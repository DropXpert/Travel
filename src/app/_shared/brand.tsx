import localFont from "next/font/local";
import Link from "next/link";
import { brandName } from "@/brand";
import styles from "./site.module.css";

export const siteDisplay = localFont({
  src: "../_home/bricolage-grotesque.woff2",
  variable: "--sidetrail-display",
  weight: "500 800",
  display: "swap",
});

export function SiteBrand({ href, className }: { href: string; className?: string }) {
  return (
    <Link className={className ? `${styles.brand} ${className}` : styles.brand} href={href} aria-label={`${brandName} home`}>
      <span>Share <strong>Yarana</strong></span>
    </Link>
  );
}
