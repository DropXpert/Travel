import type { Metadata } from "next";
import { brandName, brandTagline } from "@/brand";

export const siteOpenGraph = {
  type: "website",
  siteName: brandName,
  title: `${brandName} | ${brandTagline}`,
  description: "Discover hikes, road trips and weekend getaways across India with people who travel like you. No platform fees.",
} as const;

export function publicPageMetadata(title: string, description: string, pathname: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      ...siteOpenGraph,
      title: `${title} | ${brandName}`,
      description,
      url: pathname,
    },
  };
}
