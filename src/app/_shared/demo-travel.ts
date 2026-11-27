"use client";

import { useSyncExternalStore } from "react";
import { demoRequestSeeds } from "@/data/host-workspace";
import { publicTravellerProfiles } from "@/data/traveller-profiles";
import { draftCovers } from "@/data/trip-covers";
import { photos, tripListings, type TripListing } from "@/data/trip-listings";
import { availableSpots, type Activity, type JoinRequest } from "@/domain/travel";
import { demoTripId } from "./demo-id";
import { subscribeToStorage } from "./local-storage";
import { decodeDraft, draftDates, todayInIndia, validateTripDraft, type TripDraft } from "./trip-draft";

const accounts = ["traveller-meera", "traveller-kavya-dev", "traveller-nairs"] as const;
export const demoAccounts = accounts.map(demoProfileFor);
export function demoProfileFor(id: string) {
  return publicTravellerProfiles.find((profile) => profile.id === id)!;
}

export type PublishedTrip = {
  id: string;
  hostId: string;
  postedOn: string;
  revision: number;
  cancelled: boolean;
  draft: TripDraft;
};
type DemoState = {
  version: 1;
  account: string;
  trips: readonly PublishedTrip[];
  requests: readonly JoinRequest[];
};
const initial: DemoState = { version: 1, account: accounts[0], trips: [], requests: demoRequestSeeds };
const key = "sidetrail-travel-demo-v1";
const changed = key + "-changed";


function acceptedSeats(requests: readonly JoinRequest[], tripId: string) {
  return requests.reduce((total, request) => total + (request.tripId === tripId && request.status === "accepted" ? request.partySize : 0), 0);
}

const activityByCategory: Record<TripDraft["category"], Activity> = {
  "Hiking & Trekking": "hiking", "Weekend Getaway": "weekend-getaway", "Road Trip": "road-trip",
  Camping: "camping", Adventure: "adventure", Leisure: "leisure", Other: "other", "": "other",
};

function localListing({ id, hostId, postedOn, draft, cancelled }: PublishedTrip): TripListing {
  const capacity = Number(draft.capacity);
  return {
    local: true, cancelled, host: demoProfileFor(hostId),
    date: draftDates(draft.startsOn, draft.endsOn),
    photo: draftCovers.find(({ src }) => src === draft.cover) ?? photos.hero,
    suggestedFor: draft.groups,
    trip: {
      id, slug: id, hostId, postedOn, capacity,
      confirmedTravellers: draft.spots === "" ? 0 : capacity - Number(draft.spots),
      title: draft.title.trim(), destination: draft.destination.trim(), departureCity: draft.departureCity.trim(),
      startsOn: draft.startsOn, endsOn: draft.endsOn,
      activity: activityByCategory[draft.category],
      difficulty: "easy", welcomeGroups: draft.groups,
      details: {
        description: draft.description.trim() || "The host is still putting together the trip description.",
        itinerary: draft.itinerary.filter(({ title, note }) => title.trim() || note.trim()),
        suitability: draft.preferences.trim(),
      },
    },
  };
}

function demoListings(state: DemoState) {
  return [...tripListings, ...state.trips.map(localListing)].map((listing) => {
    const { trip } = listing;
    // Seeded acceptances are already included in the fixture counts.
    const base = trip.confirmedTravellers - (listing.local ? 0 : acceptedSeats(demoRequestSeeds, trip.id));
    return { ...listing, trip: { ...trip, confirmedTravellers: base + acceptedSeats(state.requests, trip.id) } };
  });
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isAccount(id: unknown): id is string {
  return accounts.some((account) => account === id);
}

function validParty(id: string, size: unknown): size is number {
  if (typeof size !== "number" || !Number.isSafeInteger(size)) return false;
  const group = demoProfileFor(id).group;
  return group === "solo" ? size === 1 : group === "couple" ? size === 2 : size >= 2;
}

function listingAccepts(listing: TripListing, requester: string, size: number) {
  return listing.trip.hostId !== requester && listing.trip.welcomeGroups.includes(demoProfileFor(requester).group) && validParty(requester, size);
}

function decodeState(raw: string | null): DemoState | null {
  if (raw === null) return initial;
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1 || !isAccount(data.account) || !Array.isArray(data.trips) || !Array.isArray(data.requests)) return null;
    const trips: PublishedTrip[] = [];
    const ids = new Set<string>();
    for (const item of data.trips as unknown[]) {
      if (!record(item) || typeof item.id !== "string" || !demoTripId.test(item.id) || ids.has(item.id) ||
        !isAccount(item.hostId) || !isDate(item.postedOn) || typeof item.cancelled !== "boolean" ||
        typeof item.revision !== "number" || !Number.isSafeInteger(item.revision) || item.revision < 1) return null;
      const draft = decodeDraft(JSON.stringify(item.draft));
      if (!draft || Object.keys(validateTripDraft(draft, item.postedOn)).length) return null;
      ids.add(item.id);
      trips.push({ id: item.id, hostId: item.hostId, postedOn: item.postedOn, revision: item.revision, cancelled: item.cancelled, draft });
    }
    const requests: JoinRequest[] = [];
    const pairs = new Set<string>();
    const requestIds = new Set<string>();
    const listings = [...tripListings, ...trips.map(localListing)];
    for (const item of data.requests as unknown[]) {
      if (!record(item) || typeof item.id !== "string" || requestIds.has(item.id) || typeof item.tripId !== "string" ||
        typeof item.requesterId !== "string" || !isDate(item.submittedOn) || !validStatus(item.status)) return null;
      const seed = demoRequestSeeds.find(({ id }) => id === item.id);
      if (seed ? seed.tripId !== item.tripId || seed.requesterId !== item.requesterId || seed.partySize !== item.partySize
        : !demoTripId.test(item.id) || !isAccount(item.requesterId)) return null;
      const listing = listings.find(({ trip }) => trip.id === item.tripId);
      const pair = item.tripId + "/" + item.requesterId;
      if (!listing || pairs.has(pair) || !validParty(item.requesterId, item.partySize)) return null;
      if (item.status === "accepted" && (listing.cancelled || !listingAccepts(listing, item.requesterId, item.partySize))) return null;
      if (item.status === "pending" && listing.cancelled) return null;
      pairs.add(pair);
      requestIds.add(item.id);
      requests.push({ id: item.id, tripId: item.tripId, requesterId: item.requesterId, partySize: item.partySize, submittedOn: item.submittedOn, status: item.status });
    }
    if (demoRequestSeeds.some(({ id }) => !requestIds.has(id))) return null;
    const state: DemoState = { version: 1, account: data.account, trips, requests };
    return demoListings(state).some(({ trip }) => availableSpots(trip) < 0) ? null : state;
  } catch {
    return null;
  }
}

function validStatus(status: unknown): status is JoinRequest["status"] {
  return status === "pending" || status === "accepted" || status === "declined" || status === "cancelled";
}

const serverSnapshot = { state: initial, listings: demoListings(initial), ready: false, damaged: false };
let cachedRaw: string | null | undefined;
let cachedSnapshot = serverSnapshot;

function getSnapshot() {
  let raw: string | null;
  try { raw = localStorage.getItem(key); } catch { raw = ""; }
  if (raw !== cachedRaw) {
    const data = decodeState(raw);
    const state = data ?? initial;
    cachedRaw = raw;
    cachedSnapshot = { state, listings: demoListings(state), ready: true, damaged: data === null };
  }
  return cachedSnapshot;
}

function subscribe(listener: () => void) {
  return subscribeToStorage(key, changed, listener);
}

export function useDemoTravel() {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

type Result = { ok: true; id?: string } | { ok: false; error: string };
type Action =
  | { type: "switch"; account: string }
  | { type: "reset" }
  | { type: "publish"; draft: TripDraft }
  | { type: "edit"; id: string; revision: number; draft: TripDraft }
  | { type: "cancel-trip"; id: string }
  | { type: "join"; tripId: string; partySize: number }
  | { type: "decision"; id: string; status: "accepted" | "declined" }
  | { type: "cancel-request"; id: string };

function failure(error: string): Result { return { ok: false, error }; }

export async function updateDemo(action: Action, expectedAccount?: string): Promise<Result> {
  if (!navigator.locks) return failure("Open Share Yarana over HTTPS or localhost to save demo changes.");
  try {
    return await navigator.locks.request(key, (): Result => {
      function commit(state: DemoState, id?: string): Result {
        localStorage.setItem(key, JSON.stringify(state));
        window.dispatchEvent(new Event(changed));
        return { ok: true, id };
      }
      if (action.type === "reset") {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event(changed));
        return { ok: true };
      }
      const state = decodeState(localStorage.getItem(key));
      if (!state) return failure("Demo data could not be read. Use Reset Demo Data to start again.");
      if (action.type === "switch") return isAccount(action.account) ? commit({ ...state, account: action.account }) : failure("Choose a demo traveller.");
      if (state.account !== expectedAccount) return failure("The demo traveller changed. Review the current account and try again.");
      const { account, trips, requests } = state;
      const listings = demoListings(state);

      if (action.type === "publish" || action.type === "edit" || action.type === "cancel-trip") {
        const current = action.type === "publish" ? undefined : trips.find(({ id }) => id === action.id);
        if (action.type !== "publish" && (!current || current.hostId !== account || current.cancelled)) return failure("Only the host can manage an active demo trip.");
        if (action.type === "cancel-trip") {
          return commit({ ...state,
            trips: trips.map((trip) => trip.id === action.id ? { ...trip, cancelled: true } : trip),
            requests: requests.map((request) => request.tripId === action.id && (request.status === "pending" || request.status === "accepted")
              ? { ...request, status: "cancelled" } : request),
          });
        }
        const draft = decodeDraft(JSON.stringify(action.draft));
        const today = todayInIndia();
        if (!draft || Object.keys(validateTripDraft(draft, current?.postedOn ?? today)).length) return failure("Check the trip details before saving.");
        if (action.type === "edit" && current?.revision !== action.revision) return failure("This trip changed in another tab. Reopen the editor to get the latest version.");
        const id = current?.id ?? "demo-" + crypto.randomUUID();
        const published = { id, hostId: account, draft, postedOn: current?.postedOn ?? today, revision: (current?.revision ?? 0) + 1, cancelled: false };
        const next = localListing(published);
        const accepted = requests.filter((request) => request.tripId === id && request.status === "accepted");
        if (acceptedSeats(accepted, id) > availableSpots(next.trip) || accepted.some(({ requesterId, partySize }) => !listingAccepts(next, requesterId, partySize))) {
          return failure("Keep enough offered spots and the traveller categories for all accepted parties.");
        }
        return commit({ ...state, trips: current ? trips.map((trip) => trip.id === id ? published : trip) : [...trips, published] }, id);
      }
      if (action.type === "join") {
        const listing = listings.find(({ trip }) => trip.id === action.tripId);
        if (!listing || listing.cancelled) return failure("This trip is unavailable.");
        if (requests.some(({ tripId, requesterId }) => tripId === action.tripId && requesterId === account)) return failure("You already have a demo request for this trip.");
        if (!listingAccepts(listing, account, action.partySize)) return failure("Your demo account or party size is ineligible for this trip.");
        if (action.partySize > availableSpots(listing.trip)) return failure("There aren’t enough spots for your party.");
        return commit({ ...state, requests: [...requests, {
          id: "demo-" + crypto.randomUUID(), tripId: action.tripId, requesterId: account,
          partySize: action.partySize, submittedOn: todayInIndia(), status: "pending",
        }] });
      }
      const request = requests.find(({ id }) => id === action.id);
      const listing = listings.find(({ trip }) => trip.id === request?.tripId);
      if (!request || !listing || listing.cancelled) return failure("This request is unavailable.");
      if (action.type === "cancel-request") {
        if (request.requesterId !== account || (request.status !== "pending" && request.status !== "accepted")) return failure("You can only cancel an active request from your account.");
      } else {
        if (listing.trip.hostId !== account || request.status !== "pending") return failure("Only the host can decide a pending request.");
        if (action.status === "accepted" && (!listingAccepts(listing, request.requesterId, request.partySize) || request.partySize > availableSpots(listing.trip))) {
          return failure("This party no longer fits the trip’s eligibility or available spots.");
        }
      }
      const status = action.type === "cancel-request" ? "cancelled" : action.status;
      return commit({ ...state, requests: requests.map((item) => item.id === request.id ? { ...item, status } : item) });
    });
  } catch {
    return failure("Demo storage is unavailable. Your changes could not be saved.");
  }
}
