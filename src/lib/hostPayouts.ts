import type Stripe from "stripe";
import type { DisputeStatus, Prisma, PrismaClient } from "@prisma/client";
import { isConnectReady } from "@/lib/stripeConnect";
import { reportError } from "@/lib/observability";

/**
 * When a host's share reaches their bank (owner's decision, 3 Nov 2026: the
 * industry standard - about a day after the guest checks in, once they have
 * arrived and the stay is under way; Airbnb pays about 24 hours after
 * check-in, Booking.com after the stay. This replaces the 16-17 Oct choice of
 * holding everything for the maximum 89 days).
 *
 * The guest's payment is still a destination charge, so the host's share
 * lands in their Stripe balance when the guest pays, and a refund still
 * reverses it from there. What changes is the payout to the bank: host
 * accounts are on manual payouts, and the daily host-payouts cron pays out
 * only what no unreleased booking still needs. A booking's share is released
 * the day after check-in (the check-in date is stored as midnight UTC, and
 * the cron runs at 11:00 UTC), and never less than a day after the guest paid
 * - so a same-day booking, or one inside the 24-hour free-cancellation
 * window, is still held while that refund can happen.
 *
 * Two safety rules: a booking with an open chargeback stays held, and no
 * share is held beyond 89 days after payment, because Stripe pays manually
 * held funds in the UK out itself after 90 days (a stay booked more than
 * about 3 months ahead is therefore paid out before it starts).
 */
export const PAYOUT_DELAY_HOURS = 24;
export const MAX_HOLD_DAYS = 89;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function hostPayoutReleaseAt(booking: { paidAt: Date; checkIn: Date }): Date {
  const afterCheckIn = booking.checkIn.getTime() + PAYOUT_DELAY_HOURS * HOUR_MS;
  const afterPayment = booking.paidAt.getTime() + PAYOUT_DELAY_HOURS * HOUR_MS;
  const cap = booking.paidAt.getTime() + MAX_HOLD_DAYS * DAY_MS;
  return new Date(Math.min(Math.max(afterCheckIn, afterPayment), cap));
}

type HeldBooking = {
  paidAt: Date | null;
  checkIn: Date;
  /** A chargeback on this booking is still open. */
  hasOpenDispute?: boolean;
  totalPriceCents: number;
  applicationFeeCents: number | null;
  changeRequests: { applicationFeeCents: number | null }[];
};

/**
 * What a host's Stripe balance must keep for bookings not yet released: each
 * booking's current total less FYStay's fees on it (the original charge's
 * and any paid date change's) - the share Stripe moved to the host.
 */
export function heldHostShareCents(bookings: HeldBooking[], now: Date): number {
  return bookings.reduce((sum, booking) => {
    if (!booking.paidAt) return sum;
    const releaseAt = hostPayoutReleaseAt({ paidAt: booking.paidAt, checkIn: booking.checkIn });
    const capAt = booking.paidAt.getTime() + MAX_HOLD_DAYS * DAY_MS;
    // Released once its time has come - unless a chargeback is open, which holds it until Stripe's own limit.
    if (releaseAt <= now && !(booking.hasOpenDispute && now.getTime() < capAt)) return sum;
    const fees =
      (booking.applicationFeeCents ?? 0) +
      booking.changeRequests.reduce((total, change) => total + (change.applicationFeeCents ?? 0), 0);
    return sum + Math.max(0, booking.totalPriceCents - fees);
  }, 0);
}

/** Bookings whose host share may still be held (paid through Connect, not cancelled). */
export function heldBookingsWhere(hostId: string): Prisma.BookingWhereInput {
  return {
    listing: { hostId },
    hostPaidViaConnect: true,
    paidAt: { not: null },
    status: { in: ["CONFIRMED", "COMPLETED"] },
    paymentStatus: { in: ["PAID", "PARTIALLY_REFUNDED"] },
  };
}

/** A chargeback that has not been decided yet. */
const OPEN_DISPUTE_STATUSES: DisputeStatus[] = ["WARNING_NEEDS_RESPONSE", "WARNING_UNDER_REVIEW", "NEEDS_RESPONSE", "UNDER_REVIEW"];

export const MANUAL_PAYOUTS: Stripe.BalanceSettingsUpdateParams = {
  payments: { payouts: { schedule: { interval: "manual" } } },
};

/** Puts a host's account on manual payouts, if it isn't already. */
export async function ensureManualPayouts(stripe: Stripe, accountId: string): Promise<void> {
  const settings = await stripe.balanceSettings.retrieve({}, { stripeAccount: accountId });
  if (settings.payments?.payouts?.schedule?.interval === "manual") return;
  await stripe.balanceSettings.update(MANUAL_PAYOUTS, { stripeAccount: accountId });
}

export type HostPayoutResult = { accountId: string; paidOutCents: number; heldCents: number; error?: string };

/**
 * Pays out each host's released money: their available GBP balance less what
 * their unreleased stays still need. Refunds and reversals have already come
 * out of that balance, so it never pays out money a guest got back. One
 * host's failure never stops the others.
 */
export async function runHostPayouts(stripe: Stripe, db: PrismaClient, now = new Date()): Promise<HostPayoutResult[]> {
  const hosts = await db.user.findMany({
    where: { stripeConnectAccountId: { not: null } },
    select: { id: true, stripeConnectAccountId: true, stripeConnectChargesEnabled: true, stripeConnectPayoutsEnabled: true },
  });
  const results: HostPayoutResult[] = [];
  for (const host of hosts) {
    const accountId = host.stripeConnectAccountId!;
    if (!isConnectReady(host)) continue;
    try {
      await ensureManualPayouts(stripe, accountId);
      const bookings = await db.booking.findMany({
        where: heldBookingsWhere(host.id),
        select: {
          paidAt: true,
          checkIn: true,
          totalPriceCents: true,
          applicationFeeCents: true,
          changeRequests: { where: { paidAt: { not: null } }, select: { applicationFeeCents: true } },
          disputes: { where: { status: { in: OPEN_DISPUTE_STATUSES } }, select: { id: true }, take: 1 },
        },
      });
      const heldCents = heldHostShareCents(
        bookings.map(({ disputes, ...booking }) => ({ ...booking, hasOpenDispute: disputes.length > 0 })),
        now,
      );
      const balance = await stripe.balance.retrieve({}, { stripeAccount: accountId });
      const availableCents = balance.available.find((entry) => entry.currency === "gbp")?.amount ?? 0;
      const amount = availableCents - heldCents;
      if (amount > 0) {
        await stripe.payouts.create(
          { amount, currency: "gbp", description: "FYStay payout", metadata: { fystay_user_id: host.id } },
          { stripeAccount: accountId, idempotencyKey: `host-payout:${accountId}:${now.toISOString().slice(0, 10)}:${amount}` },
        );
      }
      results.push({ accountId, paidOutCents: Math.max(0, amount), heldCents });
    } catch (error) {
      reportError(error, { area: "payments", message: `Host payout failed for ${accountId}` });
      results.push({ accountId, paidOutCents: 0, heldCents: 0, error: error instanceof Error ? error.message : "unknown" });
    }
  }
  return results;
}
