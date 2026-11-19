"use client";

import { useRef, useState, type FormEvent } from "react";
import { Dialog } from "./dialog";
import { draftLimits, emptyTripDraft, persistTripDraft, useTripDraft, validPlace } from "./trip-draft";
import styles from "./site.module.css";

export function TripPlanner({ className }: { className?: string }) {
  const { saved, working } = useTripDraft();
  const draft = working ?? saved;
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const destination = String(fields.get("destination")).trim();
    const departure = String(fields.get("departure")).trim();
    if (!validPlace(destination) || !validPlace(departure)) {
      setNotice("Enter a destination and starting city by name.");
      return;
    }
    const updated = { ...(draft ?? emptyTripDraft), destination, departureCity: departure };
    setNotice(persistTripDraft(updated) ? "Draft saved on this device." : "Device storage is unavailable. Keep this page open to keep your edits.");
  }

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" onClick={() => {
        form.current?.reset();
        dialog.current?.showModal();
      }}>Quick draft</button>
      <Dialog id="create-trip" title="Quick trip draft" dialogRef={dialog} onClose={() => setNotice("")}>
        <p>Jot down a destination and a starting city. You can add the rest in the trip editor.</p>
        <form ref={form} className={styles.draftForm} onSubmit={saveDraft} onChange={() => setNotice("")}>
          <label>
            Destination
            <input name="destination" defaultValue={draft?.destination} placeholder="e.g. Coorg" required maxLength={draftLimits.destination} />
          </label>
          <label>
            Departing from
            <input name="departure" defaultValue={draft?.departureCity} placeholder="e.g. Bengaluru" required maxLength={draftLimits.departureCity} />
          </label>
          <button type="submit" className={styles.buttonPrimary}>Save draft</button>
        </form>
        <div aria-live="polite" className={styles.draftStatus}>
          {notice && <p>{notice}</p>}
        </div>
        {saved && <form method="dialog"><button type="submit" className={styles.buttonOutline}>View my trip plan</button></form>}
      </Dialog>
    </>
  );
}
