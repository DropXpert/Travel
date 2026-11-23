import { ArrowRight, Compass, MapPin, Plus, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { photos, tripListings } from "@/data/trip-listings";
import { TripDiscovery } from "./_home/trip-discovery";
import styles from "./_home/home.module.css";
import { siteOpenGraph } from "./_shared/public-metadata";
import { SiteShell } from "./_shared/site-shell";
import site from "./_shared/site.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...siteOpenGraph, url: "/", images: [{ url: photos.hero.src, alt: photos.hero.alt }] },
};

export default function HomePage() {
  return (
    <SiteShell isHome>
      <div className={styles.home + " " + site.container}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A little adventure. A lot of connection.</p>
            <h1 id="hero-title">Find your people.<br /><span>Share the adventure.</span></h1>
            <p>Weekend trails, open roads, and people you’ll be glad you met. Make your next plan together.</p>
            <div className={styles.actions}>
              <Link href="/explore" className={styles.coralButton}><Compass size={17} aria-hidden="true" />Explore Trips</Link>
              <Link href="/trips/new" className={styles.heroLink}><Plus size={17} aria-hidden="true" />Create Trip</Link>
            </div>
          </div>
          <figure className={styles.heroPhoto}>
            <Image src={photos.hero.src} alt={photos.hero.alt} fill preload sizes="(min-width: 1264px) 520px, (min-width: 768px) 45vw, calc(100vw - 32px)" />
            <figcaption><MapPin size={14} aria-hidden="true" />Gui campsite, Uttarakhand</figcaption>
          </figure>
        </section>

        <section className={styles.destinations} aria-labelledby="destinations-title">
          <div className={styles.sectionHeading}><h2 id="destinations-title">Somewhere worth sharing</h2><Link href="/explore">Explore all <ArrowRight size={15} aria-hidden="true" /></Link></div>
          <ul className={styles.destinationStrip}>
            {tripListings.map(({ trip, photo }) => (
              <li key={trip.id}><Link href={"/explore?destination=" + encodeURIComponent(trip.destination)}>
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 160px, 120px" />
                <span>{trip.destination.split(",")[0]}</span>
              </Link></li>
            ))}
          </ul>
        </section>

        <div className={styles.discoveryLayout}>
          <Suspense fallback={<p>Loading travel plans…</p>}><TripDiscovery /></Suspense>
          <aside className={styles.sidebar}>
            <section className={styles.hostPanel}>
              <span className={styles.panelIcon}><Plus size={22} aria-hidden="true" /></span>
              <h2>Got a plan?<br />Host it.</h2>
              <p>A sunrise hike or a slow weekend. Put your plan out there and find your crew.</p>
              <Link href="/trips/new" className={site.buttonPrimary}>Create a Trip <ArrowRight size={16} aria-hidden="true" /></Link>
              <small>Free to host. Always your call who joins.</small>
            </section>
            <section className={styles.communityPanel}>
              <UsersRound size={22} aria-hidden="true" /><h2>Find your kind of crew</h2>
              <p>Meet people who share your pace, your interests, and your love for getting out.</p>
              <Link href="/community">Discover communities <ArrowRight size={16} aria-hidden="true" /></Link>
            </section>
            <section id="how-it-works" className={styles.how}>
              <h2>A plan becomes a shared adventure</h2>
              <p>Find a trip, get to know the host, and request to join. The host reviews your request before you coordinate in the group space.</p>
              <Link href="/verification">Travel together, thoughtfully <ArrowRight size={15} aria-hidden="true" /></Link>
            </section>
          </aside>
        </div>
        <p className={styles.closing}>Free to explore, free to host, free to join. Find your people. Share the adventure.</p>
      </div>
    </SiteShell>
  );
}
