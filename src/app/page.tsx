import { Backpack, Compass, HeartHandshake, MapPin, Plus, Send, UserRound, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { photos, tripListings } from "@/data/trip-listings";
import { TripDiscovery } from "./_home/trip-discovery";
import styles from "./_home/home.module.css";
import { SiteShell } from "./_shared/site-shell";
import site from "./_shared/site.module.css";

export const metadata: Metadata = {
  title: "SideTrail | Good trips. Better company.",
  description: "Discover hikes, road trips and weekend getaways across India with people who travel like you.",
};

const communities = [
  { title: "Solo travellers", icon: UserRound, copy: "Pick a trail or a new town and share the day with a small group." },
  { title: "Couples", icon: HeartHandshake, copy: "Find a road trip or a weekend away with room for two." },
  { title: "Families", icon: UsersRound, copy: "Find gentler trails, slower mornings and room for the whole family." },
];

const steps = [
  { title: "Find a trip", icon: Compass, copy: "Pick a travel style and see the dates, budget and host at a glance." },
  { title: "Request to join", icon: Send, copy: "Tell the host who’s coming. They’ll review your request and confirm your place." },
  { title: "Travel together", icon: Backpack, copy: "Get the meetup details, pack your bag and go meet your crew." },
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className={site.container + " " + styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Travel together in India</p>
          <h1 id="hero-title">Good trips.<br /><span>Better company.</span></h1>
          <p className={styles.heroDescription}>Create trips, meet fellow travellers and explore together. No platform fees.</p>
          <div className={styles.heroActions}>
            <Link href="/explore" className={site.buttonPrimary}>
              <Compass size={19} aria-hidden="true" />Explore Trips
            </Link>
            <Link href="/trips/new" className={site.buttonOutline}>
              <Plus size={19} aria-hidden="true" />Create a Trip
            </Link>
          </div>
        </div>
        <figure className={styles.heroPhoto}>
          <Image
            src={photos.hero.src}
            alt={photos.hero.alt}
            fill
            preload
            sizes="(min-width: 1264px) 630px, (min-width: 1024px) 50vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
          />
          <figcaption><MapPin size={16} aria-hidden="true" />Gui campsite, Uttarakhand</figcaption>
        </figure>
      </section>

      <TripDiscovery listings={tripListings.slice(0, 6)} />

      <section id="communities" className={site.container + " " + styles.people} aria-labelledby="people-title">
        <div className={styles.peoplePhoto}>
          <Image
            fill
            src={photos.people.src}
            alt={photos.people.alt}
            sizes="(min-width: 1264px) 530px, (min-width: 768px) 45vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
          />
        </div>
        <div className={styles.peopleCopy}>
          <div className={styles.sectionIntro}>
            <h2 id="people-title">Find your travel people.</h2>
            <p>Good company means something different to everyone. Find a trip that feels like yours.</p>
          </div>
          <ul className={styles.peopleList}>
            {communities.map(({ title, copy, icon: Icon }) => (
              <li key={title}>
                <span className={styles.peopleIcon}><Icon size={21} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className={styles.how} aria-labelledby="how-title">
        <div className={site.container}>
          <div className={styles.sectionIntro}><h2 id="how-title">How it works.</h2></div>
          <ol className={styles.steps}>
            {steps.map(({ title, copy, icon: Icon }) => (
              <li key={title}>
                <span className={styles.stepIcon}><Icon size={25} aria-hidden="true" /></span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={site.container} aria-labelledby="final-title">
        <div className={styles.finalCta}>
          <div>
            <h2 id="final-title">Where to next?</h2>
            <p>Free to explore, free to host, free to join. Find your people and share the adventure.</p>
          </div>
          <div className={styles.finalActions}>
            <Link href="/explore" className={site.buttonCoral}>Explore Trips</Link>
            <Link href="/trips/new" className={site.buttonOnDark}>Create a Trip</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
