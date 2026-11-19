"use client";

import { Check, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { travellerGroupLabels, type TravellerGroup } from "@/domain/travel";
import { Dialog } from "../../_shared/dialog";
import site from "../../_shared/site.module.css";
import styles from "./trip.module.css";

export function JoinRequestPreview({ title, hostName, groups, spots }: {
  title: string;
  hostName: string;
  groups: readonly TravellerGroup[];
  spots: number;
}) {
  const [preview, setPreview] = useState<{ group: TravellerGroup; participants: number }>();
  const [error, setError] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (preview) confirmation.current?.focus();
  }, [preview]);

  function createPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const group = groups.find((value) => value === fields.get("group"));
    const participants = Number(fields.get("participants"));
    if (!group || !Number.isInteger(participants) || participants < 1 || participants > spots) {
      setError("Choose an eligible traveller category and a party size within the available spots.");
      return;
    }
    setPreview({ group, participants });
  }

  function resetPreview() {
    form.current?.reset();
    setPreview(undefined);
    setError("");
  }

  return (
    <Dialog id="join-trip" title="Request to join" onClose={resetPreview}>
      {preview ? (
        <div className={styles.confirmation}>
          <span><Check size={23} aria-hidden="true" /></span>
          <h3 ref={confirmation} tabIndex={-1}>Request preview created</h3>
          <p>{travellerGroupLabels[preview.group]} · {preview.participants} {preview.participants === 1 ? "participant" : "participants"}</p>
          <p>This preview is for you only and clears when you close it. The host receives requests on live trips.</p>
          <form method="dialog"><button type="submit" className={site.buttonPrimary}>Done</button></form>
        </div>
      ) : (
        <>
          <div className={styles.requestTrip}>
            <strong>{title}</strong>
            <span>Hosted by {hostName}</span>
          </div>
          <p>Tell the host a little about your travel plans.</p>
          <div className={site.verificationNotice + " " + styles.verificationNotice}>
            <Shield size={17} aria-hidden="true" />
            <div>
              <p>Identity verification will be required before real trip requests can be sent.</p>
              <Link href="/verification" target="_blank" rel="noopener noreferrer" className={site.verificationLink}>
                Learn about verification<span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </div>
          </div>
          <form ref={form} className={styles.requestForm} onSubmit={createPreview} onChange={() => setError("")}>
            <div className={styles.formPair}>
              <label>
                Traveller category
                <select name="group" defaultValue="" required>
                  <option value="" disabled>Choose a category</option>
                  {groups.map((group) => <option key={group} value={group}>{travellerGroupLabels[group]}</option>)}
                </select>
              </label>
              <label>
                Participants
                <input name="participants" type="number" inputMode="numeric" min={1} max={spots} defaultValue={1} required />
              </label>
            </div>
            <label>
              Message to host (optional)
              <textarea name="message" rows={3} maxLength={280} aria-describedby="request-note" placeholder="What made you want to join this trip?" />
            </label>
            <p id="request-note" className={styles.formNote}>Keep it about the trip. Leave out contact or ID details.</p>
            {error && <p className={styles.formError} role="alert">{error}</p>}
            <button type="submit" className={site.buttonPrimary}>Create request preview</button>
          </form>
        </>
      )}
    </Dialog>
  );
}
