import { Plus, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { brandName } from "@/brand";
import { photos } from "@/data/trip-listings";
import { primaryNavigation } from "@/navigation/primary";
import { SiteBrand, siteDisplay } from "./brand";
import { DemoAccount } from "./demo-account";
import { DialogButton } from "./dialog-button";
import { Dialog } from "./dialog";
import { LoginLink } from "./login-link";
import styles from "./site.module.css";

export function SiteShell({ children, isExplore = false, isCommunity = false, isCommunityDetail = false, isDashboard = false, isTrip = false, isTripGroup = false, isCreate = false, isVerification = false, profilePage, mobileAction }: {
  children: ReactNode;
  isExplore?: boolean;
  isCommunity?: boolean;
  isCommunityDetail?: boolean;
  isDashboard?: boolean | "detail";
  isTrip?: boolean;
  isTripGroup?: boolean;
  isCreate?: boolean;
  isVerification?: boolean;
  profilePage?: "own" | "public";
  mobileAction?: ReactNode;
}) {
  const homePath = isExplore || isCommunity || isCommunityDetail || isDashboard || isTrip || isTripGroup || isCreate || isVerification || profilePage ? "/" : "";
  const exploreHref = isExplore ? "#top" : "/explore";
  const createHref = isCreate ? "#top" : "/trips/new";
  const ownProfile = profilePage === "own";
  const profileHref = ownProfile ? "#top" : "/profile";
  const dashboardDetail = isDashboard === "detail";
  const activeHref = isDashboard === true ? "/dashboard" : isExplore ? "/explore" : isCommunity ? "/community" : ownProfile ? "/profile" : undefined;
  const brandHref = homePath || "#top";
  const profileLink = (
    <Link href={profileHref} className={styles.iconButton} aria-label="My profile" aria-current={ownProfile ? "page" : undefined}>
      <UserRound size={21} aria-hidden="true" />
    </Link>
  );
  const bottomNav = !isTrip && !isCreate && (
    <nav className={styles.bottomNav} aria-label={`${brandName} main navigation`}>
      {primaryNavigation.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href === "/explore" ? exploreHref : href === "/trips/new" ? createHref : href === "/profile" ? profileHref : href}
          className={href === "/trips/new" ? styles.bottomCreate : undefined}
          aria-current={href === activeHref ? "page" : undefined}
          data-section-active={((isCommunityDetail && href === "/community") || (dashboardDetail && href === "/dashboard") || (isTripGroup && href === "/explore")) || undefined}
        >
          <span><Icon size={21} aria-hidden="true" /></span>{label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className={[siteDisplay.variable, styles.site, isTrip && styles.tripSite, isCreate && styles.createSite, mobileAction && styles.siteWithAction].filter(Boolean).join(" ")} id="top">
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={isTrip ? styles.header + " " + styles.desktopOnly : styles.header}>
        <div className={styles.container + " " + styles.headerInner}>
          <SiteBrand href={brandHref} />
          <nav className={styles.desktopNav} aria-label={`${brandName} main navigation`}>
            <Link href={exploreHref} aria-current={isExplore ? "page" : undefined} data-section-active={isTrip || isTripGroup || undefined}>Explore Trips</Link>
            <Link href="/community" aria-current={isCommunity ? "page" : undefined} data-section-active={isCommunityDetail || undefined}>Communities</Link>
            <Link href={homePath + "#how-it-works"}>How It Works</Link>
            <Link href="/dashboard" aria-current={isDashboard === true ? "page" : undefined} data-section-active={dashboardDetail || undefined}>My trips</Link>
          </nav>
          <div className={styles.mobileAccount}>
            <LoginLink className={styles.buttonText} />
            {profileLink}
          </div>
          <div className={styles.desktopActions}>
            <LoginLink className={styles.buttonText} />
            {profileLink}
            <Link href={createHref} aria-current={isCreate ? "page" : undefined} className={styles.buttonPrimary}>
              <Plus size={18} aria-hidden="true" />Create a Trip
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <DemoAccount />
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.container + " " + styles.footerInner}>
          <SiteBrand href={brandHref} />
          <nav aria-label="Footer">
            <Link href={exploreHref}>Explore</Link>
            <Link href={homePath + "#how-it-works"}>How it works</Link>
            <DialogButton dialogId="photo-credits" className={styles.buttonText}>Photo credits</DialogButton>
          </nav>
        </div>
      </footer>

      {mobileAction ? (
        <div className={styles.mobileDock}>
          <div className={styles.mobileAction}>{mobileAction}</div>
          {bottomNav}
        </div>
      ) : bottomNav}

      <Dialog id="photo-credits" title="Photo credits">
        <p>Photographs from Wikimedia Commons, resized and displayed with responsive crops.</p>
        <ul className={styles.credits}>
          {Object.values(photos).map(({ title, author, source, license, licenseUrl }) => (
            <li key={source}>
              <a href={source} target="_blank" rel="noreferrer">{title} by {author}</a>{" "}
              <a href={licenseUrl} target="_blank" rel="noreferrer">{license}</a>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
