import type { Metadata } from "next";
import { draftCovers } from "@/data/trip-covers";
import { SiteShell } from "../../_shared/site-shell";
import { TripEditor } from "./trip-editor";

export const metadata: Metadata = {
  title: "Create a Trip | SideTrail",
  description: "Draft a trip, choose who can join, and preview how it looks on SideTrail.",
};

export default async function NewTripPage({ searchParams }: { searchParams: Promise<{ edit?: string | string[] }> }) {
  const { edit } = await searchParams;
  return (
    <SiteShell isCreate>
      <TripEditor covers={draftCovers} editId={typeof edit === "string" ? edit : undefined} />
    </SiteShell>
  );
}
