"use client";

import { useMemo, useSyncExternalStore } from "react";
import { type TravellerGroup } from "@/domain/travel";
import { subscribeToStorage } from "./local-storage";

export const draftCategories = [
  "Hiking & Trekking", "Weekend Getaway", "Road Trip", "Camping", "Adventure", "Leisure", "Other",
] as const;

export const draftLimits = {
  title: 120,
  destination: 80,
  departureCity: 80,
  description: 600,
  preferences: 300,
  included: 400,
  excluded: 400,
  costNotes: 400,
  dayTitle: 90,
  dayNote: 400,
} as const;

export interface DraftDay { id: number; title: string; note: string }

export interface TripDraft {
  title: string;
  destination: string;
  departureCity: string;
  startsOn: string;
  endsOn: string;
  category: (typeof draftCategories)[number] | "";
  description: string;
  groups: TravellerGroup[];
  capacity: string;
  spots: string;
  preferences: string;
  // Legacy expense fields are preserved for saved data compatibility only; never rendered or validated.
  budget: string;
  included: string;
  excluded: string;
  costNotes: string;
  itinerary: DraftDay[];
  cover: string;
}

export const emptyTripDraft: TripDraft = {
  title: "", destination: "", departureCity: "", startsOn: "", endsOn: "",
  category: "", description: "", groups: [], capacity: "", spots: "", preferences: "",
  budget: "", included: "", excluded: "", costNotes: "", itinerary: [], cover: "",
};

export type DraftErrors = Partial<Record<
  "title" | "destination" | "departureCity" | "startsOn" | "endsOn" | "groups" | "capacity" | "spots",
  string
>>;

export function validPlace(value: string) {
  return /\p{L}/u.test(value);
}

const draftDateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});

export function draftDates(start: string, end: string) {
  if (!validDate(start)) return "Dates to be decided";
  const from = new Date(start);
  return validDate(end) && end >= start
    ? draftDateFormat.formatRange(from, new Date(end))
    : draftDateFormat.format(from);
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const indiaDate = new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
});

export function todayInIndia() {
  const parts = Object.fromEntries(indiaDate.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return parts.year + "-" + parts.month + "-" + parts.day;
}

export function validateTripDraft(draft: TripDraft, today: string) {
  const errors: DraftErrors = {};
  if (!draft.title.trim()) errors.title = "Give your trip a title.";
  if (!validPlace(draft.destination)) errors.destination = "Enter the name of a destination.";
  if (!validPlace(draft.departureCity)) errors.departureCity = "Enter the name of your starting city.";
  if (!validDate(draft.startsOn)) errors.startsOn = "Choose a valid start date.";
  else if (draft.startsOn < today) errors.startsOn = "Choose today or a future date.";
  if (!validDate(draft.endsOn)) errors.endsOn = "Choose a valid end date.";
  else if (validDate(draft.startsOn) && draft.endsOn < draft.startsOn) errors.endsOn = "Choose an end date on or after the start date.";
  if (!draft.groups.length) errors.groups = "Choose at least one traveller group.";
  const capacity = Number(draft.capacity);
  if (!Number.isSafeInteger(capacity) || capacity < 1) errors.capacity = "Enter a whole number of at least 1.";
  const spots = Number(draft.spots);
  if (draft.spots && (!Number.isSafeInteger(spots) || spots < 0 || (!errors.capacity && spots > capacity))) {
    errors.spots = "Enter a whole number between 0 and the maximum participants.";
  }
  return errors;
}

const draftKey = "sidetrail-trip-draft-v1";
const draftChanged = "sidetrail-trip-draft-changed";
let workingDraft: TripDraft | null = null;

function readSavedText() {
  try { return window.localStorage.getItem(draftKey); } catch { return null; }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function decodeDraft(text: string | null): TripDraft | null {
  if (!text) return null;
  try {
    const stored: unknown = JSON.parse(text);
    if (!isRecord(stored)) return null;
    const read = (value: unknown, limit: number) => typeof value === "string" ? value.slice(0, limit) : "";
    const allowedGroups: TravellerGroup[] = ["solo", "couple", "family"];
    const savedGroups: unknown[] = Array.isArray(stored.groups) ? stored.groups : [];
    const groups = allowedGroups.filter((group) => savedGroups.includes(group));
    const days: unknown[] = Array.isArray(stored.itinerary) ? stored.itinerary : [];
    return {
      title: read(stored.title, draftLimits.title),
      destination: read(stored.destination, draftLimits.destination),
      departureCity: read(stored.departureCity, draftLimits.departureCity),
      startsOn: validDate(stored.startsOn) ? stored.startsOn : "",
      endsOn: validDate(stored.endsOn) ? stored.endsOn : "",
      category: draftCategories.find((category) => category === stored.category) ?? "",
      description: read(stored.description, draftLimits.description),
      groups,
      capacity: read(stored.capacity, 24),
      spots: read(stored.spots, 24),
      preferences: read(stored.preferences, draftLimits.preferences),
      budget: read(stored.budget, 40),
      included: read(stored.included, draftLimits.included),
      excluded: read(stored.excluded, draftLimits.excluded),
      costNotes: read(stored.costNotes, draftLimits.costNotes),
      itinerary: days.filter(isRecord).map((day, index): DraftDay => ({
        id: index + 1, title: read(day.title, draftLimits.dayTitle), note: read(day.note, draftLimits.dayNote),
      })),
      cover: read(stored.cover, 160),
    };
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  return subscribeToStorage(draftKey, draftChanged, listener);
}

function warnBeforeLeaving(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = "";
}

const noDraft = () => null;
const readWorking = () => workingDraft;

export function useTripDraft() {
  const savedText = useSyncExternalStore(subscribe, readSavedText, noDraft);
  const saved = useMemo(() => decodeDraft(savedText), [savedText]);
  const working = useSyncExternalStore(subscribe, readWorking, noDraft);
  const migrated = Boolean(saved && savedText && "kind" in JSON.parse(savedText));
  return { saved, savedText, working, migrated };
}

export function editTripDraft(draft: TripDraft) {
  workingDraft = draft;
  window.addEventListener("beforeunload", warnBeforeLeaving);
  window.dispatchEvent(new Event(draftChanged));
}

export function persistTripDraft(draft: TripDraft | null) {
  try {
    if (draft) {
      const original = window.localStorage.getItem(draftKey);
      // Preserve the original before the first save in the new format, including unknown legacy fields.
      if (original && !window.localStorage.getItem(draftKey + "-original")) {
        let stored: unknown;
        try { stored = JSON.parse(original); } catch { stored = null; }
        if (!isRecord(stored) || stored.schemaVersion !== 2) {
          window.localStorage.setItem(draftKey + "-original", original);
        }
      }
      window.localStorage.setItem(draftKey, JSON.stringify({ ...decodeDraft(JSON.stringify(draft)), schemaVersion: 2 }));
    }
    else window.localStorage.removeItem(draftKey);
  } catch {
    return false;
  }
  workingDraft = null;
  window.removeEventListener("beforeunload", warnBeforeLeaving);
  window.dispatchEvent(new Event(draftChanged));
  return true;
}

export function discardTripDraft(expected: { savedText: string | null; working: TripDraft | null }) {
  if (readSavedText() !== expected.savedText || workingDraft !== expected.working) return "changed";
  return persistTripDraft(null) ? "discarded" : "unavailable";
}
