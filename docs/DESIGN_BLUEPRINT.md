# Social travel design blueprint

The foundation includes the root layout, design tokens, shared navigation definitions and fictional fixtures. The routes, screens and interactions below describe future work.

## 1. Product vision and audience

Help people across India find companions for hikes, treks, road trips and weekend breaks, then turn shared trips into lasting connections. The core journey is discover a trip, get to know the host, request places for your party and receive the host’s decision. Hosting is a parallel journey with a short listing form and a request inbox.

Solo travellers, couples and families have equal standing in discovery, hosting and community. Support first-time hikers, experienced trekkers and parents planning around pace, distance and school holidays. Treat group type as how someone travels. Match people around activities, departure city and pace.

## 2. Brand personality

Young, adventurous and welcoming. Speak like a friendly trip organiser. Lead with specifics such as “Sunrise hike from Pune”, “2 spots left” and “Request sent to Meera”. Use a calm, candid tone for costs, difficulty, request decisions and safety.

Use real, licensed travel photography from India, with a mix of landscapes and candid groups that reflects the audience. Give images room, with warm neutral surfaces and selective teal or coral accents. Use expressive headings, simple Lucide icons, and brief pressed and focus feedback. Keep gradients, overlays and motion to a minimum.

## 3. Mobile-first visual design system

- At 375px, use 16px side gutters, one primary action per view and a vertical reading order. Use a 4px spacing grid, 16px inside cards and 32px between major sections.
- Trip cards start with a 4:3 destination photo and use a 20px corner radius. Put essential details on the card surface where their legibility is independent of the photo. Use a few distinct formats for different jobs, such as full listings, compact request rows and traveller cards.
- Controls start at 44×44 CSS px with a 12px radius. Allow buttons and labels to grow when text wraps. Mobile sheets use a 24px top corner radius.
- Short swipeable galleries or filter-chip rows may scroll inside their own bounded region. Provide labelled controls for galleries and make all filters available in the filter sheet. Keep the main trip feed vertical.

## 4. Colour and typography tokens

The Tailwind theme lives in `src/app/globals.css`. The display stack names Bricolage Grotesque for later self-hosting and currently falls back to the system UI stack used for body text.

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
| `label` | 14 / 20px | 600, actions, dates and status labels |
| `body` | 16 / 24px | 400, paragraphs and form inputs |
| `section` | 24 / 30px | 700, section headings and trip titles |
| `display` | 32 / 36px | 700, mobile editorial headings |
| `display-wide` | 48 / 52px | 700, wide editorial headings |

Typography is defined in rem. Keep long reading blocks near 65 characters per line. White on dark teal is approximately 6.2:1 and charcoal on coral is 6.0:1. Use those pairings for normal-sized text.

## 5. Responsive layout rules

| Width | Layout |
| --- | --- |
| Below 640px | 16px gutters, one trip per row, bottom navigation, mobile filter sheet, sticky trip action |
| 640px to 1023px | 24px gutters, up to two trip columns, bottom navigation, flexible details and filters |
| 1024px and up | 32px gutters, centered content up to 1200px, desktop header, up to three trip columns and room for inline filters |

On wide trip details, place the request action in a sticky side panel beside the itinerary. Keep forms in a single column up to 36rem and let their controls wrap. Reserve space under scrolling content for mobile and desktop sticky elements. Test at 320, 375, 768 and 1280 CSS px with long place names, large text and device insets. Use wrapping, flexible tracks and intrinsic sizing to prevent page-level horizontal overflow.

Use `next/image` with accurate `sizes`, intrinsic dimensions or a reserved aspect ratio, and lazy loading for below-the-fold photos. Reserve high fetch priority for the image that determines the initial render. Give a failed image the same footprint as its placeholder. [Next.js Image reference](https://nextjs.org/docs/app/api-reference/components/image)

## 6. Website information architecture

| Route | Purpose | Intended access |
| --- | --- | --- |
| `/` | Introduce the community with an authentic trip photo and an Explore trips action | Public |
| `/explore` | Browse and filter community trips | Public |
| `/trips/[slug]` | Review trip details, host, costs and availability, then request to join | Public detail, signed-in request |
| `/trips/new` | Create and preview a trip listing | Signed-in traveller |
| `/community` | Discover people by city, interests and travel pace | Public discovery |
| `/travellers/[handle]` | View a public traveller profile and their hosted trips | Public profile |
| `/profile` | View and edit your own traveller profile | Signed-in traveller |
| `/dashboard` | See upcoming trips, hosted trips and join request summaries | Signed-in traveller |
| `/dashboard/requests` | Track sent requests and manage received requests as a host | Requester or host |
| `/sign-in`, `/register` | Enter or create an account and return to the intended action | Public entry |

The landing page gives public entry points into Explore and Community. Dashboard owns personal trip activity and join requests. Profile owns public-facing identity and visibility choices.

## 7. Route and component structure

- `src/app/layout.tsx` and `src/app/globals.css` provide the document layout, locale, viewport and theme.
- Plan `src/app/(marketing)/page.tsx` for the landing route and `src/app/(auth)/` for sign-in and registration. Give the routes with shared navigation a `src/app/(platform)/layout.tsx`. Keep the groups under the single root layout. [Next.js route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- Add route-specific modules beside their pages. Keep pages responsible for composition and default to Server Components. Use Client Components for controls that need browser state, such as the filters, gallery and forms.
- Add shared components when their first screen needs them. Plan `src/components/navigation/` for the bottom bar and desktop header, `src/components/trips/` for the listing card, `src/components/travellers/` for profile summaries, and `src/components/ui/` for genuinely shared controls such as buttons and dialog structure.
- `src/domain/travel.ts` holds frontend model types. `src/data/fixtures.ts` holds local fictional examples. `src/navigation/primary.ts` holds the shared destination labels, routes and icons.

## 8. Navigation patterns

- Use five labelled links in the mobile bottom bar, in order from left to right. **Explore**, **Community**, **Create**, **My trips** and **Profile**. Give Create the central position. Give each destination at least a 44px hit area, with a 60px base bar height plus the bottom inset.
- At 1024px, render the same destinations in the header. Put Explore and Community in the main link group, give Create a clear action treatment, and keep My trips and Profile visible near the account area.
- Use a nav landmark and `aria-current="page"` on the exact current link. Indicate the parent destination visually on trip details, traveller details and requests. Landing and authentication screens use a compact header.
- On mobile details, the sticky request CTA takes the bottom slot while an in-flow back link returns to the results. On create and edit screens, reserve the bottom slot for the form’s primary action and provide a labelled back or cancel action.
- Apply `env(safe-area-inset-bottom)` to bottom bars and sheets, and the top and side insets where the layout reaches a device edge. Add content padding and scroll padding so the last result and focused controls clear the bar. Allow sheets to scroll within the dynamic viewport.
- Keep filter state in Explore’s URL and preserve the filters and scroll position when returning from a trip. When sign-in becomes available, preserve the user’s intended destination and resume the action after sign-in.

## 9. Trip listing and request UX

1. **Browse.** Lead with results, quick activity chips and a Filters button. Filter by destination or departure city, date range, activity, difficulty, group and listing type. Apply or clear from a bottom sheet on mobile and use in-flow controls on desktop. Show the result count, a size-matched loading state, an empty state with Clear filters, and a retry action after errors.
2. **Scan.** Show the destination photo, title, date, departure city, activity, difficulty, host, remaining places and per-person cost. Display **Personal trip** with an estimated share or **Commercial trip** with the organiser and stated price. Use Indian currency formatting and understandable local date ranges.
3. **Decide.** Group trip details into overview, route or itinerary, pace and physical requirements, costs and inclusions, and host information. Keep **Request to join** reachable below the overview and sticky on mobile. Show full or closed status in place of the request action when applicable.
4. **Request.** Ask for party size and an optional short note. Explain that the host reviews the request and show the pending state after submission. My trips surfaces Accepted, Declined and Withdrawn states with clear next actions where relevant. Hosts review incoming requests by trip and accept or decline them. Capacity reflects confirmed places. A request stays pending until the host decides or the requester withdraws it.
5. **Host.** Start with listing type, destination and departure city, dates, activity, difficulty, capacity and cost. Ask for itinerary, inclusions and requirements in a short second step, then preview the card and details before publication. Personal listings show cost sharing. Commercial listings show the organiser’s identity and price.

## 10. Community and profile UX

- Community browsing begins with location and shared interests. Show compatibility through specific details such as “Also leaves from Bengaluru” or “Prefers easy trails”. Keep the flow centred on travel plans and host or companion discovery.
- Traveller cards show a display name, city, travel group, interests and a short bio. Give all group types the same space and prominence. Offer a public hosted-trip list and a public profile preview from the account’s edit view.
- Keep profile creation lightweight. Start with a display name, home city and group type. Make interests, bio and portrait optional. Let people choose which optional details appear publicly. Use initials for fixture profiles.

## 11. Trust and safety UI requirements

- Give users a visible way to report a trip or profile and block contact where applicable. Label the controls plainly. Explain what information a report sends and show a receipt once reporting exists.
- Keep personal contact information, private join notes and precise meeting details out of public views. Use city-level locations in discovery. Share meeting arrangements only with accepted participants. A family profile represents the adult account holder. Keep children’s names, ages and photos out of public profile fields.
- Verification badges belong in design concepts until a verification system is implemented. Never collect or store Aadhaar numbers, card images or related documents. Use fictional sample profiles, organisers and listings, with no implied endorsements.
- Identify personal and commercial trips on the card, detail page and create form. Distinguish estimated shared expenses from organiser pricing. Surface physical demands, gear, minimum age where relevant, and the host’s cancellation terms before someone requests a place.

## 12. Accessibility and interaction standards

- Target WCAG 2.2 AA and use the product’s 44×44 CSS px action target. Aim for 4.5:1 contrast for normal text and 3:1 for large text and meaningful control boundaries. Pair statuses with text, and keep focus visible and clear of sticky elements. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- Use semantic landmarks, a skip link, one main heading and correctly labelled links, buttons and fields. Give informative images useful alt text and decorative images empty alt text. Mark decorative icons hidden from assistive technology.
- Make mobile filter sheets labelled modal dialogs. Move focus inside on open, keep it in the dialog, support Escape and a labelled close control, and restore focus when the sheet closes. Provide button and keyboard alternatives to swipe and drag gestures. [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- Use visible labels and appropriate input types and autocomplete. Keep entered values after errors, mark fields in error, and announce submission and filtering feedback with a polite status region. Use plain request statuses with recovery instructions where applicable.
- Respect reduced motion with instant or minimal transitions. Verify keyboard-only use, screen-reader announcements, 200% text zoom and reflow before shipping screens.
