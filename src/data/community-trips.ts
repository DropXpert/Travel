import type { Community } from "./communities";
import { tripListings } from "./trip-listings";

const indiaDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
});

export function upcomingCommunityTrips(tripSlugs: Community["tripSlugs"]) {
  const today = indiaDate.format(new Date());
  return tripListings.filter(({ trip }) => trip.startsOn >= today && tripSlugs.some((slug) => slug === trip.slug))
    .sort(({ trip: a }, { trip: b }) => a.startsOn.localeCompare(b.startsOn));
}
