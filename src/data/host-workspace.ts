import type { JoinRequest, JoinRequestStatus } from "@/domain/travel";
import { joinRequests } from "./fixtures";
import { publicTravellerProfiles, type TravellerProfileView } from "./traveller-profiles";
import { tripListings } from "./trip-listings";

export type HostRequestStatus = Exclude<JoinRequestStatus, "withdrawn">;
export type HostRequest = Omit<JoinRequest, "status"> & {
  status: HostRequestStatus;
  traveller: TravellerProfileView;
  introduction: string;
  startingCity?: string;
};

const tripId = "trip-sinhagad";
const additionalRequests = [
  {
    id: "host-demo-nairs",
    tripId,
    requesterId: "traveller-nairs",
    partySize: 6,
    submittedOn: "2027-01-06",
    status: "pending",
    introduction: "Our family enjoys a steady pace and a few water breaks. The chai stop sounds like a good way to finish.",
  },
  {
    id: "host-demo-ananya",
    tripId,
    requesterId: "traveller-ananya",
    partySize: 1,
    submittedOn: "2027-01-04",
    status: "accepted",
    introduction: "I’m visiting Pune and would love an early start on the trail. I’m happy to bring an extra flask of chai.",
    startingCity: "Pune",
  },
] satisfies readonly Omit<HostRequest, "traveller">[];

export function getHostWorkspaceDemo() {
  const listing = tripListings.find(({ trip }) => trip.id === tripId);
  const coupleRequest = joinRequests.find(({ id, tripId: requestedTrip }) => id === "request-sinhagad" && requestedTrip === tripId);
  if (!listing || !coupleRequest) throw new Error("Host workspace example trip or request is missing.");
  const sampleRequests = [{
    ...coupleRequest,
    introduction: "We’ll be in Pune that weekend and would love to join for the ridge views. Is the pace steady on the way up?",
    startingCity: "Pune",
  }, ...additionalRequests];
  const requests: HostRequest[] = sampleRequests.map((request) => {
    const traveller = publicTravellerProfiles.find(({ id }) => id === request.requesterId);
    if (!traveller) throw new Error("Host workspace example traveller is missing.");
    return { ...request, traveller };
  });
  return { listing, requests };
}
