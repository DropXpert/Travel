export type TravellerGroup = "solo" | "couple" | "family";
export type Activity = "hiking" | "trekking" | "road-trip" | "weekend-getaway" | "camping" | "adventure" | "leisure" | "other";
export type TravellerInterest = Exclude<Activity, "adventure" | "leisure" | "other"> | "nature" | "photography";
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

export interface Trip extends TripSummary {
  // Omitted means undecided; zero explicitly means no expected expenses.
  estimatedSharePerPersonInr?: number;
  hostGroupName?: string;
}

export const sharedExpenseNote = "Travel budgets are estimates for transport, accommodation, food and common expenses. They are not booking fees. Share Yarana collects no payments.";

const moneyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 2,
});

export function formatTripBudget(amount?: number) {
  if (amount === undefined) return "Budget not specified";
  return amount === 0 ? "No expected expenses" : moneyFormat.format(amount);
}

export const activityLabels: Record<Activity, string> = {
  hiking: "Hiking",
  trekking: "Trekking",
  "road-trip": "Road trip",
  "weekend-getaway": "Weekend getaway",
  camping: "Camping",
  adventure: "Adventure",
  leisure: "Leisure",
  other: "Community outing",
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
  nature: "Nature",
  photography: "Photography",
};

export function travellerHref(handle: string) {
  return "/travellers/" + encodeURIComponent(handle);
}

export function availableSpots(trip: Trip) {
  return trip.capacity - trip.confirmedTravellers;
}

export function tripHostName(trip: Trip, host: TravellerProfile) {
  return trip.hostGroupName ?? host.displayName;
}

export function travellerInitials(displayName: string) {
  return displayName.replace(/^(The|Sample) /, "").split(/\s+/).filter((word) => word !== "&")
    .slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
}

export type JoinRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface JoinRequest {
  id: string;
  tripId: Trip["id"];
  requesterId: TravellerProfile["id"];
  partySize: number;
  submittedOn: string;
  status: JoinRequestStatus;
}


export const requestStatusLabels: Record<JoinRequestStatus, string> = {
  pending: "Pending", accepted: "Accepted", declined: "Declined", cancelled: "Cancelled",
};
