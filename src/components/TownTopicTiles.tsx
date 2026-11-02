import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FyldeCoastDestination } from "@/lib/destinations";
import { TOWN_TOPICS } from "@/lib/townTopics";

/**
 * The town page's way into its guide: a tile per topic, each its own page
 * (see docs/town-pages-restructure.md), instead of one long page holding
 * every part of the guide at once. id="quick-discovery" is the anchor the
 * homepage's town cards and the town hero already link to.
 */
export function TownTopicTiles({ destination }: { destination: FyldeCoastDestination }) {
  return (
    <section id="quick-discovery" className="scroll-mt-16" aria-labelledby="town-guide-heading">
      <h2 id="town-guide-heading" className="text-xl font-bold text-foreground sm:text-2xl">
        Explore {destination.name}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        Our local guide to {destination.name}, one topic at a time.
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TOWN_TOPICS.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/destinations/${destination.slug}/${topic.slug}`}
              className="focus-ring group flex h-full items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface px-4 py-3.5 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:text-brand-800 hover:shadow-[var(--shadow-card-hover)]"
            >
              {topic.label}
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
