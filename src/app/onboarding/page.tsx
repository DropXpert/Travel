import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photos } from "@/data/trip-listings";
import { safeAuthReturn } from "@/navigation/auth";
import { SiteBrand, siteDisplay } from "../_shared/brand";
import site from "../_shared/site.module.css";
import { TravellerOnboarding, type TravellerOption } from "./traveller-onboarding";
import styles from "./onboarding.module.css";

export const metadata: Metadata = {
  title: "Traveller Onboarding",
  description: "Try Share Yarana’s traveller onboarding and preview a profile with the trips and places you enjoy.",
};

const options = [
  {
    group: "solo", photo: photos.sinhagad,
    description: "For people who love exploring and meeting new travel buddies.",
  },
  {
    group: "couple", photo: photos.rishikesh,
    description: "Explore together and connect with other travellers.",
  },
  {
    group: "family", photo: photos.coorg,
    description: "Discover family-friendly adventures and make memories together.",
  },
] as const satisfies readonly TravellerOption[];

export default async function OnboardingPage({ searchParams }: {
  searchParams: Promise<{ traveller?: string | string[]; returnTo?: string | string[] }>;
}) {
  const { traveller, returnTo } = await searchParams;
  const back = safeAuthReturn(returnTo);
  const preselected = options.find(({ group }) => group === traveller)?.group;
  const photo = photos.people;

  return (
    <div className={siteDisplay.variable + " " + styles.page}>
      <a className={site.skipLink} href="#onboarding-main">Skip to content</a>
      <header className={styles.header}>
        <SiteBrand href="/" />
        <Link href={back} className={styles.exit}>Exit demo</Link>
      </header>
      <main id="onboarding-main" tabIndex={-1} className={styles.layout}>
        <figure className={styles.editorialPhoto}>
          <Image fill src={photo.src} alt={photo.alt} sizes="(min-width: 1240px) 550px, (min-width: 900px) 45vw, 1px" />
          <figcaption>
            <a href={photo.source} target="_blank" rel="noreferrer">
              <MapPin size={17} aria-hidden="true" />
              <span>Out on the trail in India <small>{photo.author} · {photo.license}</small></span>
            </a>
          </figcaption>
        </figure>
        <TravellerOnboarding options={options} preselected={preselected} />
      </main>
    </div>
  );
}
