import Link from "next/link";
import { SiteShell } from "../../_shared/site-shell";
import site from "../../_shared/site.module.css";
import styles from "../../_profile/profile.module.css";

export default function TravellerNotFound() {
  return (
    <SiteShell profilePage="public">
      <div className={site.container + " " + styles.missing}>
        <h1>Traveller not found</h1>
        <p>This profile link may have changed. Explore hosted trips to meet other travellers.</p>
        <Link href="/explore" className={site.buttonPrimary}>Explore trips</Link>
      </div>
    </SiteShell>
  );
}
