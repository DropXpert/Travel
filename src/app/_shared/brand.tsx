import { Mountain } from "lucide-react";
import localFont from "next/font/local";
import Link from "next/link";
import styles from "./site.module.css";

export const siteDisplay = localFont({
  src: "../_home/bricolage-grotesque.woff2",
  variable: "--sidetrail-display",
  weight: "500 800",
  display: "swap",
});

export function SiteBrand({ href }: { href: string }) {
  return (
    <Link className={styles.brand} href={href} aria-label="SideTrail home">
      <span><Mountain size={22} strokeWidth={2.2} aria-hidden="true" /></span>
      SideTrail
    </Link>
  );
}
