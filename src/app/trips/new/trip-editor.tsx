"use client";

import { ArrowDown, ArrowLeft, ArrowUp, Eye, Plus, Shield, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { DraftCover } from "@/data/trip-covers";
import { travellerGroupLabels, type TravellerGroup } from "@/domain/travel";
import { Dialog } from "../../_shared/dialog";
import {
  discardTripDraft, draftCategories, draftLimits, editTripDraft, emptyTripDraft, persistTripDraft,
  todayInIndia, useTripDraft, validateTripDraft, type DraftDay, type DraftErrors, type TripDraft,
} from "../../_shared/trip-draft";
import { useRouter } from "next/navigation";
import { demoProfileFor, updateDemo, useDemoTravel, type PublishedTrip } from "../../_shared/demo-travel";
import { tripHref } from "../../_shared/trip-navigation";
import site from "../../_shared/site.module.css";
import { DraftPreview } from "./draft-preview";
import styles from "./create.module.css";

const groups = Object.keys(travellerGroupLabels) as TravellerGroup[];
const sections = [
  ["trip-basics", "Trip basics"],
  ["people-and-cost", "People & budget"],
  ["plan-and-cover", "Plan & cover"],
] as const;

type TextField = Exclude<keyof TripDraft, "category" | "groups" | "itinerary" | "cover">;
const storageUnavailable = "Device storage is unavailable. Keep this tab open to keep your edits.";

export function TripEditor({ covers, editId }: { covers: readonly DraftCover[]; editId?: string }) {
  const { state, ready } = useDemoTravel();
  const published = state.trips.find(({ id }) => id === editId);
  if (editId && (!ready || !published || published.cancelled || published.hostId !== state.account)) {
    return <div className={site.container + " " + site.demoPanel}>
      <h1>Edit demo trip</h1>
      <p>{!ready ? "Loading demo trip..." : !published ? "This demo trip is unavailable in this browser."
        : published.cancelled ? "Cancelled trips can’t be edited." : "Switch to the host’s demo account to edit this trip."}</p>
      <Link className={site.buttonOutline} href="/dashboard?tab=hosting">Back to Hosting</Link>
    </div>;
  }
  return <Editor key={editId ?? "new"} covers={covers} published={published} account={state.account} ready={ready} />;
}

function Editor({ covers, published, account, ready }: { covers: readonly DraftCover[]; published?: PublishedTrip; account: string; ready: boolean }) {
  const { saved, savedText, working, migrated } = useTripDraft();
  const [edits, setEdits] = useState(published?.draft);
  const [revision] = useState(published?.revision);
  const draft = published ? edits! : working ?? saved ?? emptyTripDraft;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [publishError, setPublishError] = useState("");
  const validate = () => validateTripDraft(draft, published?.postedOn ?? todayInIndia());
  const cover = covers.find(({ src }) => src === draft.cover);
  const [attemptedPreview, setAttemptedPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDialogElement>(null);
  const discard = useRef<HTMLDialogElement>(null);
  const pendingDiscard = useRef({ savedText, working });
  const [discardError, setDiscardError] = useState("");
  const errors = attemptedPreview ? validate() : {};

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function keepFieldVisible() {
      const field = document.activeElement;
      if (!viewport || !(field instanceof HTMLElement) || !form.current?.contains(field)) return;
      if (!actions.current || getComputedStyle(actions.current).position !== "fixed") return;
      const bounds = field.getBoundingClientRect();
      const top = viewport.offsetTop;
      const bottom = Math.min(top + viewport.height, actions.current.getBoundingClientRect().top);
      if (bounds.top >= top && bounds.bottom + 8 <= bottom) return;
      const safeTop = top + Math.max(8, (bottom - top - bounds.height) / 2);
      window.scrollBy({ top: bounds.top - safeTop, behavior: "instant" });
    }

    viewport.addEventListener("resize", keepFieldVisible);
    return () => viewport.removeEventListener("resize", keepFieldVisible);
  }, []);

  function edit(patch: Partial<TripDraft>) {
    if (published) setEdits({ ...draft, ...patch });
    else editTripDraft({ ...draft, ...patch });
    setPublishError("");
    setNotice("");
  }

  function field(name: TextField) {
    const error = errors[name as keyof DraftErrors];
    return {
      name,
      value: draft[name],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => edit({ [name]: event.currentTarget.value }),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? name + "-error" : undefined,
    };
  }

  function errorFor(name: keyof DraftErrors) {
    return errors[name] && <span className={styles.fieldError} id={name + "-error"}>{errors[name]}</span>;
  }

  function openPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problems = validate();
    const [first] = Object.keys(problems);
    setAttemptedPreview(true);
    if (first) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[name="' + first + '"]')?.focus());
      setNotice("Check the highlighted fields before previewing.");
      return;
    }
    setNotice("");
    setShowPreview(true);
    preview.current?.showModal();
  }

  async function publish() {
    setBusy(true);
    setPublishError("");
    const result = await updateDemo(published && revision !== undefined
      ? { type: "edit", id: published.id, revision, draft }
      : { type: "publish", draft }, account);
    if (result.ok && result.id) {
      preview.current?.close();
      router.push(tripHref(result.id));
    } else if (!result.ok) setPublishError(result.error);
    setBusy(false);
  }

  function discardDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = discardTripDraft(pendingDiscard.current);
    if (result !== "discarded") {
      setDiscardError(result === "changed" ? "This draft changed in another tab. Close this window and review the draft." : storageUnavailable);
      return;
    }
    setAttemptedPreview(false);
    setNotice("Draft discarded.");
    discard.current?.close();
    requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('[name="title"]')?.focus());
  }

  function addDay() {
    const id = Math.max(0, ...draft.itinerary.map((day) => day.id)) + 1;
    edit({ itinerary: [...draft.itinerary, { id, title: "", note: "" }] });
    requestAnimationFrame(() => document.getElementById("day-" + id + "-title")?.focus());
  }

  function updateDay(id: number, patch: Partial<Omit<DraftDay, "id">>) {
    edit({ itinerary: draft.itinerary.map((day) => day.id === id ? { ...day, ...patch } : day) });
  }

  function moveDay(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= draft.itinerary.length) return;
    const itinerary = [...draft.itinerary];
    const day = itinerary[index];
    [itinerary[index], itinerary[target]] = [itinerary[target], day];
    edit({ itinerary });
    requestAnimationFrame(() => document.getElementById("day-" + day.id + "-title")?.focus());
  }

  const storageStatus = notice || (working ? "Unsaved changes" : saved ? "Draft saved on this device." : "Drafts stay on this device.");

  return (
    <>
      <div className={styles.intro}>
        <div className={site.container}>
          <div className={styles.introToolbar}>
            <Link href="/explore" className={styles.back}><ArrowLeft size={18} aria-hidden="true" />Back to Explore</Link>
            {!published && (saved || working) && <button type="button" className={styles.discard} aria-haspopup="dialog" onClick={() => {
              pendingDiscard.current = { savedText, working };
              setDiscardError("");
              discard.current?.showModal();
            }}>Discard draft</button>}
          </div>
          <h1>{published ? "Edit demo trip" : <>Where are we going<span>?</span></>}</h1>
          <p>{published ? "Update your published plan in this browser." : "Share a fictional travel plan. Hosting on Share Yarana is free."}</p>
          {!published && migrated && <p role="status">Your saved plan now uses the community-trip format. Review any previous amount as an estimated shared expense before saving. Your original draft will be backed up on this device.</p>}
          <div className={styles.progress}>
            <nav aria-label="Draft sections">
              {sections.map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}
            </nav>
          </div>
        </div>
      </div>

      <div className={site.container + " " + styles.layout}>
        <form id="trip-editor" className={styles.editor} ref={form} onSubmit={openPreview} noValidate>
          <section id="trip-basics" className={styles.section} aria-labelledby="basics-heading">
            <h2 id="basics-heading">Trip basics</h2>
            <div className={site.verificationNotice}>
              <Shield size={18} aria-hidden="true" />
              <div>
                <p>Identity verification will be required before publishing a real trip.</p>
                <Link href="/verification" target="_blank" rel="noopener noreferrer" className={site.verificationLink}>
                  Learn about verification<span className="sr-only"> (opens in a new tab)</span>
                </Link>
              </div>
            </div>
            <label className={styles.field}>
              Trip title
              <input {...field("title")} required maxLength={draftLimits.title} placeholder="e.g. Sunrise hike up Nandi Hills" />
              {errorFor("title")}
            </label>
            <div className={styles.pair}>
              <label className={styles.field}>
                Destination
                <input {...field("destination")} required maxLength={draftLimits.destination} placeholder="e.g. Nandi Hills" />
                {errorFor("destination")}
              </label>
              <label className={styles.field}>
                Starting city
                <input {...field("departureCity")} required maxLength={draftLimits.departureCity} placeholder="e.g. Bengaluru" />
                {errorFor("departureCity")}
              </label>
            </div>
            <div className={styles.pair}>
              <label className={styles.field}>
                Start date
                <input {...field("startsOn")} required type="date" />
                {errorFor("startsOn")}
              </label>
              <label className={styles.field}>
                End date
                <input {...field("endsOn")} required type="date" min={draft.startsOn || undefined} />
                {errorFor("endsOn")}
              </label>
            </div>
            <label className={styles.field}>
              Trip category
              <select name="category" value={draft.category} onChange={(event) => edit({ category: event.currentTarget.value as TripDraft["category"] })}>
                <option value="">Choose a category</option>
                {draftCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Short trip description <span className={styles.optional}>Optional</span></span>
              <textarea {...field("description")} rows={3} maxLength={draftLimits.description} placeholder="Early start, an easy pace, and chai with a view." />
            </label>
          </section>

          <section id="people-and-cost" className={styles.section} aria-labelledby="people-heading">
            <h2 id="people-heading">Who can join?</h2>
            <fieldset>
              <legend>Traveller groups</legend>
              <div className={styles.groupChoices}>
                {groups.map((group) => (
                  <label key={group}>
                    <input
                      type="checkbox"
                      name="groups"
                      value={group}
                      checked={draft.groups.includes(group)}
                      aria-invalid={errors.groups ? true : undefined}
                      aria-describedby={errors.groups ? "groups-error" : undefined}
                      onChange={(event) => edit({ groups: event.currentTarget.checked ? [...draft.groups, group] : draft.groups.filter((item) => item !== group) })}
                    />
                    {travellerGroupLabels[group]}
                  </label>
                ))}
              </div>
              {errorFor("groups")}
            </fieldset>
            <div className={styles.pair}>
              <label className={styles.field}>
                Maximum participants
                <input {...field("capacity")} required type="number" min="1" step="1" inputMode="numeric" placeholder="e.g. 6" />
                {errorFor("capacity")}
              </label>
              <label className={styles.field}>
                {published ? "Spots offered" : "Available spots"}
                <input {...field("spots")} type="number" min="0" max={draft.capacity || undefined} step="1" inputMode="numeric" placeholder="All spots by default" aria-describedby={errors.spots ? "spots-error" : "spots-hint"} />
                <span id="spots-hint" className={styles.hint}>{published ? "Accepted parties are deducted from the spots offered." : "Leave empty if all places are open."}</span>
                {errorFor("spots")}
              </label>
            </div>
            <label className={styles.field}>
              <span>Traveller preferences <span className={styles.optional}>Optional</span></span>
              <textarea {...field("preferences")} rows={2} maxLength={draftLimits.preferences} placeholder="e.g. Happy to walk at a relaxed pace with plenty of breaks." />
            </label>

            <div className={styles.subsection}>
              <h3>Estimated trip budget</h3>
              <label className={styles.field}>
                <span>Approximate cost per person (₹) <span className={styles.optional}>Optional</span></span>
                <input {...field("budget")} aria-describedby={errors.budget ? "budget-error budget-hint" : "budget-hint"} type="number" min="0" step="any" inputMode="decimal" placeholder="e.g. 850" />
                <span id="budget-hint" className={styles.hint}>Leave blank if undecided. Enter 0 for no expected expenses. This is an estimate, not a booking fee; Share Yarana collects no payments.</span>
                {errorFor("budget")}
              </label>
              <details>
                <summary>Shared expense details (optional)</summary>
                <div className={styles.pair}>
                  <label className={styles.field}>
                    <span>Expenses covered by the estimate <span className={styles.optional}>Optional</span></span>
                    <textarea {...field("included")} rows={2} maxLength={draftLimits.included} placeholder="e.g. Transport ₹400, stay ₹300, food ₹150" />
                  </label>
                  <label className={styles.field}>
                    <span>Expenses to plan for separately <span className={styles.optional}>Optional</span></span>
                    <textarea {...field("excluded")} rows={2} maxLength={draftLimits.excluded} placeholder="e.g. Meals and entry fees" />
                  </label>
                </div>
                <label className={styles.field}>
                  <span>Shared expense notes <span className={styles.optional}>Optional</span></span>
                  <textarea {...field("costNotes")} rows={2} maxLength={draftLimits.costNotes} placeholder="How will you split transport, accommodation, food or common expenses?" />
                </label>
              </details>
            </div>
          </section>

          <section id="plan-and-cover" className={styles.section} aria-labelledby="plan-heading">
            <h2 id="plan-heading">Plan & cover</h2>
            <div className={styles.subsection}>
              <h3>Itinerary</h3>
              {draft.itinerary.length === 0 && <p className={styles.hint}>Keeping plans flexible? You can add days later.</p>}
              <ol className={styles.days}>
                {draft.itinerary.map((day, index) => (
                  <li key={day.id}>
                    <div className={styles.dayHeader}>
                      <h4>Day {index + 1}</h4>
                      <div>
                        <button type="button" disabled={index === 0} aria-label={"Move day " + (index + 1) + " up"} className={styles.dayAction} onClick={() => moveDay(index, -1)}><ArrowUp size={18} aria-hidden="true" /></button>
                        <button type="button" disabled={index === draft.itinerary.length - 1} aria-label={"Move day " + (index + 1) + " down"} className={styles.dayAction} onClick={() => moveDay(index, 1)}><ArrowDown size={18} aria-hidden="true" /></button>
                        <button type="button" aria-label={"Remove day " + (index + 1)} className={styles.dayAction} onClick={() => {
                          edit({ itinerary: draft.itinerary.filter(({ id }) => id !== day.id) });
                          requestAnimationFrame(() => document.getElementById("add-day")?.focus());
                        }}><Trash2 size={18} aria-hidden="true" /></button>
                      </div>
                    </div>
                    <label className={styles.field}>
                      Day heading
                      <input id={"day-" + day.id + "-title"} value={day.title} maxLength={draftLimits.dayTitle} onChange={(event) => updateDay(day.id, { title: event.currentTarget.value })} placeholder="e.g. Hike up for sunrise" />
                    </label>
                    <label className={styles.field}>
                      Activities
                      <textarea value={day.note} rows={2} maxLength={draftLimits.dayNote} onChange={(event) => updateDay(day.id, { note: event.currentTarget.value })} placeholder="Leave before dawn, then stop for chai on the way back." />
                    </label>
                  </li>
                ))}
              </ol>
              <button id="add-day" type="button" className={site.buttonOutline + " " + styles.addDay} onClick={addDay}><Plus size={18} aria-hidden="true" />Add day</button>
            </div>
            <fieldset className={styles.coverSection}>
              <legend>Cover photo</legend>
              <p className={styles.hint}>Choose a sample photo that fits your destination.</p>
              <div className={styles.coverGrid}>
                {covers.map((photo) => (
                  <label key={photo.src}>
                    <input type="radio" name="cover" value={photo.src} checked={draft.cover === photo.src} onChange={() => edit({ cover: photo.src })} />
                    <span className={styles.coverThumb}><Image fill src={photo.src} alt="" sizes="(min-width: 1264px) 185px, (min-width: 1024px) 150px, (min-width: 640px) calc((100vw - 84px) / 4), calc((100vw - 44px) / 2)" /></span>
                    <span>{photo.label}</span>
                  </label>
                ))}
              </div>
              {cover && (
                <div className={styles.coverCredit}>
                  <span>Photo by <a href={cover.source} target="_blank" rel="noreferrer">{cover.author}</a> · <a href={cover.licenseUrl} target="_blank" rel="noreferrer">{cover.license}</a></span>
                  <button type="button" onClick={() => edit({ cover: "" })}>Remove cover</button>
                </div>
              )}
            </fieldset>
          </section>
        </form>

        <aside className={styles.side} aria-label="Listing and draft actions">
          <div className={styles.livePreview}>
            <h2>Your listing</h2>
            <DraftPreview draft={draft} cover={cover} compact />
          </div>
          <div className={styles.actions} ref={actions}>
            <p role="status">{published ? notice : storageStatus}</p>
            <div>
              {published ? <Link className={site.buttonOutline} href={tripHref(published.id)}>Cancel edit</Link>
                : <button type="button" className={site.buttonOutline} onClick={() => {
                  setNotice(persistTripDraft(draft) ? "Draft saved on this device." : storageUnavailable);
                }}>Save draft</button>}
              <button type="submit" form="trip-editor" className={site.buttonPrimary}><Eye size={18} aria-hidden="true" />Preview listing</button>
            </div>
          </div>
        </aside>
      </div>

      <Dialog id="listing-preview" title="Listing preview" dialogRef={preview} onClose={() => { setShowPreview(false); setPublishError(""); }}>
        <p>{published ? "Editing as " : "Publishing as "}{demoProfileFor(account).displayName}. Use fictional details only. The listing stays in this browser.</p>
        {showPreview && <DraftPreview draft={draft} cover={cover} />}
        {publishError && <p role="alert" className={styles.fieldError}>{publishError}</p>}
        <div className={site.dialogActions}>
          <form method="dialog"><button type="submit" className={site.buttonOutline}>Keep editing</button></form>
          <button type="button" className={site.buttonPrimary} disabled={!ready || busy} onClick={publish}>
            {published ? "Save demo changes" : "Publish trip (demo)"}
          </button>
        </div>
      </Dialog>
      <Dialog id="discard-draft" title="Discard this draft?" dialogRef={discard}>
        <p>This clears your form and removes the draft saved on this device.</p>
        {discardError && <p role="alert">{discardError}</p>}
        <div className={site.dialogActions}>
          <form method="dialog"><button type="submit" className={site.buttonOutline}>Keep editing</button></form>
          <form onSubmit={discardDraft}><button type="submit" className={styles.discardConfirm}>Discard draft</button></form>
        </div>
      </Dialog>
    </>
  );
}
