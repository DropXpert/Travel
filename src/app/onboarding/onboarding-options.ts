import {
  Camera, CarFront, Coffee, Footprints, Leaf, Mountain, Palmtree, Sunrise, TentTree, CalendarDays,
} from "lucide-react";

export const interestOptions = [
  { id: "hiking", label: "Hiking & Trekking", icon: Footprints },
  { id: "road-trip", label: "Road Trips", icon: CarFront },
  { id: "camping", label: "Camping", icon: TentTree },
  { id: "weekend-getaway", label: "Weekend Getaways", icon: CalendarDays },
  { id: "beaches", label: "Beaches", icon: Palmtree },
  { id: "mountains", label: "Mountains", icon: Mountain },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "nature", label: "Nature", icon: Leaf },
  { id: "food-culture", label: "Food & Culture", icon: Coffee },
  { id: "relaxed-holidays", label: "Relaxed Holidays", icon: Sunrise },
] as const;

export const travelStyles = [
  "Relaxed Explorer", "Adventure Seeker", "Weekend Wanderer", "Flexible Traveller",
] as const;

export const budgetBands = ["No expected expenses", "Below ₹3,000", "₹3,000–₹7,999", "₹8,000–₹15,000", "Above ₹15,000"] as const;
export const ageBands = ["0–5 years", "6–11 years", "12–17 years", "More than one age range"] as const;
