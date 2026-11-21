"use client";

import { MessageSquareText, UserRound, Users, UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { profileTypeLabels, type TravellerGroup } from "@/domain/travel";
import { authHref, onboardingHref, type AuthMode } from "@/navigation/auth";
import site from "../_shared/site.module.css";
import styles from "./sign-in.module.css";

const availableModes = [
  { id: "login", label: "Login" },
  { id: "signup", label: "Sign Up" },
] as const;

const travellerTypes = [
  { id: "solo", icon: UserRound, description: "Find your crew." },
  { id: "couple", icon: Users, description: "Explore together." },
  { id: "family", icon: UsersRound, description: "Make memories outdoors." },
] as const satisfies readonly { id: TravellerGroup; icon: typeof UserRound; description: string }[];

function mobileError(value: string) {
  const compact = value.replace(/[\s()-]/g, "").replace(/^\+91/, "");
  if (!compact) return "Enter a mobile number.";
  return /^[6-9][0-9]{9}$/.test(compact) ? "" : "Enter 10 digits starting with 6, 7, 8 or 9.";
}

export function AuthEntry({ mode, returnTo }: { mode: AuthMode; returnTo: string }) {
  const signUp = mode === "signup";
  const [displayName, setDisplayName] = useState("");
  const [mobile, setMobile] = useState("");
  const [traveller, setTraveller] = useState<TravellerGroup>();
  const [attempt, setAttempt] = useState<AuthMode>();
  const [preview, setPreview] = useState<AuthMode>();
  const nameField = useRef<HTMLInputElement>(null);
  const mobileField = useRef<HTMLInputElement>(null);
  const previewHeading = useRef<HTMLHeadingElement>(null);
  const showPreview = preview === mode;
  const missingName = signUp && !displayName.trim();
  const phoneError = mobileError(mobile);
  const showNameError = attempt === mode && missingName;
  const showPhoneError = attempt === mode && Boolean(phoneError);

  useEffect(() => {
    if (showPreview) previewHeading.current?.focus();
  }, [showPreview]);

  function continuePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (missingName || phoneError) {
      setAttempt(mode);
      requestAnimationFrame(() => (missingName ? nameField : mobileField).current?.focus());
      return;
    }
    setAttempt(undefined);
    setPreview(mode);
  }

  function editDetails() {
    setPreview(undefined);
    requestAnimationFrame(() => (signUp ? nameField : mobileField).current?.focus());
  }

  return (
    <section className={styles.panel} aria-labelledby="auth-title">
      <nav className={styles.switcher} aria-label="Account entry">
        {availableModes.map(({ id, label }) => (
          <Link key={id} href={authHref(id, returnTo)} aria-current={id === mode ? "page" : undefined}
            onNavigate={() => { setAttempt(undefined); setPreview(undefined); }}>
            {label}
          </Link>
        ))}
      </nav>

      {showPreview ? (
        <div className={styles.confirmation}>
          <span className={styles.previewIcon}><MessageSquareText size={25} strokeWidth={1.8} aria-hidden="true" /></span>
          <h1 ref={previewHeading} id="auth-title" tabIndex={-1}>OTP preview<span>.</span></h1>
          <p><strong>No OTP has been sent.</strong> On live SideTrail, you’d enter a one-time code here to verify your mobile number.</p>
          {signUp && traveller && <p className={styles.selection}>Traveller type preview · {profileTypeLabels[traveller]}</p>}
          <p className={styles.demoNote}>This demo never sends or saves your details.</p>
          <Link href={onboardingHref(returnTo, signUp ? traveller : undefined)} className={site.buttonPrimary + " " + styles.fullButton}>
            Preview onboarding
          </Link>
          <button type="button" className={site.buttonOutline + " " + styles.fullButton} onClick={editDetails}>Edit details</button>
        </div>
      ) : (
        <>
          <div className={styles.intro}>
            <h1 id="auth-title">{signUp ? "Good trips start here" : "Welcome back, explorer"}<span>.</span></h1>
            <p>{signUp ? "Registration is free. Meet your people and go somewhere new." : "Your next adventure is waiting."}</p>
          </div>
          <p className={styles.demoNote} id="auth-demo-note"><strong>Account demo.</strong> Use sample details.</p>
          <form className={styles.form} aria-describedby="auth-demo-note" onSubmit={continuePreview} noValidate autoComplete="off">
            {signUp && (
              <div className={styles.field}>
                <label htmlFor="auth-name">Display name</label>
                <input id="auth-name" ref={nameField} type="text" value={displayName} autoComplete="off"
                  maxLength={80} required placeholder="Your display name"
                  aria-invalid={showNameError || undefined} aria-describedby={showNameError ? "auth-name-error" : undefined}
                  onChange={(event) => setDisplayName(event.currentTarget.value)} />
                {showNameError && <p className={styles.error} id="auth-name-error" role="alert">Enter a display name.</p>}
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="auth-mobile">Mobile number</label>
              <div className={styles.mobileInput}>
                <span aria-hidden="true">+91</span>
                <input id="auth-mobile" ref={mobileField} type="tel" inputMode="numeric" autoComplete="off"
                  value={mobile} maxLength={24} required placeholder="10-digit mobile number"
                  aria-invalid={showPhoneError || undefined}
                  aria-describedby={showPhoneError ? "auth-country auth-mobile-error" : "auth-country"}
                  onChange={(event) => setMobile(event.currentTarget.value)} />
              </div>
              <span id="auth-country" className="sr-only">India, country code +91.</span>
              {showPhoneError && <p className={styles.error} id="auth-mobile-error" role="alert">{phoneError}</p>}
            </div>
            {signUp && (
              <fieldset className={styles.travellers}>
                <legend>How do you travel? <span>Optional preview</span></legend>
                <div className={styles.options}>
                  {travellerTypes.map(({ id, icon: Icon, description }) => (
                    <label className={styles.option} key={id}>
                      <input type="radio" className="sr-only" name="traveller-type" value={id}
                        checked={traveller === id} onChange={() => setTraveller(id)} />
                      <span className={styles.optionBody}>
                        <Icon size={19} strokeWidth={1.85} aria-hidden="true" />
                        <strong>{profileTypeLabels[id]}</strong>
                        <span>{description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <button type="submit" className={site.buttonPrimary + " " + styles.fullButton}>Continue</button>
          </form>
        </>
      )}
    </section>
  );
}
