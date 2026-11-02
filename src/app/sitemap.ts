import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { bookableHostWhere } from "@/lib/stripeConnect";
import { FYLDE_COAST_DESTINATIONS } from "@/lib/destinations";
import { SITE_URL } from "@/lib/seo";
import { LOCAL_GUIDES } from "@/lib/localGuide";
import { estimateTopicEntries, isIndexableTopic, TOWN_TOPICS } from "@/lib/townTopics";

// Rendered per-request rather than prerendered at build time: a build
// machine isn't guaranteed the same database access as the deployed
// serverless functions, so a build-time query here would make the whole
// site's build fragile on something unrelated to the actual code.
export const dynamic = "force-dynamic";

// Static, always-indexable pages beyond the homepage and listings - kept as
// a plain list here rather than trying to auto-discover routes, since a
// route being renderable doesn't mean it should be indexed (e.g. /search,
// deliberately noindexed via its own metadata since every filter
// combination renders from the same URL shape as the homepage).
const STATIC_PAGES = [
  "/about",
  "/services",
  "/deals",
  "/contact",
  "/host",
  "/help",
  "/safety",
  "/host-guide",
  "/cancellation-policies",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
];

/** The town topic pages that have enough real entries to be left for search engines (the same rule the pages apply to themselves). */
async function indexableTopicUrls(): Promise<string[]> {
  const [byCategory, dogFriendly] = await Promise.all([
    prisma.localPlace.groupBy({ by: ["townSlug", "category"], _count: { _all: true } }).catch(() => []),
    prisma.localPlace.groupBy({ by: ["townSlug"], where: { dogFriendly: true }, _count: { _all: true } }).catch(() => []),
  ]);
  const urls: string[] = [];
  for (const destination of FYLDE_COAST_DESTINATIONS) {
    const guide = LOCAL_GUIDES[destination.slug];
    if (!guide) continue;
    const counts: Partial<Record<(typeof byCategory)[number]["category"], number>> = {};
    for (const row of byCategory) if (row.townSlug === destination.slug) counts[row.category] = row._count._all;
    const dogs = dogFriendly.find((row) => row.townSlug === destination.slug)?._count._all ?? 0;
    for (const topic of TOWN_TOPICS) {
      if (isIndexableTopic(topic, estimateTopicEntries(topic, guide, counts, dogs))) {
        urls.push(`${SITE_URL}/destinations/${destination.slug}/${topic.slug}`);
      }
    }
  }
  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A sitemap is non-critical: if the database is briefly unreachable,
  // degrade to just the homepage and static pages rather than failing the
  // request.
  const listings = await prisma.listing
    .findMany({
      where: { published: true, suspendedAt: null, ...bookableHostWhere() },
      select: { id: true, updatedAt: true },
    })
    .catch(() => []);
  const topicUrls = await indexableTopicUrls().catch(() => []);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...STATIC_PAGES.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
    // The destinations hub links to every town page; it was missing here.
    {
      url: `${SITE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    ...FYLDE_COAST_DESTINATIONS.map((destination) => ({
      url: `${SITE_URL}/destinations/${destination.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...topicUrls.map((url) => ({
      url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...listings.map((listing) => ({
      url: `${SITE_URL}/listings/${listing.id}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
