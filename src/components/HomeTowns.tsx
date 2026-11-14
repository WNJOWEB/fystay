import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FYLDE_COAST_DESTINATIONS } from "@/lib/destinations";
import { DESTINATION_PHOTOS } from "@/lib/destinationPhotos";
import { DESTINATION_ART, FALLBACK_ART } from "@/components/destinationArt";
import { cn } from "@/lib/cn";
import { EditorialHeader } from "@/components/EditorialHeader";

/** What there is to do in each town, in the card's small caps line. */
const TOWN_TAGLINES: Record<string, string> = {
  blackpool: "The Tower, piers & Pleasure Beach",
  lytham: "The windmill, the green & boutique shops",
  "st-annes": "Sandy beach, pier & seafront gardens",
  "poulton-le-fylde": "Market square & historic streets",
  fleetwood: "Fishing port, market & the ferry",
  "thornton-cleveleys": "Open coast & promenade walks",
};

/**
 * How the six tiles are laid out from lg: Blackpool large and tall, then
 * tiles of different widths, so the grid has a composition instead of six
 * equal boxes. Below lg it is the swipe row and these do nothing.
 */
const MOSAIC_SPANS = [
  "lg:col-span-6 lg:row-span-2",
  "lg:col-span-6",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-5",
  "lg:col-span-7",
];

/**
 * The homepage's "Explore the Fylde Coast": a card per town, each opening the
 * things-to-do buttons of that town's Local Guide. Real photography where FYStay has it (DESTINATION_PHOTOS),
 * otherwise the same icon-and-gradient art as /destinations - never a
 * stand-in stock photo of another place. A swipeable row on phones and
 * tablets (the next card peeks in), a grid from lg.
 *
 * The row is out of flow inside a fixed-height wrapper below lg, the same
 * fix ListingsCarousel documents: an in-flow row wider than
 * the screen widens a phone's page-fit viewport.
 */
export function HomeTowns() {
  return (
    <section aria-labelledby="experiences-heading">
      <EditorialHeader
        id="experiences-heading"
        name="Explore the Fylde Coast"
        link={{ href: "/destinations", label: "View all" }}
      />

      <div className="relative h-[188px] min-[400px]:h-[198px] sm:h-[208px] lg:h-auto">
        <ul className="absolute inset-x-0 top-0 -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:gap-4 lg:static lg:mx-0 lg:grid lg:auto-rows-[12.5rem] lg:grid-cols-12 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {FYLDE_COAST_DESTINATIONS.map((destination, index) => {
            const art = DESTINATION_ART[destination.slug] ?? FALLBACK_ART;
            const Icon = art.icon;
            const photo = DESTINATION_PHOTOS[destination.slug]?.tile;
            return (
              <li
                key={destination.slug}
                className={cn(
                  "w-[46%] shrink-0 snap-start min-[400px]:w-[44%] sm:w-[30%] lg:h-full lg:w-auto",
                  MOSAIC_SPANS[index] ?? "lg:col-span-4",
                )}
              >
                <Link
                  href={`/destinations/${destination.slug}#quick-discovery`}
                  className={cn(
                    "focus-ring group relative flex h-[180px] flex-col justify-end overflow-hidden border-b-[3px] border-brand-500 bg-gradient-to-br p-3 shadow-[var(--shadow-card)] ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)] min-[400px]:h-[190px] sm:h-[200px] sm:p-4 lg:h-full lg:p-6",
                    art.gradient,
                  )}
                >
                  {photo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    </>
                  ) : (
                    <Icon className="absolute -right-3 -top-3 h-24 w-24 text-white/15 sm:h-32 sm:w-32" aria-hidden />
                  )}
                  <div className="relative flex items-end justify-between gap-1">
                    <div className="min-w-0">
                      <p className={cn("font-serif text-base font-bold leading-tight text-white min-[400px]:text-lg", index === 0 ? "lg:text-4xl" : "lg:text-2xl")}>
                        {destination.name}
                      </p>
                      <p className="mt-1 text-[11px] font-medium uppercase leading-snug tracking-[0.08em] text-white/90 min-[400px]:text-[11px] lg:text-xs">
                        {TOWN_TAGLINES[destination.slug]}
                      </p>
                    </div>
                    <ArrowRight className="mb-0.5 h-4 w-4 shrink-0 text-white transition-transform group-hover:translate-x-0.5 lg:h-5 lg:w-5" aria-hidden />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
