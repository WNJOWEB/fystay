import type { LocalPlace, LocalPlaceCategory } from "@prisma/client";
import type { GuideCategoryKey, GuideEntry, TownGuide } from "@/lib/localGuide";

/**
 * The separate pages a town's guide is split into (docs/town-pages-restructure.md):
 * /destinations/<town>/<topic>. A "category" topic lists the town's curated
 * entries for that part of the guide first, then the live local places
 * (OpenStreetMap, synced daily) for the same part; the other kinds render
 * one of the guide's richer sections on a page of its own.
 */
export type TopicKind = "category" | "hidden-gems" | "perfect-days" | "whats-on" | "local-tips";

export type TownTopic = {
  slug: string;
  kind: TopicKind;
  /** Short name for tiles and links ("Places to eat"). */
  label: string;
  /** The page's h1 and search title stem; `{town}` is replaced with the town's name. */
  heading: string;
  /** One line after the town's own description; says what is on this page. */
  intro: string;
  /** Curated guide categories listed on the page (several merge, e.g. transport and parking). */
  guideKeys?: GuideCategoryKey[];
  /** Live place categories added after the curated entries. */
  placeCategories?: LocalPlaceCategory[];
  /** Live places flagged dog-friendly instead of by category. */
  dogFriendlyPlaces?: boolean;
};

export const TOWN_TOPICS: TownTopic[] = [
  {
    slug: "things-to-do",
    kind: "category",
    label: "Things to do",
    heading: "Things to do in {town}",
    intro: "The attractions, sights and days out worth planning a stay around.",
    guideKeys: ["thingsToDo"],
    placeCategories: ["ATTRACTION", "MUSEUM", "VIEWPOINT"],
  },
  {
    slug: "places-to-eat",
    kind: "category",
    label: "Places to eat",
    heading: "Best places to eat in {town}",
    intro: "Where to eat, from fish and chips to a proper sit-down dinner.",
    guideKeys: ["eat"],
    placeCategories: ["RESTAURANT"],
  },
  {
    slug: "coffee-and-breakfast",
    kind: "category",
    label: "Coffee & breakfast",
    heading: "Coffee and breakfast in {town}",
    intro: "Cafes and breakfast spots for the first meal of the day.",
    guideKeys: ["coffeeAndBreakfast"],
    placeCategories: ["CAFE"],
  },
  {
    slug: "family-activities",
    kind: "category",
    label: "Family activities",
    heading: "Family activities in {town}",
    intro: "Things that work with children, from rides to playgrounds.",
    guideKeys: ["family"],
    placeCategories: ["PLAYGROUND", "ATTRACTION"],
  },
  {
    slug: "beaches-and-walks",
    kind: "category",
    label: "Beaches & walks",
    heading: "Beaches and walks in {town}",
    intro: "Sand, promenades, parks and the best places to stretch your legs.",
    guideKeys: ["beachesAndWalks"],
    placeCategories: ["BEACH", "PARK", "VIEWPOINT"],
  },
  {
    slug: "dog-friendly",
    kind: "category",
    label: "Dog-friendly",
    heading: "Dog-friendly places in {town}",
    intro: "Where your dog is welcome: walks, beaches, pubs and cafes.",
    guideKeys: ["dogFriendly"],
    dogFriendlyPlaces: true,
  },
  {
    slug: "pubs-and-nightlife",
    kind: "category",
    label: "Pubs & nightlife",
    heading: "Pubs and nightlife in {town}",
    intro: "Pubs, bars and a night out.",
    guideKeys: ["pubsAndNightlife"],
    placeCategories: ["PUB"],
  },
  {
    slug: "shopping",
    kind: "category",
    label: "Shopping",
    heading: "Shopping in {town}",
    intro: "High streets, independents and where to pick things up.",
    guideKeys: ["shopping"],
    placeCategories: ["SHOP"],
  },
  {
    slug: "rainy-day-activities",
    kind: "category",
    label: "Rainy day",
    heading: "Rainy-day activities in {town}",
    intro: "What to do when the weather turns.",
    guideKeys: ["rainyDay"],
    placeCategories: ["MUSEUM"],
  },
  {
    slug: "getting-there-and-parking",
    kind: "category",
    label: "Getting there & parking",
    heading: "Getting to {town} and where to park",
    intro: "Trains, trams, buses and car parks, plus the everyday amenities nearby.",
    guideKeys: ["transport", "parking", "amenities"],
    placeCategories: ["PARKING", "PHARMACY", "SUPERMARKET", "TOILET"],
  },
  { slug: "hidden-gems", kind: "hidden-gems", label: "Hidden gems", heading: "Hidden gems in {town}", intro: "The places locals rate that visitors tend to miss." },
  { slug: "perfect-days", kind: "perfect-days", label: "Perfect days", heading: "Perfect days in {town}", intro: "Ready-made plans for a family day, a couples day, a relaxed day or a wet one." },
  { slug: "whats-on", kind: "whats-on", label: "What's on", heading: "What's on in {town}", intro: "Events and seasonal attractions coming up." },
  { slug: "local-tips", kind: "local-tips", label: "Local tips", heading: "Local tips for {town}", intro: "Parking to avoid, when to turn up, and where to go instead of the obvious choice." },
];

export function findTopic(slug: string): TownTopic | undefined {
  return TOWN_TOPICS.find((topic) => topic.slug === slug);
}

export function topicHeading(topic: TownTopic, townName: string): string {
  return topic.heading.replace("{town}", townName);
}

export type TopicEntry = {
  name: string;
  note?: string;
  website?: string | null;
  /** "curated" entries are FYStay's own write-up; "local" ones come from the live local-places data. */
  source: "curated" | "local";
};

/** A page needs at least this many distinct entries to be left for search engines; thinner ones stay out of the index. */
export const MIN_INDEXABLE_ENTRIES = 6;
/** Live places added after the curated entries, at most. */
export const MAX_LOCAL_ENTRIES = 24;

export function isIndexableTopic(topic: TownTopic, entryCount: number): boolean {
  // The itineraries and local tips are written pages, not lists to count.
  if (topic.kind === "perfect-days" || topic.kind === "local-tips") return true;
  return entryCount >= MIN_INDEXABLE_ENTRIES;
}

const normalise = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** The curated entries for a topic's guide categories, then the town's live places for it - deduplicated by name. */
export function composeTopicEntries(topic: TownTopic, guide: TownGuide, places: LocalPlace[]): TopicEntry[] {
  const seen = new Set<string>();
  const entries: TopicEntry[] = [];

  for (const key of topic.guideKeys ?? []) {
    for (const entry of guide[key] as GuideEntry[]) {
      const id = normalise(entry.name);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      entries.push({ name: entry.name, note: entry.note, source: "curated" });
    }
  }

  const live = places
    .filter((place) =>
      topic.dogFriendlyPlaces ? place.dogFriendly === true : (topic.placeCategories ?? []).includes(place.category),
    )
    // Places with a website or opening hours are the most useful first.
    .sort(
      (a, b) =>
        Number(Boolean(b.website)) - Number(Boolean(a.website)) ||
        Number(Boolean(b.openingHours)) - Number(Boolean(a.openingHours)) ||
        a.name.localeCompare(b.name),
    );
  let added = 0;
  for (const place of live) {
    if (added >= MAX_LOCAL_ENTRIES) break;
    const id = normalise(place.name);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    added += 1;
    entries.push({ name: place.name, note: place.address ?? undefined, website: place.website, source: "local" });
  }
  return entries;
}

/**
 * An estimate of how many entries a topic page will show, from counts alone
 * (the sitemap can't load every place): curated entries plus the live places
 * in the topic's categories, capped as on the page. Duplicate names make the
 * page's own count a little lower, which only matters at the threshold.
 */
export function estimateTopicEntries(
  topic: TownTopic,
  guide: TownGuide,
  placeCountsByCategory: Partial<Record<LocalPlaceCategory, number>>,
  dogFriendlyPlaceCount: number,
): number {
  const curatedKeys: GuideCategoryKey[] =
    topic.kind === "hidden-gems" ? ["hiddenGems"] : topic.kind === "whats-on" ? ["events"] : (topic.guideKeys ?? []);
  const curated = curatedKeys.reduce((total, key) => total + guide[key].length, 0);
  const live = topic.dogFriendlyPlaces
    ? dogFriendlyPlaceCount
    : (topic.placeCategories ?? []).reduce((total, category) => total + (placeCountsByCategory[category] ?? 0), 0);
  return curated + Math.min(live, MAX_LOCAL_ENTRIES);
}
