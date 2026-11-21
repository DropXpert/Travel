# Free community model — change report

## Product changes

SideTrail now uses one community-trip model. Registration, hosting, discovery, join requests and community participation are free. Shared travel expenses are optional estimates. Blank budgets mean “Budget not specified”; zero means “No expected expenses”. SideTrail does not collect payments.

Removed the personal/commercial discriminator, organiser name and selling-price fields, conditional pricing helper, commercial badges and search terms, trip-type selector, required-budget validation, and unused selector styles. The existing app had no checkout or payment integration to remove. Safety guidance about suspicious payment requests remains intact.

The Harishchandragad sample is now a peer-planned trek with estimated shared expenses. The Udaipur sample is a local lakeside meetup with no expected shared expenses. Rishikesh demonstrates an unspecified budget. Existing trip IDs and URLs are unchanged, including the older Harishchandragad slug, so bookmarks and links continue to work.

The create form keeps the existing planning fields, itinerary, cover picker, draft actions and preview. Optional expense details are collapsed by default. Shared cards and details label estimates consistently. Free participation messaging appears at relevant entry points without promotional badges. Verification, safety, navigation and the existing visual identity are preserved.

## Local data migration

- The active draft key remains `sidetrail-trip-draft-v1`. Reading a legacy draft projects compatible fields into the current model without writing or deleting storage.
- Titles, locations, valid dates, descriptions, traveller groups, capacity, available spots, preferences, category, itinerary, cover selection and expense notes survive. Previous budget values become editable estimates. A notice asks the traveller to review those amounts.
- The next explicit save stores the untouched original under `sidetrail-trip-draft-v1-original` before writing the updated draft with `schemaVersion: 2`. The backup is retained and never overwritten. Unknown legacy fields remain recoverable in that backup.
- If backup or saving fails, the save returns failure and the working draft remains available. Malformed original data is backed up before replacement. Existing explicit-discard conflict checks remain in place.
- Bookmark storage remains `sidetrail-saved-trip-ids-v1`. Migration never changes it. All original trip IDs still resolve.
- Browser tests use isolated fictional storage. They do not access or alter the user's actual browser drafts or bookmarks.

## Verification

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed, all 31 generated pages completed |
| `node scripts/check-community-model.cjs` | Passed |
| Chromium responsive checks | 16 routes at 320, 375, 390, 768, 1024 and 1440px; all HTTP 200; no page-level horizontal overflow |
| Browser interactions | Legacy draft restoration, field preservation, original backup, save/reload, blank/zero/positive budget previews, negative-budget validation, saved trips and existing links, zero-budget filter, trip preview/detail navigation, family join preview and host acceptance passed |
| Console/runtime errors | None in successful browser flow run |
| Frontend terminology scan | No commercial options, organiser pricing, selling-price fields, Book Now, Buy Ticket, Checkout or Pay Now remain in `src` |

Responsive routes: homepage, Explore, Create, converted trek details, zero-budget details, unspecified-budget details, own profile, public traveller profile, Communities, community details, My Trips, Host Workspace, Trip Group Space, onboarding, signup and verification. Mobile and desktop screenshots were also visually reviewed.

The browser runner is `scripts/check-community-browser.cjs`. It uses Playwright from the existing local tooling installation, supplied through `NODE_PATH`, and the existing Chromium executable through `CHROMIUM_EXECUTABLE`. It targets `http://127.0.0.1:3100` by default, configurable through `SIDETRAIL_TEST_URL`. Screenshots and its JSON results go to the OS temporary directory under `sidetrail-community-check`. No project dependencies were added. Tests cover Chromium desktop viewport emulation; physical-device and Safari/Firefox testing were not performed.

## Files modified

| File | Change |
| --- | --- |
| `docs/DESIGN_BLUEPRINT.md` | Free product model, actual architecture, budget UX and migration rules |
| `src/domain/travel.ts` | Single community-trip type, optional budget and shared budget formatting/copy |
| `src/data/fixtures.ts` | Converted trek and zero/unspecified-budget examples |
| `src/data/trip-listings.ts` | Derive budget labels from the shared formatter |
| `src/app/_shared/trip-card.tsx` | Community host labels and optional budget display in cards/previews |
| `src/app/_shared/trip-draft.ts` | Optional budget validation and safe legacy migration/backup |
| `src/app/page.tsx` | Free community platform messaging |
| `src/app/explore/browse-trips.ts` | Remove commercial search logic; filter/sort optional budgets |
| `src/app/explore/trip-filters.tsx` | Estimated-budget wording and zero/unspecified guidance |
| `src/app/trips/new/trip-editor.tsx` | Remove trip-type choices, optional budget, expense disclosure and migration notice |
| `src/app/trips/new/draft-preview.tsx` | Community listing and shared-expense preview |
| `src/app/trips/new/create.module.css` | Remove obsolete selector CSS; style expense disclosure |
| `src/app/trips/[slug]/page.tsx` | Community host, optional estimates and free join messaging |
| `src/app/trips/[slug]/join-request.tsx` | Free request preview messaging |
| `src/app/trips/[slug]/trip.module.css` | Rename obsolete price selector to budget selector |
| `src/app/dashboard/draft-plan.tsx` | Migrated draft notice and optional shared-budget summary |
| `src/app/dashboard/requests/host-workspace.tsx` | Community trip label |
| `src/app/community/community-discovery.tsx` | Free community participation copy |
| `src/app/community/[slug]/page.tsx` | Free participation and host wording |
| `src/app/sign-in/auth-entry.tsx` | Free registration copy |
| `src/app/onboarding/onboarding-options.ts` | No-expected-expenses preference |
| `src/app/onboarding/traveller-onboarding.tsx` | Estimated travel-budget wording |

## Files added

- `scripts/check-community-model.cjs` — model, migration, storage-failure and filtering regression checks.
- `scripts/check-community-browser.cjs` — viewport and interaction regression checks.
- `docs/COMMUNITY_MODEL_CHANGELOG.md` — this report.

Traveller profiles, community-related trip lists, the dashboard's saved list and Trip Group Space continue to consume the existing shared trip source. Their surrounding layouts and demo behavior required no separate redesign. The app remains a frontend demo; no backend, database, real authentication, publishing, request submission, payment or identity integration was introduced. Changes are local and have not been pushed or deployed.
