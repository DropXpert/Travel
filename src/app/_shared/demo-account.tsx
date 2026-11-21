"use client";

import { useRef, useState } from "react";
import { profileTypeLabels } from "@/domain/travel";
import { demoAccounts, demoProfileFor, updateDemo, useDemoTravel } from "./demo-travel";
import { Dialog } from "./dialog";
import styles from "./site.module.css";

export function DemoAccount() {
  const { state, ready, damaged } = useDemoTravel();
  const dialog = useRef<HTMLDialogElement>(null);
  const reset = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");
  const account = demoProfileFor(state.account);

  function changeConfirmation(next: boolean) {
    setConfirming(next);
    requestAnimationFrame(() => (next ? keep : reset).current?.focus());
  }

  return (
    <div className={styles.demoBar}>
      <div className={styles.container}>
        <button type="button" className={styles.buttonText} aria-haspopup="dialog" disabled={!ready}
          onClick={() => { setNotice(""); dialog.current?.showModal(); }}>
          Demo account <span>· {profileTypeLabels[account.group]}</span>
        </button>
      </div>
      <Dialog id="demo-account" title="Demo account" dialogRef={dialog} onClose={() => setConfirming(false)}>
        <p>Switch fictional travellers to try hosting and joining. Trips and requests stay in this browser.</p>
        {damaged && <p role="alert">Demo data could not be read. Reset it to continue.</p>}
        <label className={styles.demoField}>
          Switch demo traveller
          <select value={state.account} disabled={damaged || confirming} onChange={async (event) => {
            const result = await updateDemo({ type: "switch", account: event.currentTarget.value });
            setNotice(result.ok ? "Demo traveller switched." : result.error);
          }}>
            {demoAccounts.map(({ id, group, displayName }) => <option value={id} key={id}>{profileTypeLabels[group]} · {displayName}</option>)}
          </select>
        </label>
        <p role="status">{notice}</p>
        {confirming ? (
          <>
            <p>Reset demo data? This removes published demo trips and request changes and restores the sample accounts. Your drafts and bookmarks are kept.</p>
            <div className={styles.dialogActions}>
              <button ref={keep} className={styles.buttonOutline} type="button" onClick={() => changeConfirmation(false)}>Keep demo data</button>
              <button className={styles.buttonPrimary} type="button" onClick={async () => {
                const result = await updateDemo({ type: "reset" });
                setNotice(result.ok ? "Demo data reset." : result.error);
                if (result.ok) changeConfirmation(false);
              }}>Confirm reset</button>
            </div>
          </>
        ) : <button ref={reset} className={styles.buttonOutline} type="button" onClick={() => changeConfirmation(true)}>Reset Demo Data</button>}
      </Dialog>
    </div>
  );
}
