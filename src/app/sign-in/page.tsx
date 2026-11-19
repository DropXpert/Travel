import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photos } from "@/data/trip-listings";
import { safeAuthReturn } from "@/navigation/auth";
import { SiteBrand, siteDisplay } from "../_shared/brand";
import site from "../_shared/site.module.css";
import { AuthEntry } from "./auth-entry";
import styles from "./sign-in.module.css";

export const metadata: Metadata = {
  title: "Login and Sign Up | SideTrail",
  description: "Preview the SideTrail account experience with sample details.",
};

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ mode?: string | string[]; returnTo?: string | string[] }>;
}) {
  const { mode, returnTo: requestedReturn } = await searchParams;
  const returnTo = safeAuthReturn(requestedReturn);
  const photo = photos.hero;

  return (
    <div className={siteDisplay.variable + " " + styles.page}>
      <a className={site.skipLink} href="#auth-main">Skip to content</a>
      <header className={styles.header}>
        <SiteBrand href="/" />
        <Link href={returnTo} className={styles.back}>Back to SideTrail</Link>
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
        <AuthEntry mode={mode === "signup" ? "signup" : "login"} returnTo={returnTo} />
      </main>
    </div>
  );
}
