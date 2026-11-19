import type { TravellerGroup } from "@/domain/travel";

export type AuthMode = "login" | "signup";

const entryPath = "/sign-in";

export function authHref(mode: AuthMode, returnTo = "/") {
  const query = new URLSearchParams();
  if (mode === "signup") query.set("mode", mode);
  if (returnTo !== "/") query.set("returnTo", returnTo);
  return query.size ? entryPath + "?" + query : entryPath;
}

export function onboardingHref(returnTo: string, traveller?: TravellerGroup) {
  const query = new URLSearchParams();
  if (returnTo !== "/") query.set("returnTo", returnTo);
  if (traveller) query.set("traveller", traveller);
  return query.size ? "/onboarding?" + query : "/onboarding";
}

export function safeAuthReturn(value: string | string[] | undefined) {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  const origin = "https://sidetrail.invalid";
  try {
    const url = new URL(value, origin);
    const path = url.pathname.replace(/\/$/, "") || "/";
    const isPublicPage = ["/", "/explore", "/community", "/dashboard", "/dashboard/requests", "/profile", "/verification"].includes(path);
    const isDetailPage = /^\/(trips|travellers|community)\/[a-z0-9-]+$/.test(path);
    const isGroupPage = /^\/trips\/[a-z0-9-]+\/group$/.test(path);
    return url.origin === origin && (isPublicPage || isDetailPage || isGroupPage) ? path + url.search + url.hash : "/";
  } catch {
    return "/";
  }
}

