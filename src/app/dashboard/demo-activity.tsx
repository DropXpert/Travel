"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { availableSpots, requestStatusLabels } from "@/domain/travel";
import { updateDemo, useDemoTravel } from "../_shared/demo-travel";
import { Dialog } from "../_shared/dialog";
import { tripGroupHref, tripHref } from "../_shared/trip-navigation";
import site from "../_shared/site.module.css";

export function DemoActivity({ hosting }: { hosting: boolean }) {
  const { state, listings } = useDemoTravel();
  const hosted = listings.filter(({ trip }) => trip.hostId === state.account);
  const sent = state.requests.filter(({ requesterId }) => requesterId === state.account);
  const [cancel, setCancel] = useState<{ id: string; title: string }>();
  const [notice, setNotice] = useState("");
  const confirmation = useRef<HTMLDialogElement>(null);

  function askToCancel(id: string, title: string) {
    setCancel({ id, title });
    confirmation.current?.showModal();
  }

  return (
    <div className={site.demoPanel}>
      <h2>{hosting ? "Trips you host" : "Your demo join requests"}</h2>
      <p>Activity for this demo traveller stays in this browser.</p>
      <p role="status">{notice}</p>
      {hosting ? (hosted.length ? (
        <ul>{hosted.map(({ trip, date, local, cancelled }) => (
          <li key={trip.id}>
            <h3><Link className={site.buttonText} href={tripHref(trip.slug)}>{trip.title}</Link></h3>
            <p>{date} · {cancelled ? "Cancelled demo trip" : local ? "Published demo trip" : "Sample trip"}</p>
            {!cancelled && <p>{availableSpots(trip)} spots left</p>}
            <div className={site.dialogActions}>
              <Link href={"/dashboard/requests?trip=" + encodeURIComponent(trip.id)} className={site.buttonOutline}>Manage requests</Link>
              {local && !cancelled && <>
                <Link href={"/trips/new?edit=" + trip.slug} className={site.buttonOutline}>Edit demo trip</Link>
                <button type="button" className={site.buttonText} onClick={() => askToCancel(trip.id, trip.title)}>Cancel demo trip</button>
              </>}
            </div>
          </li>
        ))}</ul>
      ) : <p>No trips hosted yet. <Link className={site.buttonText} href="/trips/new">Create a Trip</Link></p>) : (sent.length ? (
        <ul>{sent.map((request) => {
          const listing = listings.find(({ trip }) => trip.id === request.tripId);
          if (!listing) return null;
          const { trip, date } = listing;
          return <li key={request.id}>
            <h3><Link className={site.buttonText} href={tripHref(trip.slug)}>{trip.title}</Link></h3>
            <p>{date} · {request.partySize} {request.partySize === 1 ? "participant" : "participants"} · <strong>{requestStatusLabels[request.status]}</strong></p>
            <div className={site.dialogActions}>
              {request.status === "accepted" && <Link className={site.buttonOutline} href={tripGroupHref(trip.slug)}>Trip Group Space</Link>}
              {(request.status === "pending" || request.status === "accepted") && <button className={site.buttonText} type="button"
                onClick={() => askToCancel(request.id, trip.title)}>Cancel demo request</button>}
            </div>
          </li>;
        })}</ul>
      ) : <p>No demo requests yet. <Link className={site.buttonText} href="/explore">Explore Trips</Link></p>)}
      <Dialog id="cancel-demo-activity" title={hosting ? "Cancel demo trip?" : "Cancel demo request?"} dialogRef={confirmation} onClose={() => setCancel(undefined)}>
        <p>{cancel?.title}</p>
        <p>{hosting ? "This removes the trip from Explore and cancels all pending and accepted requests." : "Your request will show as cancelled. Any accepted places will reopen."}</p>
        <div className={site.dialogActions}>
          <form method="dialog"><button className={site.buttonOutline} type="submit">Keep it</button></form>
          <button type="button" className={site.buttonPrimary} onClick={async () => {
            if (!cancel) return;
            const result = await updateDemo({ type: hosting ? "cancel-trip" : "cancel-request", id: cancel.id }, state.account);
            setNotice(result.ok ? (hosting ? "Demo trip cancelled." : "Demo request cancelled.") : result.error);
            confirmation.current?.close();
          }}>Confirm cancellation</button>
        </div>
      </Dialog>
    </div>
  );
}
