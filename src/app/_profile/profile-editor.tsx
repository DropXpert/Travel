"use client";

import { Pencil } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import type { ProfileCover, TravellerProfileView } from "@/data/traveller-profiles";
import { profileTypeLabels, travellerInterestLabels, type TravellerGroup, type TravellerInterest } from "@/domain/travel";
import { Dialog } from "../_shared/dialog";
import { DialogButton } from "../_shared/dialog-button";
import site from "../_shared/site.module.css";
import { ProfileAvatar, ProfileView } from "./profile-view";
import styles from "./profile.module.css";

type CoverKey = NonNullable<TravellerProfileView["cover"]>;
type Tone = TravellerProfileView["avatarTone"];
type Covers = Record<CoverKey, ProfileCover>;
type Tones = Record<Tone, string>;

const storageKey = "sidetrail-demo-profile-v1";
const profileChanged = "sidetrail-demo-profile-changed";
const groups = Object.keys(profileTypeLabels) as TravellerGroup[];
const interests = Object.keys(travellerInterestLabels) as TravellerInterest[];
const limits = { displayName: 80, homeCity: 80, bio: 320, travelStyle: 120, partnerDisplayName: 80 };

function readSaved() {
  try { return localStorage.getItem(storageKey); } catch { return null; }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(profileChanged, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(profileChanged, listener);
  };
}

function readProfile(raw: string | null, initial: TravellerProfileView, covers: Covers, tones: Tones): TravellerProfileView {
  if (!raw) return initial;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return initial;
    const stored = value as Record<string, unknown>;
    function read(key: keyof typeof limits, fallback = "") {
      const text = stored[key];
      return typeof text === "string" ? text.trim().slice(0, limits[key]) : fallback;
    }
    const savedInterests: unknown[] | null = Array.isArray(stored.interests) ? stored.interests : null;
    const cover = (Object.keys(covers) as CoverKey[]).find((key) => key === stored.cover);
    return {
      ...initial,
      displayName: read("displayName") || initial.displayName,
      homeCity: read("homeCity", initial.homeCity),
      group: groups.find((group) => group === stored.group) ?? initial.group,
      bio: read("bio", initial.bio),
      interests: savedInterests ? interests.filter((interest) => savedInterests.includes(interest)) : initial.interests,
      travelStyle: read("travelStyle", initial.travelStyle),
      partnerDisplayName: read("partnerDisplayName"),
      cover: stored.cover === "" ? undefined : cover ?? initial.cover,
      avatarTone: (Object.keys(tones) as Tone[]).find((tone) => tone === stored.avatarTone) ?? initial.avatarTone,
    };
  } catch {
    return initial;
  }
}

function profileErrors(profile: TravellerProfileView) {
  const errors: Partial<Record<"displayName" | "homeCity", string>> = {};
  if (!profile.displayName.trim()) errors.displayName = "Enter a display name.";
  if (profile.homeCity.trim() && !/\p{L}/u.test(profile.homeCity)) errors.homeCity = "Enter a city name or leave this field empty.";
  return errors;
}

const serverSnapshot = () => null;

export function ProfileEditor({ initial, covers, tones }: {
  initial: TravellerProfileView;
  covers: Covers;
  tones: Tones;
}) {
  const raw = useSyncExternalStore(subscribe, readSaved, serverSnapshot);
  const profile = readProfile(raw, initial, covers, tones);
  const [draft, setDraft] = useState(initial);
  const [validate, setValidate] = useState(false);
  const [status, setStatus] = useState("");
  const [storageError, setStorageError] = useState("");
  const editor = useRef<HTMLDialogElement>(null);
  const reset = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const fields = useRef<HTMLDivElement>(null);
  const errors = validate ? profileErrors(draft) : {};

  function edit() {
    setDraft(profile);
    setValidate(false);
    setStorageError("");
    setStatus("");
    editor.current?.showModal();
    fields.current?.scrollTo(0, 0);
  }

  function update(next: Partial<TravellerProfileView>) {
    setDraft((previous) => ({ ...previous, ...next }));
    setStorageError("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidate(true);
    const [first] = Object.keys(profileErrors(draft));
    if (first) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('[name="' + first + '"]')?.focus());
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        displayName: draft.displayName.trim(),
        homeCity: draft.homeCity.trim(),
        group: draft.group,
        bio: draft.bio.trim(),
        interests: draft.interests,
        travelStyle: draft.travelStyle?.trim() ?? "",
        partnerDisplayName: draft.group === "couple" ? draft.partnerDisplayName?.trim() ?? "" : "",
        cover: draft.cover ?? "",
        avatarTone: draft.avatarTone,
      }));
    } catch {
      setStorageError("Device storage is unavailable. Keep this editor open to keep your changes.");
      return;
    }
    window.dispatchEvent(new Event(profileChanged));
    setStatus("Profile saved on this device.");
    editor.current?.close();
  }

  function resetProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(profileChanged));
      setStatus("Profile reset on this device.");
    } catch {
      setStatus("Device storage is unavailable. Your saved profile is still in place.");
    }
    reset.current?.close();
  }

  return (
    <>
      <ProfileView own profile={profile} cover={profile.cover ? covers[profile.cover] : undefined} actions={
        <>
          <button type="button" className={site.buttonPrimary} aria-haspopup="dialog" onClick={edit}>
            <Pencil size={17} aria-hidden="true" />Edit profile
          </button>
          <DialogButton dialogId="reset-profile" className={styles.resetButton}>Reset profile</DialogButton>
          <p className={styles.actionStatus} role="status">{status}</p>
        </>
      } />

      <Dialog id="edit-profile" title="Edit your profile" className={styles.editorDialog} dialogRef={editor}>
        <form ref={form} className={styles.editForm} onSubmit={save} noValidate>
          <div className={styles.editFields} ref={fields}>
            <p>Changes stay on this device.</p>
            <div className={styles.fieldPair}>
              <div className={styles.field}>
                <label htmlFor="profile-display-name">Display name</label>
                <input id="profile-display-name" name="displayName" required value={draft.displayName} maxLength={limits.displayName}
                  aria-invalid={Boolean(errors.displayName) || undefined} aria-describedby={errors.displayName ? "name-error" : undefined}
                  onChange={(event) => update({ displayName: event.currentTarget.value })} />
                {errors.displayName && <span id="name-error" className={styles.error}>{errors.displayName}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="profile-home-city">Starting city</label>
                <input id="profile-home-city" name="homeCity" value={draft.homeCity} maxLength={limits.homeCity} placeholder="e.g. Mumbai"
                  aria-invalid={Boolean(errors.homeCity) || undefined} aria-describedby={errors.homeCity ? "city-error" : undefined}
                  onChange={(event) => update({ homeCity: event.currentTarget.value })} />
                {errors.homeCity && <span id="city-error" className={styles.error}>{errors.homeCity}</span>}
              </div>
            </div>
            <label className={styles.field}>Traveller type
              <select name="group" value={draft.group} onChange={(event) => update({ group: event.currentTarget.value as TravellerGroup })}>
                {groups.map((group) => <option key={group} value={group}>{profileTypeLabels[group]}</option>)}
              </select>
            </label>
            {draft.group === "couple" && (
              <label className={styles.field}>Partner display name (optional)
                <input name="partnerDisplayName" value={draft.partnerDisplayName ?? ""} maxLength={limits.partnerDisplayName}
                  onChange={(event) => update({ partnerDisplayName: event.currentTarget.value })} />
              </label>
            )}
            <label className={styles.field}>Short bio
              <textarea name="bio" value={draft.bio} rows={3} maxLength={limits.bio}
                onChange={(event) => update({ bio: event.currentTarget.value })} placeholder="A little about how you like to travel." />
            </label>
            <fieldset className={styles.choiceField}>
              <legend>Travel interests</legend>
              <div className={styles.interestChoices}>
                {interests.map((interest) => (
                  <label key={interest}>
                    <input type="checkbox" name="interest" value={interest} checked={draft.interests.includes(interest)}
                      onChange={(event) => update({
                        interests: event.currentTarget.checked ? [...draft.interests, interest] : draft.interests.filter((item) => item !== interest),
                      })} />
                    {travellerInterestLabels[interest]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className={styles.field}>Travel style
              <input name="travelStyle" value={draft.travelStyle ?? ""} maxLength={limits.travelStyle}
                onChange={(event) => update({ travelStyle: event.currentTarget.value })} placeholder="e.g. Slow mornings and short trails" />
            </label>

            <details className={styles.appearance}>
              <summary>Cover and avatar</summary>
              <fieldset className={styles.choiceField}>
                <legend>Sample cover photo</legend>
                <div className={styles.coverChoices}>
                  <label>
                    <input type="radio" name="cover" value="" checked={!draft.cover} onChange={() => update({ cover: undefined })} />
                    <span>No cover</span>
                  </label>
                  {(Object.keys(covers) as CoverKey[]).map((key) => (
                    <label key={key}>
                      <input type="radio" name="cover" value={key} checked={draft.cover === key} onChange={() => update({ cover: key })} />
                      <span className={styles.coverThumb}><Image fill src={covers[key].src} alt="" sizes="150px" /></span>
                      <span>{covers[key].label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className={styles.choiceField}>
                <legend>Initials avatar</legend>
                <div className={styles.avatarChoices}>
                  {(Object.keys(tones) as Tone[]).map((tone) => (
                    <label key={tone}>
                      <input type="radio" name="avatarTone" value={tone} checked={draft.avatarTone === tone} onChange={() => update({ avatarTone: tone })} />
                      <ProfileAvatar name={draft.displayName} tone={tone} />
                      <span>{tones[tone]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </details>
          </div>
          <div className={styles.editFooter}>
            {storageError && <p className={styles.error} role="alert">{storageError}</p>}
            <div>
              <button type="button" className={site.buttonOutline} onClick={() => editor.current?.close()}>Cancel</button>
              <button type="submit" className={site.buttonPrimary}>Save changes</button>
            </div>
          </div>
        </form>
      </Dialog>
      <Dialog id="reset-profile" title="Reset profile?" dialogRef={reset}>
        <p>This restores the sample profile and clears its saved edits on this device.</p>
        <div className={site.dialogActions}>
          <form method="dialog"><button type="submit" className={site.buttonOutline}>Keep profile</button></form>
          <form onSubmit={resetProfile}><button type="submit" className={styles.resetConfirm}>Reset profile</button></form>
        </div>
      </Dialog>
    </>
  );
}
