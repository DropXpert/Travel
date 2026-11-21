# SideTrail connected demo

Start in **Create a Trip**, enter a fictional plan, and select **Preview listing** → **Publish trip (demo)**. Use **Demo account** to switch from the host to a traveller. Find the trip in **Explore**, open its details, and send a free demo request. Switch back to the host and open **My Trips → Hosting → Manage requests**. Once accepted, the traveller can open **Trip Group Space** from the trip or **My Trips → Join Requests**.

## What changed

- Publishing copies the validated draft into a local listing and assigns a stable UUID-based URL. Explore includes active local listings and filters them alongside the fixtures. Trip Details and Saved Trips resolve the same listing, including on refresh. Hosting lists the selected traveller’s trips, with editing and cancellation for locally published listings.
- Requests are tied to the selected fictional traveller. Party size follows the traveller category. Each traveller gets one request per trip, with Pending, Accepted, Declined and Cancelled states. The host cannot request their own trip. A traveller can cancel a pending or accepted request.
- The Host Workspace identifies the trip by ID and checks the current host role, eligibility and remaining capacity when saving a decision. Existing fixture occupancy is adjusted for seeded acceptances so each accepted party counts once. Cancelling an accepted request frees its places. Editing keeps the trip URL and protects already accepted parties. Cancelling a trip removes it from Explore, closes the group and cancels active requests.
- Trip Group Space is available to the demo host and accepted travellers. Its roster tracks accepted requests. The itinerary, announcements and checklist use the existing design, and the sample chat is read-only. Fixture places occupied before requests are counted are shown separately from the roster.
- The switcher offers Meera Kulkarni, Kavya & Dev and the Nair family. It uses fictional profiles and stores the selected account in the same browser. Registration, listing, discovering, joining, community participation and group coordination stay free. Optional INR budgets remain shared expense estimates.

## Persistence and data protection

The app stores versioned demo data under `sidetrail-travel-demo-v1`. It validates listings, requests and their relationships before loading them. Mutations take a browser lock and revalidate the latest snapshot, then notify the current tab and other tabs on the same origin. The interactive demo requires HTTPS or localhost with Web Locks support. [Web Locks specification](https://w3c.github.io/web-locks/)

Publishing, editing and resetting leave the draft, its migration backup and saved-trip keys intact. Edit mode starts from the listing’s own snapshot. Corrupt or unsupported demo records stay in place until **Reset Demo Data** is confirmed. Reset restores the fixture state and defaults to Meera. A local listing URL opened in a different browser or after reset shows an unavailable state. The selected account is shared across tabs, and role checks are part of the browser demo.

## Verification

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `node scripts/check-community-model.cjs` | Passed draft migration, storage failure, budget, bookmark and filtering checks |
| `node scripts/check-community-browser.cjs` | Passed the complete connected flow and existing browser regressions against the production build |
| Responsive layouts | 114 route and viewport checks at 320, 375, 390, 768, 1024 and 1440px, with no page overflow |
| Browser errors | Zero console or runtime errors in the passing run |

The browser run covered publishing, searching, refreshing, self-join prevention, eligibility, duplicate prevention, request acceptance and decline, editing with accepted guests, group access, two-tab capacity and cancellation updates, trip cancellation, damaged data and reset confirmation. It also verified that the original draft, migration backup and bookmarks survived the flow. Responsive testing used Chromium viewport emulation.

## Implementation map

| Area | Files |
| --- | --- |
| Local state and shared UI | `src/app/_shared/demo-travel.ts`, `demo-id.ts`, `local-storage.ts`, `demo-account.tsx`, `site-shell.tsx`, `site.module.css`, `trip-draft.ts`, `saved-trips.ts`, `trip-card.tsx` |
| Domain and fixtures | `src/domain/travel.ts`, `src/data/trip-listings.ts`, `host-workspace.ts`, `trip-groups.ts` |
| Publishing and editing | `src/app/trips/new/page.tsx`, `trip-editor.tsx`, `create.module.css` |
| Explore | `src/app/explore/page.tsx`, `explore-trips.tsx`, `browse-trips.ts`, `trip-filters.tsx` |
| Details and requests | `src/app/trips/[slug]/page.tsx`, `trip-details.tsx`, `trip.module.css`, `join-request.tsx` |
| Dashboard and host decisions | `src/app/dashboard/page.tsx`, `dashboard.tsx`, `dashboard.module.css`, `demo-activity.tsx`, `requests/page.tsx`, `requests/host-workspace.tsx` |
| Group | `src/app/trips/[slug]/group/page.tsx`, `trip-group-space.tsx` |
| Regression tests | `scripts/check-community-model.cjs`, `scripts/check-community-browser.cjs` |
| Documentation | `docs/DESIGN_BLUEPRINT.md`, `docs/CONNECTED_DEMO_REPORT.md` |
