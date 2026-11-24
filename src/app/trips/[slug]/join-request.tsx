"use client";

import { Check, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { profileTypeLabels, type TravellerProfile } from "@/domain/travel";
import { updateDemo } from "../../_shared/demo-travel";
import { Dialog } from "../../_shared/dialog";
import site from "../../_shared/site.module.css";
import styles from "./trip.module.css";

export function JoinRequestDialog({ tripId, title, hostName, account, spots, dashboardHref }: {
  tripId: string;
  title: string;
  hostName: string;
  account: TravellerProfile;
  spots: number;
  dashboardHref: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const confirmation = useRef<HTMLHeadingElement>(null);
  const min = account.group === "solo" ? 1 : 2;
  const max = account.group === "family" ? spots : min;

  useEffect(() => {
    if (submitted) confirmation.current?.focus();
  }, [submitted]);

  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const partySize = Number(new FormData(event.currentTarget).get("participants"));
    const result = await updateDemo({ type: "join", tripId, partySize }, account.id);
    if (result.ok) setSubmitted(true);
    else setError(result.error);
    setBusy(false);
  }

  return (
    <Dialog id="join-trip" title="Request to Join" onClose={() => { setSubmitted(false); setError(""); }}>
      {submitted ? (
        <div className={styles.confirmation}>
          <span><Check size={23} aria-hidden="true" /></span>
          <h3 ref={confirmation} tabIndex={-1}>Request saved</h3>
          <p>Your request is pending. Switch to the host’s traveller profile to review it in this browser.</p>
          <div className={site.dialogActions}>
            <Link href={dashboardHref} className={site.buttonPrimary}>View My Requests</Link>
            <form method="dialog"><button type="submit" className={site.buttonOutline}>Done</button></form>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.requestTrip}><strong>{title}</strong><span>Hosted by {hostName}</span></div>
          <p>Join for free as {account.displayName} · {profileTypeLabels[account.group]}. Requests stay in this browser.</p>
          <div className={site.verificationNotice + " " + styles.verificationNotice}>
            <Shield size={17} aria-hidden="true" />
            <div>
              <p>Real trips will require phone verification by SMS and a separate government ID check. This local demo stays open.</p>
              <Link href="/verification" target="_blank" rel="noopener noreferrer" className={site.verificationLink}>
                Learn about verification<span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </div>
          </div>
          <form className={styles.requestForm} onSubmit={request}>
            <label>Participants
              <input name="participants" type="number" inputMode="numeric" min={min} max={max} defaultValue={min} required />
            </label>
            {error && <p className={styles.formError} role="alert">{error}</p>}
            <button type="submit" disabled={busy} className={site.buttonPrimary}>Send request</button>
          </form>
        </>
      )}
    </Dialog>
  );
}
