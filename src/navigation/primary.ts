import { Compass, Luggage, SquarePlus, UserRound, UsersRound } from "lucide-react";

export const primaryNavigation = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/community", label: "Community", icon: UsersRound },
  { href: "/trips/new", label: "Create", icon: SquarePlus },
  { href: "/dashboard", label: "My trips", icon: Luggage },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;
