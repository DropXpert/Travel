"use client";

import { ArrowDown, ArrowLeft, ArrowUp, Eye, Plus, Shield, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { DraftCover } from "@/data/trip-covers";
import { travellerGroupLabels, type TravellerGroup } from "@/domain/travel";
import { Dialog } from "../../_shared/dialog";
import { DialogButton } from "../../_shared/dialog-button";
import {
  draftCategories, draftLimits, editTripDraft, emptyTripDraft, persistTripDraft,
  todayInIndia, useTripDraft, validateTripDraft, type DraftDay, type DraftErrors, type TripDraft,
} from "../../_shared/trip-draft";
import site from "../../_shared/site.module.css";
import { DraftPreview } from "./draft-preview";
import styles from "./create.module.css";

const groups = Object.keys(travellerGroupLabels) as TravellerGroup[];
const sections = [
  ["trip-basics", "Trip basics"],
  ["people-and-cost", "People & cost"],
  ["plan-and-cover", "Plan & cover"],
] as const;

type TextField = Exclude<keyof TripDraft, "kind" | "category" | "groups" | "itinerary" | "cover">;
const storageUnavailable = "Device storage is unavailable. Keep this tab open to keep your edits.";

export function TripEditor({ covers }: { covers: readonly DraftCover[] }) {
  const { saved, working } = useTripDraft();
  const draft = working ?? saved ?? emptyTripDraft;
  const cover = covers.find(({ src }) => src === draft.cover);
  const commercial = draft.kind === "commercial";
  const [attemptedPreview, setAttemptedPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const preview = useRef<HTMLDialogElement>(null);
  const discard = useRef<HTMLDialogElement>(null);
  const errors = attemptedPreview ? validateTripDraft(draft, todayInIndia()) : {};

  function edit(patch: Partial<TripDraft>) {
    editTripDraft({ ...draft, ...patch });
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
    const problems = validateTripDraft(draft, todayInIndia());
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

  function discardDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!persistTripDraft(null)) {
      discard.current?.close();
      setNotice(storageUnavailable);
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
            {(saved || working) && <DialogButton dialogId="discard-draft" className={styles.discard}>Discard draft</DialogButton>}
          </div>
          <h1>Where are we going<span>?</span></h1>
          <p>Got a trip in mind? Find your people and make it happen.</p>
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
            <fieldset>
              <legend>Trip type</legend>
              <div className={styles.typeChoices}>
                <label>
                  <input type="radio" name="kind" value="personal" checked={!commercial} onChange={() => edit({ kind: "personal" })} />
                  <span><strong>Personal community trip</strong><small>Plan together and share estimated expenses.</small></span>
                </label>
                <label>
                  <input type="radio" name="kind" value="commercial" checked={commercial} onChange={() => edit({ kind: "commercial" })} />
                  <span><strong>Organised commercial trip</strong><small>List a trip at an advertised organiser price.</small></span>
                </label>
              </div>
            </fieldset>
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
                Available spots
                <input {...field("spots")} type="number" min="0" max={draft.capacity || undefined} step="1" inputMode="numeric" placeholder="All spots by default" aria-describedby={errors.spots ? "spots-error" : "spots-hint"} />
                <span id="spots-hint" className={styles.hint}>Leave empty if all places are open.</span>
                {errorFor("spots")}
              </label>
            </div>
            <label className={styles.field}>
              <span>Traveller preferences <span className={styles.optional}>Optional</span></span>
              <textarea {...field("preferences")} rows={2} maxLength={draftLimits.preferences} placeholder="e.g. Happy to walk at a relaxed pace with plenty of breaks." />
            </label>

            <div className={styles.subsection}>
              <h3>Trip cost</h3>
              <label className={styles.field}>
                {commercial ? "Advertised price per person (₹)" : "Estimated share per person (₹)"}
                <input {...field("budget")} required type="number" min="0" step="any" inputMode="decimal" placeholder="e.g. 850" />
                {errorFor("budget")}
              </label>
              <div className={styles.pair}>
                <label className={styles.field}>
                  <span>What’s included <span className={styles.optional}>Optional</span></span>
                  <textarea {...field("included")} rows={2} maxLength={draftLimits.included} placeholder="e.g. Shared transport" />
                </label>
                <label className={styles.field}>
                  <span>What’s excluded <span className={styles.optional}>Optional</span></span>
                  <textarea {...field("excluded")} rows={2} maxLength={draftLimits.excluded} placeholder="e.g. Meals and entry fees" />
                </label>
              </div>
              <label className={styles.field}>
                <span>Additional cost notes <span className={styles.optional}>Optional</span></span>
                <textarea {...field("costNotes")} rows={2} maxLength={draftLimits.costNotes} placeholder="Add anything travellers should budget for." />
              </label>
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
          <div className={styles.actions}>
            <p role="status">{storageStatus}</p>
            <div>
              <button type="button" className={site.buttonOutline} onClick={() => {
                setNotice(persistTripDraft(draft) ? "Draft saved on this device." : storageUnavailable);
              }}>Save draft</button>
              <button type="submit" form="trip-editor" className={site.buttonPrimary}><Eye size={18} aria-hidden="true" />Preview listing</button>
            </div>
          </div>
        </aside>
      </div>

      <Dialog id="listing-preview" title="Listing preview" dialogRef={preview} onClose={() => setShowPreview(false)}>
        <p>This preview is visible to you on this device.</p>
        {showPreview && <DraftPreview draft={draft} cover={cover} />}
        <form method="dialog" className={styles.previewDone}><button type="submit" className={site.buttonPrimary}>Keep editing</button></form>
      </Dialog>
      <Dialog id="discard-draft" title="Discard this draft?" dialogRef={discard}>
        <p>This clears your form and removes the draft saved on this device.</p>
        <div className={site.dialogActions}>
          <form method="dialog"><button type="submit" className={site.buttonOutline}>Keep editing</button></form>
          <form onSubmit={discardDraft}><button type="submit" className={styles.discardConfirm}>Discard draft</button></form>
        </div>
      </Dialog>
    </>
  );
}
