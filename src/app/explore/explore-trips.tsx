"use client";

import { CarFront, Compass, MapPinned, Mountain, Search, SlidersHorizontal, TentTree, UserRound, UsersRound, X } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { availableSpots, travellerGroupLabels } from "@/domain/travel";
import { TripCard } from "../_shared/trip-card";
import { useDemoTravel } from "../_shared/demo-travel";
import site from "../_shared/site.module.css";
import { browseTrips, categories, emptyFilters, exploreQuery, readExploreState, sortOptions, type ExploreState, type TripFilters } from "./browse-trips";
import { TripFilterDialog, TripSelect } from "./trip-filters";
import styles from "./explore.module.css";

const categoryIcons = {
  all: Compass, solo: UserRound, couple: UsersRound, family: UsersRound, hiking: Mountain, weekend: TentTree, road: CarFront,
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const queryChanged = "sidetrail-explore-query-changed";

function subscribeToQuery(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(queryChanged, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(queryChanged, listener);
  };
}

function browserQuery() {
  return window.location.search.slice(1);
}

function filterTags(filters: TripFilters) {
  const tags: { label: string; reset: Partial<TripFilters> }[] = [];
  if (filters.city) tags.push({ label: "From " + filters.city, reset: { city: "" } });
  if (filters.destination) tags.push({ label: filters.destination, reset: { destination: "" } });
  if (filters.group) tags.push({ label: travellerGroupLabels[filters.group], reset: { group: "" } });
  if (filters.minBudget || filters.maxBudget) {
    const min = filters.minBudget && money.format(Number(filters.minBudget));
    const max = filters.maxBudget && money.format(Number(filters.maxBudget));
    const label = min && max ? min + "–" + max : min ? min + "+" : "Up to " + max;
    tags.push({ label, reset: { minBudget: "", maxBudget: "" } });
  }
  if (filters.start || filters.end) {
    const start = filters.start && date.format(new Date(filters.start));
    const end = filters.end && date.format(new Date(filters.end));
    const label = start && end ? start + "–" + end : start ? "After " + start : "By " + end;
    tags.push({ label, reset: { start: "", end: "" } });
  }
  if (filters.spots) tags.push({ label: filters.spots + "+ spots", reset: { spots: "" } });
  return tags;
}

export function ExploreTrips({ initialState }: { initialState: ExploreState }) {
  const urlQuery = useSyncExternalStore(subscribeToQuery, browserQuery, () => exploreQuery(initialState));
  const state = readExploreState(new URLSearchParams(urlQuery));
  const [filterVersion, setFilterVersion] = useState(0);
  const search = useRef<HTMLInputElement>(null);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const filterDialog = useRef<HTMLDialogElement>(null);
  const { filters, query, sort } = state;
  const { listings } = useDemoTravel();
  const available = listings.filter((listing) => !listing.cancelled);
  const results = browseTrips(available, state);
  const tags = filterTags(filters);
  const activeCount = tags.length + Number(filters.category !== "all");
  const cities = [...new Set(available.map(({ trip }) => trip.departureCity))].sort();
  const destinations = [...new Set(available.map(({ trip }) => trip.destination))].sort();
  const maxSpots = Math.max(0, ...available.map(({ trip }) => availableSpots(trip)));

  function update(next: ExploreState) {
    const params = exploreQuery(next);
    const { pathname, hash } = window.location;
    window.history.replaceState(null, "", pathname + (params ? "?" + params : "") + hash);
    window.dispatchEvent(new Event(queryChanged));
  }

  function openFilters() {
    setFilterVersion((version) => version + 1);
    filterDialog.current?.showModal();
  }

  function clearFilters() {
    update({ query: "", sort, filters: emptyFilters });
    search.current?.focus();
  }

  return (
    <>
      <div className={styles.masthead}>
        <div className={site.container}>
          <div className={styles.intro}>
            <div>
              <h1>Explore trips<span>.</span></h1>
              <p>Find a trail, a road trip, or a weekend worth sharing.</p>
            </div>
            <div className={styles.searchRow}>
              <div role="search" className={styles.searchField}>
                <Search size={20} aria-hidden="true" />
                <input
                  ref={search}
                  type="search"
                  aria-label="Search trips"
                  placeholder="City, trail, or trip"
                  value={query}
                  maxLength={120}
                  onChange={(event) => update({ ...state, query: event.currentTarget.value })}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => { update({ ...state, query: "" }); search.current?.focus(); }}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              <button
                ref={filterTrigger}
                type="button"
                className={site.buttonOutline + " " + styles.filterButton}
                aria-label={activeCount ? "Filters, " + activeCount + " active" : undefined}
                aria-haspopup="dialog"
                aria-controls="trip-filters"
                onClick={openFilters}
              >
                <SlidersHorizontal size={18} aria-hidden="true" />
                Filters
                {activeCount > 0 && <span aria-hidden="true">{activeCount}</span>}
              </button>
            </div>
          </div>
          <div className={styles.categories} role="group" aria-label="Trip categories">
            {categories.map(({ value, label }) => {
              const Icon = categoryIcons[value];
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filters.category === value}
                  onClick={() => update({ ...state, filters: { ...filters, category: value } })}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className={site.container + " " + styles.results} aria-labelledby="results-title">
        {tags.length > 0 && (
          <div role="group" aria-label="Applied filters" className={styles.activeFilters}>
            {tags.map(({ label, reset }) => (
              <button
                key={Object.keys(reset).join("-")}
                type="button"
                aria-label={"Remove " + label + " filter"}
                onClick={() => {
                  update({ ...state, filters: { ...filters, ...reset } });
                  filterTrigger.current?.focus();
                }}
              >
                {label}<X size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
        <div className={styles.resultsBar}>
          <h2 id="results-title" aria-live="polite">{results.length} {results.length === 1 ? "trip" : "trips"}</h2>
          <label className={styles.sort}>
            <span>Sort by</span>
            <TripSelect value={sort} onChange={(event) => {
              const option = sortOptions.find(({ value }) => value === event.currentTarget.value);
              if (option) update({ ...state, sort: option.value });
            }}>
              {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </TripSelect>
          </label>
        </div>
        {results.length ? (
          <ul className={site.tripGrid}>
            {results.map((listing, index) => (
              <li key={listing.trip.id}><TripCard listing={listing} showTravelDetails eagerImage={index === 0} /></li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><MapPinned size={26} aria-hidden="true" /></span>
            <h3>{query.trim() ? "No trips match that search" : "No trips fit these filters"}</h3>
            <p>Try a nearby starting city, a wider budget, or a different travel style.</p>
            <button type="button" className={site.buttonPrimary} onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>

      <TripFilterDialog
        version={filterVersion}
        dialogRef={filterDialog}
        initial={filters}
        cities={cities}
        destinations={destinations}
        maxSpots={maxSpots}
        onApply={(next) => { update({ ...state, filters: next }); filterDialog.current?.close(); }}
      />
    </>
  );
}
