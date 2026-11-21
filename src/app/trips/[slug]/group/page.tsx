import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tripGroupSlugs } from "@/data/trip-groups";
import { SiteShell } from "../../../_shared/site-shell";
import { demoTripId } from "../../../_shared/demo-id";
import { tripListings } from "@/data/trip-listings";
import { ConnectedTripGroup } from "./trip-group-space";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return tripGroupSlugs.map((slug) => ({ slug }));
}

export const metadata: Metadata = { title: "Trip Group Space | SideTrail" };

export default async function TripGroupPage({ params }: Props) {
  const { slug } = await params;
  if (!demoTripId.test(slug) && !tripListings.some(({ trip }) => trip.slug === slug)) notFound();
  return <SiteShell isTripGroup><ConnectedTripGroup slug={slug} /></SiteShell>;
}
