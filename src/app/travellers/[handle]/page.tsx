import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profileCovers, publicTravellerProfiles, upcomingHostedTrips } from "@/data/traveller-profiles";
import { travellerHref } from "@/domain/travel";
import { ProfileView } from "../../_profile/profile-view";
import { publicPageMetadata } from "../../_shared/public-metadata";
import { SiteShell } from "../../_shared/site-shell";

type ProfilePageProps = { params: Promise<{ handle: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return publicTravellerProfiles.map(({ handle }) => ({ handle }));
}

function findProfile(handle: string) {
  return publicTravellerProfiles.find((profile) => profile.handle === handle);
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const profile = findProfile((await params).handle);
  return profile
    ? publicPageMetadata(profile.displayName, profile.bio, travellerHref(profile.handle))
    : { title: "Traveller not found" };
}

export default async function TravellerPage({ params }: ProfilePageProps) {
  const profile = findProfile((await params).handle);
  if (!profile) notFound();

  return (
    <SiteShell profilePage="public">
      <ProfileView profile={profile} cover={profile.cover ? profileCovers[profile.cover] : undefined} hostedTrips={upcomingHostedTrips(profile.id)} />
    </SiteShell>
  );
}
