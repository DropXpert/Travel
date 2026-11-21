"use client";

import { CalendarDays, MapPin, Shield, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { demoRequestSeeds, type HostRequest } from "@/data/host-workspace";
import type { TripListing } from "@/data/trip-listings";
import { availableSpots, requestStatusLabels as labels, profileTypeLabels, travellerHref, travellerInterestLabels, tripHostName } from "@/domain/travel";
import { ProfileAvatar } from "../../_profile/profile-view";
import { demoProfileFor, updateDemo, useDemoTravel } from "../../_shared/demo-travel";
import { Dialog } from "../../_shared/dialog";
import { tripGroupHref } from "../../_shared/trip-navigation";
import site from "../../_shared/site.module.css";
import styles from "./host-workspace.module.css";

const filters = ["all", "pending", "accepted", "declined", "cancelled"] as const;
type Filter = (typeof filters)[number];
type Decision = { requestId: string; status: "accepted" | "declined" };

const safetyTips = [
  "Read the traveller’s profile and agree on the pace and expectations.",
  "Be upfront about expenses and how the group will split them.",
  "Keep personal details private and choose a public meeting point.",
  "Report suspicious behaviour through reporting tools where available.",
];

function participantLabel(count: number) {
  return count + (count === 1 ? " participant" : " participants");
}

export function HostWorkspace({ tripId }: { tripId: string }) {
  const { state, ready, listings } = useDemoTravel();
  const listing = listings.find(({ trip }) => trip.id === tripId);
  if (!listing || state.account !== listing.trip.hostId) {
    return <div className={site.container + " " + site.demoPanel}>
      <h1>Host Workspace</h1>
      <p>{!ready ? "Loading demo trip..." : listing ? "Switch to " + listing.host.displayName + " to manage this trip." : "This demo trip is unavailable in this browser."}</p>
      <Link className={site.buttonOutline} href="/dashboard?tab=hosting">Back to Hosting</Link>
    </div>;
  }
  const requests = state.requests.filter((request) => request.tripId === tripId).map((request) => ({
    ...demoRequestSeeds.find(({ id }) => request.id === id),
    ...request,
    traveller: demoProfileFor(request.requesterId),
  }));
  return <HostInbox key={tripId + state.account} listing={listing} requests={requests} account={state.account} />;
}

function HostInbox({ listing, requests, account }: { listing: TripListing; requests: readonly HostRequest[]; account: string }) {
  const { trip, host, photo, date, local, cancelled } = listing;
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [reviewing, setReviewing] = useState<HostRequest>();
  const [decision, setDecision] = useState<Decision>();
  const profileDialog = useRef<HTMLDialogElement>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const requestHeading = useRef<HTMLHeadingElement>(null);
  const accepted = requests.filter(({ status }) => status === "accepted");
  const remaining = availableSpots(trip);
  const pending = requests.filter(({ status }) => status === "pending").length;
  const visible = requests.filter(({ status }) => filter === "all" || filter === status);
  const deciding = requests.find(({ id }) => id === decision?.requestId);

  function review(request: HostRequest) {
    setReviewing(request);
    profileDialog.current?.showModal();
  }

  function askToDecide(requestId: string, status: Decision["status"]) {
    setDecision({ requestId, status });
    confirmDialog.current?.showModal();
  }

  async function confirmDecision() {
    if (!decision) return;
    const result = await updateDemo({ type: "decision", id: decision.requestId, status: decision.status }, account);
    setNotice(result.ok ? labels[decision.status] + " the demo request." : result.error);
    confirmDialog.current?.close();
    requestAnimationFrame(() => {
      (document.getElementById("request-title-" + decision.requestId) ?? requestHeading.current)?.focus();
    });
  }

  return (
    <article className={site.container + " " + styles.workspace} aria-labelledby="host-trip-title">
      <div className={styles.workspaceLinks}>
        <Link className={styles.textLink} href="/dashboard?tab=hosting">Back to Hosting</Link>
        {!cancelled && <Link className={site.buttonOutline} href={tripGroupHref(trip.slug)}>Trip Group Space</Link>}
      </div>
      <header className={styles.trip}>
        <div className={styles.cover}>
          <Image fill preload src={photo.src} alt={photo.alt}
            sizes="(min-width: 1264px) 505px, (min-width: 900px) 44vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)" />
        </div>
        <div className={styles.tripIdentity}>
          <p className={styles.eyebrow}>Host workspace · {cancelled ? "Cancelled" : local ? "Published demo trip" : "Sample trip"}</p>
          <h1 id="host-trip-title">{trip.title}</h1>
          <ul className={styles.tripFacts}>
            <li><MapPin size={17} aria-hidden="true" />{trip.destination}</li>
            <li><CalendarDays size={17} aria-hidden="true" />{date}</li>
          </ul>
          <p className={styles.hostName}>Hosted by {tripHostName(trip, host)} <span>· Community trip</span></p>
        </div>
      </header>
      <dl className={styles.capacity} aria-label="Demo trip capacity">
        <div><dt>Capacity</dt><dd>{trip.capacity}</dd></div>
        <div><dt>Spots filled</dt><dd>{trip.confirmedTravellers}</dd></div>
        <div><dt>Spots left</dt><dd>{cancelled ? 0 : remaining}</dd></div>
        <div><dt>Pending requests</dt><dd>{pending}</dd></div>
      </dl>

      <div className={styles.layout}>
        <section className={styles.inbox} aria-labelledby="host-inbox-title">
          <h2 id="host-inbox-title" ref={requestHeading} tabIndex={-1}>Join requests</h2>
          <p className={styles.lead}>Review requests from demo travellers. Your decisions stay in this browser.</p>
          <div className={styles.filters} role="group" aria-label="Filter join requests">
            {filters.map((item) => (
              <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>
                {item === "all" ? "All" : labels[item]}
              </button>
            ))}
          </div>
          <p role="status" className={styles.notice}>{notice}</p>
          {visible.length ? (
            <ul className={styles.requests}>
              {visible.map((request) => {
                const { id, traveller, partySize, startingCity, status, introduction } = request;
                const tooLarge = partySize > remaining;
                const ineligible = !trip.welcomeGroups.includes(traveller.group);
                return (
                  <li key={id} className={styles.request}>
                    <div className={styles.requestHeading}>
                      <ProfileAvatar name={traveller.displayName} tone={traveller.avatarTone} className={styles.avatar} />
                      <div>
                        <h3 tabIndex={-1} id={"request-title-" + id}>{traveller.displayName}</h3>
                        <p>{profileTypeLabels[traveller.group]} · {participantLabel(partySize)}</p>
                      </div>
                      <span className={styles.status} data-status={status}>{labels[status]}</span>
                    </div>
                    {startingCity && <p className={styles.city}><MapPin size={15} aria-hidden="true" />Starting in {startingCity}</p>}
                    {introduction && <p className={styles.message}>{introduction}</p>}
                    <button type="button" className={styles.textLink} aria-haspopup="dialog" onClick={() => review(request)}>
                      View profile<span className="sr-only"> for {traveller.displayName}</span>
                    </button>
                    {status === "pending" && (
                      <div className={styles.decisions}>
                        {ineligible && <p>This traveller category is no longer eligible.</p>}
                        {tooLarge && <p id={"capacity-" + id}>This party needs {partySize} spots. {remaining} {remaining === 1 ? "spot remains" : "spots remain"}.</p>}
                        <button type="button" className={site.buttonPrimary} aria-haspopup="dialog" disabled={tooLarge || ineligible}
                          aria-label={"Accept request from " + traveller.displayName}
                          aria-describedby={tooLarge ? "capacity-" + id : undefined} onClick={() => askToDecide(id, "accepted")}>
                          Accept request
                        </button>
                        <button type="button" className={site.buttonOutline} aria-haspopup="dialog"
                          aria-label={"Decline request from " + traveller.displayName} onClick={() => askToDecide(id, "declined")}>
                          Decline request
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : <p className={styles.empty}>No {filter === "all" ? "" : filter + " "}sample requests yet.</p>}
        </section>

        <div className={styles.rail}>
          <section className={styles.roster} aria-labelledby="host-roster-title">
            <h2 id="host-roster-title"><UsersRound size={22} aria-hidden="true" />Accepted travellers</h2>
            {accepted.length ? <ul>
              {accepted.map((request) => (
                <li key={request.id}>
                  <ProfileAvatar name={request.traveller.displayName} tone={request.traveller.avatarTone} className={styles.avatar} />
                  <div className={styles.rosterIdentity}>
                    <button type="button" className={styles.textLink} aria-haspopup="dialog" onClick={() => review(request)}>{request.traveller.displayName}</button>
                    <p>{profileTypeLabels[request.traveller.group]} · {participantLabel(request.partySize)}</p>
                  </div>
                  <span className={styles.status} data-status="accepted">Accepted</span>
                </li>
              ))}
            </ul> : <p>No travellers accepted in this preview yet.</p>}
          </section>
          <section className={styles.safety} aria-labelledby="host-safety-title">
            <h2 id="host-safety-title"><Shield size={22} aria-hidden="true" />Before you head out</h2>
            <ul>{safetyTips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            <p>Identity verification is a proposed future requirement for hosting.</p>
            <Link href="/verification#verification-safety" className={styles.textLink}>Travel safety guidance</Link>
          </section>
        </div>
      </div>

      <Dialog id="host-profile" title={reviewing?.traveller.displayName ?? "Traveller profile"} dialogRef={profileDialog} onClose={() => setReviewing(undefined)}>
        {reviewing && (
          <div className={styles.profile}>
            <div className={styles.requestHeading}>
              <ProfileAvatar name={reviewing.traveller.displayName} tone={reviewing.traveller.avatarTone} className={styles.avatar} />
              <div>
                <p>{profileTypeLabels[reviewing.traveller.group]} · {participantLabel(reviewing.partySize)} requested</p>
                {reviewing.traveller.homeCity && <p>{reviewing.traveller.homeCity} · Sample traveller profile</p>}
              </div>
            </div>
            <p>{reviewing.traveller.bio}</p>
            {reviewing.traveller.travelStyle && <div><h3>Travel style</h3><p>{reviewing.traveller.travelStyle}</p></div>}
            {reviewing.traveller.interests.length > 0 && (
              <div><h3>Interests</h3><ul className={styles.interests}>
                {reviewing.traveller.interests.map((interest) => <li key={interest}>{travellerInterestLabels[interest]}</li>)}
              </ul></div>
            )}
            <Link className={site.buttonOutline} href={travellerHref(reviewing.traveller.handle)} target="_blank" rel="noopener noreferrer">
              Open public profile<span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </div>
        )}
      </Dialog>
      <Dialog id="host-decision" title={decision?.status === "declined" ? "Decline request?" : "Accept request?"}
        dialogRef={confirmDialog} onClose={() => setDecision(undefined)}>
        {decision && deciding && (
          <>
            <p>{deciding.traveller.displayName} requested {participantLabel(deciding.partySize)}.</p>
            <p>{decision.status === "accepted"
              ? "Accepting confirms " + (deciding.partySize === 1 ? "1 spot" : deciding.partySize + " spots") + " in this demo."
              : "Declining keeps the same number of spots open in this demo."}</p>
            <div className={site.dialogActions}>
              <form method="dialog"><button type="submit" className={site.buttonOutline}>Cancel</button></form>
              <button type="button" className={decision.status === "accepted" ? site.buttonPrimary : styles.declineConfirm} onClick={confirmDecision}>
                {decision.status === "accepted" ? "Confirm acceptance" : "Confirm decline"}
              </button>
            </div>
          </>
        )}
      </Dialog>
    </article>
  );
}
