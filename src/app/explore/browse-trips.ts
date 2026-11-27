import type { TripListing } from "@/data/trip-listings";
import { activityLabels, availableSpots, type Activity, type TravellerGroup } from "@/domain/travel";

export const categories = [
  { value: "all", label: "All Trips" },
  { value: "solo", label: "Solo Friendly" },
  { value: "couple", label: "Couples" },
  { value: "family", label: "Families" },
  { value: "hiking", label: "Hiking" },
  { value: "weekend", label: "Weekend Trips" },
  { value: "road", label: "Road Trips" },
] as const;

export const sortOptions = [
  { value: "upcoming", label: "Upcoming first" },
  { value: "newest", label: "Newest listings" },
] as const;

export type Category = (typeof categories)[number]["value"];
type Sort = (typeof sortOptions)[number]["value"];

export interface TripFilters {
  category: Category;
  city: string;
  destination: string;
  group: TravellerGroup | "";
  start: string;
  end: string;
  spots: string;
}

export interface ExploreState {
  query: string;
  sort: Sort;
  filters: TripFilters;
}

export const emptyFilters: TripFilters = {
  category: "all", city: "", destination: "", group: "", start: "", end: "", spots: "",
};

const activitySearchWords: Record<Activity, string> = {
  hiking: "hike hikes trail trails walk",
  trekking: "trek treks hike hiking trail trails",
  "road-trip": "drive driving road trips",
  "weekend-getaway": "weekend trips short breaks",
  camping: "camp camps campsite",
  adventure: "outdoors",
  leisure: "relaxed sightseeing",
  other: "outing",
};

function validNumber(value: string) {
  return /^\d{1,7}$/.test(value) ? String(Number(value)) : "";
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

export function readTripFilters(params: { get: (name: string) => unknown }): TripFilters {
  function read(name: string) {
    const value = params.get(name);
    return typeof value === "string" ? value.trim().slice(0, 120) : "";
  }

  const category = categories.find(({ value }) => value === read("category"))?.value ?? "all";
  const group = read("group");
  const spots = validNumber(read("spots"));
  return {
    category,
    city: read("city"),
    destination: read("destination"),
    group: group === "solo" || group === "couple" || group === "family" ? group : "",
    start: validDate(read("start")),
    end: validDate(read("end")),
    spots: spots === "0" ? "" : spots,
  };
}

export function readExploreState(params: URLSearchParams): ExploreState {
  return {
    query: params.get("q")?.slice(0, 120) ?? "",
    sort: sortOptions.find(({ value }) => value === params.get("sort"))?.value ?? "upcoming",
    filters: readTripFilters(params),
  };
}

export function exploreQuery({ query, sort, filters }: ExploreState) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (sort !== "upcoming") params.set("sort", sort);
  for (const key of Object.keys(emptyFilters) as (keyof TripFilters)[]) {
    if (filters[key] !== emptyFilters[key]) params.set(key, filters[key]);
  }
  return params.toString();
}

function matchesCategory({ trip, suggestedFor }: TripListing, category: Category) {
  switch (category) {
    case "all":
      return true;
    case "hiking":
      return trip.activity === "hiking" || trip.activity === "trekking";
    case "weekend":
      return trip.activity === "weekend-getaway";
    case "road":
      return trip.activity === "road-trip";
    default:
      return suggestedFor.includes(category);
  }
}

export function browseTrips(listings: readonly TripListing[], { query, sort, filters }: ExploreState) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matching = listings.filter((listing) => {
    const { trip } = listing;
    if (!matchesCategory(listing, filters.category)) return false;
    if (filters.city && trip.departureCity !== filters.city) return false;
    if (filters.destination && trip.destination !== filters.destination) return false;
    if (filters.group && !trip.welcomeGroups.includes(filters.group)) return false;
    if (filters.start && trip.startsOn < filters.start) return false;
    if (filters.end && trip.endsOn > filters.end) return false;
    if (filters.spots && availableSpots(trip) < Number(filters.spots)) return false;

    const type = "community trip " + (trip.hostGroupName ?? "");
    const searchable = [
      trip.departureCity, trip.destination, trip.title, trip.activity, activityLabels[trip.activity],
      activitySearchWords[trip.activity], type,
    ].join(" ").toLowerCase();
    return words.every((word) => searchable.includes(word));
  });

  return matching.sort(({ trip: a }, { trip: b }) => {
    if (sort === "newest") {
      const dateDifference = b.postedOn.localeCompare(a.postedOn);
      if (dateDifference) return dateDifference;
    }
    return a.startsOn.localeCompare(b.startsOn) || a.slug.localeCompare(b.slug);
  });
}
