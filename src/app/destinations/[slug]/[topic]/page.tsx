import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FYLDE_COAST_DESTINATIONS } from "@/lib/destinations";
import { HiddenGems } from "@/components/HiddenGems";
import { LocalKnowledge } from "@/components/LocalKnowledge";
import { PerfectDays } from "@/components/PerfectDays";
import { WhatsOn } from "@/components/WhatsOn";
import { LOCAL_GUIDES } from "@/lib/localGuide";
import { buildConciergeSnapshot, loadConciergeSources } from "@/lib/localData/concierge";
import { getTownPlaces } from "@/lib/localData/places";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import {
  composeTopicEntries,
  findTopic,
  isIndexableTopic,
  TOWN_TOPICS,
  topicHeading,
  type TopicEntry,
  type TownTopic,
} from "@/lib/townTopics";

// Built on the first visit and kept for six hours: nothing here changes faster, and a page this size shouldn't wait on the places and events lookups every time.
export const revalidate = 21600;

type Params = { slug: string; topic: string };

const findDestination = (slug: string) => FYLDE_COAST_DESTINATIONS.find((destination) => destination.slug === slug);

/** The entries a category-style topic would show, for the page and for its search-engine decision. */
async function entriesFor(slug: string, topic: TownTopic): Promise<TopicEntry[]> {
  const guide = LOCAL_GUIDES[slug];
  if (!guide) return [];
  if (topic.kind === "category") {
    const places = await getTownPlaces(slug).catch(() => []);
    return composeTopicEntries(topic, guide, places);
  }
  return composeTopicEntries({ ...topic, guideKeys: topic.kind === "hidden-gems" ? ["hiddenGems"] : topic.kind === "whats-on" ? ["events"] : [] }, guide, []);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, topic: topicSlug } = await params;
  const destination = findDestination(slug);
  const topic = findTopic(topicSlug);
  if (!destination || !topic || !LOCAL_GUIDES[destination.slug]) return {};

  const entries = await entriesFor(destination.slug, topic);
  const heading = topicHeading(topic, destination.name);
  return pageMetadata({
    title: `${heading}, Fylde Coast`,
    description: `${heading}: ${topic.intro} A local guide from FYStay, with places to stay in ${destination.name}.`,
    path: `/destinations/${destination.slug}/${topic.slug}`,
    // Thin pages stay out of search results until they have enough real content.
    robots: isIndexableTopic(topic, entries.length) ? undefined : { index: false, follow: true },
  });
}

export default async function TownTopicPage({ params }: { params: Promise<Params> }) {
  const { slug, topic: topicSlug } = await params;
  const destination = findDestination(slug);
  const topic = findTopic(topicSlug);
  const guide = destination ? LOCAL_GUIDES[destination.slug] : undefined;
  if (!destination || !topic || !guide) notFound();

  const heading = topicHeading(topic, destination.name);
  const townPath = `/destinations/${destination.slug}`;
  const pagePath = `${townPath}/${topic.slug}`;

  // The richer sections need the town's full set of live sources; plain lists only need its places.
  const sources = topic.kind === "category" ? null : await loadConciergeSources(destination.slug);
  const snapshot = sources ? buildConciergeSnapshot(sources, null) : null;
  const entries = await entriesFor(destination.slug, topic);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: destination.name, item: `${SITE_URL}${townPath}` },
      { "@type": "ListItem", position: 3, name: topic.label, item: `${SITE_URL}${pagePath}` },
    ],
  };
  const listJsonLd =
    entries.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: heading,
          itemListElement: entries.map((entry, i) => ({ "@type": "ListItem", position: i + 1, name: entry.name })),
        }
      : null;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      {listJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd).replace(/</g, "\\u003c") }} />
      )}

      <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
        <Link href="/" className="hover:text-brand-700 hover:underline">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href={townPath} className="hover:text-brand-700 hover:underline">{destination.name}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{topic.label}</span>
      </nav>

      <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl">{heading}</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-700">
        {destination.description} {topic.intro}
      </p>

      {topic.kind === "category" && <EntryList entries={entries} townName={destination.name} />}

      {topic.kind === "hidden-gems" && snapshot && (
        <>
          <HiddenGems destinationName={destination.name} recommendations={snapshot.nearby} />
          {entries.length > 0 && <EntryList entries={entries} townName={destination.name} />}
        </>
      )}
      {topic.kind === "perfect-days" && (
        <PerfectDays townSlug={destination.slug} destinationName={destination.name} fromListing={null} />
      )}
      {topic.kind === "whats-on" && snapshot && (
        <>
          <WhatsOn destinationName={destination.name} events={snapshot.events} checkIn={null} checkOut={null} />
          {entries.length > 0 && <EntryList entries={entries} townName={destination.name} />}
        </>
      )}
      {topic.kind === "local-tips" && (
        <LocalKnowledge destinationName={destination.name} slug={destination.slug} fromListing={null} />
      )}

      <section className="mt-10 rounded-2xl border border-brand-100 bg-brand-50 p-6">
        <h2 className="font-serif text-xl font-bold text-brand-900">Stay in {destination.name}</h2>
        <p className="mt-1 text-sm text-brand-900/80">Independent holiday homes, apartments and guest houses from local hosts, with the full price shown before you book.</p>
        <Link href={townPath} className="focus-ring mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800">
          See stays in {destination.name}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      <nav aria-label={`More about ${destination.name}`} className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">More about {destination.name}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {TOWN_TOPICS.filter((t) => t.slug !== topic.slug).map((t) => (
            <li key={t.slug}>
              <Link
                href={`${townPath}/${t.slug}`}
                className="focus-ring inline-flex rounded-full border border-border-subtle bg-surface px-3.5 py-1.5 text-sm text-stone-700 hover:border-brand-200 hover:text-brand-800"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function EntryList({ entries, townName }: { entries: TopicEntry[]; townName: string }) {
  if (entries.length === 0) return null;
  const curated = entries.filter((e) => e.source === "curated");
  const local = entries.filter((e) => e.source === "local");
  return (
    <div className="mt-8 flex flex-col gap-10">
      {curated.length > 0 && (
        <ul className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface px-6">
          {curated.map((entry) => (
            <li key={entry.name} className="py-5">
              <p className="font-semibold text-foreground">{entry.name}</p>
              {entry.note && <p className="mt-1 text-sm leading-relaxed text-stone-600">{entry.note}</p>}
            </li>
          ))}
        </ul>
      )}
      {local.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground">More in {townName}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {local.map((entry) => (
              <li key={entry.name} className="rounded-xl border border-border-subtle bg-surface p-4">
                <p className="font-medium text-foreground">{entry.name}</p>
                {entry.note && <p className="mt-0.5 text-sm text-stone-600">{entry.note}</p>}
                {entry.website && (
                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="focus-ring mt-1.5 inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                  >
                    Website <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
