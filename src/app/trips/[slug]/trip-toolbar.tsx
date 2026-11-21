"use client";

import { ArrowLeft, Bookmark, Share2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Dialog } from "../../_shared/dialog";
import { updateSavedTrip, useSavedTripIds } from "../../_shared/saved-trips";
import { shareLink as shareTripLink } from "../../_shared/share-link";
import { canGoBackFromTrip, tripHref } from "../../_shared/trip-navigation";
import site from "../../_shared/site.module.css";
import styles from "./trip.module.css";

export function TripToolbar({ id, title, slug, local }: { id: string; title: string; slug: string; local?: boolean }) {
  const saved = useSavedTripIds().includes(id);
  const [feedback, setFeedback] = useState("");
  const [shareLink, setShareLink] = useState("");
  const shareDialog = useRef<HTMLDialogElement>(null);

  async function shareTrip() {
    if (local) {
      setShareLink(new URL(tripHref(slug), window.location.origin).href);
      shareDialog.current?.showModal();
      return;
    }
    const result = await shareTripLink(title, tripHref(slug));
    if (result.kind === "shared") setFeedback("Share options opened.");
    if (result.kind === "copied") setFeedback("Trip link copied.");
    if (result.kind === "manual") {
      setShareLink(result.url);
      shareDialog.current?.showModal();
    }
  }

  function toggleSaved() {
    const result = updateSavedTrip(id);
    setFeedback(result === null
      ? "Device storage is unavailable. Your saves could not be updated."
      : result ? "Trip saved on this device." : "Trip removed from your saves.");
  }

  return (
    <div className={site.container + " " + styles.toolbar}>
      <div className={styles.toolbarRow}>
        <Link
          href="/explore"
          className={styles.toolButton + " " + styles.back}
          aria-label="Back to trips"
          onNavigate={(event) => {
            if (canGoBackFromTrip()) {
              event.preventDefault();
              window.history.back();
            }
          }}
        >
          <ArrowLeft size={20} aria-hidden="true" />
          <span>Back to trips</span>
        </Link>
        <Link className={styles.mobileBrand} href="/">SideTrail</Link>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.toolButton} aria-label={local ? "View local trip link" : "Share trip"} onClick={shareTrip}>
            <Share2 size={19} aria-hidden="true" />
            <span>{local ? "Trip link" : "Share"}</span>
          </button>
          <button type="button" className={styles.toolButton} aria-label="Save trip" aria-pressed={saved} onClick={toggleSaved}>
            <Bookmark size={19} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
      <p className={styles.toolbarStatus} role="status">{feedback}</p>

      <Dialog id="share-trip" title={local ? "Local trip link" : "Share this trip"} dialogRef={shareDialog}>
        <p>{local ? "This link opens the demo trip in this browser only." : "Select and copy the link to share it with someone."}</p>
        <label className={styles.shareField}>
          Trip link
          <input readOnly value={shareLink} onFocus={(event) => event.currentTarget.select()} />
        </label>
        <form method="dialog"><button type="submit" className={site.buttonPrimary}>Done</button></form>
      </Dialog>
    </div>
  );
}
