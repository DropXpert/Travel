import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { tripListings } from "@/data/trip-listings";
import { SiteShell } from "../../_shared/site-shell";

import { demoTripId } from "../../_shared/demo-id";
import { publicPageMetadata, siteOpenGraph } from "../../_shared/public-metadata";
import { tripHref } from "../../_shared/trip-navigation";
import { TripDetails } from "./trip-details";

type TripPageProps = { params: Promise<{ slug: string }> };

function findListing(slug: string) {
  return tripListings.find(({ trip }) => trip.slug === slug);
}

export function generateStaticParams() {
  return tripListings.map(({ trip }) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const listing = findListing((await params).slug);
  if (!listing) return { title: "Trip details" };
  const { trip } = listing;
  return publicPageMetadata(trip.title, trip.details?.description ?? siteOpenGraph.description, tripHref(trip.slug));
}

export default async function TripPage({ params }: TripPageProps) {
  const { slug } = await params;
  if (!findListing(slug) && !demoTripId.test(slug)) notFound();
  return <SiteShell isTrip><TripDetails slug={slug} /></SiteShell>;
}
