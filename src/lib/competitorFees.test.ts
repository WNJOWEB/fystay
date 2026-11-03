import { describe, expect, it } from "vitest";
import { AIRBNB_FEE_RATE, BOOKING_COM_FEE_RANGE, compareHostEarnings } from "./competitorFees";
import { hostCommissionFor } from "./pricing";

describe("compareHostEarnings", () => {
  it("takes each site's fee off the same stay", () => {
    const result = compareHostEarnings(100, 3); // £300
    expect(result.stayCents).toBe(30000);
    expect(result.fystay).toBe(30000 - hostCommissionFor(30000));
    expect(result.fystay).toBe(27000);
    expect(result.airbnb).toBe(30000 - Math.round(30000 * AIRBNB_FEE_RATE));
    expect(result.airbnb).toBe(25350);
    expect(result.bookingComBest).toBe(27000);
    expect(result.bookingComWorst).toBe(22500);
  });

  it("FYStay's own figure is whatever the real commission leaves", () => {
    for (const [price, nights] of [[89, 2], [255, 5], [47.5, 7]] as const) {
      const stay = Math.round(price * 100) * nights;
      expect(compareHostEarnings(price, nights).fystay).toBe(stay - hostCommissionFor(stay));
    }
  });

  it("is zero for empty or nonsense input", () => {
    expect(compareHostEarnings(0, 3).fystay).toBe(0);
    expect(compareHostEarnings(100, 0).airbnb).toBe(0);
    expect(compareHostEarnings(-5, 3).stayCents).toBe(0);
    expect(compareHostEarnings(Number.NaN, 2).stayCents).toBe(0);
  });

  it("keeps Booking.com's range ordered", () => {
    expect(BOOKING_COM_FEE_RANGE.low).toBeLessThan(BOOKING_COM_FEE_RANGE.high);
    const r = compareHostEarnings(120, 4);
    expect(r.bookingComBest).toBeGreaterThan(r.bookingComWorst);
  });
});
