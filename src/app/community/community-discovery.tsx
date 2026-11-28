"use client";

import {
  CalendarDays, CarFront, ChevronDown, Compass, Globe2, HeartHandshake, LockKeyhole,
  MapPin, Mountain, Search, TentTree, UserRound, UsersRound, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { communityCategories, communityHref, participationLabels } from "@/data/communities";
import { travellerGroupLabels, travellerInterestLabels } from "@/domain/travel";
import site from "../_shared/site.module.css";
import { CommunityPreview, type DiscoveryCommunity } from "./community-preview";
import styles from "./community.module.css";

const categories = { all: "All Communities", ...communityCategories } as const;
type Category = keyof typeof categories;
const categoryKeys = Object.keys(categories) as Category[];
const categoryIcons = {
  all: Compass, hiking: Mountain, weekend: CalendarDays, solo: UserRound,
  couple: HeartHandshake, family: UsersRound, road: CarFront, camping: TentTree,
};
const filtersChanged = "community-filters-changed";
const readSearch = () => window.location.search;
const serverSearch = () => "";

function subscribeFilters(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(filtersChanged, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(filtersChanged, listener);
  };
}

function updateFilters(filters: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(filters)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(filtersChanged));
}
function matchesCategory(community: DiscoveryCommunity, category: Category) {
  if (category === "all" || community.category === category) return true;
  if (category === "solo" || category === "couple" || category === "family") {
    return community.groups.includes(category);
  }
  if (category === "hiking") return community.activities.includes("hiking") || community.activities.includes("trekking");
  if (category === "weekend") return community.activities.includes("weekend-getaway");
  if (category === "road") return community.activities.includes("road-trip");
  return community.activities.includes("camping");
}

function CommunityCard({ community, lead, wide, eager, onOpen }: {
  community: DiscoveryCommunity;
  lead: boolean;
  wide: boolean;
  eager: boolean;
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { name, city, category, photo, description, groups, activities, participation } = community;
  const AccessIcon = participation === "public" ? Globe2 : LockKeyhole;

  return (
    <article className={styles.card} data-lead={lead || undefined}>
      <div className={styles.cardPhoto}>
        <Image
          fill
          src={photo.src}
          alt={photo.alt}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          sizes={wide
            ? "(min-width: 1264px) 588px, (min-width: 640px) 48vw, calc(100vw - 32px)"
            : "(min-width: 1264px) 386px, (min-width: 1024px) 32vw, (min-width: 640px) 46vw, calc(100vw - 32px)"}
        />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardCategory}>{communityCategories[category]}</p>
        <h3>{name}</h3>
        <p className={styles.location}><MapPin size={16} aria-hidden="true" />{city}</p>
        <p className={styles.cardDescription}>{description}</p>
        <p className={styles.cardGroups}>
          <UsersRound size={17} aria-hidden="true" />
          <span>{groups.map((group) => travellerGroupLabels[group]).join(", ")}</span>
        </p>
        <ul className={styles.activities} aria-label="Typical activities">
          {activities.map((activity) => <li key={activity}>{travellerInterestLabels[activity]}</li>)}
        </ul>
        <div className={styles.cardFooter}>
          <span><AccessIcon size={16} aria-hidden="true" />{participationLabels[participation]}</span>
          <div className={styles.cardActions}>
            <Link href={communityHref(community.id)} className={styles.detailsLink} aria-label={"View community, " + name}>View community</Link>
            <button type="button" className={styles.previewButton} aria-haspopup="dialog" aria-label={"View group, " + name} onClick={onOpen}>
              View group
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CommunityDiscovery({ communities }: { communities: readonly DiscoveryCommunity[] }) {
  const filters = new URLSearchParams(useSyncExternalStore(subscribeFilters, readSearch, serverSearch));
  const [selected, setSelected] = useState<DiscoveryCommunity>();
  const search = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const cities = [...new Set(communities.map((community) => community.city))].sort();
  const query = (filters.get("q") ?? "").slice(0, 120);
  const city = cities.find((name) => name === filters.get("city")) ?? "";
  const category = categoryKeys.find((key) => key === filters.get("category")) ?? "all";
  const trimmedQuery = query.trim();
  const words = trimmedQuery.toLowerCase().split(/\s+/);
  const hasFilters = Boolean(trimmedQuery || city || category !== "all");
  const results = communities.filter((community) => {
    if ((city && community.city !== city) || !matchesCategory(community, category)) return false;
    const searchable = [
      community.name, community.city, communityCategories[community.category],
      ...community.activities.map((activity) => travellerInterestLabels[activity]),
      ...community.groups.map((group) => travellerGroupLabels[group]),
    ].join(" ").toLowerCase();
    return words.every((word) => searchable.includes(word));
  });

  function clearSearch() {
    updateFilters({ q: "" });
    search.current?.focus();
  }

  function resetFilters() {
    updateFilters({ q: "", city: "", category: "" });
    search.current?.focus();
  }

  return (
    <>
      <header className={styles.masthead}>
        <div className={site.container}>
          <div className={styles.intro}>
            <div>
              <p className={styles.eyebrow}>Travel communities</p>
              <h1>Find your kind <span>of people.</span></h1>
              <p className={styles.subtitle}>From sunrise hikes to spontaneous weekend plans, find your crew. Community participation is free.</p>
              <a className={site.buttonText} href="#traveller-photos">See and share traveller photos</a>
            </div>
            <div className={styles.controls}>
              <div className={styles.searchField} role="search">
                <Search size={20} aria-hidden="true" />
                <input
                  ref={search}
                  type="search"
                  aria-label="Search communities"
                  placeholder="Search name, city, or activity"
                  value={query}
                  maxLength={120}
                  onChange={(event) => updateFilters({ q: event.currentTarget.value })}
                />
                {query && (
                  <button type="button" aria-label="Clear search" onClick={clearSearch}><X size={18} aria-hidden="true" /></button>
                )}
              </div>
              <div className={styles.cityField}>
                <MapPin size={18} aria-hidden="true" />
                <select value={city} aria-label="Filter by city" onChange={(event) => updateFilters({ city: event.currentTarget.value })}>
                  <option value="">All Cities</option>
                  {cities.map((name) => <option key={name}>{name}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className={styles.categories} role="group" aria-label="Community categories">
            {categoryKeys.map((key) => {
              const Icon = categoryIcons[key];
              return (
                <button key={key} type="button" aria-pressed={category === key} onClick={() => updateFilters({ category: key === "all" ? "" : key })}>
                  <Icon size={17} aria-hidden="true" />{categories[key]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <section className={site.container + " " + styles.results} aria-labelledby="community-results">
        <div className={styles.resultsBar}>
          <h2 id="community-results" aria-live="polite">
            {results.length} {results.length === 1 ? "community" : "communities"}{city && " in " + city}
          </h2>
          {hasFilters && <button type="button" className={styles.resetButton} onClick={resetFilters}>Reset filters</button>}
        </div>
        {results.length ? (
          <ul className={styles.grid} data-browse={!hasFilters || undefined}>
            {results.map((community, index) => (
              <li key={community.id}>
                <CommunityCard
                  community={community}
                  lead={index === 0 && !hasFilters}
                  wide={!hasFilters && index >= results.length - 2}
                  eager={index === 0}
                  onOpen={(event) => {
                    opener.current = event.currentTarget;
                    setSelected(community);
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <h3>{trimmedQuery ? "No communities match that search" : "No communities fit these filters"}</h3>
            <p>{trimmedQuery ? "Try a different name, city, or activity." : "Try All Cities or choose another category."}</p>
            <button type="button" className={site.buttonPrimary} onClick={resetFilters}>Show all communities</button>
          </div>
        )}
      </section>
      {selected && (
        <CommunityPreview
          community={selected}
          onClose={() => {
            setSelected(undefined);
            opener.current?.focus();
          }}
        />
      )}
    </>
  );
}
