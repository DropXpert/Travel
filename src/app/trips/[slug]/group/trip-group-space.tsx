"use client";

import { CalendarDays, ClipboardList, MapPin, Megaphone, MessageCircle, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { getGroupContent, type TripGroupDemo } from "@/data/trip-groups";
import { profileTypeLabels, travellerHref } from "@/domain/travel";
import { ProfileAvatar } from "../../../_profile/profile-view";
import { demoProfileFor, useDemoTravel } from "../../../_shared/demo-travel";
import { tripHref } from "../../../_shared/trip-navigation";
import site from "../../../_shared/site.module.css";
import styles from "./group.module.css";
import { ChatLocation } from "./chat-location";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "itinerary", label: "Itinerary" },
  { id: "chat", label: "Group Chat" },
  { id: "checklist", label: "Checklist" },
] as const;
type Tab = (typeof tabs)[number]["id"];
const tabChanged = "sidetrail-group-tab-changed";
const checklist = [
  "Pack the essentials",
  "Fill your water bottle",
  "Check the weather",
  "Get hiking shoes ready",
  "Review travel documents",
  "Confirm transport arrangements",
] as const;

function subscribeTab(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(tabChanged, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(tabChanged, listener);
  };
}

function browserTab(): Tab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return tabs.find(({ id }) => id === tab)?.id ?? "overview";
}

export function ConnectedTripGroup({ slug }: { slug: string }) {
  const { state, ready, listings } = useDemoTravel();
  const listing = listings.find(({ trip }) => trip.slug === slug);
  const accepted = state.requests.filter(({ tripId, status }) => tripId === listing?.trip.id && status === "accepted");
  const canOpen = listing && !listing.cancelled
    && (state.account === listing.trip.hostId || accepted.some(({ requesterId }) => requesterId === state.account));

  if (!ready || !canOpen) return <div className={site.container + " " + site.demoPanel}>
    <h1>Trip Group Space</h1>
    <p>{!ready ? "Loading group..." : !listing ? "This group is unavailable in this browser."
      : listing.cancelled ? "This trip was cancelled." : "Switch to the host or an accepted traveller to open the group."}</p>
    <Link className={site.buttonOutline} href={tripHref(slug)}>Back to trip details</Link>
  </div>;

  return <TripGroupSpace key={slug + state.account} group={{
    listing,
    members: [
      { traveller: demoProfileFor(listing.trip.hostId), partySize: 0, host: true },
      ...accepted.map(({ requesterId, partySize }) => ({ traveller: demoProfileFor(requesterId), partySize, host: false })),
    ],
    ...getGroupContent(slug, listing.trip.hostId),
  }} />;
}

function TripGroupSpace({ group }: { group: TripGroupDemo }) {
  const { listing: { trip, host, photo, date }, members, meeting, messages, announcements } = group;
  const active = useSyncExternalStore<Tab>(subscribeTab, browserTab, () => "overview");
  const [checked, setChecked] = useState<readonly string[]>([]);
  const tabList = useRef<HTMLDivElement>(null);
  const partySize = members.reduce((sum, member) => sum + member.partySize, 0);
  const alreadyFilled = trip.confirmedTravellers - partySize;
  const itinerary = trip.details?.itinerary;

  useEffect(() => {
    const row = tabList.current;
    const button = row?.querySelector("[aria-selected=true]");
    if (!row || !button) return;
    const tab = button.getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    if (tab.right > bounds.right - 4) row.scrollLeft += tab.right - bounds.right + 4;
    else if (tab.left < bounds.left + 4) row.scrollLeft -= bounds.left - tab.left + 4;
  }, [active]);

  function selectTab(next: Tab, focus = false) {
    if (next !== active) {
      const url = new URL(window.location.href);
      if (next === "overview") url.searchParams.delete("tab");
      else url.searchParams.set("tab", next);
      window.history.pushState(null, "", url);
      window.dispatchEvent(new Event(tabChanged));
    }
    if (focus) tabList.current?.querySelector<HTMLButtonElement>("#group-tab-" + next)?.focus();
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const indices: Partial<Record<string, number>> = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = indices[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next].id, true);
  }

  return (
    <article className={site.container + " " + styles.space} aria-labelledby="group-title">
      <Link href={tripHref(trip.slug)} className={styles.textLink}>Back to trip details</Link>
      <header className={styles.hero}>
        <figure className={styles.cover}>
          <Image fill preload src={photo.src} alt={photo.alt}
            sizes="(min-width: 1152px) 485px, (min-width: 900px) 44vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)" />
        </figure>
        <div className={styles.identity}>
          <p className={styles.eyebrow}>Trip group space</p>
          <h1 id="group-title">{trip.title}</h1>
          <ul className={styles.facts}>
            <li><MapPin size={17} aria-hidden="true" />{trip.destination}</li>
            <li><CalendarDays size={17} aria-hidden="true" />{date}</li>
          </ul>
          <p className={styles.groupStatus}><UsersRound size={17} aria-hidden="true" />{partySize} accepted {partySize === 1 ? "participant" : "participants"}</p>
        </div>
      </header>

      <div role="tablist" aria-label="Trip group sections" className={styles.tabs} ref={tabList}>
        {tabs.map(({ id, label }, index) => (
          <button key={id} id={"group-tab-" + id} type="button" role="tab" aria-controls={"group-panel-" + id}
            aria-selected={active === id} tabIndex={active === id ? 0 : -1}
            onClick={() => selectTab(id)} onKeyDown={(event) => moveTab(event, index)}>{label}</button>
        ))}
      </div>

      {tabs.map(({ id }) => (
        <section key={id} id={"group-panel-" + id} role="tabpanel" aria-labelledby={"group-tab-" + id}
          hidden={id !== active} tabIndex={0} className={styles.panel}>
          {id === active && id === "overview" && (
            <div className={styles.overview}>
              <section className={styles.announcements} aria-labelledby="group-announcements">
                <h2 id="group-announcements"><Megaphone size={23} aria-hidden="true" />Host announcements</h2>
                <p className={styles.lead}>{announcements.length ? "Fictional examples from " + host.displayName + "." : "No announcements for this trip yet."}</p>
                <ul>{announcements.map(({ title, text }) => <li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ul>
              </section>
              <section className={styles.meeting} aria-labelledby="group-meeting">
                <h2 id="group-meeting"><MapPin size={23} aria-hidden="true" />Meeting point</h2>
                <p className={styles.area}>{meeting.area}</p>
                <p>{meeting.time ?? "Time to be agreed"}</p>
                {meeting.instructions && <p>{meeting.instructions}</p>}
              </section>
            </div>
          )}

          {id === active && id === "members" && (
            <>
              <h2>Meet the crew</h2>
              <p className={styles.lead}>{partySize} accepted {partySize === 1 ? "participant" : "participants"} in the request roster. Adults manage family participation.</p>
              {alreadyFilled > 0 && <p>{alreadyFilled} {alreadyFilled === 1 ? "spot was" : "spots were"} already filled when this listing was created.</p>}
              <ul className={styles.members}>
                {members.map(({ traveller, partySize, host: isHost }) => (
                  <li key={traveller.id}>
                    <ProfileAvatar name={traveller.displayName} tone={traveller.avatarTone} className={styles.avatar} />
                    <div>
                      <h3><Link className={styles.textLink} href={travellerHref(traveller.handle)}>{traveller.displayName}</Link></h3>
                      <p>{profileTypeLabels[traveller.group]}{!isHost && (" · " + partySize + (partySize === 1 ? " person" : " people"))}</p>
                    </div>
                    <span className={styles.memberStatus} data-host={isHost || undefined}>{isHost ? "Sample host" : "Sample participant"}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {id === active && id === "itinerary" && (
            <div className={styles.timeline}>
              <h2>Shared itinerary</h2>
              <p className={styles.lead}>{date} · Trip outline</p>
              {itinerary?.length ? (
                <ol>{itinerary.map(({ title, note }, index) => (
                  <li key={index}><span>Day {index + 1}</span><div><h3>{title}</h3><p>{note}</p></div></li>
                ))}</ol>
              ) : <p>The host is still outlining the route and activities.</p>}
              {trip.details?.suitability && <aside className={styles.meeting}><h3>Host note</h3><p>{trip.details.suitability}</p></aside>}
            </div>
          )}

          {id === active && id === "chat" && (
            <div className={styles.conversation}>
              <h2><MessageCircle size={23} aria-hidden="true" />Group Chat</h2>
              <p className={styles.lead}>Fictional conversation · All times IST</p>
              <aside className={styles.chatAnnouncement}><Megaphone size={19} aria-hidden="true" /><div>
                <h3>Sample host announcement</h3><p>{announcements[0]?.text ?? "No messages for this trip."}</p>
              </div></aside>
              <ol className={styles.messages}>
                {messages.map(({ id, traveller, host: isHost, text, time }) => (
                  <li key={id} data-host={isHost || undefined}>
                    <ProfileAvatar name={traveller.displayName} tone={traveller.avatarTone} className={styles.avatar} />
                    <div>
                      <p className={styles.sender}><strong>{traveller.displayName}{isHost && " · Host"}</strong><time dateTime={time}>{time}</time></p>
                      <p className={styles.bubble}>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <ChatLocation tripId={trip.id} />
              <label className={styles.composer}>Message
                <input disabled placeholder="Messaging is unavailable" aria-describedby="group-chat-note" />
              </label>
              <p id="group-chat-note" className={styles.lead}>Text messages are samples. Shared locations stay in this browser; chat is not connected.</p>
            </div>
          )}

          {id === active && id === "checklist" && (
            <div className={styles.checklist}>
              <h2><ClipboardList size={23} aria-hidden="true" />Your travel checklist</h2>
              <p className={styles.lead}>Your checklist resets when you refresh.</p>
              <p className={styles.progress} role="status">{checked.length} of {checklist.length} ready</p>
              <fieldset>
                <legend className="sr-only">Trip preparation</legend>
                {checklist.map((item) => (
                  <label key={item}>
                    <input type="checkbox" checked={checked.includes(item)} onChange={(event) => {
                      const ready = event.currentTarget.checked;
                      setChecked((current) => ready ? [...current, item] : current.filter((value) => value !== item));
                    }} />
                    <span>{item}</span>
                  </label>
                ))}
              </fieldset>
            </div>
          )}
        </section>
      ))}
    </article>
  );
}
