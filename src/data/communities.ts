import type { TravellerGroup, TravellerInterest } from "@/domain/travel";
import type { trips } from "./fixtures";
import type { photos } from "./trip-listings";

export const communityCategories = {
  hiking: "Hiking & Trekking",
  weekend: "Weekend Explorers",
  solo: "Solo Travellers",
  couple: "Couples",
  family: "Families",
  road: "Road Trips",
  camping: "Camping & Outdoors",
} as const;

export type CommunityCategory = keyof typeof communityCategories;
type TripSlug = (typeof trips)[number]["slug"];

export interface Community {
  id: string;
  name: string;
  city: string;
  category: CommunityCategory;
  photo: keyof typeof photos;
  description: string;
  about: string;
  groups: readonly TravellerGroup[];
  activities: readonly TravellerInterest[];
  participation: "public" | "private";
  expectations: string;
  tripSlugs: readonly TripSlug[];
}

export const communities: readonly Community[] = [
  {
    id: "pune-sunrise-hikers",
    name: "Pune Sunrise Hikers",
    city: "Pune",
    category: "hiking",
    photo: "people",
    description: "Early alarms, Sahyadri trails and chai after the climb. Come for the sunrise and stay for the company.",
    about: "We like quiet starts and unhurried chats on the trail. Come along for a Sahyadri ridge walk that suits your pace, then stick around for chai and the story of how everyone found their way into hiking.",
    groups: ["solo", "couple"],
    activities: ["hiking", "trekking"],
    participation: "public",
    expectations: "Choose a trail that suits your pace, bring water and shoes with grip, and stay with the group on the way down.",
    tripSlugs: ["sinhagad-sunrise-hike"],
  },
  {
    id: "bangalore-weekend-crew",
    name: "Bangalore Weekend Crew",
    city: "Bengaluru",
    category: "weekend",
    photo: "nandiHills",
    description: "Make more of a free weekend with hill walks, coffee stops and a little room for detours.",
    about: "A hill walk or a coffee-country weekend is reason enough to get out of Bengaluru. We like a loose plan with time for good coffee, a view or a detour the whole group feels like taking.",
    groups: ["solo", "couple", "family"],
    activities: ["weekend-getaway", "hiking"],
    participation: "public",
    expectations: "Share how much time you have and what pace works for your party. Check the route and shared costs before setting off.",
    tripSlugs: ["nandi-hills-morning-hike", "coorg-coffee-country-road-trip"],
  },
  {
    id: "delhi-mountain-escape",
    name: "Delhi Mountain Escape Club",
    city: "Delhi",
    category: "camping",
    photo: "hero",
    description: "Swap the city buzz for riverside mornings, campsite cooking and a night under the hill skies.",
    about: "We head out from Delhi for time by the river and honest evenings around a camp stove. Campers and trekkers can compare kit and agree on a route before heading into the hills together.",
    groups: ["solo", "couple"],
    activities: ["camping", "trekking"],
    participation: "private",
    expectations: "Check the gear list and agree on transport before a plan. Camp at permitted spots and pack out everything you bring.",
    tripSlugs: ["riverside-rishikesh-weekend"],
  },
  {
    id: "mumbai-road-trip-circle",
    name: "Mumbai Road Trip Circle",
    city: "Mumbai",
    category: "road",
    photo: "coorg",
    description: "Scenic drives with time for roadside breakfasts, shared playlists and one more photo stop.",
    about: "We enjoy the drive as much as getting there. Pick a scenic route together, agree on seats and shared costs, and leave enough time for breakfast and the photo stops along the way.",
    groups: ["solo", "couple", "family"],
    activities: ["road-trip", "photography"],
    participation: "public",
    expectations: "Agree on drivers, legal seating and how fuel and tolls will be split. Bring a suitable child restraint if travelling as a family.",
    tripSlugs: [],
  },
  {
    id: "chandigarh-adventure-families",
    name: "Chandigarh Adventure Families",
    city: "Chandigarh",
    category: "family",
    photo: "vagamon",
    description: "Gentle trails, picnic breaks and enough time to stop for every interesting leaf along the way.",
    about: "Our nature walks and easy hikes leave room for short legs, picnic breaks and questions about every interesting leaf. Parents and guardians plan together around a pace the whole family can enjoy.",
    groups: ["family"],
    activities: ["nature", "hiking"],
    participation: "private",
    expectations: "A parent or guardian requests to join, attends and stays responsible for their children. Share pace and practical needs without posting children’s personal details.",
    tripSlugs: [],
  },
  {
    id: "jaipur-couples-explore",
    name: "Jaipur Couples Explore",
    city: "Jaipur",
    category: "couple",
    photo: "udaipur",
    description: "Easy weekends for two, with heritage stops, lake views and long lunches with other travelling pairs.",
    about: "We like heritage stops, walks with a camera and lunches that can run a little long. It’s a relaxed way to spend a weekend with other couples who enjoy exploring at a similar pace.",
    groups: ["couple"],
    activities: ["weekend-getaway", "photography"],
    participation: "private",
    expectations: "Share the kind of weekend you both enjoy. Agree on the schedule and split costs with the group before committing.",
    tripSlugs: [],
  },
  {
    id: "hyderabad-trail-friends",
    name: "Hyderabad Trail Friends",
    city: "Hyderabad",
    category: "solo",
    photo: "harishchandragad",
    description: "A low-pressure way to meet other solo travellers over a short trail and breakfast afterwards.",
    about: "Come on your own for a short hike or a nature walk, then stay for breakfast if you like. First-timers can pick a manageable trail and take the time they need along the way.",
    groups: ["solo"],
    activities: ["hiking", "nature"],
    participation: "public",
    expectations: "First-timers are welcome. Pick a route that feels manageable and let the group know if you need a slower pace.",
    tripSlugs: [],
  },
];

export const participationLabels: Record<Community["participation"], string> = {
  public: "Public group",
  private: "Private group",
};

export function communityHref(slug: string) {
  return "/community/" + encodeURIComponent(slug);
}
