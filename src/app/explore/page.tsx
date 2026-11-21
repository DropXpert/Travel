import { publicPageMetadata } from "../_shared/public-metadata";
import { SiteShell } from "../_shared/site-shell";
import { readExploreState } from "./browse-trips";
import { ExploreTrips } from "./explore-trips";

export const metadata = publicPageMetadata(
  "Explore trips",
  "Find a hike, weekend getaway, or road trip to share with travellers across India.",
  "/explore",
);

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
      <ExploreTrips initialState={initialState} />
    </SiteShell>
  );
}
