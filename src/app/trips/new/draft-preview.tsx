import { CalendarDays, ImageIcon, MapPin, Route, UsersRound } from "lucide-react";
import Image from "next/image";
import type { DraftCover } from "@/data/trip-covers";
import { sharedExpenseNote, travellerGroupLabels } from "@/domain/travel";
import { draftCost, draftDates, type TripDraft } from "../../_shared/trip-draft";
import site from "../../_shared/site.module.css";
import styles from "./create.module.css";

export function DraftPreview({ draft, cover, compact = false }: {
  draft: TripDraft;
  cover?: DraftCover;
  compact?: boolean;
}) {
  const groupNames = draft.groups.map((group) => travellerGroupLabels[group]);
  const budget = draftCost(draft.budget);
  const spots = draft.spots || draft.capacity;
  const days = draft.itinerary.map((day, index) => ({ ...day, number: index + 1 }))
    .filter((day) => day.title.trim() || day.note.trim());

  return (
    <article className={styles.previewCard} data-compact={compact || undefined}>
      <div className={styles.previewPhoto}>
        {cover ? (
          <Image
            fill
            src={cover.src}
            alt={cover.alt}
            loading="eager"
            sizes={compact ? "(min-width: 1024px) 350px, 1px" : "(min-width: 640px) 480px, calc(100vw - 36px)"}
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            <ImageIcon size={28} aria-hidden="true" />
            <span>Cover photo to be chosen</span>
          </div>
        )}
        {draft.category && <span className={styles.categoryLabel}>{draft.category}</span>}
      </div>
      <div className={styles.previewBody}>
        <p className={styles.previewLocation}><MapPin size={16} aria-hidden="true" />{draft.destination.trim() || "Your destination"}</p>
        <h3>{draft.title.trim() || "Your trip title"}</h3>
        <p className={styles.previewFact}><CalendarDays size={16} aria-hidden="true" />{draftDates(draft.startsOn, draft.endsOn)}</p>
        {draft.departureCity.trim() && <p className={styles.previewFact}><Route size={16} aria-hidden="true" />From {draft.departureCity.trim()}</p>}
        <div className={styles.previewHost}>
          <span className={site.avatar} aria-hidden="true">Y</span>
          <p><strong>You · host</strong><span>Community trip</span></p>
        </div>
        {groupNames.length > 0 && <p className={styles.previewFact}><UsersRound size={16} aria-hidden="true" />{groupNames.join(" · ")}</p>}
        <div className={styles.previewCost}>
          <p><strong>{budget}</strong> {Number(draft.budget) > 0 && <span>est. budget / person</span>}</p>
          {spots && <span>{Number(spots) === 0 ? "Trip full" : spots + (Number(spots) === 1 ? " spot available" : " spots available")}</span>}
        </div>
        {!compact && (
          <>
            <p className={styles.hint}>{sharedExpenseNote}</p>
            <section className={styles.previewSection}>
              <h4>What to expect</h4>
              <p>{draft.description.trim() || "Trip description to be added."}</p>
              {draft.preferences.trim() && <p><strong>Traveller preferences</strong><br />{draft.preferences.trim()}</p>}
            </section>
            {(draft.included.trim() || draft.excluded.trim() || draft.costNotes.trim()) && (
              <section className={styles.previewSection}>
                <h4>Estimated shared expenses</h4>
                {draft.included.trim() && <p><strong>Covered by the estimate</strong><br />{draft.included.trim()}</p>}
                {draft.excluded.trim() && <p><strong>Plan for separately</strong><br />{draft.excluded.trim()}</p>}
                {draft.costNotes.trim() && <p><strong>Expense notes</strong><br />{draft.costNotes.trim()}</p>}
              </section>
            )}
            <section className={styles.previewSection}>
              <h4>Itinerary</h4>
              {days.length ? (
                <ol>
                  {days.map((day) => <li key={day.id}><strong>Day {day.number}{day.title.trim() && " · " + day.title.trim()}</strong>{day.note.trim() && <p>{day.note.trim()}</p>}</li>)}
                </ol>
              ) : <p>Plans are still being finalized.</p>}
            </section>
          </>
        )}
      </div>
    </article>
  );
}
