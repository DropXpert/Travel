import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profileCovers, publicTravellerProfiles, upcomingHostedTrips } from "@/data/traveller-profiles";
import { ProfileView } from "../../_profile/profile-view";
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
    ? { title: profile.displayName + " | SideTrail", description: profile.bio }
    : { title: "Traveller not found | SideTrail" };
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
