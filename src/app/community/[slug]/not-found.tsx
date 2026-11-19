import { Compass } from "lucide-react";
import Link from "next/link";
import { SiteShell } from "../../_shared/site-shell";
import site from "../../_shared/site.module.css";
import styles from "./detail.module.css";

export default function CommunityNotFound() {
  return (
    <SiteShell isCommunityDetail>
      <div className={site.container + " " + styles.missing}>
        <span><Compass size={27} aria-hidden="true" /></span>
        <h1>Community not found</h1>
        <p>This crew may have a different link. Browse the communities to find your people.</p>
        <Link href="/community" className={site.buttonPrimary}>Browse communities</Link>
      </div>
    </SiteShell>
  );
}
