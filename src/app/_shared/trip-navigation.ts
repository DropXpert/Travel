let openedTripPath: string | undefined;

export function tripHref(slug: string) {
  return "/trips/" + encodeURIComponent(slug);
}

export function rememberTripOpening(slug: string) {
  openedTripPath = tripHref(slug);
}

export function canGoBackFromTrip() {
  return openedTripPath === window.location.pathname && window.history.length > 1;
}
