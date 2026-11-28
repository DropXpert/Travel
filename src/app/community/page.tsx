import { communities } from "@/data/communities";
import { upcomingCommunityTrips } from "@/data/community-trips";
import { photos } from "@/data/trip-listings";
import { publicPageMetadata } from "../_shared/public-metadata";
import { SiteShell } from "../_shared/site-shell";
import { CommunityDiscovery } from "./community-discovery";
import { PhotoFeed } from "./photo-feed";

export const metadata = publicPageMetadata(
  "Travel communities",
  "Find hiking groups, weekend crews, and travel circles for solo travellers, couples, and families across India.",
  "/community",
);

export const revalidate = 86400;

export default function CommunityPage() {
  const groups = communities.map(({ photo, tripSlugs, ...community }) => ({
    ...community,
    photo: { src: photos[photo].src, alt: photos[photo].alt },
    upcomingTrips: upcomingCommunityTrips(tripSlugs)
      .map(({ trip, date }) => ({ slug: trip.slug, title: trip.title, date })),
  }));

  return (
    <SiteShell isCommunity>
      <CommunityDiscovery communities={groups} />
      <PhotoFeed />
    </SiteShell>
  );
}
