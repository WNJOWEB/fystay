import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("@/lib/prisma", () => ({ prisma: { deliveryFailure: { create: (...a: unknown[]) => create(...a) } } }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

import { describeError, recordDeliveryFailure } from "./deliveryFailures";

beforeEach(() => {
  create.mockReset().mockResolvedValue({ id: "f1" });
});

describe("describeError", () => {
  it("gives the error's name and message, and nothing else", () => {
    expect(describeError(new TypeError("bad input"))).toBe("TypeError: bad input");
    expect(describeError("oops")).toBe("Unknown error");
  });

  it("keeps the reason short", () => {
    expect(describeError(new Error("x".repeat(2000))).length).toBeLessThanOrEqual(500);
  });
});

describe("recordDeliveryFailure", () => {
  it("stores the kind, label and reason", async () => {
    await recordDeliveryFailure({ kind: "EMAIL", label: "Your booking", reason: "Error: refused" });
    expect(create).toHaveBeenCalledWith({
      data: { kind: "EMAIL", label: "Your booking", reason: "Error: refused" },
    });
  });

  it("truncates long labels and reasons so one row can't grow without limit", async () => {
    await recordDeliveryFailure({ kind: "WEBHOOK", label: "L".repeat(999), reason: "R".repeat(999) });
    const data = create.mock.calls[0][0].data;
    expect(data.label).toHaveLength(200);
    expect(data.reason).toHaveLength(500);
  });

  it("never throws, even when the database write fails", async () => {
    create.mockRejectedValueOnce(new Error("database down"));
    await expect(recordDeliveryFailure({ kind: "EMAIL", label: "x", reason: "y" })).resolves.toBeUndefined();
  });
});
