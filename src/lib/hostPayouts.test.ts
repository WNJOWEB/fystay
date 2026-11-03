import { describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import type { PrismaClient } from "@prisma/client";
import { heldHostShareCents, hostPayoutReleaseAt, runHostPayouts } from "./hostPayouts";

vi.mock("@/lib/observability", () => ({ reportError: vi.fn() }));
vi.mock("@/lib/stripe", () => ({ getStripeClient: () => null }));

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("hostPayoutReleaseAt", () => {
  it("releases the day after check-in", () => {
    expect(hostPayoutReleaseAt({ paidAt: day("2026-10-16"), checkIn: day("2026-11-17") })).toEqual(day("2026-11-18"));
  });

  it("holds a same-day booking for a day after it was paid, so a 24-hour refund can still come out of it", () => {
    const paidAt = new Date("2026-11-17T14:00:00Z");
    expect(hostPayoutReleaseAt({ paidAt, checkIn: day("2026-11-17") })).toEqual(new Date("2026-11-18T14:00:00Z"));
  });

  it("never holds money beyond 89 days after payment, Stripe's own limit (a stay booked far ahead is paid before it starts)", () => {
    expect(hostPayoutReleaseAt({ paidAt: day("2026-10-16"), checkIn: day("2027-06-01") })).toEqual(day("2027-01-13"));
  });
});

describe("heldHostShareCents", () => {
  const booking = {
    paidAt: day("2026-10-16"),
    checkIn: day("2026-11-17"),
    totalPriceCents: 50_000,
    applicationFeeCents: 5_000,
    changeRequests: [{ applicationFeeCents: 1_000 }],
  };

  it("holds the host's share until the day after check-in, net of FYStay's fees", () => {
    expect(heldHostShareCents([booking], day("2026-11-17"))).toBe(44_000);
  });

  it("holds nothing once the stay is released", () => {
    expect(heldHostShareCents([booking], day("2026-11-18"))).toBe(0);
  });

  it("keeps a booking with an open chargeback held after its release, until Stripe's own 90-day limit", () => {
    const disputed = { ...booking, hasOpenDispute: true };
    expect(heldHostShareCents([disputed], day("2026-12-01"))).toBe(44_000);
    expect(heldHostShareCents([disputed], day("2027-01-13"))).toBe(0);
  });

  it("ignores unpaid bookings", () => {
    expect(heldHostShareCents([{ ...booking, paidAt: null }], day("2026-10-20"))).toBe(0);
  });
});

describe("runHostPayouts", () => {
  function setup({ interval = "manual", available = 60_000 } = {}) {
    const stripe = {
      balanceSettings: {
        retrieve: vi.fn().mockResolvedValue({ payments: { payouts: { schedule: { interval } } } }),
        update: vi.fn().mockResolvedValue({}),
      },
      balance: { retrieve: vi.fn().mockResolvedValue({ available: [{ currency: "gbp", amount: available }] }) },
      payouts: { create: vi.fn().mockResolvedValue({ id: "po_1" }) },
    };
    const db = {
      user: {
        findMany: vi.fn().mockResolvedValue([
          { id: "host_1", stripeConnectAccountId: "acct_1", stripeConnectChargesEnabled: true, stripeConnectPayoutsEnabled: true },
          { id: "host_2", stripeConnectAccountId: "acct_2", stripeConnectChargesEnabled: false, stripeConnectPayoutsEnabled: false },
        ]),
      },
      booking: {
        findMany: vi.fn().mockResolvedValue([
          { paidAt: day("2026-10-16"), checkIn: day("2026-11-17"), totalPriceCents: 50_000, applicationFeeCents: 5_000, changeRequests: [], disputes: [] },
        ]),
      },
    };
    return { stripe, db };
  }

  it("pays out only what upcoming stays don't need, once a day", async () => {
    const { stripe, db } = setup();
    const results = await runHostPayouts(stripe as unknown as Stripe, db as unknown as PrismaClient, day("2026-10-20"));
    expect(stripe.payouts.create).toHaveBeenCalledTimes(1);
    expect(stripe.payouts.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 15_000, currency: "gbp" }),
      { stripeAccount: "acct_1", idempotencyKey: "host-payout:acct_1:2026-10-20:15000" },
    );
    expect(results).toEqual([{ accountId: "acct_1", paidOutCents: 15_000, heldCents: 45_000 }]);
  });

  it("pays out a released stay the day after check-in", async () => {
    const { stripe, db } = setup();
    const results = await runHostPayouts(stripe as unknown as Stripe, db as unknown as PrismaClient, day("2026-11-18"));
    expect(stripe.payouts.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 60_000 }), expect.anything());
    expect(results[0]).toMatchObject({ paidOutCents: 60_000, heldCents: 0 });
  });

  it("pays nothing while the balance is all held", async () => {
    const { stripe, db } = setup({ available: 45_000 });
    await runHostPayouts(stripe as unknown as Stripe, db as unknown as PrismaClient, day("2026-10-20"));
    expect(stripe.payouts.create).not.toHaveBeenCalled();
  });

  it("switches an account still on automatic payouts to manual", async () => {
    const { stripe, db } = setup({ interval: "daily" });
    await runHostPayouts(stripe as unknown as Stripe, db as unknown as PrismaClient, day("2026-10-20"));
    expect(stripe.balanceSettings.update).toHaveBeenCalledWith(
      { payments: { payouts: { schedule: { interval: "manual" } } } },
      { stripeAccount: "acct_1" },
    );
  });

  it("keeps going when one host fails", async () => {
    const { stripe, db } = setup();
    stripe.balance.retrieve.mockRejectedValueOnce(new Error("boom"));
    const results = await runHostPayouts(stripe as unknown as Stripe, db as unknown as PrismaClient, day("2026-10-20"));
    expect(results[0]).toMatchObject({ accountId: "acct_1", error: "boom" });
  });
});
