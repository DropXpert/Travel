"use client";

import { MessageSquareText, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { authHref, onboardingHref, type AuthMode } from "@/navigation/auth";
import site from "../_shared/site.module.css";
import styles from "./sign-in.module.css";

type Step = "methods" | "phone" | "google-info" | "sms-info";
const availableModes = [
  { id: "login", label: "Sign In" },
  { id: "signup", label: "Sign Up" },
] as const;

function OtpEntryPreview() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const fields = useRef<(HTMLInputElement | null)[]>([]);
  const filled = digits.filter(Boolean).length;

  function enter(index: number, text: string) {
    const incoming = text.replace(/\D/g, "").slice(0, 6 - index);
    setDigits(current => {
      const next = [...current];
      if (!incoming) next[index] = "";
      else [...incoming].forEach((digit, offset) => { next[index + offset] = digit; });
      return next;
    });
    if (incoming) fields.current[Math.min(index + incoming.length, 5)]?.focus();
  }

  return (
    <fieldset className={styles.otpPreview} aria-describedby="otp-preview-note">
      <legend>Try entering a code</legend>
      <p id="otp-preview-note" className={styles.demoNote}>Use any six digits to try the animation. This does not verify your phone.</p>
      <div className={styles.otpDigits}>
        {digits.map((digit, index) => (
          <input key={index} ref={field => { fields.current[index] = field; }}
            type="text" inputMode="numeric" autoComplete="off" maxLength={6}
            aria-label={`Digit ${index + 1} of 6`} value={digit} data-filled={Boolean(digit) || undefined}
            onFocus={event => event.currentTarget.select()}
            onChange={event => enter(index, event.currentTarget.value)}
            onPaste={event => { event.preventDefault(); enter(index, event.clipboardData.getData("text")); }}
            onKeyDown={event => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                fields.current[Math.max(0, Math.min(5, index + (event.key === "ArrowLeft" ? -1 : 1)))]?.focus();
              } else if (event.key === "Backspace" && !digit && index > 0) {
                event.preventDefault();
                setDigits(current => current.map((value, position) => position === index - 1 ? "" : value));
                fields.current[index - 1]?.focus();
              }
            }} />
        ))}
      </div>
      <div className={styles.otpProgress} aria-hidden="true">
        {digits.map((digit, index) => <span key={index} data-filled={Boolean(digit) || undefined} />)}
      </div>
      <div className={styles.otpFooter}>
        <p role="status" className={styles.demoNote}>{filled === 6 ? "All six digits entered. Preview only; nothing is verified." : `${filled} of 6 digits entered`}</p>
        <button type="button" className={site.buttonText} onClick={() => {
          setDigits(Array(6).fill(""));
          fields.current[0]?.focus();
        }}>Clear code</button>
      </div>
    </fieldset>
  );
}

export function AuthEntry({ mode, returnTo }: { mode: AuthMode; returnTo: string }) {
  const [step, setStep] = useState<Step>("methods");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const mobileField = useRef<HTMLInputElement>(null);
  const googleButton = useRef<HTMLButtonElement>(null);
  const changingStep = useRef(false);
  const explanation = step === "google-info" || step === "sms-info";

  useEffect(() => {
    if (!changingStep.current) return;
    changingStep.current = false;
    if (step === "phone") mobileField.current?.focus();
    else if (step === "methods") googleButton.current?.focus();
    else heading.current?.focus();
  }, [step]);

  function changeStep(next: Step) {
    setMobile("");
    setError("");
    changingStep.current = true;
    setStep(next);
  }

  function explainSms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[6-9][0-9]{9}$/.test(mobile.trim())) {
      setError(mobile.trim() ? "Enter 10 digits starting with 6, 7, 8 or 9." : "Enter a mobile number.");
      mobileField.current?.focus();
      return;
    }
    // Discard the input before showing information; this flow never authenticates.
    changeStep("sms-info");
  }

  return (
    <section className={styles.panel} aria-labelledby="auth-title">
      <nav className={styles.switcher} aria-label="Account entry">
        {availableModes.map(({ id, label }) => (
          <Link key={id} href={authHref(id, returnTo)} aria-current={id === mode ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      {explanation ? (
        <div className={styles.confirmation}>
          {step === "sms-info" && <span className={styles.previewIcon}><MessageSquareText size={24} aria-hidden="true" /></span>}
          <h1 ref={heading} id="auth-title" tabIndex={-1}>
            {step === "google-info" ? "Google sign-in, explained." : "How SMS verification will work."}
          </h1>
          <p className={styles.demoNote}>
            {step === "google-info"
              ? "Google sign-in is not connected. No Google account has been accessed, and you are not signed in."
              : "No SMS has been sent. You are not signed in, and your phone has not been verified. Your number is not saved."}
          </p>
          {step === "sms-info" && <OtpEntryPreview />}
          {step === "google-info" ? (
            <ol className={styles.flowSteps}>
              <li>Choose your Google account on Google&apos;s secure sign-in screen.</li>
              <li>Return to Share Yarana and browse trips.</li>
              <li>Before joining or hosting a real trip, verify your phone by SMS OTP and complete the separate government ID check.</li>
            </ol>
          ) : (
            <p>In the live service, an SMS code would confirm control of your number before you sign in and browse. A separate government ID check would still be required before joining or hosting a real trip.</p>
          )}
          <p className={styles.demoNote}>Phone OTP confirms control of a number, not government ID verification.</p>
          <Link href="/verification" className={site.verificationLink}>See verification requirements</Link>
          <Link href={onboardingHref(returnTo)} className={site.buttonPrimary + " " + styles.fullButton}>Try travel preferences</Link>
          <p className={styles.demoNote}>You can explore the local walkthrough without creating an account.</p>
          <button type="button" className={site.buttonOutline + " " + styles.fullButton} onClick={() => changeStep("methods")}>Back to sign-in methods</button>
        </div>
      ) : (
        <>
          <div className={styles.intro}>
            <h1 id="auth-title">{step === "phone" ? "Continue with Phone" : mode === "signup" ? "Good trips start here" : "Welcome back, explorer"}<span>.</span></h1>
            <p>{step === "phone" ? "Use a sample Indian mobile number to see the next step." : "Choose how you'd like to continue. It's free."}</p>
          </div>
          <p className={styles.demoNote} id="auth-demo-note">Frontend walkthrough only. No account is created, and no sign-in or verification takes place.</p>
          {step === "methods" ? (
            <div className={styles.methods} role="group" aria-label="Sign-in methods" aria-describedby="auth-demo-note">
              <button ref={googleButton} type="button" className={styles.methodButton + " " + styles.googleButton} onClick={() => changeStep("google-info")}>
                <Image src="/brand/google-g.png" width={200} height={204} alt="" unoptimized />
                <span>Continue with Google</span>
              </button>
              <button type="button" className={styles.methodButton + " " + styles.phoneButton} onClick={() => changeStep("phone")}>
                <Phone size={20} aria-hidden="true" /><span>Continue with Phone</span>
              </button>
            </div>
          ) : (
            <>
              <form className={styles.form} aria-describedby="auth-demo-note phone-privacy" onSubmit={explainSms} noValidate autoComplete="off">
                <div className={styles.field}>
                  <label htmlFor="auth-mobile">Mobile number</label>
                  <div className={styles.mobileInput}>
                    <span aria-hidden="true">+91</span>
                    <input id="auth-mobile" ref={mobileField} type="tel" inputMode="numeric" autoComplete="off"
                      value={mobile} maxLength={24} required placeholder="10-digit mobile number"
                      aria-invalid={Boolean(error) || undefined}
                      aria-describedby={error ? "auth-country auth-mobile-error" : "auth-country"}
                      onChange={(event) => setMobile(event.currentTarget.value)} />
                  </div>
                  <span id="auth-country" className="sr-only">India, country code +91.</span>
                  {error && <p className={styles.error} id="auth-mobile-error" role="alert">{error}</p>}
                </div>
                <p id="phone-privacy" className={styles.demoNote}>Your number stays in this field only. It is never sent or saved.</p>
                <button type="submit" className={site.buttonPrimary + " " + styles.fullButton}>Continue</button>
              </form>
              <button type="button" className={site.buttonOutline + " " + styles.fullButton} onClick={() => changeStep("methods")}>Back to sign-in methods</button>
            </>
          )}
        </>
      )}
    </section>
  );
}
