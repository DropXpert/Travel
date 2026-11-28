"use client";

import { useRef, useState, type FormEvent } from "react";
import { demoProfileFor, useDemoTravel } from "../../_shared/demo-travel";
import { Dialog } from "../../_shared/dialog";
import { updateSocial, useSocialEntries } from "../../_shared/social-state";
import site from "../../_shared/site.module.css";
import styles from "../../_shared/social.module.css";

export function TripReviews({ tripId }: { tripId: string }) {
  const { state, listings } = useDemoTravel();
  const listing = listings.find(l => l.trip.id === tripId);
  const eligible = !listing?.cancelled && state.requests.some(r => r.tripId === tripId && r.requesterId === state.account && r.status === "accepted");
  return <Reviews key={tripId + state.account} tripId={tripId} account={state.account} eligible={eligible} />;
}

function Reviews({ tripId, account, eligible }: { tripId: string; account: string; eligible: boolean }) {
  const { entries, damaged } = useSocialEntries();
  const reviews = entries.filter(e => e.kind === "review").filter(e => e.tripId === tripId);
  const own = reviews.find(e => e.author === account);
  const dialog = useRef<HTMLDialogElement>(null);
  const [rating, setRating] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    const result = await updateSocial({ add: { kind: "review", tripId, rating: Number(rating), text: text.trim() } }, account);
    setBusy(false);
    if (result) { setError(result); return; }
    dialog.current?.close();
    setNotice("Trip feedback saved in this browser. Nothing was sent online.");
  }
  return <section className={styles.section} aria-labelledby="trip-reviews-title">
    <div className={styles.heading}><div><h2 id="trip-reviews-title">Traveller feedback</h2><p className={styles.note}>Thoughts on the plan or the experience. Local demo reviews, not verified trips.</p></div>
      {eligible && !damaged && <button className={site.buttonOutline} onClick={() => { setRating(own ? String(own.rating) : ""); setText(own?.text ?? ""); setError(""); dialog.current?.showModal(); }}>{own ? "Edit feedback" : "Leave feedback"}</button>}
    </div>
    {damaged ? <p role="alert">Feedback could not be read. Use Reset Demo Data to start again.</p> : !reviews.length && <p className={styles.empty}>No feedback yet. Accepted travellers can share their thoughts here.</p>}
    <p role="status" className={styles.status}>{notice}</p>
    <ul>{reviews.map(review => <li key={review.id} className={styles.review}>
      <div className={styles.author}><strong>{demoProfileFor(review.author).displayName}</strong><span aria-label={review.rating + " out of 5 stars"}>{review.rating}/5</span></div>
      <p>{review.text}</p>
      {review.author === account && <button className={site.buttonText} onClick={async () => setNotice(await updateSocial({ remove: review.id }, account) || "Feedback removed.")}>Remove feedback</button>}
    </li>)}</ul>
    <Dialog id="trip-feedback" title={own ? "Edit trip feedback" : "Leave trip feedback"} dialogRef={dialog}>
      <p>Your review will appear on this trip in this browser only. Don&apos;t include private contact details.</p>
      <form className={styles.form} onSubmit={save}>
        <label>Your rating<select required value={rating} onChange={e => setRating(e.target.value)}><option value="">Choose a rating</option>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} {n === 1 ? "star" : "stars"}</option>)}</select></label>
        <label>Your feedback<textarea required maxLength={1200} rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="What worked well? What could be better?" /></label>
        {error && <p role="alert">{error}</p>}
        <div className={styles.actions}><button className={site.buttonPrimary} disabled={busy || !text.trim() || !rating}>{busy ? "Saving..." : "Save feedback locally"}</button><button className={site.buttonOutline} type="button" onClick={() => dialog.current?.close()}>Cancel</button></div>
      </form>
    </Dialog>
  </section>;
}
