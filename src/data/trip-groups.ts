import type { travellerProfiles, trips } from "./fixtures";
import { publicTravellerProfiles, type TravellerProfileView } from "./traveller-profiles";
import type { TripListing } from "./trip-listings";

type TravellerId = (typeof travellerProfiles)[number]["id"];
type Message = { id: string; from: TravellerId; time: string; text: string };
type GroupFixture = {
  slug: (typeof trips)[number]["slug"];
  meeting: { area: string; time?: string; instructions?: string };
  messages: readonly Message[];
  announcements: readonly { title: string; text: string }[];
};

const fixtures: readonly GroupFixture[] = [{
  slug: "sinhagad-sunrise-hike",
  meeting: {
    area: "Public pickup area in Pune",
    instructions: "In this example, the host would agree on a public pickup point and time with the group before departure.",
  },
  announcements: [
    { title: "Pack for an early start", text: "Bring water, shoes with grip, and a light layer for the ridge." },
    { title: "Agree on the ride together", text: "Check who needs a lift and agree on the pickup points before setting out." },
  ],
  messages: [
    { id: "welcome", from: "traveller-meera", time: "18:10", text: "Hey everyone! The idea is an early start and a steady walk up to the ridge. We can work out the pickup plan together." },
    { id: "chai", from: "traveller-ananya", time: "18:14", text: "Sounds good. I can bring a flask of chai for a break on the way back." },
    { id: "breaks", from: "traveller-nairs", time: "18:19", text: "We’re up for that. Could we leave room for a couple of water breaks on the climb?" },
    { id: "reply", from: "traveller-meera", time: "18:22", text: "Of course. Let’s go at a pace that works for the whole group." },
  ],
}];

export const tripGroupSlugs = fixtures.map(({ slug }) => slug);

export type TripGroupDemo = {
  listing: TripListing;
  members: readonly { traveller: TravellerProfileView; partySize: number; host: boolean }[];
  meeting: GroupFixture["meeting"];
  announcements: GroupFixture["announcements"];
  messages: readonly (Omit<Message, "from"> & { traveller: TravellerProfileView; host: boolean })[];
};

export function getGroupContent(slug: string, hostId: string): Pick<TripGroupDemo, "meeting" | "announcements" | "messages"> {
  const fixture = fixtures.find((group) => group.slug === slug);
  return {
    meeting: fixture?.meeting ?? { area: "Meeting point to be agreed with the host" },
    announcements: fixture?.announcements ?? [],
    messages: fixture?.messages.map(({ from, ...message }) => ({
      ...message, traveller: publicTravellerProfiles.find(({ id }) => id === from)!, host: from === hostId,
    })) ?? [],
  };
}
