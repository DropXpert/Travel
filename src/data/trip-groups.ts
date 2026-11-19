import type { travellerProfiles, trips } from "./fixtures";
import { publicTravellerProfiles, type TravellerProfileView } from "./traveller-profiles";
import { tripListings } from "./trip-listings";

type TravellerId = (typeof travellerProfiles)[number]["id"];
type Message = { id: string; from: TravellerId; time: string; text: string };
type GroupFixture = {
  slug: (typeof trips)[number]["slug"];
  guests: readonly { id: TravellerId; partySize: number }[];
  meeting: { area: string; time?: string; instructions?: string };
  messages: readonly Message[];
  announcements: readonly { title: string; text: string }[];
};

const fixtures: readonly GroupFixture[] = [{
  slug: "sinhagad-sunrise-hike",
  guests: [
    { id: "traveller-ananya", partySize: 1 },
    { id: "traveller-kavya-dev", partySize: 2 },
    { id: "traveller-nairs", partySize: 3 },
  ],
  meeting: {
    area: "Public pickup area in Pune",
    instructions: "In this example, the host would agree on a public pickup point and time with the group before departure.",
  },
  announcements: [
    { title: "Pack for an early start", text: "Bring water, shoes with grip, and a light layer for the ridge." },
    { title: "Agree on the ride together", text: "Check who needs a lift and agree on how to share the cost before setting out." },
  ],
  messages: [
    { id: "welcome", from: "traveller-meera", time: "18:10", text: "Hey everyone! The idea is an early start and a steady walk up to the ridge. We can work out the pickup plan together." },
    { id: "chai", from: "traveller-ananya", time: "18:14", text: "Sounds good. I can bring a flask of chai for a break on the way back." },
    { id: "breaks", from: "traveller-nairs", time: "18:19", text: "We’re up for that. Could we leave room for a couple of water breaks on the climb?" },
    { id: "reply", from: "traveller-meera", time: "18:22", text: "Of course. Let’s go at a pace that works for the whole group." },
  ],
}];

export const tripGroupSlugs = fixtures.map(({ slug }) => slug);

export function getTripGroupDemo(slug: string) {
  const fixture = fixtures.find((group) => group.slug === slug);
  if (!fixture) return undefined;
  const listing = tripListings.find(({ trip }) => trip.slug === slug);
  if (!listing) throw new Error("Group demo trip fixture is missing.");
  function profile(id: string): TravellerProfileView {
    const traveller = publicTravellerProfiles.find((item) => item.id === id);
    if (!traveller) throw new Error("Group demo traveller fixture is missing.");
    return traveller;
  }
  return {
    listing,
    members: [
      { traveller: profile(listing.host.id), partySize: 1, host: true },
      ...fixture.guests.map(({ id, partySize }) => ({ traveller: profile(id), partySize, host: false })),
    ],
    meeting: fixture.meeting,
    announcements: fixture.announcements,
    messages: fixture.messages.map(({ from, ...message }) => ({ ...message, traveller: profile(from), host: from === listing.host.id })),
  };
}

export type TripGroupDemo = NonNullable<ReturnType<typeof getTripGroupDemo>>;
