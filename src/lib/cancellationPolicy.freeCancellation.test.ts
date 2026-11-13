import { describe, expect, it } from "vitest";
import { freeCancellationDays, resolveCancellationPolicy } from "@/lib/cancellationPolicy";

describe("freeCancellationDays", () => {
  it("gives the days before check-in until which a full refund applies", () => {
    expect(freeCancellationDays(resolveCancellationPolicy({ cancellationPolicy: "FLEXIBLE" }))).toBe(1);
    expect(freeCancellationDays(resolveCancellationPolicy({ cancellationPolicy: "MODERATE" }))).toBe(5);
  });

  it("uses a custom policy's cutoff only when it refunds in full", () => {
    const full = resolveCancellationPolicy({
      cancellationPolicy: "CUSTOM",
      customCancellationCutoffDays: 14,
      customCancellationRefundPercent: 100,
    });
    expect(freeCancellationDays(full)).toBe(14);
    const half = resolveCancellationPolicy({
      cancellationPolicy: "CUSTOM",
      customCancellationCutoffDays: 14,
      customCancellationRefundPercent: 50,
    });
    expect(freeCancellationDays(half)).toBeNull();
  });

  it("is null for Strict, Non-refundable and No refund", () => {
    expect(freeCancellationDays(resolveCancellationPolicy({ cancellationPolicy: "STRICT" }))).toBeNull();
    expect(freeCancellationDays(resolveCancellationPolicy({ cancellationPolicy: "NON_REFUNDABLE" }))).toBeNull();
    const noRefund = resolveCancellationPolicy({
      cancellationPolicy: "CUSTOM",
      customCancellationCutoffDays: 7,
      customCancellationRefundPercent: 0,
    });
    expect(freeCancellationDays(noRefund)).toBeNull();
  });
});
