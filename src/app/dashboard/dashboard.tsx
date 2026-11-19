"use client";

import { Bookmark, Compass, Luggage, Map, Plus, Send, TentTree } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { DraftCover } from "@/data/trip-covers";
import type { TripListing } from "@/data/trip-listings";
import { updateSavedTrip, useSavedTripIds } from "../_shared/saved-trips";
import site from "../_shared/site.module.css";
import { TripCard } from "../_shared/trip-card";
import { DraftPlan } from "./draft-plan";
import styles from "./dashboard.module.css";

const tabs = [
  { id: "plans", label: "My Plans", icon: Map },
  { id: "hosting", label: "Hosting", icon: TentTree },
  { id: "join-requests", label: "Join Requests", icon: Send },
  { id: "saved", label: "Saved Trips", icon: Bookmark },
] as const;

type DashboardTab = (typeof tabs)[number]["id"];
type Photo = { src: string; alt: string };
const tabChanged = "sidetrail-dashboard-tab-changed";

function readTab(value: string | null): DashboardTab {
  return tabs.find(({ id }) => id === value)?.id ?? "plans";
}

function browserTab() {
  return readTab(new URLSearchParams(window.location.search).get("tab"));
}

function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(tabChanged, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(tabChanged, listener);
  };
}

const requestStatuses = [
  ["Pending", "Waiting for a host to respond."],
  ["Accepted", "The host confirmed a place for your party."],
  ["Declined", "The host couldn’t offer your party a place."],
  ["Cancelled", "You withdrew the request."],
] as const;

export function Dashboard({ initialTab, listings, covers, planPhoto, savedPhoto }: {
  initialTab: string | null;
  listings: readonly TripListing[];
  covers: readonly DraftCover[];
  planPhoto: Photo;
  savedPhoto: Photo;
}) {
  const active = useSyncExternalStore(subscribe, browserTab, () => readTab(initialTab));
  const tabList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = tabList.current;
    const selected = row?.querySelector("[aria-selected=true]");
    if (!row || !selected) return;
    const tabBounds = selected.getBoundingClientRect();
    const rowBounds = row.getBoundingClientRect();
    if (tabBounds.right > rowBounds.right - 4) row.scrollLeft += tabBounds.right - rowBounds.right + 4;
    else if (tabBounds.left < rowBounds.left + 4) row.scrollLeft -= rowBounds.left - tabBounds.left + 4;
  }, [active]);

  function selectTab(next: DashboardTab, focus = false) {
    if (next !== active) {
      const url = new URL(window.location.href);
      if (next === "plans") url.searchParams.delete("tab");
      else url.searchParams.set("tab", next);
      window.history.pushState(null, "", url);
      window.dispatchEvent(new Event(tabChanged));
    }
    if (focus) tabList.current?.querySelector<HTMLButtonElement>("#my-trips-tab-" + next)?.focus();
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const indices: Partial<Record<string, number>> = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const nextIndex = indices[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectTab(tabs[nextIndex].id, true);
  }

  return (
    <>
      <header className={styles.masthead}>
        <div className={site.container + " " + styles.intro}>
          <div>
            <p className={styles.eyebrow}><Luggage size={17} aria-hidden="true" />My trips</p>
            <h1>Your adventures, <span>all in one place.</span></h1>
            <p>Trips you’re planning, saving, and dreaming about.</p>
          </div>
          <Link className={site.buttonPrimary} href="/trips/new"><Plus size={18} aria-hidden="true" />Plan a Trip</Link>
        </div>
      </header>

      <div className={styles.tabBar}>
        <div ref={tabList} className={site.container + " " + styles.tabs} role="tablist" aria-label="My trips sections">
          {tabs.map(({ id, label, icon: Icon }, index) => (
            <button key={id} type="button" role="tab" id={"my-trips-tab-" + id} aria-selected={id === active}
              aria-controls={"my-trips-panel-" + id} tabIndex={id === active ? 0 : -1}
              onClick={() => selectTab(id)} onKeyDown={(event) => moveTab(event, index)}>
              <Icon size={17} aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className={site.container + " " + styles.panels}>
        {tabs.map(({ id }) => (
          <section key={id} id={"my-trips-panel-" + id} role="tabpanel" aria-labelledby={"my-trips-tab-" + id}
            tabIndex={0} hidden={id !== active}>
            {id === active && (
              <>
                {id === "plans" && <DraftPlan covers={covers} emptyPhoto={planPhoto} />}
                {id === "saved" && <SavedTrips listings={listings} emptyPhoto={savedPhoto} />}
                {id === "hosting" && (
                  <div className={styles.hostingEmpty}>
                    <span className={styles.hostingIcon}><TentTree size={30} strokeWidth={1.7} aria-hidden="true" /></span>
                    <div>
                      <h2>No published trips yet.</h2>
                      <p>Publishing and managing live trips will be available with traveller accounts. For now, you can work on a plan in My Plans.</p>
                      <div className={site.dialogActions}>
                        <button type="button" className={site.buttonPrimary} onClick={() => selectTab("plans", true)}>Go to My Plans</button>
                        <Link href="/dashboard/requests" className={site.buttonOutline}>Preview host workspace</Link>
                      </div>
                    </div>
                  </div>
                )}
                {id === "join-requests" && (
                  <div className={styles.requestsEmpty}>
                    <span className={styles.requestsIcon}><Send size={25} strokeWidth={1.8} aria-hidden="true" /></span>
                    <h2>No join requests yet.</h2>
                    <p>You can try the request preview on a trip. This prototype keeps previews private and never sends them to hosts.</p>
                    <Link className={site.buttonPrimary} href="/explore"><Compass size={18} aria-hidden="true" />Explore Trips</Link>
                    <details className={styles.requestGuide}>
                      <summary>How request statuses will work</summary>
                      <p>Each request card will show the trip, dates, your party size, and the host’s response.</p>
                      <dl>
                        {requestStatuses.map(([status, description]) => (
                          <div key={status}><dt>{status}</dt><dd>{description}</dd></div>
                        ))}
                      </dl>
                    </details>
                  </div>
                )}
              </>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

function SavedTrips({ listings, emptyPhoto }: { listings: readonly TripListing[]; emptyPhoto: Photo }) {
  const ids = useSavedTripIds();
  const saved = ids.flatMap((id) => {
    const listing = listings.find(({ trip }) => trip.id === id);
    return listing ? [listing] : [];
  });
  const list = useRef<HTMLUListElement>(null);
  const explore = useRef<HTMLAnchorElement>(null);
  const [notice, setNotice] = useState("");

  function removeTrip({ trip }: TripListing, index: number) {
    if (updateSavedTrip(trip.id, false) === null) {
      setNotice("Device storage is unavailable. Your saved trips could not be updated.");
      return;
    }
    setNotice("Removed " + trip.title + " from saved trips.");
    requestAnimationFrame(() => {
      const links = list.current?.querySelectorAll<HTMLAnchorElement>("h3 a");
      (links?.[index] ?? links?.[index - 1] ?? explore.current)?.focus();
    });
  }

  return (
    <>
      <div className={styles.savedHeading}>
        <h2>Saved adventures</h2>
        <p>Saved trips stay on this device.</p>
      </div>
      <p className={styles.notice} role="status">{notice}</p>
      {saved.length ? (
        <ul ref={list} className={site.tripGrid + " " + styles.savedGrid}>
          {saved.map((listing, index) => (
            <li key={listing.trip.id}>
              <TripCard listing={listing} showTravelDetails eagerImage={index === 0} savedAction={
                <button type="button" className={site.iconButton + " " + styles.removeSaved}
                  title="Remove saved trip" aria-label={"Remove " + listing.trip.title + " from saved trips"}
                  onClick={() => removeTrip(listing, index)}>
                  <Bookmark size={20} fill="currentColor" aria-hidden="true" />
                </button>
              } />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.savedEmpty}>
          <div className={styles.savedEmptyBody}>
            <span className={styles.savedIcon}><Bookmark size={25} aria-hidden="true" /></span>
            <h3>Your next adventure is waiting.</h3>
            <p>Save trips that catch your eye and come back to them when you’re ready to make a plan.</p>
            <Link ref={explore} className={site.buttonOnDark} href="/explore">Explore Trips</Link>
          </div>
          <div className={styles.savedEmptyPhoto}>
            <Image fill src={emptyPhoto.src} alt={emptyPhoto.alt} loading="eager"
              sizes="(min-width: 1024px) 390px, (min-width: 768px) 40vw, calc(100vw - 32px)" />
          </div>
        </div>
      )}
    </>
  );
}
