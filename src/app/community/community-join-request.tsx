"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Community } from "@/data/communities";
import { profileTypeLabels } from "@/domain/travel";
import { Dialog } from "../_shared/dialog";
import site from "../_shared/site.module.css";
import styles from "./community.module.css";

type Participation = Pick<Community, "groups" | "expectations">;
export function CommunityJoinDialog({ dialogId, name, groups, expectations }: Participation & { dialogId: string; name: string }) {
  const [request, setRequest] = useState(0);
  return (
    <Dialog id={dialogId} title={"Join " + name} className={styles.preview} onClose={() => setRequest((value) => value + 1)}>
      <CommunityJoinRequest key={request} groups={groups} expectations={expectations} />
    </Dialog>
  );
}

export function CommunityJoinRequest({ groups, expectations, focusOnMount = false }: Participation & { focusOnMount?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const typeSelect = useRef<HTMLSelectElement>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (done || focusOnMount) heading.current?.focus();
  }, [done, focusOnMount]);

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const group = new FormData(event.currentTarget).get("traveller-type");
    if (!groups.some((eligibleGroup) => eligibleGroup === group)) {
      setError(true);
      typeSelect.current?.focus();
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <section className={styles.done} aria-labelledby="community-done-title">
        <span className={styles.doneIcon}><Check size={23} aria-hidden="true" /></span>
        <h3 tabIndex={-1} ref={heading} id="community-done-title">Your request</h3>
        <p>Your request is shown here only. Nothing has been sent.</p>
        <form method="dialog"><button className={site.buttonPrimary} type="submit">Done</button></form>
      </section>
    );
  }

  return (
    <section className={styles.joinStep} aria-labelledby="community-request-title">
      <h3 tabIndex={-1} ref={heading} id="community-request-title">Join request</h3>
      <p>{expectations}</p>
      <form className={styles.joinForm} onSubmit={submitRequest} noValidate>
        <label htmlFor="community-traveller-type">Traveller type</label>
        <div className={styles.formSelect}>
          <select
            ref={typeSelect}
            id="community-traveller-type"
            name="traveller-type"
            defaultValue=""
            required
            aria-invalid={error || undefined}
            aria-describedby={error ? "community-type-error" : undefined}
            onChange={() => setError(false)}
          >
            <option value="" disabled>Choose traveller type</option>
            {groups.map((group) => <option key={group} value={group}>{profileTypeLabels[group]}</option>)}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
        {error && <p className={styles.error} id="community-type-error" role="alert">Choose a traveller type to continue.</p>}
        <label htmlFor="community-introduction">Short introduction <span>Optional</span></label>
        <textarea id="community-introduction" rows={3} maxLength={240}
          aria-describedby="community-introduction-hint" placeholder="What kind of trips do you enjoy?" />
        <p className={styles.fieldHint} id="community-introduction-hint">Up to 240 characters. Leave out contact details and children’s personal information.</p>
        <p className={styles.fieldHint}>This preview stays on this screen.</p>
        <button type="submit" className={site.buttonPrimary + " " + styles.joinButton}>Review request</button>
      </form>
    </section>
  );
}
