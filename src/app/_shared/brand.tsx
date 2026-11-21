import Image from "next/image";
import Link from "next/link";
import { brandName } from "@/brand";
import styles from "./site.module.css";

export function SiteBrand({ href, className }: { href: string; className?: string }) {
  return (
    <Link className={className ? `${styles.brand} ${className}` : styles.brand} href={href} aria-label={`${brandName} home`}>
      <Image src="/share-yarana-logo.webp" alt="" width={576} height={156} loading="eager" unoptimized />
    </Link>
  );
}
