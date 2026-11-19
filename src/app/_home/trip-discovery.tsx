"use client";

import { Compass, Mountain, TentTree, UserRound, UsersRound } from "lucide-react";
import { useState } from "react";
import type { TripListing } from "@/data/trip-listings";
import { TripCard } from "../_shared/trip-card";
import site from "../_shared/site.module.css";
import styles from "./home.module.css";

const filters = [
  { id: "all", label: "All Trips", icon: Compass },
  { id: "solo", label: "Solo Friendly", icon: UserRound },
  { id: "couple", label: "Couples", icon: UsersRound },
  { id: "family", label: "Families", icon: UsersRound },
  { id: "trails", label: "Hiking & Treks", icon: Mountain },
  { id: "weekends", label: "Weekend Getaways", icon: TentTree },
] as const;

type Filter = (typeof filters)[number]["id"];

function matchesFilter({ trip, suggestedFor }: TripListing, filter: Filter) {
  switch (filter) {
    case "all":
      return true;
    case "trails":
      return trip.activity === "hiking" || trip.activity === "trekking";
    case "weekends":
      return trip.activity === "weekend-getaway" || trip.activity === "road-trip";
    default:
      return suggestedFor.includes(filter);
  }
}

export function TripDiscovery({ listings }: { listings: readonly TripListing[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);
  const matching = listings.filter((listing) => matchesFilter(listing, filter));
  const visible = filter === "all" && !showAll ? matching.slice(0, 3) : matching;
  const hiddenCount = matching.length - visible.length;

  return (
    <section className={styles.discovery} id="trips" aria-labelledby="trips-title">
      <div className={site.container}>
        <div className={styles.sectionIntro}>
          <h2 id="trips-title">Find your next trip.</h2>
          <p>Pick a place, a pace, and a group you’d want to share the road with.</p>
        </div>
        <div className={styles.filters} role="group" aria-label="Filter sample trips">
          {filters.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => { setFilter(id); setShowAll(false); }}
            >
              <Icon size={17} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <p className={styles.resultCount} role="status">
          {visible.length === matching.length ? matching.length : visible.length + " of " + matching.length}{" "}
          {matching.length === 1 ? "sample trip" : "sample trips"}
        </p>
        <ul className={site.tripGrid}>
          {visible.map((listing) => <li key={listing.trip.id}><TripCard listing={listing} /></li>)}
        </ul>
        {visible.length === 0 && <p>Try another category to see more trips.</p>}
        {filter === "all" && matching.length > 3 && (
          <div className={styles.moreTrips}>
            <button type="button" className={site.buttonOutline} onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show fewer trips" : "Show " + hiddenCount + " more trips"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
