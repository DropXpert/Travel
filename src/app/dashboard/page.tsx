import type { Metadata } from "next";
import { draftCovers } from "@/data/trip-covers";
import { photos, tripListings } from "@/data/trip-listings";
import { SiteShell } from "../_shared/site-shell";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "My Trips | SideTrail",
  description: "Pick up a trip draft, revisit saved adventures and keep track of your travel plans.",
};

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  return (
    <SiteShell isDashboard>
      <Dashboard
        initialTab={typeof tab === "string" ? tab : null}
        listings={tripListings}
        covers={draftCovers}
        planPhoto={{ src: photos.coorg.src, alt: photos.coorg.alt }}
        savedPhoto={{ src: photos.rishikesh.src, alt: photos.rishikesh.alt }}
      />
    </SiteShell>
  );
}
