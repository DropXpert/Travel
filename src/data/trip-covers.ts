import { photos } from "./trip-listings";

export const draftCovers = [
  { ...photos.hero, label: "Dayara Bugyal" },
  { ...photos.sinhagad, label: "Sinhagad" },
  { ...photos.coorg, label: "Coorg" },
  { ...photos.vagamon, label: "Vagamon" },
  { ...photos.nandiHills, label: "Nandi Hills" },
  { ...photos.harishchandragad, label: "Harishchandragad" },
  { ...photos.rishikesh, label: "Rishikesh" },
  { ...photos.udaipur, label: "Udaipur" },
] as const;

export type DraftCover = (typeof draftCovers)[number];
