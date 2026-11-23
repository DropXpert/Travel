"use client";

import { ArrowRight, Bookmark, CalendarDays, MapPin, UsersRound } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { availableSpots, profileTypeLabels, travellerGroupLabels, travellerInitials, tripHostName, requestStatusLabels } from "@/domain/travel";
import { useDemoTravel } from "../_shared/demo-travel";
import { useSavedTripIds, updateSavedTrip } from "../_shared/saved-trips";
import { rememberTripOpening, tripHref } from "../_shared/trip-navigation";
import site from "../_shared/site.module.css";
import styles from "./home.module.css";

const filters = [
  { id: "all", label: "Everyone" },
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Couples" },
  { id: "family", label: "Families" },
] as const;

export function TripDiscovery() {
  const params = useSearchParams();
  const filter = filters.find(({ id }) => id === params.get("traveller"))?.id ?? "all";
  const { listings, state } = useDemoTravel();
  const saved = useSavedTripIds();
  const [feedback, setFeedback] = useState("");
  const matching = listings.filter(({ trip, cancelled }) => !cancelled && (filter === "all" || trip.welcomeGroups.includes(filter)));

  function chooseFilter(value: string) {
    const next = new URL(window.location.href);
    if (value === "all") next.searchParams.delete("traveller");
    else next.searchParams.set("traveller", value);
    window.history.pushState(null, "", next.pathname + next.search + next.hash);
  }

  function toggleSaved(id: string) {
    const result = updateSavedTrip(id);
    setFeedback(result === null ? "Device storage is unavailable. Your save could not be updated."
      : result ? "Trip saved on this device." : "Trip removed from your saves.");
  }

  return (
    <section className={styles.discovery} id="trips" aria-labelledby="trips-title">
      <div className={styles.sectionHeading}>
        <div><h2 id="trips-title">Good plans. Better company.</h2><p>Find a trip with room for you.</p></div>
        <span className={styles.resultCount} role="status">{matching.length} trips</span>
      </div>
      <div className={styles.filters} role="group" aria-label="Who is travelling?">
        {filters.map(({ id, label }) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => chooseFilter(id)}>{label}</button>)}
      </div>
      <p className="sr-only" role="status">{feedback}</p>
      <ul className={styles.feed}>
        {matching.map(({ trip, host, photo, date, cost, local }) => {
          const name = tripHostName(trip, host);
          const spots = availableSpots(trip);
          const owner = trip.hostId === state.account;
          const request = state.requests.find(item => item.tripId === trip.id && item.requesterId === state.account && item.status !== "cancelled");
          const href = tripHref(trip.slug);
          return (
            <li key={trip.id}>
              <article className={styles.feedCard}>
                <header className={styles.host}>
                  <span className={site.avatar} data-group={host.group} aria-hidden="true">{travellerInitials(name)}</span>
                  <div><strong>{name}</strong><small>{profileTypeLabels[host.group]} · {host.homeCity}{local && " · Local trip"}</small></div>
                  <button type="button" className={styles.save} aria-label={"Save " + trip.title} aria-pressed={saved.includes(trip.id)} onClick={() => toggleSaved(trip.id)}>
                    <Bookmark size={19} fill={saved.includes(trip.id) ? "currentColor" : "none"} aria-hidden="true" />
                  </button>
                </header>
                <Link className={styles.feedPhoto} href={href} aria-label={"View " + trip.title} onNavigate={() => rememberTripOpening(trip.slug)}>
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1264px) 420px, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, calc(100vw - 32px)" />
                  <span><MapPin size={14} aria-hidden="true" />{trip.destination}</span>
                </Link>
                <div className={styles.cardBody}>
                  <h3><Link href={href} onNavigate={() => rememberTripOpening(trip.slug)}>{trip.title}</Link></h3>
                  <p className={styles.facts}><CalendarDays size={15} aria-hidden="true" />{date}</p>
                  <p className={styles.facts}><MapPin size={15} aria-hidden="true" />From {trip.departureCity}</p>
                  <p className={styles.welcome}><UsersRound size={15} aria-hidden="true" /><span>Open to {trip.welcomeGroups.map(group => travellerGroupLabels[group]).join(" · ")}</span></p>
                  <div className={styles.cardBottom}>
                    <div>{trip.estimatedSharePerPersonInr !== undefined && <p className={styles.budget}><strong>{cost}</strong>{trip.estimatedSharePerPersonInr > 0 && <small>estimated / person</small>}</p>}
                      <span className={styles.spots}>{spots > 0 ? spots + (spots === 1 ? " spot left" : " spots left") : "Trip full"}</span>
                    </div>
                    <Link href={href} className={styles.join} onNavigate={() => rememberTripOpening(trip.slug)}>
                      {owner ? "Your trip" : request ? requestStatusLabels[request.status] + " request" : spots === 0 ? "View trip" : "Request to Join"}<ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      {matching.length === 0 && <p className={styles.empty}>No plans for this group yet. Try Everyone, or share a trip of your own.</p>}
      <p className={styles.expenseNote}>Shared expenses are estimates agreed between travellers. Share Yarana collects no payments.</p>
    </section>
  );
}
