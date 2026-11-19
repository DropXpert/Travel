import Link from "next/link";
import { SiteShell } from "../../../_shared/site-shell";
import site from "../../../_shared/site.module.css";
import styles from "./group.module.css";

export default function GroupNotFound() {
  return (
    <SiteShell isTripGroup>
      <div className={site.container + " " + styles.missing}>
        <h1>Group preview not found</h1>
        <p>Group previews are available for selected sample trips.</p>
        <Link href="/dashboard/requests" className={site.buttonPrimary}>Open host workspace</Link>
      </div>
    </SiteShell>
  );
}
