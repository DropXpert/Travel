# Share Yarana frontend audit

Share Yarana is a free social travel demo. The audit followed one person switching between fictional accounts on one browser, including two tabs sharing the same demo state. It covered the production build, the design blueprint, the connected demo report, the route and component code, and the regression scripts.

## Confirmed issues and fixes

| Severity | What the audit found | What changed |
| --- | --- | --- |
| High | Confirming **Discard draft** in a stale Create tab deleted a newer draft saved in another tab. The baseline reproduction returned an empty draft key after confirmation. | Create now checks the version shown when the discard dialog opened. If it changed, the dialog stays open and explains how to review the newer draft. It reuses the Dashboard check. |
| High | Valid long destination, starting city and itinerary strings widened a published Trip Details page beyond 6,000 CSS pixels in a 375px viewport. | The hero grid shrinks to the available width and shared text can break long words. The mobile action bar can wrap its contents. The same long-input example reflows on mobile and desktop. |
| Medium | Tabbing on a short mobile viewport put focused controls under the fixed navigation or Create action bar. The probe reproduced this in Explore, Profile, Create and Verification. | Document scroll padding now accounts for the active bottom bar and the safe area. The keyboard probe found no controls covered by those bars after the fix. [W3C guidance on visible keyboard focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) |
| Medium | At 200% root text size, 15 of 19 representative screen variants overflowed, mostly at the shared header. Explore’s sort control could still overflow once the header wrapped. | The header and Explore controls can wrap. All 19 variants passed the 375px root-text-size reflow probe after the fixes. [W3C guidance on text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) |
| Medium | A locally published trip linked to its host’s public profile, but that profile’s hosted-trip section only used the sample fixtures. | Public profiles include that host’s upcoming local trips and exclude cancelled ones. The editable sample profile explains its separate role. |
| Medium | The mobile sticky action disappeared for an ineligible traveller or a party too large for the remaining places. The reason only appeared in the desktop panel. | Both layouts now explain why the current party cannot request to join. The host sees **Manage this trip** in the desktop panel. |
| Medium | Local trip sharing offered ordinary share or copy feedback for a URL that another browser could not resolve. | Local trips open a copyable link with an explanation that it resolves in the current browser. Fixture links retain the normal sharing flow. |
| Medium | Reset confirmation replaced the focused button and lost the user’s place inside the dialog. | Focus moves to **Keep demo data** when confirming and returns to **Reset Demo Data** when backing out or completing the reset. |
| Medium | A profile validation error became part of the field’s accessible name and was also associated as its description. | Profile name and city fields keep stable labels. Error text is announced through the field description. |
| Low | Explore counted user-published trips as sample trips. Missing local edit and group URLs suggested switching accounts. The root 404 lacked a recovery link. | Explore counts trips neutrally. Local routes distinguish missing data from the wrong account. The group fallback directs users to My Trips and the Share Yarana 404 links back to Explore. |

## Screens and design checks

Reviewed the homepage, Explore, trip details for fixtures and local listings, create and edit, editable and public profiles, community discovery and details, My Trips drafts/hosting/requests, Host Workspace, Trip Group Space, login, sign-up, onboarding and verification/safety. The browser regression also exercised saved trips and expanded group membership. Reviewed 38 production screenshots per audit pass at 375px and 1440px, plus filter and profile sheets in a short viewport. The long-input sample used a 120-character title, 78-character locations and 600-character description.

The screenshot pass checked heading hierarchy, fonts, imagery and crops, spacing, form and button styling, empty states, tabs, sheet layouts and bottom actions. No broken loaded images were found in the sampled routes. The 375px probe found no visible buttons, selects or disclosure controls smaller than 44px in the sampled initial screens. The standard text colour pairs measured 14.74:1 for charcoal on canvas, 6.11:1 for muted text on canvas, 6.19:1 for white on dark teal and 6.00:1 for charcoal on coral. Control borders against canvas measured 3.62:1.

Keyboard checks covered tabbing at 375 × 545, Escape and focus return for the filter and profile sheets, and the reset confirmation controls. The screenshot pass used the browser’s reduced-motion preference. The accessibility checks used visible focus, labelled controls and accessible role/name queries in the browser.

## Test results

| Check | Result |
| --- | --- |
| ESLint, TypeScript and production build | Passed |
| `node scripts/check-community-model.cjs` | Passed |
| Chromium browser regression | 120 responsive checks passed, with the connected journey and console guard passing |
| Firefox browser regression | 120 responsive checks passed, with the connected journey and console guard passing |
| WebKit browser regression | 120 responsive checks and journey assertions passed. The rapid navigation sweep triggered console diagnostics. The targeted rerun passed the connected flow and all 24 connected layout checks with a clean console. |
| Separate 375 × 545 Chromium smoke test | Sign-up validation and OTP preview, onboarding, verification method preview, community request preview, and profile form validation and persistence passed |

The responsive matrix ran at 320, 375, 390, 768, 1024 and 1440px. The browser suite exercised publish → account switch → discover → request → accept → group, plus editing, decline, cancellation, overbooking prevention, browser Back and Forward, refresh, and cross-tab sync. It validated five missing URLs and a local group URL after reset. The legacy draft and bookmark regressions ran in the same isolated browser context.

WebKit’s diagnostics were limited to Next.js prefetch requests during rapid document replacement. The runner now lets the outgoing page settle in WebKit before hard navigation and refresh. The console guard remains enabled. [Playwright’s WebKit investigation](https://github.com/microsoft/playwright/issues/43120)

The browser runner accepts `SIDETRAIL_BROWSER=chromium`, `firefox` or `webkit`. Playwright’s browser install pruned two older Chromium binaries during setup. Both binaries were restored. Browser tooling was kept in the existing cache.

## Data and demo boundaries

The fixture audit checked host IDs, posting and trip date order, and initial occupancy. The journey compared Host Workspace counts to accepted parties and the group roster. Seeded accepted parties counted once. The tests also exercised insufficient capacity, duplicate requests, accepted-place release and visibility of cancelled listings.

Drafts, the legacy draft backup and bookmarks remain separate from versioned demo data. The browser suite exercised corrupt demo data, reset confirmation, preservation of those keys, and the HTTPS or localhost message when browser locking is unavailable. Web Locks still serialize trip and request writes. The free model and optional shared budgets remain intact. Verification stays a concept preview.

## Remaining limitations

- Windows Playwright supplied Chromium, Firefox and WebKit. Apple Safari on macOS or iOS and physical phones were unavailable. Playwright’s WebKit build differs from branded Safari. [Playwright browser documentation](https://playwright.dev/docs/browsers#webkit)
- Text enlargement was exercised with a 200% root font size at 375 CSS pixels. Safe-area behaviour, the software keyboard and assistive technology announcements still need checks on actual devices. The audit sampled colour pairs and control sizes, with no claim of full WCAG conformance.
- Local listings and requests are tied to the browser origin. Testers who open a local listing in a different browser will see the unavailable state.

## Files changed

| Area | Files |
| --- | --- |
| Shared layout and demo account | `src/app/_shared/site.module.css`, `src/app/_shared/demo-account.tsx` |
| Trips and drafts | `src/app/trips/new/trip-editor.tsx`, `src/app/trips/[slug]/trip-details.tsx`, `src/app/trips/[slug]/trip-toolbar.tsx`, `src/app/trips/[slug]/trip.module.css`, `src/app/trips/[slug]/group/trip-group-space.tsx` |
| Discovery and profiles | `src/app/explore/explore-trips.tsx`, `src/app/explore/explore.module.css`, `src/app/_profile/profile-view.tsx`, `src/app/_profile/profile-editor.tsx` |
| Recovery pages | `src/app/not-found.tsx`, `src/app/trips/[slug]/group/not-found.tsx` |
| Verification and report | `scripts/check-community-browser.cjs`, `scripts/check-community-model.cjs`, `docs/FRONTEND_AUDIT_REPORT.md` |

## Recommendations for real-user demo testing

- Ask a solo traveller, a couple and a family to complete the publish-to-group journey without coaching. Observe whether they find the account switcher and understand the host’s role, party size and request statuses.
- Repeat the create, filter and join flows on an iPhone with Safari and an Android phone with the keyboard open. Check long input, bottom controls, safe-area spacing and larger system text.
- Ask a VoiceOver or TalkBack user to complete a request and the host decision. Listen for focus, field labels, validation and status announcements. Use fictional details during the sessions.
- Open the demo over HTTPS. Give users a clear test objective, then check whether they can explain what a shared budget covers and where listings and requests are stored.
