# Share Yarana frontend polish

Updated 23 November 2026. Local testing version; no commit, push or deployment was performed.

## Scope

Polished the existing screens and preserved the homepage work already in the workspace. The logo, photos, teal/coral colours, Nunito ExtraBold headings, existing body font and component architecture remain in place. No state model, storage key, trip ID, page route, backend or payment integration changed.

## Typography and spacing

- Shared page titles: 28px on phones and 40px from 768px. The homepage hero scales up to 44px on desktop.
- Section headings: generally 22-24px. Trip and community card titles: 18px. Body: 15px; supporting labels: 12-13px.
- Form controls stay at least 16px, including search, sorting, account switching and fields inside dialogs.
- Loosened overly tight headline letter spacing and retained natural wrapping for long names.
- Reduced large section gaps and padding, using a 24px/28px section-spacing token where appropriate. Shared action targets remain at least 44px.
- Shared trip photos use a 3:2 crop. Cards have 16px corners and quiet borders instead of resting and hover shadows. Dialog padding and headings are more compact.
- Homepage filter pills wrap when text is enlarged, preventing page overflow at 200% root font size.
- Added the conventional favicon fallback as an ICO container containing the existing 64px brand PNG without altering its artwork. This fixes a browser-requested missing asset; metadata still uses the original PNG.

## Copy

Shortened labels to **Switch Traveller**, **Publish Trip**, **Send request**, **Request saved**, **Save changes**, **Edit trip**, **Cancel trip**, **Reset profile** and **View group**. Removed repeated decorative demo wording from page headings, list summaries, onboarding and group space. Listing and profile previews retain their useful preview labels.

The traveller switcher still explains fictional profiles and browser-local data. Publishing asks for fictional details and states where the listing is stored. Requests disclose their browser-local scope before submission and in the confirmation. Reset Demo Data retains its confirmation and draft/bookmark protection. Sign-in still creates no account or OTP; identity checks remain unavailable, reporting remains a preview and messages remain sample content.

## Verification

| Check | Result |
| --- | --- |
| ESLint (`npm run lint`) | Passed |
| TypeScript (`npm run typecheck`) | Passed |
| Production build (`npm run build`) | Passed, 31 generated pages |
| Community model regression | Passed: optional budgets, filtering, migration, backups, conflicts and bookmark preservation |
| Chromium regression | Passed: 120 responsive route checks plus connected flows; zero console/runtime errors |
| Firefox regression | Passed: 120 responsive route checks plus connected flows; zero console/runtime errors |
| WebKit regression | All 120 layout checks and journey assertions passed; the full sweep failed the console guard on prefetch/access-control diagnostics. A focused rerun passed the complete journey and 24 connected layout checks with zero console/runtime errors |
| Text enlargement | Passed: 200% root font size on 15 routes at 375px, without page-level horizontal overflow |
| Dialog checks | Traveller, filter and profile dialogs fit all six widths; visible inputs are at least 16px, Tab stays inside and Escape works; switcher focus returns to its trigger |
| Profile checks | Long unbroken names wrap; saved edits persist; profile reset works; focused input remains reachable in a 320 x 420 viewport |
| Short-viewport sign-up/onboarding | Validation, sample OTP screen and full onboarding passed at 375 x 545 |
| Touch target probe | No visible enabled buttons below 44 x 44px on ten sampled 320px initial screens |
| Whitespace/diff check | `git diff --check` passed |

The responsive matrix uses **320, 375, 390, 768, 1024 and 1440px**. It covers 16 initial routes and four connected route variants at each width. Added computed-size assertions guard compact page headings and 16px input text; the existing console guard now includes the failing resource URL for diagnosis. Tests also check the favicon fallback.

The browser journey covers creating and publishing locally, discovering the listing, switching travellers, sending requests, accepting/declining, opening the group, editing/cancelling, duplicate and eligibility checks, overbooking protection, cross-tab changes, refresh/back navigation, saved trips, legacy drafts and confirmed reset without losing drafts/bookmarks. Homepage eligibility filters, URL/back state, bookmarks, local listings and request/capacity updates are included.

Visually reviewed screenshots of the homepage and 15 other initial screens at 375px and 1440px, covering card crops, heading wraps, form spacing, bottom navigation and desktop layouts. Screenshots and isolated test browser data remain in the system temporary directory. No application dependency was added.

## Limitations

- The full WebKit sweep still emits the prefetch/access-control diagnostics already recorded in `FRONTEND_AUDIT_REPORT.md`. The console guard remains enabled. The isolated journey passes; this does not establish that the full sweep is clean.
- Responsive and keyboard checks use desktop browser automation. No physical iPhone or Android device was available. Shortened viewports approximate keyboard space; native keyboards, safe-area insets and VoiceOver/TalkBack still need real-device testing. These checks do not establish full accessibility conformance. The product remains a browser-local frontend with fictional accounts.

## Modified files

The inventory includes the previously requested homepage changes retained in the workspace, the polish changes, regression updates and documentation. No temporary screenshots or browser profiles were added to the repository.

- `docs/DEMO_TESTING_GUIDE.md`
- `docs/DESIGN_BLUEPRINT.md`
- `docs/FRONTEND_POLISH_REPORT.md`
- `public/favicon.ico`
- `scripts/check-community-browser.cjs`
- `src/app/_home/home.module.css`
- `src/app/_home/trip-discovery.tsx`
- `src/app/_profile/profile-editor.tsx`
- `src/app/_profile/profile-view.tsx`
- `src/app/_profile/profile.module.css`
- `src/app/_shared/demo-account.tsx`
- `src/app/_shared/site-shell.tsx`
- `src/app/_shared/site.module.css`
- `src/app/_shared/trip-card.tsx`
- `src/app/community/[slug]/detail.module.css`
- `src/app/community/[slug]/page.tsx`
- `src/app/community/community-discovery.tsx`
- `src/app/community/community-join-request.tsx`
- `src/app/community/community-preview.tsx`
- `src/app/community/community.module.css`
- `src/app/dashboard/dashboard.module.css`
- `src/app/dashboard/demo-activity.tsx`
- `src/app/dashboard/requests/host-workspace.module.css`
- `src/app/dashboard/requests/host-workspace.tsx`
- `src/app/dashboard/requests/page.tsx`
- `src/app/explore/explore.module.css`
- `src/app/globals.css`
- `src/app/onboarding/onboarding.module.css`
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/traveller-onboarding.tsx`
- `src/app/page.tsx`
- `src/app/sign-in/auth-entry.tsx`
- `src/app/sign-in/sign-in.module.css`
- `src/app/trips/[slug]/group/group.module.css`
- `src/app/trips/[slug]/group/trip-group-space.tsx`
- `src/app/trips/[slug]/join-request.tsx`
- `src/app/trips/[slug]/trip-details.tsx`
- `src/app/trips/[slug]/trip-toolbar.tsx`
- `src/app/trips/[slug]/trip.module.css`
- `src/app/trips/new/create.module.css`
- `src/app/trips/new/trip-editor.tsx`
- `src/app/verification/verification-methods.tsx`
- `src/app/verification/verification.module.css`
