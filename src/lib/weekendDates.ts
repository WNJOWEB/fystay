import { addDays, getDay } from "date-fns";

/**
 * The next `count` Friday-to-Sunday weekends, as local-midnight dates for the
 * date picker. The first is the coming Friday, or today when today is Friday;
 * on a Saturday or Sunday that already-started weekend is skipped (check-in
 * would be in the past or a one-night stay), so the first is next weekend.
 */
export function upcomingWeekends(today: Date, count = 2): { from: Date; to: Date }[] {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const untilFriday = (5 - getDay(midnight) + 7) % 7;
  const firstFriday = addDays(midnight, untilFriday);
  return Array.from({ length: count }, (_, i) => {
    const from = addDays(firstFriday, i * 7);
    return { from, to: addDays(from, 2) };
  });
}
