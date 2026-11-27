"use client";

import { Compass, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { profileTypeLabels, type TravellerGroup } from "@/domain/travel";
import { ProfileAvatar } from "../_profile/profile-view";
import site from "../_shared/site.module.css";
import { ageBands, interestOptions, travelStyles } from "./onboarding-options";
import styles from "./onboarding.module.css";

export interface TravellerOption {
  group: TravellerGroup;
  photo: { src: string; alt: string; source: string; author: string; license: string };
  description: string;
}

const steps = ["Traveller type", "Interests", "Travel preferences", "Profile preview"] as const;
type Interest = (typeof interestOptions)[number]["id"];
type Choices = {
  group?: TravellerGroup;
  interests: Interest[];
  city: string;
  style: string;
  activity: string;
  sharedStyle: string;
  childAge: string;
};

const headings = [
  ["Let’s find your kind of adventure.", "A little about you helps us find trips worth joining."],
  ["What gets you out the door?", "Pick as many things as you like."],
  ["Make it your kind of trip.", "Tell us where you start from and how you like to travel."],
  ["Here’s your profile preview.", "See how your choices come together on Share Yarana."],
  ["See you out there.", "You’re all set to explore the trips."],
] as const;

const listFormat = new Intl.ListFormat("en-IN", { style: "long", type: "conjunction" });
const groupTone = { solo: "teal", couple: "clay", family: "stone" } as const;

function ProfilePreview({ choices, option }: { choices: Choices; option: TravellerOption }) {
  const { group, photo } = option;
  const selected = interestOptions.filter(({ id }) => choices.interests.includes(id));
  const activity = interestOptions.find(({ id }) => id === choices.activity);
  const identity = choices.style.charAt(0).toUpperCase() + choices.style.slice(1).toLowerCase() + " from " + choices.city.trim();

  return (
    <article className={styles.profileCard}>
      <figure className={styles.profilePhoto}>
        <Image fill src={photo.src} alt={photo.alt} sizes="(min-width: 900px) 500px, calc(100vw - 32px)" />
        <a href={photo.source} target="_blank" rel="noreferrer" className={styles.profileCredit} aria-label={"Photo credit · " + photo.author + " · " + photo.license}>
          Photo credit
        </a>
      </figure>
      <div className={styles.profileBody}>
        <ProfileAvatar name={profileTypeLabels[group]} tone={groupTone[group]} className={styles.avatar} />
        <h2>{identity}</h2>
        <ul className={styles.profileMeta}>
          <li className={styles.groupTag}>{profileTypeLabels[group]}</li>
          <li><MapPin size={16} aria-hidden="true" />{choices.city.trim()}</li>
        </ul>
        {selected.length > 0 ? (
          <p className={styles.summary}>Interested in {listFormat.format(selected.map(({ label }) => label.toLowerCase()))}.</p>
        ) : <p className={styles.summary}>You can add interests whenever you’re ready.</p>}
        {group === "couple" && choices.sharedStyle && <p className={styles.summary}>Together, you picked {choices.sharedStyle.toLowerCase()}.</p>}
        {activity && <p className={styles.summary}>Your first pick for a trip is {activity.label.toLowerCase()}.</p>}
        {selected.length > 0 && (
          <ul className={styles.profileInterests} aria-label="Selected interests">
            {selected.map(({ id, label, icon: Icon }) => <li key={id}><Icon size={16} aria-hidden="true" />{label}</li>)}
          </ul>
        )}
      </div>
    </article>
  );
}

export function TravellerOnboarding({ options, preselected }: {
  options: readonly TravellerOption[];
  preselected?: TravellerGroup;
}) {
  const [step, setStep] = useState(0);
  const [triedContinue, setTriedContinue] = useState(false);
  const [choices, setChoices] = useState<Choices>({
    group: preselected, interests: [], city: "", style: "", activity: "", sharedStyle: "", childAge: "",
  });
  const [optionalOpen, setOptionalOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const changingStep = useRef(false);
  const [title, description] = headings[step];
  const currentOption = options.find(({ group }) => group === choices.group);
  const complete = step === steps.length;
  const cityValid = /^\p{L}[\p{L}\p{M}\s.'’,-]*$/u.test(choices.city.trim());
  const missingGroup = triedContinue && !choices.group;
  const missingInterests = triedContinue && choices.interests.length === 0;
  const invalidCity = triedContinue && !cityValid;
  const missingStyle = triedContinue && !choices.style;

  useEffect(() => {
    if (!changingStep.current) return;
    changingStep.current = false;
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  function update(patch: Partial<Choices>) {
    setChoices((current) => ({ ...current, ...patch }));
  }

  function changeStep(next: number) {
    changingStep.current = true;
    setTriedContinue(false);
    setStep(next);
  }

  function continueOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missingField = step === 0 && !choices.group ? "traveller-type"
      : step === 1 && !choices.interests.length ? "interest"
        : step === 2 && !cityValid ? "onboarding-city"
          : step === 2 && !choices.style ? "onboarding-style" : "";
    if (missingField) {
      setTriedContinue(true);
      requestAnimationFrame(() => {
        const field = form.current?.querySelector<HTMLElement>(`[id="${missingField}"], [name="${missingField}"]`);
        field?.focus();
      });
      return;
    }
    changeStep(step + 1);
  }

  return (
    <section className={styles.flow} aria-labelledby="onboarding-title">
      <div className={styles.progress}>
        <div className={styles.progressText}>
          <span>Your travel style</span>
          <span>{complete ? "Preview complete" : `Step ${step + 1} of ${steps.length}`}</span>
        </div>
        <div className={styles.segments} role="progressbar" aria-label="Onboarding progress" aria-valuemin={0}
          aria-valuemax={steps.length} aria-valuenow={Math.min(step + 1, steps.length)}
          aria-valuetext={complete ? "All set" : `Step ${step + 1} of ${steps.length}, ${steps[step]}`}>
          {steps.map((label, index) => <span key={label} data-active={index <= step || undefined} aria-hidden="true" />)}
        </div>
      </div>

      <div className={styles.intro}>
        {complete && <span className={styles.completionIcon}><Compass size={30} strokeWidth={1.75} aria-hidden="true" /></span>}
        <h1 id="onboarding-title" ref={heading} tabIndex={-1}>{title}</h1>
        <p>{description}</p>
      </div>

      {!complete && (
        <form id="traveller-onboarding" ref={form} noValidate autoComplete="off" onSubmit={continueOnboarding}>
          {step === 0 && (
            <fieldset className={styles.types} aria-describedby={missingGroup ? "onboarding-type-error" : undefined}>
              <legend>How do you travel?</legend>
              {options.map(({ group, photo, description: copy }) => (
                <label className={styles.typeOption} key={group}>
                  <input type="radio" name="traveller-type" value={group} className="sr-only" required
                    checked={choices.group === group} onChange={() => update({ group })} />
                  <span className={styles.typeBody}>
                    <span className={styles.typePhoto}><Image fill sizes="76px" src={photo.src} alt="" /></span>
                    <span className={styles.typeCopy}><strong>{profileTypeLabels[group]}</strong><span>{copy}</span></span>
                    <span className={styles.radioMark} aria-hidden="true" />
                  </span>
                </label>
              ))}
              {missingGroup && <p className={styles.error} id="onboarding-type-error" role="alert">Choose how you usually travel to continue.</p>}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className={styles.interests} aria-describedby={missingInterests ? "onboarding-interest-error" : undefined}>
              <legend className="sr-only">Travel interests</legend>
              <div className={styles.interestGrid}>
                {interestOptions.map(({ id, label, icon: Icon }) => (
                  <label className={styles.interest} key={id}>
                    <input type="checkbox" name="interest" value={id} className="sr-only" checked={choices.interests.includes(id)}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked;
                        setChoices((current) => ({ ...current, interests: checked
                          ? [...current.interests, id] : current.interests.filter((item) => item !== id) }));
                      }} />
                    <span className={styles.interestBody}><Icon size={19} aria-hidden="true" />{label}<span className={styles.checkMark} aria-hidden="true" /></span>
                  </label>
                ))}
              </div>
              {missingInterests && <p className={styles.error} id="onboarding-interest-error" role="alert">Pick an interest or skip this step.</p>}
              <div className={styles.interestFooter}>
                <p role="status">{choices.interests.length ? `${choices.interests.length} selected` : ""}</p>
                {choices.interests.length === 0 && <button type="button" className={styles.textButton} onClick={() => changeStep(2)}>Skip interests</button>}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div className={styles.fields}>
              <label className={styles.field}>
                Home city
                <input id="onboarding-city" type="text" required autoComplete="off" maxLength={64}
                  value={choices.city} placeholder="e.g. Chandigarh" onChange={(event) => update({ city: event.currentTarget.value })}
                  aria-invalid={invalidCity || undefined} aria-describedby={invalidCity ? "onboarding-city-error" : undefined} />
                {invalidCity && <span className={styles.error} id="onboarding-city-error" role="alert">Enter a city name to continue.</span>}
              </label>
              <label className={styles.field}>
                Your travel style
                <select id="onboarding-style" value={choices.style} required onChange={(event) => update({ style: event.currentTarget.value })}
                  aria-invalid={missingStyle || undefined} aria-describedby={missingStyle ? "onboarding-style-error" : undefined}>
                  <option value="" disabled>Choose a travel style</option>
                  {travelStyles.map((style) => <option key={style}>{style}</option>)}
                </select>
                {missingStyle && <span className={styles.error} id="onboarding-style-error" role="alert">Choose the style that feels closest to you.</span>}
              </label>
              <details className={styles.optional} open={optionalOpen} onToggle={(event) => setOptionalOpen(event.currentTarget.open)}>
                <summary>Optional preferences</summary>
                <div className={styles.fields}>
                  <label className={styles.field}>
                    Go-to activity
                    <select value={choices.activity} onChange={(event) => update({ activity: event.currentTarget.value })}>
                      <option value="">No preference</option>
                      {interestOptions.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
                    </select>
                  </label>
                  {choices.group === "couple" && (
                    <label className={styles.field}>
                      Shared travel style
                      <select value={choices.sharedStyle} onChange={(event) => update({ sharedStyle: event.currentTarget.value })}>
                        <option value="">No preference</option>
                        {travelStyles.map((style) => <option key={style}>{style}</option>)}
                      </select>
                    </label>
                  )}
                  {choices.group === "family" && (
                    <label className={styles.field}>
                      Children’s age range
                      <select value={choices.childAge} onChange={(event) => update({ childAge: event.currentTarget.value })}
                        aria-describedby="onboarding-family-note">
                        <option value="">Prefer to skip</option>
                        {ageBands.map((band) => <option key={band}>{band}</option>)}
                      </select>
                      <span className={styles.hint} id="onboarding-family-note">An adult manages family plans. Age ranges stay out of the profile preview.</span>
                    </label>
                  )}
                </div>
              </details>
            </div>
          )}

          {step === 3 && currentOption && <ProfilePreview choices={choices} option={currentOption} />}
        </form>
      )}

      {complete && <p className={styles.demoNote}>These choices clear when you leave or refresh. This flow creates no account.</p>}

      <div className={styles.actionBar}>
        <div className={styles.actions}>
          {step > 0 && <button type="button" className={site.buttonOutline + " " + styles.back} onClick={() => changeStep(step - 1)}>Back</button>}
          {complete ? <Link href="/explore" className={site.buttonPrimary + " " + styles.primary}>Explore Trips</Link> : (
            <button type="submit" form="traveller-onboarding" className={site.buttonPrimary + " " + styles.primary}>
              {step === 2 ? "Preview profile" : step === 3 ? "Finish" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
