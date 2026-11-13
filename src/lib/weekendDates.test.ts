import { describe, expect, it } from "vitest";
import { format } from "date-fns";
import { upcomingWeekends } from "@/lib/weekendDates";

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

describe("upcomingWeekends", () => {
  it("on a Monday gives this coming Friday to Sunday, then the next", () => {
    const [first, second] = upcomingWeekends(new Date(2026, 10, 16)); // Mon 16 Nov 2026
    expect([ymd(first.from), ymd(first.to)]).toEqual(["2026-11-20", "2026-11-22"]);
    expect([ymd(second.from), ymd(second.to)]).toEqual(["2026-11-27", "2026-11-29"]);
  });

  it("on a Friday starts today", () => {
    const [first] = upcomingWeekends(new Date(2026, 10, 20, 18, 30));
    expect(ymd(first.from)).toBe("2026-11-20");
  });

  it("on a Saturday or Sunday skips the weekend already under way", () => {
    expect(ymd(upcomingWeekends(new Date(2026, 10, 21))[0].from)).toBe("2026-11-27");
    expect(ymd(upcomingWeekends(new Date(2026, 10, 22))[0].from)).toBe("2026-11-27");
  });

  it("keeps a weekend across a month end and the clock change", () => {
    const [first] = upcomingWeekends(new Date(2026, 9, 26)); // Mon 26 Oct 2026 (clocks go back that day)
    expect([ymd(first.from), ymd(first.to)]).toEqual(["2026-10-30", "2026-11-01"]);
  });
});
