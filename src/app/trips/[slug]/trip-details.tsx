"use client";

import { CalendarDays, Clock3, MapPin, Mountain, Route, ShieldCheck, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { activityLabels, availableSpots, travellerGroupLabels, travellerHref, travellerInitials, tripHostName, requestStatusLabels } from "@/domain/travel";
import { DialogButton } from "../../_shared/dialog-button";
import { demoProfileFor, useDemoTravel } from "../../_shared/demo-travel";
import { tripGroupHref } from "../../_shared/trip-navigation";
import site from "../../_shared/site.module.css";
import { JoinRequestDialog } from "./join-request";
import { TripToolbar } from "./trip-toolbar";
import styles from "./trip.module.css";
import { TripReviews } from "./trip-reviews";

function tripDuration(start: string, end: string) {
  const nights = (Date.parse(end) - Date.parse(start)) / 86_400_000;
  return nights === 0 ? "1 day" : (nights + 1) + " days · " + nights + (nights === 1 ? " night" : " nights");
}

export function TripDetails({ slug }: { slug: string }) {
  const { state, ready, listings } = useDemoTravel();
  const listing = listings.find(({ trip }) => trip.slug === slug);
  if (!listing) return <div className={site.container + " " + site.demoPanel}>
    <h1>{ready ? "Trip unavailable" : "Loading trip..."}</h1>
    <p>{ready && "This listing may be on another browser or have been reset."}</p>
    <Link className={site.buttonOutline} href="/explore">Explore trips</Link>
  </div>;

  const { trip, host, photo, date, local, cancelled } = listing;
  const hostName = tripHostName(trip, host);
  const hostCategory = host.group === "solo" ? "Solo traveller" : travellerGroupLabels[host.group];
  const groups = trip.welcomeGroups.map((group) => travellerGroupLabels[group]);
  const spots = availableSpots(trip);
  const availability = cancelled ? "Trip cancelled" : spots <= 0 ? "Trip full" : spots === 1 ? "1 spot available" : spots + " spots available";
  const owner = state.account === trip.hostId;
  const traveller = demoProfileFor(state.account);
  const request = state.requests.find(({ tripId, requesterId }) => tripId === trip.id && requesterId === state.account);
  const eligible = trip.welcomeGroups.includes(traveller.group);
  const minParty = traveller.group === "solo" ? 1 : 2;
  const canRequest = ready && !cancelled && !owner && !request && eligible && spots >= minParty;
  const requestUnavailable = ready && !cancelled && !owner && !request
    ? !eligible ? "Your traveller isn’t eligible for this trip." : spots > 0 && spots < minParty ? "Too few spots for your party." : ""
    : "";
  const action = !cancelled && owner ? (
    <Link className={site.buttonPrimary} href={"/dashboard/requests?trip=" + encodeURIComponent(trip.id)}>Manage requests</Link>
  ) : request?.status === "accepted" && !cancelled ? (
    <Link className={site.buttonPrimary} href={tripGroupHref(trip.slug)}>Trip Group Space</Link>
  ) : request ? (
    <Link className={site.buttonOutline} href="/dashboard?tab=join-requests">Request: {requestStatusLabels[request.status]}</Link>
  ) : canRequest ? (
    <DialogButton dialogId="join-trip" className={site.buttonPrimary}>Request to Join</DialogButton>
  ) : null;
  const duration = tripDuration(trip.startsOn, trip.endsOn);
  const { details } = trip;
  const itinerary = details?.itinerary;

  return (
    <>
      <TripToolbar key={"trip-toolbar-" + trip.slug} id={trip.id} title={trip.title} slug={trip.slug} local={local} />
      <div className={site.container + " " + styles.layout}>
        <article className={styles.article} aria-labelledby="trip-title">
          <div className={styles.hero}>
            <figure className={styles.photo}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1264px) 832px, (min-width: 1024px) calc(100vw - 384px), (min-width: 640px) calc(100vw - 48px), 100vw"
              />
            </figure>
            <header className={styles.overview}>
              <p className={styles.kicker}><span>{activityLabels[trip.activity]}</span><span>{local ? "Published trip" : "Community trip"}</span></p>
              <h1 id="trip-title">{trip.title}</h1>
              <p className={styles.location}><MapPin size={19} aria-hidden="true" />{trip.destination}</p>
            </header>
          </div>

          <dl className={styles.facts}>
            <div><dt><CalendarDays size={17} aria-hidden="true" />Dates</dt><dd>{date}</dd></div>
            <div><dt><Clock3 size={17} aria-hidden="true" />Duration</dt><dd>{duration}</dd></div>
            <div><dt><Route size={17} aria-hidden="true" />Starting city</dt><dd>{trip.departureCity}</dd></div>
            {!local && <div><dt><Mountain size={17} aria-hidden="true" />Difficulty</dt><dd className="capitalize">{trip.difficulty}</dd></div>}
          </dl>
          {groups.length > 0 && (
            <p className={styles.welcomeLine}>
              <UsersRound size={17} aria-hidden="true" />
              <span>Welcomes {groups.join(", ").toLowerCase()}</span>
            </p>
          )}

          <section className={styles.section} aria-labelledby="host-title">
            <h2 id="host-title">Meet your host</h2>
            <div className={styles.hostCard}>
              <span className={site.avatar + " " + styles.hostAvatar} data-group={host.group} aria-hidden="true">
                {travellerInitials(hostName)}
              </span>
              <div className={styles.hostText}>
                <h3>
                  {hostName === host.displayName ? (
                    <Link href={travellerHref(host.handle)} className={styles.hostProfileLink}>{hostName}</Link>
                  ) : hostName}
                </h3>
                <p className={styles.hostMeta}>
                  {hostName === host.displayName ? hostCategory + " · " + host.homeCity : (
                    <>Hosted by <Link href={travellerHref(host.handle)} className={styles.hostProfileLink}>{host.displayName}</Link> · {hostCategory}</>
                  )}
                </p>
                <p>{host.bio}</p>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="description-title">
            <h2 id="description-title">What to expect</h2>
            <p>{details?.description ?? "The host is still putting together the trip description."}</p>
          </section>

          <section className={styles.section} aria-labelledby="itinerary-title">
            <h2 id="itinerary-title">The plan</h2>
            {itinerary?.length ? (
              <>
                <p>Here’s the outline. Confirm the timings with the host before making travel plans.</p>
                <ol className={styles.itinerary}>
                  {itinerary.map(({ title, note }, index) => (
                    <li key={index}>
                      <span>Day {index + 1}</span>
                      <div><h3>{title || "Trip plan"}</h3><p>{note}</p></div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <div className={styles.itineraryEmpty}>
                <CalendarDays size={21} aria-hidden="true" />
                <p>Plans are still being finalized. Check with the host for the route and timing before you travel.</p>
              </div>
            )}
          </section>

          <section className={styles.section} aria-labelledby="eligibility-title">
            <h2 id="eligibility-title">Who can join</h2>
            <div className={styles.eligibility}>
              <p><UsersRound size={19} aria-hidden="true" />{availability}</p>
              {groups.length ? (
                <ul aria-label="Traveller categories welcomed by the host">
                  {groups.map((group) => <li key={group}>{group}</li>)}
                </ul>
              ) : <p>The host is still confirming which traveller categories can join.</p>}
            </div>
            {details?.suitability && <p>{details.suitability}</p>}
          </section>

          <TripReviews tripId={trip.id} />

          <section className={styles.safety} aria-labelledby="safety-title">
            <h2 id="safety-title"><ShieldCheck size={23} aria-hidden="true" />Before you set off</h2>
            <ul>
              <li>Review the route and meeting arrangements with your host.</li>
              <li>Speak with the host before travelling and share your plans with someone you trust.</li>
              <li>Avoid sending advance payments outside trusted channels.</li>
              <li>If something feels off, stop and report it through the platform where you were contacted.</li>
            </ul>
          </section>
        </article>

        <aside className={styles.joinPanel} aria-labelledby="join-title">
          <h2 id="join-title">{owner ? "Manage this trip" : "Join this trip"}</h2>
          <p className={styles.panelAvailability}><UsersRound size={18} aria-hidden="true" />{availability}</p>
          <dl className={styles.panelFacts}>
            <div><dt>Dates</dt><dd>{date}</dd></div>
            <div><dt>Departing from</dt><dd>{trip.departureCity}</dd></div>
          </dl>
          {action}
          {!cancelled && <p className={styles.panelNote}>{requestUnavailable || "Requests and decisions stay in this browser."}</p>}
          {!cancelled && owner && local && <Link className={site.buttonOutline} href={"/trips/new?edit=" + trip.slug}>Edit trip</Link>}
        </aside>
      </div>

      <div className={styles.mobileAction} role="region" aria-label="Trip availability and join">
        <div>
          <p>{availability}</p>
          {requestUnavailable && <p>{requestUnavailable}</p>}
        </div>
        {action}
      </div>

      <JoinRequestDialog key={trip.id + state.account} tripId={trip.id} title={trip.title} hostName={hostName}
        account={traveller} spots={spots} dashboardHref="/dashboard?tab=join-requests" />
    </>
  );
}
