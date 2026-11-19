import {
  CalendarDays, CircleAlert, Compass, Flag, MapPin, MessageCircle, Shield, UsersRound, Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import { SiteShell } from "../_shared/site-shell";
import site from "../_shared/site.module.css";
import { VerificationMethods } from "./verification-methods";
import styles from "./verification.module.css";

export const metadata: Metadata = {
  title: "Traveller Verification & Safety | SideTrail",
  description: "Explore SideTrail’s proposed identity checks, privacy approach and practical travel safety tips.",
};

const benefits = [
  "Reduce impersonation and fake profiles.",
  "Help hosts know whether an identity check was completed.",
  "Support a travel community where people are accountable for how they behave.",
];

const privacy = [
  "Keep identity documents away from hosts and keep government ID numbers out of public view.",
  "Show only the verification status people need to make a decision.",
  "Use a suitable provider for sensitive checks and explain consent, retention and deletion before asking for information.",
];

const safetyTips = [
  { title: "Read the trip details", text: "Check the route, pace, costs and what the host expects from the group.", icon: CalendarDays },
  { title: "Talk before meeting", text: "Ask questions and make sure everyone agrees on the plans.", icon: MessageCircle },
  { title: "Meet somewhere public", text: "Pick a well-used meeting point where you can arrive and leave on your own.", icon: MapPin },
  { title: "Share your plans", text: "Let someone you trust know where you’re going and when you expect to be back.", icon: Compass },
  { title: "Pause before paying", text: "Be wary of unexpected requests to pay in advance, especially under pressure.", icon: Wallet },
  { title: "Report inappropriate behaviour", text: "Flag harassment, impersonation or unsafe conduct through the platform’s reporting tools when available.", icon: Flag },
] as const;

export default async function VerificationPage({ searchParams }: {
  searchParams: Promise<{ method?: string | string[] }>;
}) {
  const { method } = await searchParams;

  return (
    <SiteShell isVerification>
      <div className={site.container + " " + styles.page}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Traveller verification &amp; safety</p>
            <h1>Good adventures start with <span>trust.</span></h1>
            <p className={styles.lead}>Before you travel together, we want everyone to feel a little more comfortable knowing who’s joining.</p>
          </div>
          <div className={styles.policy}>
            <span className={styles.shield}><Shield size={29} strokeWidth={1.7} aria-hidden="true" /></span>
            <div>
              <h2>Explore freely</h2>
              <p>Anyone can browse trips. In the future, an identity check will be required to join or host a real trip.</p>
            </div>
          </div>
        </header>

        <div className={styles.verification}>
          <VerificationMethods requestedMethod={method} />
          <aside className={styles.why} aria-labelledby="verification-why">
            <h2 id="verification-why">Why verify?</h2>
            <ul>{benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
            <p className={styles.caution}><CircleAlert size={19} aria-hidden="true" />An identity check can help confirm who someone is. It cannot guarantee anyone’s safety.</p>
          </aside>
        </div>

        <section className={styles.privacy} aria-labelledby="verification-privacy">
          <div>
            <h2 id="verification-privacy">Your identity stays yours</h2>
            <p>These are the privacy principles for a future verification service. This demo collects no identity information.</p>
            <ul>{privacy.map((principle) => <li key={principle}>{principle}</li>)}</ul>
          </div>
          <div className={styles.family}>
            <UsersRound size={25} aria-hidden="true" />
            <h3>Travelling as a family?</h3>
            <p>An adult account holder manages family participation. Children’s documents and personal details stay out of this flow, and family contact details should stay private.</p>
          </div>
        </section>

        <section className={styles.safety} aria-labelledby="verification-safety">
          <h2 id="verification-safety">Before you head out</h2>
          <ul>
            {safetyTips.map(({ title, text, icon: Icon }) => (
              <li key={title}>
                <Icon size={21} aria-hidden="true" />
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SiteShell>
  );
}
