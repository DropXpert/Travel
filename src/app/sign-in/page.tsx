import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import Link from "next/link";
import { photos } from "@/data/trip-listings";
import { safeAuthReturn } from "@/navigation/auth";
import { SiteBrand } from "../_shared/brand";
import site from "../_shared/site.module.css";
import { AuthEntry } from "./auth-entry";
import styles from "./sign-in.module.css";

const googleSans = localFont({
  src: "./google-sans-medium.woff2",
  variable: "--font-google-sans",
  weight: "500",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sign In and Sign Up",
  description: "Explore Share Yarana’s Google and Phone sign-in walkthrough. No account is created or verified.",
};

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ mode?: string | string[]; returnTo?: string | string[] }>;
}) {
  const { mode, returnTo: requestedReturn } = await searchParams;
  const returnTo = safeAuthReturn(requestedReturn);
  const photo = photos.hero;

  return (
    <div className={styles.page + " " + googleSans.variable}>
      <a className={site.skipLink} href="#auth-main">Skip to content</a>
      <header className={styles.header}>
        <SiteBrand href="/" />
        <Link href={returnTo} className={styles.back}>Back to Share Yarana</Link>
      </header>
      <main id="auth-main" tabIndex={-1} className={styles.layout}>
        <figure className={styles.photo}>
          <Image fill src={photo.src} alt={photo.alt} preload
            sizes="(min-width: 1200px) 570px, (min-width: 900px) 48vw, (min-width: 700px) 650px, calc(100vw - 32px)" />
          <figcaption>
            <a href={photo.source} target="_blank" rel="noreferrer">
              <MapPin size={17} aria-hidden="true" />
              <span>Dayara Bugyal, Uttarakhand <small>{photo.author} · {photo.license}</small></span>
            </a>
          </figcaption>
        </figure>
        <AuthEntry key={mode === "signup" ? "signup" : "login"} mode={mode === "signup" ? "signup" : "login"} returnTo={returnTo} />
      </main>
    </div>
  );
}
