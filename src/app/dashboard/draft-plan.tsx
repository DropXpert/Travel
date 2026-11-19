"use client";

import { CalendarDays, Eye, ImageIcon, MapPin, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import type { DraftCover } from "@/data/trip-covers";
import { travellerGroupLabels } from "@/domain/travel";
import { Dialog } from "../_shared/dialog";
import { discardTripDraft, draftCost, draftDates, useTripDraft } from "../_shared/trip-draft";
import { TripPlanner } from "../_shared/trip-planner";
import site from "../_shared/site.module.css";
import { DraftPreview } from "../trips/new/draft-preview";
import styles from "./dashboard.module.css";

type Photo = { src: string; alt: string };

export function DraftPlan({ covers, emptyPhoto }: { covers: readonly DraftCover[]; emptyPhoto: Photo }) {
  const { saved, savedText, working } = useTripDraft();
  const draft = working ?? saved;
  const cover = covers.find(({ src }) => src === draft?.cover);
  const preview = useRef<HTMLDialogElement>(null);
  const discard = useRef<HTMLDialogElement>(null);
  const create = useRef<HTMLAnchorElement>(null);
  const pendingDiscard = useRef({ savedText, working });
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cost = draft ? draftCost(draft.budget) : "";

  function confirmDiscard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = discardTripDraft(pendingDiscard.current);
    if (result !== "discarded") {
      setError(result === "changed"
        ? "This draft has changed. Go back and review it before discarding."
        : "Device storage is unavailable. Your draft could not be discarded.");
      return;
    }
    discard.current?.close();
    setNotice("Draft discarded.");
    requestAnimationFrame(() => create.current?.focus());
  }

  function restoreIfDraftIsGone() {
    if (!draft) create.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <div className={styles.sectionHeader}>
        <h2>Trip drafts</h2>
        <TripPlanner className={styles.textAction} />
      </div>
      <p role="status" className={styles.notice}>{draft ? "" : notice}</p>
      {draft ? (
        <article className={styles.draftCard}>
          <div className={styles.planPhoto}>
            {cover ? (
              <Image fill src={cover.src} alt={cover.alt} loading="eager"
                sizes="(min-width: 1024px) 420px, (min-width: 768px) 44vw, calc(100vw - 32px)" />
            ) : <div className={styles.photoPlaceholder}><ImageIcon size={26} aria-hidden="true" />Cover photo to be chosen</div>}
            <span className={styles.draftTag}>Draft</span>
          </div>
          <div className={styles.draftBody}>
            <p className={styles.draftStatus}>{working ? "Unsaved changes in this tab" : "Saved on this device"}</p>
            <h3>{draft.title.trim() || "Untitled trip plan"}</h3>
            <ul className={styles.facts}>
              <li><MapPin size={17} aria-hidden="true" />{draft.destination.trim() || "Destination to be decided"}</li>
              <li><CalendarDays size={17} aria-hidden="true" />{draftDates(draft.startsOn, draft.endsOn)}</li>
              <li><UsersRound size={17} aria-hidden="true" />
                {draft.groups.length ? draft.groups.map((group) => travellerGroupLabels[group]).join(" · ") : "Traveller groups to be decided"}
              </li>
            </ul>
            <p className={styles.draftType}>{draft.kind === "commercial" ? "Commercial trip" : "Personal trip"}
              {cost && <> · {cost} {draft.kind === "commercial" ? "per person" : "estimated share per person"}</>}
            </p>
            <div className={styles.draftActions}>
              <Link href="/trips/new" className={site.buttonPrimary}>Continue editing</Link>
              <button type="button" className={site.buttonOutline} aria-haspopup="dialog" onClick={() => {
                setShowPreview(true);
                preview.current?.showModal();
              }}><Eye size={17} aria-hidden="true" />Preview</button>
              <button type="button" className={styles.discardLink} aria-haspopup="dialog" onClick={() => {
                pendingDiscard.current = { savedText, working };
                setError("");
                discard.current?.showModal();
              }}>Discard draft</button>
            </div>
          </div>
        </article>
      ) : (
        <div className={styles.planEmpty}>
          <div className={styles.planPhoto}>
            <Image fill src={emptyPhoto.src} alt={emptyPhoto.alt} loading="eager"
              sizes="(min-width: 1024px) 420px, (min-width: 768px) 44vw, calc(100vw - 32px)" />
          </div>
          <div className={styles.draftBody}>
            <h3>Every good trip starts with an idea.</h3>
            <p>Pick a place and save a draft. You can fill in the details whenever you’re ready.</p>
            <Link ref={create} href="/trips/new" className={site.buttonPrimary}>Create a Trip</Link>
          </div>
        </div>
      )}

      <Dialog id="dashboard-draft-preview" title="Draft preview" dialogRef={preview} onClose={() => {
        setShowPreview(false);
        restoreIfDraftIsGone();
      }}>
        <p>This is your private planning draft.</p>
        {showPreview && (draft ? <DraftPreview draft={draft} cover={cover} /> : <p>The draft is no longer available.</p>)}
        <form method="dialog" className={styles.previewDone}><button type="submit" className={site.buttonPrimary}>Done</button></form>
      </Dialog>
      <Dialog id="dashboard-discard-draft" title="Discard this draft?" dialogRef={discard} onClose={restoreIfDraftIsGone}>
        <p>This removes the trip plan from this device and clears any unsaved edits in this tab.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={site.dialogActions}>
          <form method="dialog"><button type="submit" className={site.buttonOutline}>Keep draft</button></form>
          <form onSubmit={confirmDiscard}><button type="submit" className={styles.discardConfirm}>Discard draft</button></form>
        </div>
      </Dialog>
    </>
  );
}
