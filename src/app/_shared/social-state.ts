"use client";

import { useMemo, useSyncExternalStore } from "react";
import { demoAccounts, demoStorageKey, getDemoSnapshot } from "./demo-travel";
import { socialStorageKey, subscribeToStorage } from "./local-storage";

type Author = { id: string; author: string; createdAt: string };
export type PhotoPost = Author & { kind: "photo"; image: string; caption: string };
export type TripReview = Author & { kind: "review"; tripId: string; rating: number; text: string };
export type SharedLocation = Author & { kind: "location"; tripId: string; name: string; latitude?: number; longitude?: number };
export type SocialEntry = PhotoPost | TripReview | SharedLocation;
type NewEntry = Omit<PhotoPost, keyof Author> | Omit<TripReview, keyof Author> | Omit<SharedLocation, keyof Author>;
const changed = socialStorageKey + "-changed";
const empty: SocialEntry[] = [];
const text = (v: unknown, max: number): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);

export function validSocialEntry(value: unknown): value is SocialEntry {
  if (!record(value) || !text(value.id, 80) || !demoAccounts.some(a => a.id === value.author)
    || typeof value.createdAt !== "string" || !Number.isFinite(Date.parse(value.createdAt))) return false;
  if (value.kind === "photo") return text(value.caption, 400) && typeof value.image === "string"
    && value.image.length <= 350000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.image);
  if (!text(value.tripId, 100)) return false;
  if (value.kind === "review") return text(value.text, 1200) && typeof value.rating === "number"
    && Number.isInteger(value.rating) && value.rating >= 1 && value.rating <= 5;
  if (value.kind === "location") return text(value.name, 120) && (
    value.latitude === undefined && value.longitude === undefined ||
    typeof value.latitude === "number" && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90 &&
    typeof value.longitude === "number" && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180);
  return false;
}

export function decodeSocial(raw: string | null): SocialEntry[] | null {
  if (raw === null) return empty;
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1 || !Array.isArray(data.entries) || data.entries.length > 80
      || !data.entries.every(validSocialEntry)) return null;
    const entries: SocialEntry[] = data.entries;
    if (new Set(entries.map(e => e.id)).size !== entries.length || entries.filter(e => e.kind === "photo").length > 6) return null;
    const reviews = entries.filter(e => e.kind === "review");
    if (new Set(reviews.map(e => e.tripId + "/" + e.author)).size !== reviews.length) return null;
    return entries;
  } catch { return null; }
}

function read() { try { return localStorage.getItem(socialStorageKey); } catch { return ""; } }
function subscribe(listener: () => void) { return subscribeToStorage(socialStorageKey, changed, listener); }
export function useSocialEntries() {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const entries = useMemo(() => decodeSocial(raw), [raw]);
  return { entries: entries ?? empty, damaged: entries === null };
}

export async function updateSocial(action: { add: NewEntry } | { remove: string }, account: string) {
  if (!navigator.locks) return "Open over HTTPS or localhost to save changes.";
  try {
    // The shared lock also serializes account switches, trip cancellation and demo resets.
    return await navigator.locks.request(demoStorageKey, () => {
      const demo = getDemoSnapshot();
      if (demo.damaged || demo.state.account !== account) return "The traveller or trip data changed. Please try again.";
      const entries = decodeSocial(read());
      if (!entries) return "Saved posts could not be read. Reset Demo Data to start again; your drafts are kept.";
      let next: SocialEntry[];
      if ("remove" in action) {
        if (!entries.some(e => e.id === action.remove && e.author === account)) return "You can only remove your own contributions.";
        next = entries.filter(e => e.id !== action.remove);
      } else {
        const entry = { ...action.add, id: crypto.randomUUID(), author: account, createdAt: new Date().toISOString() };
        if (!validSocialEntry(entry)) return "Check the details before saving.";
        if (entry.kind !== "photo") {
          const listing = demo.listings.find(l => l.trip.id === entry.tripId);
          const accepted = demo.state.requests.some(r => r.tripId === entry.tripId && r.requesterId === account && r.status === "accepted");
          if (!listing || listing.cancelled || !(accepted || entry.kind === "location" && listing.trip.hostId === account)) {
            return entry.kind === "review" ? "Only accepted travellers can leave feedback on an active trip." : "Only the host and accepted travellers can share a location.";
          }
        }
        next = [...entries.filter(e => !(entry.kind === "review" && e.kind === "review" && e.tripId === entry.tripId && e.author === account)), entry];
        if (!decodeSocial(JSON.stringify({ version: 1, entries: next }))) return "This demo is full (6 photos, 80 contributions). Remove an older contribution first.";
      }
      localStorage.setItem(socialStorageKey, JSON.stringify({ version: 1, entries: next }));
      window.dispatchEvent(new Event(changed));
      return "";
    });
  } catch { return "Device storage is full or unavailable. Nothing was saved. Remove an older photo or try again."; }
}
