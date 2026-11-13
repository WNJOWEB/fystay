import * as Sentry from "@sentry/nextjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { bookableHostWhere } from "@/lib/stripeConnect";
import { blockingBookingWhere } from "@/lib/availability";
import { LargeCardRail } from "@/components/LargeCardRail";
import { ListingCard } from "@/components/ListingCard";
import { EditorialHeader } from "@/components/EditorialHeader";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

/** The earliest approval date that still counts as "new". */
function newSince(now: Date): Date {
  return new Date(now.getTime() - WINDOW_DAYS * DAY_MS);
}
const MAX_NEW = 12;
// A shelf of one or two stays looks like a gap, not a feature, so it stays hidden.
const MIN_NEW = 3;

/**
 * "New on FYStay": the newest stays a host has had approved in the last 30
 * days, each a live, bookable listing. Shown only when there are at least
 * three, so a young catalogue never shows a thin row. Failures hide the row
 * rather than break the homepage.
 */
export async function NewOnFystay() {
  const [session, listings] = await Promise.all([
    auth().catch(() => null),
    prisma.listing
      .findMany({
        where: {
          published: true,
          suspendedAt: null,
          approvedAt: { gte: newSince(new Date()) },
          ...bookableHostWhere(),
        },
        orderBy: { approvedAt: "desc" },
        take: MAX_NEW,
        include: {
          reviews: { where: { status: "PUBLISHED" }, select: { rating: true } },
          bookings: { where: blockingBookingWhere(), select: { checkIn: true, checkOut: true } },
        },
      })
      .catch((error: unknown) => {
        console.error("Couldn't load New on FYStay", error);
        Sentry.captureException(error);
        return [];
      }),
  ]);

  if (listings.length < MIN_NEW) return null;

  return (
    <section className="mt-12 sm:mt-16" aria-labelledby="new-on-fystay-heading">
      <EditorialHeader id="new-on-fystay-heading" name="New on FYStay" link={{ href: "/search", label: "View all" }} />
      <LargeCardRail label="New on FYStay stays">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} isLoggedIn={Boolean(session?.user)} size="large" frame="editorial" />
        ))}
      </LargeCardRail>
    </section>
  );
}
