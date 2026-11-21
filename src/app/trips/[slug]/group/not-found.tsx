import Link from "next/link";
import { SiteShell } from "../../../_shared/site-shell";
import site from "../../../_shared/site.module.css";
import styles from "./group.module.css";

export default function GroupNotFound() {
  return (
    <SiteShell isTripGroup>
      <div className={site.container + " " + styles.missing}>
        <h1>Trip group not found</h1>
        <p>Open an accepted request or a trip you host to find its group.</p>
        <Link href="/dashboard" className={site.buttonPrimary}>Go to My Trips</Link>
      </div>
    </SiteShell>
  );
}
