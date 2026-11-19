export type TravellerGroup = "solo" | "couple" | "family";
export type Activity = "hiking" | "trekking" | "road-trip" | "weekend-getaway";
export type TravellerInterest = Activity | "camping" | "nature" | "photography";
export type Difficulty = "easy" | "moderate" | "challenging";

export interface TravellerProfile {
  id: string;
  handle: string;
  displayName: string;
  homeCity: string;
  group: TravellerGroup;
  interests: readonly TravellerInterest[];
  bio: string;
  travelStyle?: string;
  favouriteDestinations?: readonly string[];
  partnerDisplayName?: string;
}

interface TripDetails {
  description: string;
  itinerary?: readonly { title: string; note: string }[];
  suitability?: string;
  costNotes?: string;
}

interface TripSummary {
  id: string;
  slug: string;
  hostId: TravellerProfile["id"];
  title: string;
  destination: string;
  departureCity: string;
  postedOn: string;
  startsOn: string;
  endsOn: string;
  activity: Activity;
  difficulty: Difficulty;
  capacity: number;
  confirmedTravellers: number;
  welcomeGroups: readonly TravellerGroup[];
  details?: TripDetails;
}

export type Trip = TripSummary & (
  | { kind: "personal"; estimatedSharePerPersonInr: number; hostGroupName?: string }
  | { kind: "commercial"; organizerName: string; pricePerPersonInr: number }
);

export const activityLabels: Record<Activity, string> = {
  hiking: "Hiking",
  trekking: "Trekking",
  "road-trip": "Road trip",
  "weekend-getaway": "Weekend getaway",
};

export const travellerGroupLabels: Record<TravellerGroup, string> = {
  solo: "Solo travellers",
  couple: "Couples",
  family: "Families",
};

export const profileTypeLabels: Record<TravellerGroup, string> = {
  solo: "Solo traveller",
  couple: "Couple",
  family: "Family",
};

export const travellerInterestLabels: Record<TravellerInterest, string> = {
  ...activityLabels,
  camping: "Camping",
  nature: "Nature",
  photography: "Photography",
};

export function travellerHref(handle: string) {
  return "/travellers/" + encodeURIComponent(handle);
}

export function tripCostPerPerson(trip: Trip) {
  return trip.kind === "personal" ? trip.estimatedSharePerPersonInr : trip.pricePerPersonInr;
}

export function availableSpots(trip: Trip) {
  return trip.capacity - trip.confirmedTravellers;
}

export function tripHostName(trip: Trip, host: TravellerProfile) {
  return trip.kind === "commercial" ? trip.organizerName : trip.hostGroupName ?? host.displayName;
}

export function travellerInitials(displayName: string) {
  return displayName.replace(/^(The|Sample) /, "").split(/\s+/).filter((word) => word !== "&")
    .slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
}

export type JoinRequestStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface JoinRequest {
  id: string;
  tripId: Trip["id"];
  requesterId: TravellerProfile["id"];
  partySize: number;
  submittedOn: string;
  status: JoinRequestStatus;
}
