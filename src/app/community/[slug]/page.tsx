import { Compass, Globe2, LockKeyhole, MapPin, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { communities, communityCategories, communityHref, participationLabels } from "@/data/communities";
import { upcomingCommunityTrips } from "@/data/community-trips";
import { photos } from "@/data/trip-listings";
import { travellerGroupLabels, travellerInterestLabels } from "@/domain/travel";
import { DialogButton } from "../../_shared/dialog-button";
import { publicPageMetadata } from "../../_shared/public-metadata";
import { TripCard } from "../../_shared/trip-card";
import { SiteShell } from "../../_shared/site-shell";
import site from "../../_shared/site.module.css";
import { CommunityJoinDialog } from "../community-join-request";
import { ShareCommunity } from "./share-community";
import styles from "./detail.module.css";

type Props = { params: Promise<{ slug: string }> };
const joinDialogId = "community-join-request";
const guidelines = [
  "Respect fellow travellers and give everyone room to go at their own pace.",
  "Ask before sharing photos or contact details. Respect people’s privacy and boundaries.",
  "Agree on shared costs and how you’ll split them before setting off.",
  "Follow outdoor safety guidance and the safety plans your group has agreed on.",
  "Flag suspicious behaviour to the host or through reporting tools where available.",
] as const;

export const revalidate = 86400;

export function generateStaticParams() {
  return communities.map(({ id }) => ({ slug: id }));
}

function findCommunity(slug: string) {
  return communities.find(({ id }) => id === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const community = findCommunity((await params).slug);
  return community ? publicPageMetadata(community.name, community.description, communityHref(community.id))
    : { title: "Community not found" };
}

export default async function CommunityDetailsPage({ params }: Props) {
  const community = findCommunity((await params).slug);
  if (!community) notFound();

  const { id, name, city, category, photo, description, about, activities, groups, participation, expectations, tripSlugs } = community;
  const cover = photos[photo];
  const related = upcomingCommunityTrips(tripSlugs);
  const AccessIcon = participation === "private" ? LockKeyhole : Globe2;

  return (
    <SiteShell isCommunityDetail mobileAction={
      <DialogButton dialogId={joinDialogId} className={site.buttonPrimary + " " + styles.joinButton}>Request to Join</DialogButton>
    }>
      <article className={site.container + " " + styles.page} aria-labelledby="community-title">
        <div className={styles.toolbar}>
          <Link href="/community" className={styles.textLink}>All communities</Link>
          <ShareCommunity slug={id} name={name} />
        </div>
        <header className={styles.hero}>
          <figure className={styles.cover}>
            <Image fill preload src={cover.src} alt={cover.alt}
              sizes="(min-width: 1264px) 660px, (min-width: 900px) 54vw, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)" />
            <figcaption>
              <a href={cover.source} target="_blank" rel="noreferrer" aria-label={"Photo credit · " + cover.author + " · " + cover.license}>Photo credit</a>
            </figcaption>
          </figure>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>Demo community · {communityCategories[category]}</p>
            <h1 id="community-title">{name}</h1>
            <ul className={styles.meta}>
              <li><MapPin size={17} aria-hidden="true" />{city}</li>
              <li><AccessIcon size={16} aria-hidden="true" />{participationLabels[participation]}</li>
            </ul>
            <p className={styles.intro}>{description}</p>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.about} aria-labelledby="community-about">
            <h2 id="community-about">About our crew</h2>
            <p>{about}</p>
            <h3>What we do</h3>
            <ul className={styles.tags}>
              {activities.map((activity) => <li key={activity}>{travellerInterestLabels[activity]}</li>)}
            </ul>
          </section>

          <aside className={styles.join} aria-labelledby="community-who">
            <h2 id="community-who"><UsersRound size={24} aria-hidden="true" />Who can join</h2>
            <ul className={styles.tags}>
              {groups.map((group) => <li key={group}>{travellerGroupLabels[group]}</li>)}
            </ul>
            <p>{expectations}</p>
            {groups.includes("family") && category !== "family" && <p>A parent or guardian manages family participation.</p>}
            <div className={styles.joinAction}>
              <DialogButton dialogId={joinDialogId} className={site.buttonPrimary + " " + styles.joinButton}>Request to Join</DialogButton>
            </div>
            <p className={styles.joinNote}>Free to participate. Demo join requests stay on this screen.</p>
          </aside>

          <section className={styles.related} aria-labelledby="community-trips">
            <h2 id="community-trips">Related upcoming trips</h2>
            {related.length > 0 ? (
              <ul className={site.tripGrid + " " + styles.relatedGrid}>
                {related.map((listing) => (
                  <li key={listing.trip.id}><TripCard listing={listing} showTravelDetails linkToDetails /></li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <span><Compass size={24} aria-hidden="true" /></span>
                <div>
                  <h3>No upcoming trips linked yet</h3>
                  <p>In the meantime, see what other travellers are planning.</p>
                  <Link href="/explore" className={styles.textLink}>Explore trips</Link>
                </div>
              </div>
            )}
          </section>

          <section className={styles.guidelines} aria-labelledby="community-guide">
            <h2 id="community-guide">Community guidelines</h2>
            <ul>{guidelines.map((guideline) => <li key={guideline}>{guideline}</li>)}</ul>
            <Link href="/verification#verification-safety" className={styles.textLink}>Travel safety guidance</Link>
          </section>
        </div>
      </article>
      <CommunityJoinDialog dialogId={joinDialogId} name={name} groups={groups} expectations={expectations} />
    </SiteShell>
  );
}
