"use client";

import {
  CalendarDays, Camera, Footprints, IdCard, Leaf, MapPin, Mountain, Phone, Route, Shield, TentTree,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { TripListing } from "@/data/trip-listings";
import type { ProfileCover, TravellerProfileView } from "@/data/traveller-profiles";
import { profileTypeLabels, travellerInitials, travellerInterestLabels } from "@/domain/travel";
import { useDemoTravel } from "../_shared/demo-travel";
import { Dialog } from "../_shared/dialog";
import { DialogButton } from "../_shared/dialog-button";
import { TripCard } from "../_shared/trip-card";
import { todayInIndia } from "../_shared/trip-draft";
import site from "../_shared/site.module.css";
import { ShareProfile } from "./share-profile";
import styles from "./profile.module.css";

const interestIcons = {
  hiking: Footprints, trekking: Mountain, "road-trip": Route, "weekend-getaway": CalendarDays,
  camping: TentTree, nature: Leaf, photography: Camera,
};

export function ProfileAvatar({ name, tone, className }: {
  name: string;
  tone: TravellerProfileView["avatarTone"];
  className?: string;
}) {
  return (
    <span className={[styles.avatar, className].filter(Boolean).join(" ")} data-tone={tone} aria-hidden="true">
      {travellerInitials(name.trim() || "SideTrail")}
    </span>
  );
}

export function ProfileView({ profile, cover, hostedTrips = [], own = false, actions }: {
  profile: TravellerProfileView;
  cover?: ProfileCover;
  hostedTrips?: readonly TripListing[];
  own?: boolean;
  actions?: ReactNode;
}) {
  const { listings, ready } = useDemoTravel();
  const today = ready ? todayInIndia() : "";
  const upcoming = ready && !own ? listings.filter(({ trip, cancelled }) =>
    !cancelled && trip.hostId === profile.id && trip.startsOn >= today)
    .sort(({ trip: a }, { trip: b }) => a.startsOn.localeCompare(b.startsOn)) : hostedTrips;

  return (
    <article className={site.container + " " + styles.profile} aria-labelledby="profile-title">
      <header className={styles.hero} data-cover={Boolean(cover) || undefined}>
        {cover && (
          <figure className={styles.cover}>
            <Image fill src={cover.src} alt={cover.alt} loading="eager" fetchPriority="high"
              sizes="(min-width: 1264px) 624px, (min-width: 768px) 52vw, calc(100vw - 32px)" />
          </figure>
        )}
        <div className={styles.identity}>
          <ProfileAvatar name={profile.displayName} tone={profile.avatarTone} />
          <p className={styles.profileTag}>{own ? "Editable sample profile" : "Sample traveller profile"}</p>
          <h1 id="profile-title">{profile.displayName}</h1>
          <ul className={styles.metadata}>
            {profile.homeCity && <li><MapPin size={17} aria-hidden="true" />{profile.homeCity}</li>}
            <li className={styles.type}>{profileTypeLabels[profile.group]}</li>
          </ul>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          {own && <p className={styles.profileNote}>Profile edits are separate from the Demo account used for trips.</p>}
          {profile.group === "couple" && profile.partnerDisplayName && (
            <p className={styles.profileNote}>Travels with {profile.partnerDisplayName}</p>
          )}
          {profile.group === "family" && <p className={styles.profileNote}>Parent-managed family profile</p>}
          <div className={styles.heroActions}>
            {own ? actions : (
              <>
                <Link href="#hosted-trips" className={site.buttonPrimary}>View hosted trips</Link>
                <ShareProfile key={profile.handle} handle={profile.handle} name={profile.displayName} />
              </>
            )}
          </div>
        </div>
      </header>

      <div className={styles.profileBody}>
        <section className={styles.travel} aria-labelledby="interests-title">
          <h2 id="interests-title">Travel interests</h2>
          {profile.interests.length ? (
            <ul className={styles.interests}>
              {profile.interests.map((interest) => {
                const Icon = interestIcons[interest];
                return <li key={interest}><Icon size={17} aria-hidden="true" />{travellerInterestLabels[interest]}</li>;
              })}
            </ul>
          ) : (
            <p>{own ? "Add the activities you’d like to do with other travellers." : "Interests are still to be added."}</p>
          )}
          {(profile.travelStyle || profile.favouriteDestinations?.length) ? (
            <dl className={styles.travelNotes}>
              {profile.travelStyle && <div><dt>Travel style</dt><dd>{profile.travelStyle}</dd></div>}
              {Boolean(profile.favouriteDestinations?.length) && (
                <div><dt>Favourite destinations</dt><dd>{profile.favouriteDestinations?.join(" · ")}</dd></div>
              )}
            </dl>
          ) : null}
        </section>

        <section id="hosted-trips" className={styles.hosted} aria-labelledby="hosted-title">
          <h2 id="hosted-title">Hosted trips</h2>
          {upcoming.length ? (
            <ul className={site.tripGrid + " " + styles.hostedGrid}>
              {upcoming.map((listing) => (
                <li key={listing.trip.id}><TripCard listing={listing} showTravelDetails /></li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <span><TentTree size={24} aria-hidden="true" /></span>
              <div>
                <h3>No upcoming trips yet</h3>
                <p>{own ? "Have a destination in mind? Start a draft when you’re ready." : "Find another plan in Explore while this traveller’s calendar is quiet."}</p>
                <Link href={own ? "/trips/new" : "/explore"} className={site.buttonOutline}>{own ? "Create a trip" : "Explore trips"}</Link>
              </div>
            </div>
          )}
        </section>

        <section className={styles.trust} aria-labelledby="trust-title">
          <h2 id="trust-title"><Shield size={21} aria-hidden="true" />Trust &amp; guidelines</h2>
          <dl>
            <div><dt><Phone size={16} aria-hidden="true" />Phone verification</dt><dd>Concept only</dd></div>
            {!own && <div><dt><IdCard size={16} aria-hidden="true" />Identity verification</dt><dd>Concept only</dd></div>}
          </dl>
          {own && (
            <>
              <p className={styles.verificationStatus}><IdCard size={16} aria-hidden="true" />Identity verification preview</p>
              <Link href="/verification" className={site.verificationLink}>Learn about verification</Link>
            </>
          )}
          <details>
            <summary>Community guidelines</summary>
            <ul>
              <li>Treat everyone with respect and honour their boundaries.</li>
              <li>Agree on the route, cost and meeting plan before travelling.</li>
              <li>Keep personal contact and family information private.</li>
            </ul>
          </details>
          {!own && (
            <>
              <DialogButton dialogId="report-profile" className={styles.reportButton}>Report profile</DialogButton>
              <Dialog id="report-profile" title="Reporting preview">
                <p>This is a design preview for reporting {profile.displayName}.</p>
                <p>On live profiles, reporting helps flag impersonation, harassment or unsafe travel behaviour.</p>
                <form method="dialog"><button type="submit" className={site.buttonPrimary}>Done</button></form>
              </Dialog>
            </>
          )}
        </section>
      </div>
    </article>
  );
}
