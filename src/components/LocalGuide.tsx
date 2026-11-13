import { Quote } from "lucide-react";
import { LOCAL_GUIDES } from "@/lib/localGuide";
import type { FyldeCoastDestination } from "@/lib/destinations";
import type { OriginListing } from "@/lib/guideLocation";
import { buildConciergeSnapshot, eventsToday, type ConciergeSources } from "@/lib/localData/concierge";
import { TodayInTown } from "@/components/TodayInTown";
import { NearYourStay } from "@/components/NearYourStay";
import { TownTopicTiles } from "@/components/TownTopicTiles";

/**
 * The FYStay Local Guide - the thing neither Airbnb nor Booking.com give a
 * guest: a full, premium concierge brief on the town itself, not just the
 * four walls being booked. The hero and the "Accommodation in X" listings
 * above this (see the destination page) are the only parts of the page not
 * owned by this component. It is deliberately short: the topic tiles into
 * the guide's own pages (/destinations/<town>/<topic>, see
 * docs/town-pages-restructure.md), the insider tip, today's weather and
 * events, and the distance-aware "near your stay" breakdown. Everything
 * else (places to eat, hidden gems, perfect days, what's on...) lives on
 * its own page.
 *
 * `fromListing`, when present (a guest arrived via a specific listing's
 * "Read the full Local Guide" link), makes the whole section
 * location-aware: real distance/walk/drive-time on every recommendation
 * that has coordinates, and "Near Your Stay" only renders its real content
 * once this is known.
 *
 * `conciergeSources` is the raw weather/places/editorial/events data the
 * page already fetched in parallel with `fromListing`; merging it into a
 * ranked snapshot happens here, synchronously, once both have resolved.
 */
export function LocalGuide({
  destination,
  fromListing,
  conciergeSources,
}: {
  destination: FyldeCoastDestination;
  fromListing: OriginListing | null;
  conciergeSources: ConciergeSources;
}) {
  const guide = LOCAL_GUIDES[destination.slug];
  if (!guide) return null;

  const now = new Date();
  const snapshot = buildConciergeSnapshot(conciergeSources, fromListing);
  const todaysEvents = eventsToday(snapshot.events, now);

  return (
    <div className="mt-14 border-t border-border-subtle pt-8">
      <TownTopicTiles destination={destination} />

      <blockquote className="mt-10 flex gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <Quote className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
        <p className="text-sm italic leading-relaxed text-brand-900">{guide.insiderTip}</p>
      </blockquote>

      <TodayInTown
        destinationName={destination.name}
        weather={snapshot.weather}
        todaysEvents={todaysEvents}
        recommended={snapshot.recommendations}
      />

      <NearYourStay
        fromListing={fromListing}
        nearby={snapshot.nearby}
        guide={guide}
      />
    </div>
  );
}
