"use client";

import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { TripListing } from "@/data/trip-listings";
import { activityLabels, availableSpots, travellerGroupLabels, travellerInitials, tripHostName, sharedExpenseNote } from "@/domain/travel";
import { useDemoTravel } from "./demo-travel";
import { DialogButton } from "./dialog-button";
import { Dialog } from "./dialog";
import { rememberTripOpening, tripHref } from "./trip-navigation";
import styles from "./site.module.css";

export function TripCard({ listing, showTravelDetails = false, eagerImage = false, savedAction, linkToDetails = false }: {
  listing: TripListing;
  showTravelDetails?: boolean;
  eagerImage?: boolean;
  savedAction?: ReactNode;
  linkToDetails?: boolean;
}) {
  const { listings } = useDemoTravel();
  const { trip, host, photo, date, cost, local, cancelled } = listings.find(({ trip }) => trip.id === listing.trip.id) ?? listing;
  const id = "preview-" + trip.slug;
  const available = availableSpots(trip);
  const availability = cancelled ? "Cancelled" : available === 1 ? "1 spot left" : available > 0 ? available + " spots left" : "Trip full";
  const hostName = tripHostName(trip, host);
  const welcomeGroups = trip.welcomeGroups.map((group) => travellerGroupLabels[group]).join(" · ");
  const initials = travellerInitials(hostName);
  const direct = Boolean(savedAction) || linkToDetails;

  return (
    <article className={styles.tripCard} data-detail={showTravelDetails || undefined}>
      <div className={styles.tripPhoto}>
        <Image
          fill
          src={photo.src}
          alt={photo.alt}
          loading={eagerImage ? "eager" : undefined}
          fetchPriority={eagerImage ? "high" : undefined}
          sizes="(min-width: 1264px) 384px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) calc((100vw - 68px) / 2), calc(100vw - 32px)"
        />
        <span className={styles.activity}>{activityLabels[trip.activity]}</span>
        {savedAction && <div className={styles.tripPhotoAction}>{savedAction}</div>}
      </div>
      <div className={styles.tripContent}>
        <p className={styles.tripLocation}><MapPin size={16} aria-hidden="true" />{trip.destination}</p>
        <h3>{direct ? (
          <Link className={styles.tripTitle} href={tripHref(trip.slug)} onNavigate={() => rememberTripOpening(trip.slug)}>
            {trip.title}
          </Link>
        ) : <DialogButton dialogId={id} className={styles.tripTitle}>{trip.title}</DialogButton>}</h3>
        <p className={styles.tripDate}>
          <CalendarDays size={16} aria-hidden="true" />
          <span>{date}{showTravelDetails && <> <span aria-hidden="true">·</span> From {trip.departureCity}</>}</span>
        </p>
        <div className={styles.tripHost}>
          <span className={styles.avatar} data-group={host.group} aria-hidden="true">{initials}</span>
          <div>
            <span className={styles.hostName}>{hostName}</span>
            <span className={styles.hostType}>{local ? "Published trip" : "Community trip"}</span>
          </div>
        </div>
        {showTravelDetails && (
          <p className={styles.tripGroups}>
            <UsersRound size={16} aria-hidden="true" />
            <span><span className="sr-only">Open to </span>{welcomeGroups}</span>
          </p>
        )}
        <div className={styles.tripBottom}>
          <div className={styles.tripCost}>
            <strong>{cost}</strong>
            {(trip.estimatedSharePerPersonInr ?? 0) > 0 && <span>est. budget / person</span>}
          </div>
          <span className={styles.availability}><span aria-hidden="true" />{availability}</span>
        </div>
      </div>

      {!direct && <Dialog id={id} title={trip.title}>
        <p>{trip.destination} · {activityLabels[trip.activity]} · Community trip</p>
        <dl className={styles.dialogFacts}>
          <div><dt>Dates</dt><dd>{date}</dd></div>
          <div><dt>Departing from</dt><dd>{trip.departureCity}</dd></div>
          <div><dt>Difficulty</dt><dd className="capitalize">{trip.difficulty}</dd></div>
          <div><dt>Host</dt><dd>{hostName}</dd></div>
          <div><dt>Estimated shared expenses per person</dt><dd>{cost}</dd></div>
          <div><dt>Availability</dt><dd>{availability}</dd></div>
          {showTravelDetails && <div><dt>Open to</dt><dd>{welcomeGroups}</dd></div>}
        </dl>
        <p>{host.bio}</p>
        <p>{sharedExpenseNote}</p>
        <p className={styles.previewNote}>Free to join. Requests and host decisions stay in this browser.</p>
        <div className={styles.dialogActions}>
          <Link className={styles.buttonPrimary} href={tripHref(trip.slug)} onNavigate={() => rememberTripOpening(trip.slug)}>
            View trip details
          </Link>
          <form method="dialog">
            <button type="submit" className={styles.buttonOutline}>Back to trips</button>
          </form>
        </div>
      </Dialog>}
    </article>
  );
}
