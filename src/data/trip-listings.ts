import { travellerProfiles, trips } from "@/data/fixtures";
import { formatTripBudget, type TravellerGroup, type TravellerProfile, type Trip } from "@/domain/travel";

export interface TripListing {
  trip: Trip;
  host: TravellerProfile;
  photo: { src: string; alt: string };
  suggestedFor: readonly TravellerGroup[];
  date: string;
  cost: string;
  local?: boolean;
  cancelled?: boolean;
}

export const photos = {
  hero: {
    src: "/travel/gui-campsite.webp",
    alt: "Yellow tents in a meadow beneath misty forest on the Dayara Bugyal trail",
    title: "Campsite at Gui",
    author: "Mike Prince",
    source: "https://commons.wikimedia.org/wiki/File:Campsite_at_Gui_(49011088343).jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  sinhagad: {
    src: "/travel/sinhagad.webp",
    alt: "Warm light across the ridge of Sinhagad fort",
    title: "Sinhagad",
    author: "Amit mitkar",
    source: "https://commons.wikimedia.org/wiki/File:Sinhagad.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  coorg: {
    src: "/travel/coorg.webp",
    alt: "Green plantation rows on the hills in Coorg",
    title: "Greenery of Coorg",
    author: "Sreeram KJ",
    source: "https://commons.wikimedia.org/wiki/File:Greenery_of_coorg.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  vagamon: {
    src: "/travel/vagamon.webp",
    alt: "Rolling grass-covered hills at Vagamon",
    title: "Vagamon Meadow",
    author: "Prasanths",
    source: "https://commons.wikimedia.org/wiki/File:Vagamon_Meadow_1.jpg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  harishchandragad: {
    src: "/travel/harishchandragad.webp",
    alt: "The steep Konkan Kada cliff at Harishchandragad",
    title: "Kokankada",
    author: "Vikram Bhimbar",
    source: "https://commons.wikimedia.org/wiki/File:Kokankada.jpg",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  rishikesh: {
    src: "/travel/rishikesh.webp",
    alt: "The Ganga between the banks of Rishikesh, seen from Ram Jhula",
    title: "The Ganga from Ram Jhula",
    author: "Krishnav25",
    source: "https://commons.wikimedia.org/wiki/File:Ram_jhula_view_of_ganga.jpg",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  udaipur: {
    src: "/travel/udaipur.webp",
    alt: "Udaipur’s City Palace and its reflection in Lake Pichola",
    title: "City Palace by Lake Pichola",
    author: "tommy",
    source: "https://commons.wikimedia.org/wiki/File:City_Palace_by_lake_Pichola%2C_Udaipur.jpg",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  nandiHills: {
    src: "/travel/nandi-hills.webp",
    alt: "Sunrise above the clouds at Nandi Hills, Karnataka",
    title: "Nandi Hills, Bengaluru",
    author: "Sidhant Soni",
    source: "https://commons.wikimedia.org/wiki/File:Nandi_Hills%2C_Bengaluru.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  people: {
    src: "/travel/trekking-together.webp",
    alt: "A group of hikers with trekking poles on a mountain trail in India",
    title: "Group trekking in India",
    author: "Shivendrahans",
    source: "https://commons.wikimedia.org/wiki/File:Group_of_people_trekking_(India%2C_2017).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
} as const;

const presentation = {
  "sinhagad-sunrise-hike": { photo: photos.sinhagad, suggestedFor: ["solo", "couple"] },
  "coorg-coffee-country-road-trip": { photo: photos.coorg, suggestedFor: ["couple", "family"] },
  "vagamon-slow-weekend": { photo: photos.vagamon, suggestedFor: ["solo", "family"] },
  "guided-harishchandragad-trek": { photo: photos.harishchandragad, suggestedFor: ["solo"] },
  "riverside-rishikesh-weekend": { photo: photos.rishikesh, suggestedFor: ["solo", "couple"] },
  "lake-pichola-weekend": { photo: photos.udaipur, suggestedFor: ["couple", "family"] },
  "nandi-hills-morning-hike": { photo: photos.nandiHills, suggestedFor: ["solo", "couple"] },
} satisfies Record<(typeof trips)[number]["slug"], {
  photo: { src: string; alt: string };
  suggestedFor: readonly TravellerGroup[];
}>;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const tripListings: TripListing[] = trips.map((trip) => {
  const host = travellerProfiles.find((profile) => profile.id === trip.hostId);
  if (!host) throw new Error("Missing host for sample trip " + trip.slug);

  const { photo, suggestedFor } = presentation[trip.slug];
  return {
    trip,
    host,
    photo: { src: photo.src, alt: photo.alt },
    suggestedFor,
    date: dateFormat.formatRange(new Date(trip.startsOn), new Date(trip.endsOn)),
    cost: formatTripBudget((trip as Trip).estimatedSharePerPersonInr),
  };
});
