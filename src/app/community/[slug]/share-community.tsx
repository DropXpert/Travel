"use client";

import { Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { communityHref } from "@/data/communities";
import { Dialog } from "../../_shared/dialog";
import { shareLink } from "../../_shared/share-link";
import site from "../../_shared/site.module.css";
import styles from "./detail.module.css";

export function ShareCommunity({ slug, name }: { slug: string; name: string }) {
  const [feedback, setFeedback] = useState("");
  const [url, setUrl] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  async function share() {
    const result = await shareLink(name + " on SideTrail", communityHref(slug));
    if (result.kind === "shared") setFeedback("Share options opened.");
    if (result.kind === "copied") setFeedback("Community link copied.");
    if (result.kind === "manual") {
      setFeedback("");
      setUrl(result.url);
      dialog.current?.showModal();
    }
  }

  return (
    <>
      <button type="button" className={site.buttonOutline} onClick={share}>
        <Share2 size={17} aria-hidden="true" />Share<span className="sr-only"> community</span>
      </button>
      <p role="status" className={styles.shareStatus}>{feedback}</p>
      <Dialog id="share-community" title="Share this community" dialogRef={dialog}>
        <p>Select and copy the community link to share it.</p>
        <label className={styles.shareField}>
          Community link
          <input readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
        </label>
        <form method="dialog"><button type="submit" className={site.buttonPrimary}>Done</button></form>
      </Dialog>
    </>
  );
}
