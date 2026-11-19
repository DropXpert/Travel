import { MapPinned } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "../../_shared/site-shell";
import site from "../../_shared/site.module.css";
import styles from "./trip.module.css";

export default function TripNotFound() {
  return (
    <SiteShell isTrip>
      <div className={site.container + " " + styles.missing}>
        <span><MapPinned size={28} aria-hidden="true" /></span>
        <h1>Trip not found</h1>
        <p>This trip link may have changed. Explore the listings to find another plan.</p>
        <Link href="/explore" className={site.buttonPrimary}>Explore trips</Link>
      </div>
    </SiteShell>
  );
}
