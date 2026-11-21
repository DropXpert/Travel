import type { JoinRequest, JoinRequestStatus } from "@/domain/travel";
import { joinRequests } from "./fixtures";
import { type TravellerProfileView } from "./traveller-profiles";

export type HostRequestStatus = JoinRequestStatus;
export type HostRequest = Omit<JoinRequest, "status"> & {
  status: HostRequestStatus;
  traveller: TravellerProfileView;
  introduction?: string;
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

export const demoRequestSeeds = [
  ...joinRequests.map((request) => request.id === "request-sinhagad" ? {
    ...request,
    introduction: "We'll be in Pune that weekend and would love to join for the ridge views. Is the pace steady on the way up?",
    startingCity: "Pune",
  } : request),
  ...additionalRequests,
] satisfies readonly Omit<HostRequest, "traveller">[];
