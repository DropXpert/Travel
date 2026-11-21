"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Trip } from "@/domain/travel";
import { subscribeToStorage } from "./local-storage";

const storageKey = "sidetrail-saved-trip-ids-v1";
const savedTripsChanged = "sidetrail-saved-trips-changed";
const emptyIds: readonly Trip["id"][] = [];
const serverSnapshot = () => null;

function readSavedIds() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function decodeIds(raw: string | null): readonly Trip["id"][] {
  if (!raw) return emptyIds;
  try {
    const ids: unknown = JSON.parse(raw);
    if (Array.isArray(ids)) {
      return [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
    }
  } catch {
    return emptyIds;
  }
  return emptyIds;
}

function subscribe(listener: () => void) {
  return subscribeToStorage(storageKey, savedTripsChanged, listener);
}

export function useSavedTripIds() {
  const raw = useSyncExternalStore(subscribe, readSavedIds, serverSnapshot);
  return useMemo(() => decodeIds(raw), [raw]);
}

export function updateSavedTrip(id: Trip["id"], saved?: boolean) {
  try {
    const ids = decodeIds(window.localStorage.getItem(storageKey));
    const nextSaved = saved ?? !ids.includes(id);
    const remaining = ids.filter((entry) => entry !== id);
    const next = nextSaved ? [id, ...remaining] : remaining;
    if (next.length) window.localStorage.setItem(storageKey, JSON.stringify(next));
    else window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(savedTripsChanged));
    return nextSaved;
  } catch {
    return null;
  }
}
