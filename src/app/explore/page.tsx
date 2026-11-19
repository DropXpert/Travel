import type { Metadata } from "next";
import { tripListings } from "@/data/trip-listings";
import { SiteShell } from "../_shared/site-shell";
import { readExploreState } from "./browse-trips";
import { ExploreTrips } from "./explore-trips";

export const metadata: Metadata = {
  title: "Explore trips | SideTrail",
  description: "Find a hike, weekend getaway, or road trip to share with travellers across India.",
};

export default async function ExplorePage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const initialState = readExploreState(params);

  return (
    <SiteShell isExplore>
      <ExploreTrips listings={tripListings} initialState={initialState} />
    </SiteShell>
  );
}
