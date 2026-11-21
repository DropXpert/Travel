import Link from "next/link";
import { SiteBrand, siteDisplay } from "./_shared/brand";
import site from "./_shared/site.module.css";

export default function NotFound() {
  return (
    <main className={siteDisplay.variable + " " + site.site}>
      <div className={site.container + " " + site.demoPanel}>
        <SiteBrand href="/" />
        <div className="grid justify-items-start gap-3">
          <h1>Page not found</h1>
          <p>This link may have changed. Find your next plan in Explore.</p>
          <Link href="/explore" className={site.buttonPrimary}>Explore trips</Link>
        </div>
      </div>
    </main>
  );
}
