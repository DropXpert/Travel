"use client";

import { CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { communityCategories, communityHref, participationLabels, type Community } from "@/data/communities";
import { travellerGroupLabels } from "@/domain/travel";
import { Dialog } from "../_shared/dialog";
import { rememberTripOpening, tripHref } from "../_shared/trip-navigation";
import site from "../_shared/site.module.css";
import { CommunityJoinRequest } from "./community-join-request";
import styles from "./community.module.css";

export interface DiscoveryCommunity extends Omit<Community, "photo" | "tripSlugs"> {
  photo: { src: string; alt: string };
  upcomingTrips: readonly { slug: string; title: string; date: string }[];
}

export function CommunityPreview({ community, onClose }: { community: DiscoveryCommunity; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [showRequest, setShowRequest] = useState(false);
  const { id, name, city, category, photo, description, participation, groups, expectations, upcomingTrips } = community;

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <Dialog id="community-preview" title={name} className={styles.preview} dialogRef={dialog} onClose={onClose}>
      {showRequest ? <CommunityJoinRequest groups={groups} expectations={expectations} focusOnMount /> : (
        <>
          <p className={styles.previewMeta}><MapPin size={16} aria-hidden="true" />{city} · {communityCategories[category]}</p>
          <figure className={styles.previewPhoto}>
            <Image fill src={photo.src} alt={photo.alt} loading="eager" sizes="(min-width: 640px) 560px, calc(100vw - 36px)" />
          </figure>
          <p>{description}</p>
          <div className={styles.participation}>
            <p><strong>{participationLabels[participation]}</strong> · {groups.map((group) => travellerGroupLabels[group]).join(", ")}</p>
            <div className={site.dialogActions}>
              <Link href={communityHref(id)} className={site.buttonPrimary} onNavigate={() => dialog.current?.close()}>View community</Link>
              <button type="button" className={site.buttonOutline} onClick={() => setShowRequest(true)}>Request to Join</button>
            </div>
          </div>
          {upcomingTrips.length > 0 && (
            <section className={styles.previewSection} aria-labelledby="community-related">
              <h3 id="community-related">Upcoming trips</h3>
              <ul className={styles.relatedTrips}>
                {upcomingTrips.map(({ slug, title, date }) => (
                  <li key={slug}>
                    <Link href={tripHref(slug)} onNavigate={() => {
                      rememberTripOpening(slug);
                      dialog.current?.close();
                    }}>
                      <CalendarDays size={19} aria-hidden="true" />
                      <span><strong>{title}</strong><small>{date}</small></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Dialog>
  );
}
