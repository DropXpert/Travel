import { CalendarDays, Clock3, MapPin, Mountain, Route, ShieldCheck, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tripListings } from "@/data/trip-listings";
import { activityLabels, availableSpots, travellerGroupLabels, travellerHref, travellerInitials, tripHostName } from "@/domain/travel";
import { DialogButton } from "../../_shared/dialog-button";
import { SiteShell } from "../../_shared/site-shell";
import site from "../../_shared/site.module.css";
import { JoinRequestPreview } from "./join-request";
import { TripToolbar } from "./trip-toolbar";
import styles from "./trip.module.css";

type TripPageProps = { params: Promise<{ slug: string }> };

function findListing(slug: string) {
  return tripListings.find(({ trip }) => trip.slug === slug);
}

export function generateStaticParams() {
  return tripListings.map(({ trip }) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const listing = findListing((await params).slug);
  return listing
    ? { title: listing.trip.title + " | SideTrail", description: listing.trip.details?.description }
    : { title: "Trip not found | SideTrail" };
}

function tripDuration(start: string, end: string) {
  const nights = (Date.parse(end) - Date.parse(start)) / 86_400_000;
  return nights === 0 ? "1 day" : (nights + 1) + " days · " + nights + (nights === 1 ? " night" : " nights");
}

export default async function TripPage({ params }: TripPageProps) {
  const listing = findListing((await params).slug);
  if (!listing) notFound();

  const { trip, host, photo, date, cost } = listing;
  const commercial = trip.kind === "commercial";
  const listingType = commercial ? "Commercial trip" : "Personal trip";
  const costType = commercial ? "Organiser price" : "Estimated share";
  const hostName = tripHostName(trip, host);
  const hostCategory = host.group === "solo" ? "Solo traveller" : travellerGroupLabels[host.group];
  const groups = trip.welcomeGroups.map((group) => travellerGroupLabels[group]);
  const spots = availableSpots(trip);
  const availability = spots <= 0 ? "Trip full" : spots === 1 ? "1 spot available" : spots + " spots available";
  const canRequest = spots > 0 && groups.length > 0;
  const duration = tripDuration(trip.startsOn, trip.endsOn);
  const { details } = trip;
  const itinerary = details?.itinerary;

  return (
    <SiteShell isTrip>
      <TripToolbar key={"trip-toolbar-" + trip.slug} id={trip.id} title={trip.title} slug={trip.slug} />
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
              <p className={styles.kicker}><span>{activityLabels[trip.activity]}</span><span>{listingType}</span></p>
              <h1 id="trip-title">{trip.title}</h1>
              <p className={styles.location}><MapPin size={19} aria-hidden="true" />{trip.destination}</p>
            </header>
          </div>

          <dl className={styles.facts}>
            <div><dt><CalendarDays size={17} aria-hidden="true" />Dates</dt><dd>{date}</dd></div>
            <div><dt><Clock3 size={17} aria-hidden="true" />Duration</dt><dd>{duration}</dd></div>
            <div><dt><Route size={17} aria-hidden="true" />Starting city</dt><dd>{trip.departureCity}</dd></div>
            <div><dt><Mountain size={17} aria-hidden="true" />Difficulty</dt><dd className="capitalize">{trip.difficulty}</dd></div>
          </dl>
          {groups.length > 0 && (
            <p className={styles.welcomeLine}>
              <UsersRound size={17} aria-hidden="true" />
              <span>Welcomes {groups.join(", ").toLowerCase()}</span>
            </p>
          )}

          <section className={styles.section} aria-labelledby="host-title">
            <h2 id="host-title">{commercial ? "Meet the organiser" : "Meet your host"}</h2>
            <div className={styles.hostCard}>
              <span className={site.avatar + " " + styles.hostAvatar} data-group={host.group} aria-hidden="true">
                {travellerInitials(hostName)}
              </span>
              <div className={styles.hostText}>
                <h3>
                  {!commercial && hostName === host.displayName ? (
                    <Link href={travellerHref(host.handle)} className={styles.hostProfileLink}>{hostName}</Link>
                  ) : hostName}
                </h3>
                <p className={styles.hostMeta}>
                  {commercial ? "Commercial organiser" : hostName === host.displayName ? hostCategory + " · " + host.homeCity : (
                    <>Hosted by <Link href={travellerHref(host.handle)} className={styles.hostProfileLink}>{host.displayName}</Link> · {hostCategory}</>
                  )}
                </p>
                {!commercial && <p>{host.bio}</p>}
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
                    <li key={title}>
                      <span>Day {index + 1}</span>
                      <div><h3>{title}</h3><p>{note}</p></div>
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

          <section className={styles.section} aria-labelledby="budget-title">
            <h2 id="budget-title">Trip budget</h2>
            <p className={styles.budget}><strong>{cost}</strong> <span>{costType} per person</span></p>
            <p>
              {details?.costNotes ?? (commercial
                ? "Ask the organiser for a breakdown of what’s included and any separately charged expenses."
                : "Shared expenses are estimated. Check what the group plans to split and what you’ll cover separately.")}
            </p>
          </section>

          <section className={styles.safety} aria-labelledby="safety-title">
            <h2 id="safety-title"><ShieldCheck size={23} aria-hidden="true" />Before you set off</h2>
            <ul>
              <li>Review the route, costs, and meeting arrangements with your host.</li>
              <li>Speak with the host before travelling and share your plans with someone you trust.</li>
              <li>Avoid sending advance payments outside trusted channels.</li>
              <li>If something feels off, stop and report it through the platform where you were contacted.</li>
            </ul>
          </section>
        </article>

        <aside className={styles.joinPanel} aria-labelledby="join-title">
          <h2 id="join-title">Join this trip</h2>
          <p className={styles.panelPrice}><strong>{cost}</strong> <span>{costType} per person</span></p>
          <p className={styles.panelAvailability}><UsersRound size={18} aria-hidden="true" />{availability}</p>
          <dl className={styles.panelFacts}>
            <div><dt>Dates</dt><dd>{date}</dd></div>
            <div><dt>Departing from</dt><dd>{trip.departureCity}</dd></div>
          </dl>
          {canRequest ? (
            <>
              <DialogButton dialogId="join-trip" className={site.buttonPrimary}>Request to Join</DialogButton>
              <p className={styles.panelNote}>Try a request preview for this sample trip.</p>
            </>
          ) : <p>{spots <= 0 ? "All spots are accounted for." : "The host is still confirming who can join."}</p>}
        </aside>
      </div>

      <div className={styles.mobileAction} role="region" aria-label="Trip availability and join">
        <div>
          <p><strong>{cost}</strong> <span>{commercial ? "price / person" : "est. / person"}</span></p>
          <p>{availability}</p>
        </div>
        {canRequest && <DialogButton dialogId="join-trip" className={site.buttonPrimary}>Request to Join</DialogButton>}
      </div>

      {canRequest && (
        <JoinRequestPreview key={"join-request-" + trip.slug} title={trip.title} hostName={hostName} groups={trip.welcomeGroups} spots={spots} />
      )}
    </SiteShell>
  );
}
