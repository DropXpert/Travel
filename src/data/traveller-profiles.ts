import type { TravellerProfile } from "@/domain/travel";
import { travellerProfiles } from "./fixtures";
import { photos, tripListings } from "./trip-listings";

export const profileCovers = {
  sinhagad: { ...photos.sinhagad, label: "Sinhagad" },
  coorg: { ...photos.coorg, label: "Coorg" },
  vagamon: { ...photos.vagamon, label: "Vagamon" },
  nandiHills: { ...photos.nandiHills, label: "Nandi Hills" },
  rishikesh: { ...photos.rishikesh, label: "Rishikesh" },
} as const;

export const avatarTones = {
  teal: "Trail teal",
  clay: "Sunset clay",
  stone: "Warm stone",
} as const;

export type ProfileCover = (typeof profileCovers)[keyof typeof profileCovers];

export interface TravellerProfileView extends TravellerProfile {
  cover?: keyof typeof profileCovers;
  avatarTone: keyof typeof avatarTones;
}

const presentation = {
  "meera-wanders": { cover: "vagamon", avatarTone: "teal" },
  "kavya-and-dev": { cover: "rishikesh", avatarTone: "clay" },
  "nairs-outdoors": { cover: "coorg", avatarTone: "stone" },
  "ananya-on-foot": { cover: "sinhagad", avatarTone: "teal" },
} satisfies Record<
  (typeof travellerProfiles)[number]["handle"],
  Pick<TravellerProfileView, "cover" | "avatarTone">
>;

export const publicTravellerProfiles: TravellerProfileView[] = travellerProfiles.map((traveller) => ({
  ...traveller,
  ...presentation[traveller.handle],
}));

export const demoProfile: TravellerProfileView = {
  id: "local-demo-traveller",
  handle: "local-demo-traveller",
  displayName: "Aarav Shah",
  homeCity: "Mumbai",
  group: "solo",
  bio: "Give me a window seat, a good playlist and a weekend outdoors.",
  interests: ["road-trip", "nature", "photography"],
  travelStyle: "Scenic routes and time for a stop when the view is worth it.",
  favouriteDestinations: ["Coorg", "Rishikesh"],
  cover: "nandiHills",
  avatarTone: "teal",
};

export function upcomingHostedTrips(hostId: string) {
  const indiaToday = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return tripListings.filter(({ trip }) => trip.hostId === hostId && trip.startsOn >= indiaToday)
    .sort(({ trip: a }, { trip: b }) => a.startsOn.localeCompare(b.startsOn));
}
