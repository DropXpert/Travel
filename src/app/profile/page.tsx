import type { Metadata } from "next";
import { avatarTones, demoProfile, profileCovers } from "@/data/traveller-profiles";
import { ProfileEditor } from "../_profile/profile-editor";
import { SiteShell } from "../_shared/site-shell";

export const metadata: Metadata = { title: "My profile | SideTrail" };

export default function MyProfilePage() {
  return (
    <SiteShell profilePage="own">
      <ProfileEditor initial={demoProfile} covers={profileCovers} tones={avatarTones} />
    </SiteShell>
  );
}
