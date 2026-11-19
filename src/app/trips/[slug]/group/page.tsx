import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTripGroupDemo, tripGroupSlugs } from "@/data/trip-groups";
import { SiteShell } from "../../../_shared/site-shell";
import { TripGroupSpace } from "./trip-group-space";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tripGroupSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = getTripGroupDemo((await params).slug);
  return { title: group ? group.listing.trip.title + " group demo | SideTrail" : "Group preview not found | SideTrail" };
}

export default async function TripGroupPage({ params }: Props) {
  const group = getTripGroupDemo((await params).slug);
  if (!group) notFound();

  return <SiteShell isTripGroup><TripGroupSpace group={group} /></SiteShell>;
}
