# Share Yarana design blueprint

Share Yarana is a free, community-driven social travel frontend demo. All profiles, communities and public listings are fictional. Drafts, bookmarks, demo trips and request decisions stay in the browser. Three fictional traveller accounts let the same browser demonstrate publishing, joining, hosting and group coordination. Account and verification screens remain informational demos.

## 1. Product vision and audience

Help people across India find companions for hikes, treks, road trips and weekend breaks, then turn shared trips into lasting connections. The core journey is discover a trip, get to know the host, request places for your party and receive the host’s decision. Hosting is a parallel journey with a short listing form and a request inbox. Registration, listings, discovery, join requests and community participation are free. There are no platform fees, commissions or subscriptions. Share Yarana helps people meet and plan together. It has no pricing, budget or expense features and collects no payments.

Solo travellers, couples and families have equal standing in discovery, hosting and community. Support first-time hikers, experienced trekkers and parents planning around pace, distance and school holidays. Treat group type as how someone travels. Match people around activities, departure city and pace.

## 2. Brand personality

Use the horizontal Share Yarana logo in the header, footer and compact mobile trip toolbar. It pairs the coral sun and trail pin with the charcoal and teal wordmark. Use the square app mark as the browser icon. The intended production domain is `https://shareyarana.com`.

Young, adventurous and welcoming. Speak like a friendly fellow traveller. Lead with specifics such as “Sunrise hike from Pune”, “2 spots left” and “Request sent to Meera”. Use a calm, candid tone for trip planning, difficulty, request decisions and safety.

Use real, licensed travel photography from India, with a mix of landscapes and candid groups that reflects the audience. Give images room, with warm neutral surfaces and selective teal or coral accents. Use expressive headings, simple Lucide icons, and brief pressed and focus feedback. Keep gradients, overlays and motion to a minimum.

## 3. Mobile-first visual design system

- At 375px, use 16px side gutters, one primary action per view and a vertical reading order. Use a 4px spacing grid, 16px inside cards and 32px between major sections.
- Trip cards start with a 4:3 destination photo and use a 20px corner radius. Put essential details on the card surface where their legibility is independent of the photo. Use a few distinct formats for different jobs, such as full listings, compact request rows and traveller cards.
- Controls start at 44×44 CSS px with a 12px radius. Allow buttons and labels to grow when text wraps. Mobile sheets use a 24px top corner radius.
- Short swipeable galleries or filter-chip rows may scroll inside their own bounded region. Provide labelled controls for galleries and make all filters available in the filter sheet. Keep the main trip feed vertical.

## 4. Colour and typography tokens

The Tailwind theme lives in `src/app/globals.css`. Nunito ExtraBold (800) is self-hosted for headings and trip titles, with the system UI stack for body text. [Nunito source and license](https://github.com/googlefonts/nunito)

| Token | Value | Use |
| --- | --- | --- |
| `canvas`, `surface`, `surface-soft` | `#FAF9F6`, `#FFFFFF`, `#F1F3ED` | Page, card, secondary panel |
| `ink`, `ink-muted` | `#202525`, `#56615D` | Body text, secondary text |
| `teal` | `#168B80` | Brand accent, decorative shapes and emphasis |
| `teal-dark`, `teal-soft` | `#116D64`, `#DDEFEA` | Primary buttons with white text, selected labels with dark teal on soft teal, focus rings |
| `coral` | `#FF7955` | Occasional highlights with charcoal text |
| `divider`, `control-border` | `#DEE4DD`, `#7B8580` | Decorative separators, visible control boundaries on light surfaces |
| `danger` | `#A72B23` | Error text and icons on light surfaces |

| Text token | Size / line height | Weight and use |
| --- | --- | --- |
| `meta` | 13 / 20px | 400, secondary metadata |
| `label` | 13 / 20px | 600, actions, dates and status labels |
| `body` | 15 / 24px | 400, paragraphs |
| `input` | 16px minimum | Form controls; avoid mobile focus zoom |
| `small` | 12px | Supporting labels |
| `card-title` | 18 / 22.5px | 800, trip and community cards |
| `page-title` | 28px mobile / 40px tablet and desktop | 800, page headings with 1.2 line height |
| `section` | 24 / 30px | 800, section headings |
| `display` | 28 / 34px | 800, mobile editorial headings |
| `display-wide` | 44 / 52px | 800, wide editorial headings |

Typography is defined in rem. Keep long reading blocks near 65 characters per line. White on dark teal is approximately 6.2:1 and charcoal on coral is 6.0:1. Use those pairings for normal-sized text.

## 5. Responsive layout rules

| Width | Layout |
| --- | --- |
| Below 640px | 16px gutters, one trip per row, bottom navigation, mobile filter sheet, sticky trip action |
| 640px to 1023px | 24px gutters, up to two trip columns, bottom navigation, flexible details and filters |
| 1024px and up | 32px gutters, centered content up to 1200px, desktop header, up to three trip columns and room for inline filters |

On wide trip details, place the request action in a sticky side panel beside the itinerary. Keep forms in a single column up to 36rem and let their controls wrap. Reserve space under scrolling content for mobile and desktop sticky elements. Test at 320, 375, 390, 768, 1024 and 1440 CSS px with long place names, large text and device insets. Use wrapping, flexible tracks and intrinsic sizing to prevent page-level horizontal overflow.

Use `next/image` with accurate `sizes`, intrinsic dimensions or a reserved aspect ratio, and lazy loading for below-the-fold photos. Reserve high fetch priority for the image that determines the initial render. Give a failed image the same footprint as its placeholder. [Next.js Image reference](https://nextjs.org/docs/app/api-reference/components/image)

## 6. Website information architecture

| Route | Purpose | Intended access |
| --- | --- | --- |
| `/` | Introduce the community with an authentic trip photo and an Explore trips action | Public |
| `/explore` | Browse and filter community trips | Public |
| `/trips/[slug]` | Review trip details, host and availability, then request to join | Public detail and local demo join request |
| `/trips/new` | Draft, preview, publish and edit a local demo trip | Public demo |
| `/community` | Discover people by city, interests and travel pace | Public discovery |
| `/travellers/[handle]` | View a public traveller profile and their hosted trips | Public profile |
| `/profile` | View and edit your own traveller profile | Public demo |
| `/dashboard` | See upcoming trips, hosted trips and join request summaries | Public demo |
| `/dashboard/requests` | Review incoming requests for the selected hosted trip | Selected demo host |
| `/sign-in?mode=signup`, `/sign-in`, `/onboarding` | Preview free registration, login and traveller preferences | Public demo |
| `/community/[slug]` | Community details, related trips and local request previews | Public demo |
| `/trips/[slug]/group` | Group planning, accepted parties, itinerary, checklist and example chat | Selected demo host or accepted traveller |
| `/verification` | Explain proposed verification and safety practices | Public information |

The landing page gives public entry points into Explore and Community. Dashboard owns personal trip activity and join requests. Profile owns public-facing identity and visibility choices.

## 7. Route and component structure

- `src/app/layout.tsx` and `src/app/globals.css` provide the document layout, locale, viewport and theme.
- Pages live directly under `src/app/`, with route-specific modules alongside them. Pages compose Server Components; browser interactions use Client Components.
- `src/app/_shared/` owns shared trip cards, site navigation, dialogs, drafts and bookmarks. Profiles share `src/app/_profile/`. Add components only when they have a current consumer.
- `src/domain/travel.ts` holds frontend model types. `src/data/fixtures.ts` holds local fictional examples. `src/navigation/primary.ts` holds the shared destination labels, routes and icons.

## 8. Navigation patterns

- Use five labelled links in the mobile bottom bar, in order from left to right. **Explore**, **Community**, **Create**, **My trips** and **Profile**. Give Create the central position. Give each destination at least a 44px hit area, with a 60px base bar height plus the bottom inset.
- At 1024px, render the same destinations in the header. Put Explore and Community in the main link group, give Create a clear action treatment, and keep My trips and Profile visible near the account area.
- Use a nav landmark and `aria-current="page"` on the exact current link. Indicate the parent destination visually on trip details, traveller details and requests. Landing and authentication screens use a compact header.
- On mobile details, the sticky request CTA takes the bottom slot while an in-flow back link returns to the results. On create and edit screens, reserve the bottom slot for the form’s primary action and provide a labelled back or cancel action.
- Apply `env(safe-area-inset-bottom)` to bottom bars and sheets, and the top and side insets where the layout reaches a device edge. Add content padding and scroll padding so the last result and focused controls clear the bar. Allow sheets to scroll within the dynamic viewport.
- Keep filter state in Explore’s URL and preserve the filters and scroll position when returning from a trip. When sign-in becomes available, preserve the user’s intended destination and resume the action after sign-in.

## 9. Trip listing and request UX

1. **Browse.** Lead with results, activity chips and a Filters button. Filter by destination, departure city, dates, activity, traveller group and available spots. Use a bottom-sheet dialog on mobile. Sort by upcoming or newest; old budget query parameters are ignored.
2. **Scan.** Show the destination photo, title, dates, departure city, activity, host and available places. All listings are community trips. Do not display prices, budgets, expense estimates or zero-cost labels.
3. **Decide.** Group details into overview, itinerary, suitability and host information. Keep **Request to Join** reachable and sticky on mobile alongside availability. Show full status in place of the request action when appropriate.
4. **Request.** Joining is free. Confirm party size using the selected demo traveller’s category. Save a pending demo request under the selected traveller. My Trips shows Pending, Accepted, Declined and Cancelled. A trip has one request per demo traveller. The host can accept or decline eligible parties, with availability checked again at the point of acceptance. A traveller can cancel a pending or accepted request.
5. **Host.** Start with title, destination, starting city, dates and description, then traveller eligibility and available places. Keep itinerary, cover selection, Save draft and Preview listing. Publish Trip creates a listing with a stable ID. Edit or cancel it through My Trips > Hosting. No budget or expense fields: hosting means sharing a plan and finding company.
6. **Messaging.** “Find your people. Share the adventure.” Pair it with “Create trips, meet fellow travellers and explore together. No platform fees.” Explain free registration, hosting, joining and participation at relevant decision points without promotional FREE badges.

### Trip data and local draft compatibility

- `src/data/fixtures.ts` provides sample trip facts and request seeds. `trip-listings.ts` derives fixture presentation. The browser store combines fixtures and published demo trips for discovery, details, hosting and group access. Public fixture cards use the same current availability.
- `Trip` has one community model without pricing fields. Listing adapters expose no amounts or expense notes. Existing IDs and URLs remain unchanged for bookmarks and links.
- Continue reading `sidetrail-trip-draft-v1` with the existing schema. Legacy budget, included, excluded and costNotes fields are retained only for storage compatibility, never rendered, used for filtering or validated. They remain intact when saving or editing older drafts and published demo trips. All other saved trip details remain usable.
- Migration on read never writes or deletes storage. On the next explicit save, preserve the raw original under `sidetrail-trip-draft-v1-original` before writing `schemaVersion: 2` to the existing key. The backup is not overwritten. If backup or save fails, report the failure and keep the working draft. Malformed original content is also backed up before replacement.
- Keep `sidetrail-saved-trip-ids-v1`, its contents and all trip IDs unchanged. Existing bookmark events, cross-tab updates and draft-discard conflict checks remain intact. Discard is still an explicit user action and does not remove the original migration backup.

### Connected browser demo

- Use the Switch Traveller control in the shared shell to switch between Meera (solo), Kavya & Dev (couple) and the Nair family. The selected account persists and is shared across tabs on the same origin. Party sizes are one for solo travellers, two for couples and two or more for families.
- Publish from the listing preview. The store copies the draft and assigns a UUID-based route. An edit starts from the saved listing, preserves the route and checks its revision before writing. Drafts and bookmarks use their existing keys. Demo publishing, edits and reset leave those keys alone.
- Capacity uses originally occupied places plus accepted party sizes. Seeded acceptances are taken out of the original fixture baseline before applying current request statuses. Pending, declined and cancelled requests do not occupy places. Hosts cannot remove places or eligibility that an accepted party requires. Cancelling a trip removes it from Explore, cancels its pending and accepted requests, and closes its group.
- The host and accepted travellers can open Trip Group Space. The roster shows the host and current accepted requests. Places occupied before listing are reported separately. The space retains itinerary, announcements, a checklist for the current visit and read-only sample messages. New groups begin with empty announcement and chat states.
- Store versioned demo data under `sidetrail-travel-demo-v1`. Validate stored shape, IDs, references, statuses, dates, party sizes and capacity before restoring it. Damaged data shows the starting examples and requires an explicit reset before changes can be saved. Reset removes the trip demo and social demo keys, preserving drafts and bookmarks.

### Photos, trip feedback and location sharing

- `/community` includes a photo feed and upload dialog. Posts have a photo, caption and fictional author. Explain that this public-feed preview is visible only within the current browser. Require permission to share the image and from anyone depicted. Accept JPG, PNG and WebP up to 10 MB, reject images over 40 megapixels, resize to a maximum edge of 1200px and re-encode to JPEG without embedded metadata. Store only the processed image (maximum 350,000 data-URL characters), never the original file. Authors can remove their own posts. No uploads or public hosting are connected.
- Trip details include traveller feedback with a 1–5 rating and written review. Only accepted travellers can add or edit feedback on an active trip, one review per traveller per trip. Authors can remove their review. Labels identify local demo reviews and never claim a completed or verified trip. Hosts cannot review their own trip.
- Group Chat keeps its read-only sample text messages and adds Share location for the host and accepted participants. Allow a manually named meeting point or a one-time browser geolocation request initiated by an explicit button. Show the pin before saving and explain persistence; permission denial, unsupported/insecure contexts and timeouts offer the manual alternative. Never run live tracking, automatically request location or load maps. A labelled external Google Maps link opens only when clicked. Authors can remove their own pins. Precise locations never appear in public trip cards or the community feed.
- Store these contributions in the separate version-1 `share-yarana-social-demo-v1` key. Validate entries, authors, coordinates, ratings, string lengths and unique IDs on read. Limit the local demo to six photos and 80 total contributions. Report quota and corruption errors without overwriting saved content. Use the existing demo Web Lock for writes, account changes and reset; recheck current account and participation under that lock. Synchronize across tabs using the existing storage-event utility. Reset Demo Data explicitly lists photos, feedback and locations in its confirmation.
- Real cross-device sharing remains a future backend task requiring real accounts, server-side authorization, media storage and moderation. Current local permissions are demo behavior, not a security boundary against someone editing browser storage.

Validation on 2026-11-28: ESLint, TypeScript and production build passed. Model checks cover malformed data, permission checks, review replacement, photo limits, failed writes and reset protection. The social browser flow passed in Chromium, Firefox and WebKit, with 18 dialog/layout checks per engine across 320, 375, 390, 768, 1024 and 1440px. Upload validation, consent, persistence, geolocation preview and denial, review edits/deletion, cross-tab updates and reset were exercised. The existing Chromium community journey (120 responsive checks) and auth regression (54 layout/state checks) also passed with no console/runtime errors. Mobile photo/location and desktop review screenshots were reviewed. WebKit's empty-MIME WebP uploads are accepted by extension and still decoded before storage. Physical phones, native camera pickers and real GPS accuracy have not been tested.
- Local writes use a browser lock to serialize changes between tabs, with a fresh validation pass inside each write. The app publishes same-tab updates and listens for cross-tab storage changes. Use HTTPS or localhost for the interactive demo. Access checks model the selected fictional role in the browser.

## 10. Community and profile UX

- Community browsing begins with location and shared interests. Show compatibility through specific details such as “Also leaves from Bengaluru” or “Prefers easy trails”. Keep the flow centred on travel plans and host or companion discovery.
- Traveller cards show a display name, city, travel group, interests and a short bio. Give all group types the same space and prominence. Offer a public hosted-trip list and a public profile preview from the account’s edit view.
- Keep profile creation lightweight. Start with a display name, home city and group type. Make interests, bio and portrait optional. Let people choose which optional details appear publicly. Use initials for fixture profiles.

## 11. Trust and safety UI requirements

- Give users a visible way to report a trip or profile and block contact where applicable. Label the controls plainly. Explain what information a report sends and show a receipt once reporting exists.
- Keep personal contact information, private join notes and precise meeting details out of public views. Use city-level locations in discovery. Share meeting arrangements only with accepted participants. A family profile represents the adult account holder. Keep children’s names, ages and photos out of public profile fields.
- Verification badges belong in design concepts until a verification system is implemented. Never collect or store Aadhaar numbers, card images or related documents. Use fictional sample profiles, hosts and listings, with no implied endorsements.
- Surface physical demands, gear, minimum age where relevant and the host’s change-of-plan expectations before someone requests a place. Preserve existing verification and safety UI. Do not collect Aadhaar information or introduce backend, database, payment, identity-provider or subscription integrations.

## 12. Accessibility and interaction standards

- Target WCAG 2.2 AA and use the product’s 44×44 CSS px action target. Aim for 4.5:1 contrast for normal text and 3:1 for large text and meaningful control boundaries. Pair statuses with text, and keep focus visible and clear of sticky elements. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- Use semantic landmarks, a skip link, one main heading and correctly labelled links, buttons and fields. Give informative images useful alt text and decorative images empty alt text. Mark decorative icons hidden from assistive technology.
- Make mobile filter sheets labelled modal dialogs. Move focus inside on open, keep it in the dialog, support Escape and a labelled close control, and restore focus when the sheet closes. Provide button and keyboard alternatives to swipe and drag gestures. [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- Use visible labels and appropriate input types and autocomplete. Keep entered values after errors, mark fields in error, and announce submission and filtering feedback with a polite status region. Use plain request statuses with recovery instructions where applicable.
- Respect reduced motion with instant or minimal transitions. Verify keyboard-only use, screen-reader announcements, 200% text zoom and reflow before shipping screens.

### Compact interface polish

Use the shared type scale above across routes. Keep Nunito ExtraBold headings, the existing body font, brand assets and teal/coral palette. Use 24px section spacing on phones and 28px on larger screens where appropriate, 16px card corners, and 44px minimum action targets. Shared trip cards use a 3:2 photo and quiet borders rather than resting shadows.

Action labels stay short: Publish Trip, Switch Traveller, Send request and Save changes. Explain fictional travellers and browser-local data in the switcher and at publishing/request actions. Retain Reset Demo Data and all privacy, safety, sample-account and unavailable-verification explanations. A listing preview is still a preview; account and verification screens do not perform real authentication or identity checks.

### Google + Phone account entry (24 November 2026)

`/sign-in` and `/sign-in?mode=signup` expose exactly two methods: Continue with Google and Continue with Phone. No email/password or email OTP entry exists. Registration asks for no display name or traveller type; existing onboarding still offers solo, couple and family preferences. Safe return URLs remain intact.

Google opens an explanation only, with no OAuth request, popup, account selection or simulated success. Phone uses +91 and validates ten digits beginning with 6-9. The number exists only in the current input state and is cleared before the SMS explanation, when changing methods or when switching entry modes. Neither route persists phone data, emits an SMS or accepts an OTP as verification. The SMS explanation includes an animated six-digit interaction preview with numeric entry, paste, keyboard correction and reduced-motion support; sample digits exist only in component memory and are discarded when leaving that screen. No authentication or verification flag is set.

Planned production participation requires two distinct checks. Google users can browse after sign-in, then must verify their phone by SMS and complete the separate government ID check before joining or hosting. Phone users complete SMS verification before signing in and browsing; government ID remains separate. The current browser-local demo is not gated by these future requirements.

The Google control uses Google's supplied full-colour G and a locally served Google Sans Medium font limited to that button. Both method buttons have equal prominence and 48px minimum height. Existing Nunito headings, compact spacing, teal/coral colours and local fonts remain in place. See [Google's current branding guidance](https://developers.google.com/identity/branding-guidelines) and `docs/AUTH_UI_REPORT.md` for asset provenance and checks.
