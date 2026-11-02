# Town pages: split one huge page into a hub plus topic pages

Status: **queued, post-launch** (owner asked 2 Nov 2026: "move on to it later, save it as a checklist task"). Not a launch blocker. Do not start before the launch checklist is clear unless the owner says so.

## The problem (from the owner's screen recording, Blackpool)

`/destinations/[slug]` (`src/app/destinations/[slug]/page.tsx`) puts everything on one page:

1. Hero, then the accommodation grid (the part that earns money).
2. `LocalGuide`: quick-discovery nav, a quote, a personalised section, today's weather and events, hidden gems, "Perfect days" itineraries (family, couples, relaxed, rainy), "Near your stay", What's on, local knowledge, then a 14-category accordion (things to do, eat, coffee, family, beaches and walks, pubs, shopping, amenities, transport, parking, dog-friendly, hidden gems, rainy day, events).

All of it is rendered into one document per town, the page is dynamic (weather and events are fetched per request), and all six towns' guide text lives in one 1,161-line module (`src/lib/localGuide.ts`). A phone has to download and lay out a very long page to reach the content it wanted, and one URL is trying to rank for dozens of different searches.

## Recommendation

### 1. Shape: a short hub plus topic pages

- **Hub** `/destinations/blackpool` keeps the hero and the accommodation grid (booking first), then a tile for each topic with the top 3 picks as a teaser, a small weather line, and links to the itineraries. Aim for a third of today's length.
- **Topic pages**, one per search intent, under the town:
  - `/destinations/blackpool/things-to-do`
  - `/places-to-eat`, `/coffee-and-breakfast`, `/family-activities`
  - `/beaches-and-walks` (and dog-friendly walks), `/dog-friendly`
  - `/pubs-and-nightlife`, `/shopping`, `/rainy-day-activities`, `/hidden-gems`
  - `/getting-there-and-parking` (merge transport and parking)
  - `/whats-on` (the only live-data page: events and weather)
  - `/perfect-days` (the itineraries), possibly one page per itinerary later
- Each topic page: a real intro written for that town (not a template with the name swapped), the entries with the practical detail already in the data, a map where it helps, a "stays near this" link back to the town's listings, a short FAQ only where the questions are real, links to sibling topics, and breadcrumbs (Home / Destinations / Blackpool / Dog-friendly).
- Same structure for all six towns (Blackpool, Lytham, St Annes, Poulton-le-Fylde, Fleetwood, Thornton-Cleveleys) so it is built once.

### 2. SEO: quality over page count

Creating many pages does not help by itself. Rules to keep it honest:

- Publish a topic page only if it has enough genuinely distinct, useful entries (suggest at least 6, each with real local detail). Below that, keep it on the hub and `noindex` the page rather than shipping thin pages.
- One search intent per page, with its own title and description ("Dog-friendly walks and places in Blackpool").
- Canonical URLs, all pages in the sitemap with a real `lastmod`, `BreadcrumbList` on every page, `ItemList` on lists. Use `FAQPage` only for real questions and answers. No invented ratings or review schema.
- Internal links are the "backlinks" we control: hub to topics, topics to siblings and back to the hub, listing pages linking to "Things to do near this stay", the homepage towns row to the hubs. External backlinks come from content worth linking to (unique itineraries, local-data pages) and outreach to local tourism sites. We cannot manufacture them.
- Keep the hub URLs unchanged, so no redirects are needed. Keep the `#quick-discovery` anchor working or point it at the new topic links.

### 3. Speed

- Split `localGuide.ts` into one file per town (and per topic where large), so a page only loads the content it shows.
- Make topic pages static (`generateStaticParams`) with daily revalidation. Only the hub's weather line and `/whats-on` stream live data, inside Suspense, so the rest of the page never waits on weather or Ticketmaster.
- Replace the accordions (all text in the HTML but collapsed) with real pages. Lazy-load images below the fold.
- Measure before and after with Lighthouse on a phone profile (LCP, INP, HTML size) for Blackpool, and keep the numbers in this file.

### 4. Rollout

1. Pilot on Blackpool (largest guide). Build the route skeleton, the per-town data split and the shared topic template.
2. Content audit for every town: which topics have enough real material. This is the real constraint, not the code.
3. Hub redesign (short, booking first), sitemap, structured data, internal links.
4. Measure, check Search Console indexing, then roll the same template to the other five towns.

## Checklist

- [ ] Owner decision: confirm timing (post-launch) and the topic list above.
- [ ] Baseline Lighthouse and HTML size for `/destinations/blackpool` (phone).
- [ ] Split `src/lib/localGuide.ts` into per-town modules.
- [ ] Route `/destinations/[slug]/[topic]` with static generation and one shared template.
- [ ] Content audit per town and topic; mark pages below the threshold `noindex`.
- [ ] Slim the hub: hero, accommodation grid, topic tiles with teasers, live weather line.
- [ ] Move live weather and events behind Suspense on the hub and `/whats-on` only.
- [ ] Sitemap entries with `lastmod`, breadcrumbs, `ItemList` structured data.
- [ ] Internal links: topics to siblings and hub, listing pages to nearby guides, homepage to hubs.
- [ ] Pilot on Blackpool, measure, then roll out to the other five towns.
