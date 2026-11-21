"use client";

import { Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { travellerHref } from "@/domain/travel";
import { Dialog } from "../_shared/dialog";
import { shareLink } from "../_shared/share-link";
import site from "../_shared/site.module.css";
import styles from "./profile.module.css";

export function ShareProfile({ handle, name }: { handle: string; name: string }) {
  const [status, setStatus] = useState("");
  const [url, setUrl] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  async function share() {
    const result = await shareLink(name + " on Share Yarana", travellerHref(handle));
    if (result.kind === "shared") setStatus("Share options opened.");
    if (result.kind === "copied") setStatus("Profile link copied.");
    if (result.kind === "manual") {
      setUrl(result.url);
      dialog.current?.showModal();
    }
  }

  return (
    <>
      <button type="button" className={site.buttonOutline} onClick={share}>
        <Share2 size={17} aria-hidden="true" />Share profile
      </button>
      <p className={styles.actionStatus} role="status">{status}</p>
      <Dialog id="share-profile" title="Share this profile" dialogRef={dialog}>
        <p>Select and copy the profile link to share it.</p>
        <label className={styles.field}>Profile link
          <input readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
        </label>
        <form method="dialog" className={styles.dialogEnd}><button type="submit" className={site.buttonPrimary}>Done</button></form>
      </Dialog>
    </>
  );
}
