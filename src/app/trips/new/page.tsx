import type { Metadata } from "next";
import { draftCovers } from "@/data/trip-covers";
import { SiteShell } from "../../_shared/site-shell";
import { TripEditor } from "./trip-editor";

export const metadata: Metadata = {
  title: "Create a Trip | SideTrail",
  description: "Draft a trip, choose who can join, and preview how it looks on SideTrail.",
};

export default function NewTripPage() {
  return (
    <SiteShell isCreate>
      <TripEditor covers={draftCovers} />
    </SiteShell>
  );
}
