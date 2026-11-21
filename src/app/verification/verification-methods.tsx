import { BookOpen, CarFront, IdCard, Vote } from "lucide-react";
import Link from "next/link";
import site from "../_shared/site.module.css";
import styles from "./verification.module.css";

const methods = [
  {
    id: "aadhaar",
    title: "Aadhaar offline verification",
    hint: "An optional, consent-based document route",
    icon: IdCard,
    process: "The intended approach is a privacy-conscious, consent-based check through a compliant provider or a permitted offline mechanism. You could choose another method instead.",
    privacy: "A live version would explain what information an offline check needs before you decide whether to share it.",
  },
  {
    id: "passport",
    title: "Passport",
    hint: "An alternative identity document",
    icon: BookOpen,
    process: "A suitable provider could check that a passport is valid for the chosen process and matches the adult traveller requesting verification.",
    privacy: "You would be told which passport details the check needs, how they would be handled and how to request deletion.",
  },
  {
    id: "driving-licence",
    title: "Driving Licence",
    hint: "A proposed licence-based check",
    icon: CarFront,
    process: "A suitable provider could check that a driving licence meets its requirements and belongs to the adult traveller requesting verification.",
    privacy: "A live version would explain the required licence details and how the provider would handle them before asking for consent.",
  },
  {
    id: "voter-id",
    title: "Voter ID",
    hint: "A proposed voter ID check",
    icon: Vote,
    process: "A suitable provider could check that the voter ID meets its requirements and matches the adult traveller requesting verification.",
    privacy: "The provider would explain which voter ID details it needs and how consent and deletion would work.",
  },
] as const;

export function VerificationMethods({ requestedMethod }: { requestedMethod?: string | string[] }) {
  const method = methods.find(({ id }) => id === requestedMethod);
  const MethodIcon = method?.icon;

  return (
    <section className={styles.methods} id="verification-methods" tabIndex={-1} aria-labelledby="verification-methods-title">
      {method && MethodIcon ? (
        <>
          <Link href="/verification#verification-methods" className={site.verificationLink}>Change method</Link>
          <div className={styles.methodTitle}>
            <span className={styles.methodIcon}><MethodIcon size={24} aria-hidden="true" /></span>
            <h2 id="verification-methods-title">{method.title}</h2>
          </div>
          <p className={styles.unavailable}>Verification isn’t available in this demo yet.</p>
          <dl className={styles.previewDetails}>
            <div><dt>What a live check could involve</dt><dd>{method.process}</dd></div>
            <div><dt>Why we would ask</dt><dd>An identity check would help confirm that an adult traveller matches the identity they use on Share Yarana.</dd></div>
            <div><dt>Privacy expectations</dt><dd>{method.privacy}</dd></div>
            <div><dt>What a host would see</dt><dd>The intended design would show only whether the check was completed. Hosts would receive no documents or ID numbers.</dd></div>
          </dl>
          <div className={styles.previewActions}>
            <Link href="/profile" className={site.buttonPrimary}>Back to profile</Link>
            <Link href="/explore" className={site.buttonOutline}>Explore trips</Link>
          </div>
        </>
      ) : (
        <>
          <h2 id="verification-methods-title">Preview a verification method</h2>
          <p>These are proposed options. Availability and legal requirements would be reviewed before any method goes live.</p>
          <ul className={styles.methodList}>
            {methods.map(({ id, title, hint, icon: Icon }) => (
              <li key={id}>
                <Link href={"/verification?method=" + id + "#verification-methods"}>
                  <span className={styles.methodIcon}><Icon size={21} aria-hidden="true" /></span>
                  <span className={styles.methodLabel}><strong>{title}</strong><small>{hint}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
