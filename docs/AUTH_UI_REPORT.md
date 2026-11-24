# Google + Phone authentication UI

Prepared locally on 24 November 2026. No commit, push or deployment was performed for this task.

## What changed

- Sign In and Sign Up each start with exactly two equal-size choices: **Continue with Google** and **Continue with Phone**.
- Google opens an explanatory screen only. It does not contact Google, open OAuth, select an account, or imply successful authentication.
- Phone shows +91 and validates ten digits beginning with 6, 7, 8 or 9. Empty, short, long, letter-containing and incorrectly prefixed input is rejected with an accessible error and focus on the field. Continue clears the input and explains future SMS verification. The SMS explanation now includes a six-digit animation preview. Users can type or paste their own sample digits; no code is generated, submitted or accepted as verification.
- The old signup display-name and traveller-type fields were removed to keep entry simple. Solo, couple and family preferences remain available in the existing onboarding flow. No manual email/password option existed in the inspected baseline, and none was added.
- Existing `/sign-in`, `?mode=signup`, safe `returnTo` URLs and onboarding links remain compatible. Mode changes reset entry state. No browser storage keys, demo accounts, participation checks or auth-state flags changed.
- Verification explains **Phone Verification ? Required** and **Government ID Verification ? Separate requirement**. Google users would verify their phone before participating; Phone users would complete SMS verification before signing in. OTP proves control of a number, not government identity. All proposed Aadhaar, passport, driving licence and voter ID information remains available, with no ID collection.
- Join and publish actions explain future phone and ID requirements without blocking the browser-local demo.

## Data boundaries

A sample phone number exists only in React input state while the form is open. It is cleared on valid Continue, changing methods, changing entry mode or leaving the component. No phone number is placed in URLs, network requests, localStorage, sessionStorage or cookies. There is no new backend, OAuth SDK, SMS provider, database, payment integration, real authentication or fake verified state.

## Branding and assets

The existing logo, Nunito headings, colours, photos, layout and navigation are preserved. The Google button uses the supplied full-colour gradient G without recolouring or stretching, a white surface, grey border, Google Sans Medium label and balanced prominence with Phone. The Google font is scoped to its button; both controls have a 48px minimum height and phone inputs remain 16px.

Sources checked on 24 November 2026:

- [Google sign-in branding guidance](https://developers.google.com/identity/branding-guidelines).
- [Official Google G asset](https://developers.google.com/static/identity/images/g-logo.png), saved unchanged as `public/brand/google-g.png`.
- [Google Fonts CSS, Google Sans 500](https://fonts.googleapis.com/css2?family=Google+Sans:wght@500&display=swap), Latin WOFF2 saved locally in `src/app/sign-in/` and served with `next/font/local`.
- [Google Sans SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/googlesans/OFL.txt), included as `src/app/sign-in/GOOGLE_SANS_OFL.txt`.

No Google-hosted scripts, fonts or images are requested by the running UI. Real integration would still need the provider's normal configuration and verification process.

## Testing

| Check | Result |
| --- | --- |
| `npm run lint` | Passed; the final test additions also passed ESLint |
| `npm run typecheck` | Passed |
| `npm run build` | Passed, 31 generated pages |
| `node scripts/check-community-model.cjs` | Passed |
| Existing Chromium browser regression | Passed, 120 responsive checks and the complete connected trip journey; zero console/runtime errors |
| New authentication regression, Chromium | Passed, 54 layout/state checks; zero console/runtime errors |
| New authentication regression, Firefox | Passed, 54 layout/state checks; zero console/runtime errors |
| New authentication regression, WebKit | Passed, 54 layout/state checks; zero console/runtime errors |
| `git diff --check` | Passed |

Widths: **320, 375, 390, 768, 1024 and 1440px**. Each auth run checks both Sign In and Sign Up, Google explanations, phone forms and SMS explanations at all widths, plus verification requirements. It checks minimum 44px targets, 16px inputs, no horizontal overflow, supplied logo proportions, field/heading focus, valid and invalid phone input, clearing numbers, safe return links, entry-mode navigation, no account cookies and unchanged draft/bookmark storage. Network checks confirm that the sample number is never submitted and that all runtime assets load from the application origin.

The auth suite also checks that onboarding still exposes all three traveller categories, the host screen explains phone verification, and the join dialog's request action remains enabled. The existing community suite exercises publishing, discovery, traveller switching, requests, acceptance/decline, capacity, groups, edit/cancel, refresh, filters, bookmarks, draft protection and cross-tab synchronization.

Reviewed mobile and desktop screenshots of both entry modes, Google/phone/SMS steps and verification. A 375 x 420 viewport check confirms the phone input stays reachable with reduced vertical space. Screenshots and test profiles are stored in the system temporary directory, outside the repository.

## Limits

Tests use automated desktop Chromium, Firefox and WebKit at emulated widths. No physical Android/iPhone, native software keyboard or assistive-technology testing was available. A shortened viewport checks input reachability but cannot replace a real keyboard test. The screens explain proposed flows and do not authenticate or verify anyone.

## Files changed or added

- `README.md`
- `docs/AUTH_UI_REPORT.md`
- `docs/DESIGN_BLUEPRINT.md`
- `public/brand/google-g.png`
- `scripts/check-auth-browser.cjs`
- `src/app/sign-in/GOOGLE_SANS_OFL.txt`
- `src/app/sign-in/auth-entry.tsx`
- `src/app/sign-in/google-sans-medium.woff2`
- `src/app/sign-in/page.tsx`
- `src/app/sign-in/sign-in.module.css`
- `src/app/trips/[slug]/join-request.tsx`
- `src/app/trips/new/trip-editor.tsx`
- `src/app/verification/page.tsx`
- `src/app/verification/verification.module.css`

## Animated OTP entry follow-up

Added a six-slot, browser-memory-only entry preview on the SMS explanation screen. Filled slots have a short entrance animation, focused slots have a teal ring, and coral progress segments reflect entered digits. Numeric typing advances focus; paste distributes digits, arrow keys move between slots, Backspace supports correction and Clear code resets the fields. Reduced-motion preferences disable the animation and transitions. Completion explicitly says that nothing is verified. Leaving this screen discards the preview digits.

Only the account component, its existing stylesheet, the auth regression and related documentation changed for this follow-up. No authentication state, API, storage key or backend was introduced. Follow-up verification: ESLint, TypeScript and production build passed. Chromium, Firefox and WebKit each passed all 54 auth layout/state checks with zero console/runtime errors. The expanded auth suite checks six-digit typing, auto-advance, Backspace, arrow-key replacement, paste distribution, clearing, reduced motion and no code transmission/storage across the six viewport widths. Paste-handler testing uses supplied clipboard event data because Firefox strips data from synthetic ClipboardEvent constructors. Native clipboard and physical-device behavior remain untested.
