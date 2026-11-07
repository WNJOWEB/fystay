import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, BedDouble, CalendarCheck2, ChevronRight, PoundSterling, Ticket, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { summarizeExtrasRevenue, summarizePlatformFinancials } from "@/lib/adminSummary";
import { formatPrice, formatStayDate } from "@/lib/format";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatCard } from "@/components/host/StatCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, type BadgeProps } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false } };

const BOOKING_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "neutral",
  COMPLETED: "brand",
  REFUNDED: "neutral",
};

/**
 * The platform-wide operational overview - what FYStay as a business is
 * doing, not any one host's or guest's own view of it. Every number here
 * is a live read off the real tables (same principle as the local-data
 * admin page's own comment), never a separate metrics pipeline that could
 * drift out of sync with what the site is actually serving.
 */
export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  const [
    usersByRole,
    listingCounts,
    hotelListingCount,
    bookingsByStatus,
    paidBookings,
    bookingExtras,
    recentBookings,
    openDisputes,
    openTickets,
    openReviewReports,
    listingsNotLive,
    requestsAwaitingHost,
    openDeliveryFailures,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.listing.aggregate({
      _count: true,
      where: { published: true },
    }),
    prisma.listing.count({ where: { propertyType: "HOTEL" } }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.booking.findMany({
      where: { paymentStatus: { not: "UNPAID" } },
      select: {
        paymentStatus: true,
        totalPriceCents: true,
        serviceFeeCents: true,
        hostCommissionCents: true,
        taxCents: true,
        creditAppliedCents: true,
        promoDiscountCents: true,
        refundedAmountCents: true,
      },
    }),
    prisma.bookingExtra.findMany({
      select: { status: true, priceCents: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        reference: true,
        guestName: true,
        status: true,
        totalPriceCents: true,
        checkIn: true,
        createdAt: true,
        listing: { select: { title: true } },
      },
    }),
    prisma.paymentDispute.count({
      where: { status: { in: ["WARNING_NEEDS_RESPONSE", "WARNING_UNDER_REVIEW", "NEEDS_RESPONSE", "UNDER_REVIEW"] } },
    }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.reviewReport.count({ where: { status: "OPEN" } }),
    prisma.listing.count({ where: { published: false, suspendedAt: null } }),
    prisma.booking.count({ where: { approvalStatus: "AWAITING" } }),
    prisma.deliveryFailure.count({ where: { resolvedAt: null } }),
  ]);

  // What needs a person today, most urgent first (a chargeback has a Stripe deadline).
  const attention = [
    { label: "Open chargebacks", count: openDisputes, href: "/admin/disputes" },
    { label: "Support tickets", count: openTickets, href: "/admin/support-tickets" },
    { label: "Reported reviews", count: openReviewReports, href: "/admin/review-reports" },
    { label: "Booking requests waiting for a host", count: requestsAwaitingHost, href: "/admin/bookings" },
    { label: "Listings not live yet", count: listingsNotLive, href: "/admin/listings" },
    { label: "Failed emails and webhooks", count: openDeliveryFailures, href: "/admin/failures" },
  ];
  const needsAttention = attention.filter((row) => row.count > 0);

  const totalListings = await prisma.listing.count();
  const totalUsers = usersByRole.reduce((sum, r) => sum + r._count, 0);
  const hostCount = usersByRole.find((r) => r.role === "HOST")?._count ?? 0;
  const guestCount = usersByRole.find((r) => r.role === "GUEST")?._count ?? 0;

  const financials = summarizePlatformFinancials(paidBookings);
  const extrasFinancials = summarizeExtrasRevenue(bookingExtras);
  const activeBookingsCount =
    (bookingsByStatus.find((b) => b.status === "PENDING")?._count ?? 0) +
    (bookingsByStatus.find((b) => b.status === "CONFIRMED")?._count ?? 0);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin overview</h1>
      

      <div className="mt-6">
        <AdminNav active="/admin" />
      </div>

      <section className="mt-6" aria-labelledby="attention-title">
        <SectionHeading icon={AlertCircle} id="attention-title">
          Needs attention
        </SectionHeading>
        {needsAttention.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">Nothing waiting.</p>
        ) : (
          <Card className="mt-3">
            <ul className="divide-y divide-border-subtle">
              {needsAttention.map((row) => (
                <li key={row.href}>
                  <Link href={row.href} className="focus-ring flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface-muted">
                    <span className="text-stone-700">{row.label}</span>
                    <span className="flex items-center gap-2 font-semibold tabular-nums text-foreground">
                      {row.count}
                      <ChevronRight className="h-4 w-4 text-stone-400" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={PoundSterling}
          label="Booking value"
          value={formatPrice(financials.grossBookingValueCents)}
          sublabel={`${financials.paidBookingsCount} paid booking${financials.paidBookingsCount === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={PoundSterling}
          label="Platform revenue"
          value={formatPrice(financials.platformRevenueCents)}
          sublabel="Commission"
        />
        <StatCard
          icon={Ticket}
          label="Extras revenue"
          value={formatPrice(extrasFinancials.extrasRevenueCents)}
          sublabel={`${extrasFinancials.paidExtrasCount} paid extra${extrasFinancials.paidExtrasCount === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={Users}
          label="Users"
          value={totalUsers.toLocaleString()}
          sublabel={`${hostCount} hosts · ${guestCount} guests`}
        />
        <StatCard
          icon={BedDouble}
          label="Listings"
          value={totalListings.toLocaleString()}
          sublabel={`${listingCounts._count} published · ${hotelListingCount} hotels`}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <div className="mt-6">
        <SectionHeading icon={CalendarCheck2}>Bookings by status</SectionHeading>
        <div className="mt-3 flex flex-wrap gap-2">
          {bookingsByStatus.map((row) => (
            <Badge key={row.status} variant={BOOKING_STATUS_VARIANT[row.status] ?? "neutral"}>
              {row.status} · {row._count}
            </Badge>
          ))}
          {activeBookingsCount === 0 && bookingsByStatus.length === 0 && (
            <p className="text-sm text-stone-500">No bookings yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading icon={CalendarCheck2}>Recent bookings</SectionHeading>
        {recentBookings.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No bookings yet.</p>
        ) : (
          <Card className="mt-3">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-xs font-medium uppercase tracking-wide text-stone-500">
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Listing</th>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Check-in</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3">
                          <Link
                            href={`/bookings/${booking.id}`}
                            className="font-mono text-xs font-medium text-brand-700 hover:underline"
                          >
                            {booking.reference}
                          </Link>
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-stone-700">
                          {booking.listing.title}
                        </td>
                        <td className="px-4 py-3 text-stone-700">{booking.guestName ?? "—"}</td>
                        <td className="px-4 py-3 text-stone-700">{formatStayDate(booking.checkIn)}</td>
                        <td className="px-4 py-3 tabular-nums text-stone-700">
                          {formatPrice(booking.totalPriceCents)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={BOOKING_STATUS_VARIANT[booking.status] ?? "neutral"}>
                            {booking.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
