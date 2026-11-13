"use client";

import { useSyncExternalStore } from "react";
import { format, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import { upcomingWeekends } from "@/lib/weekendDates";

// Today as a string, known only in the browser: the server has no idea which
// day the visitor is on, so nothing is drawn until the browser says (and the
// first browser render matches the server's empty one).
const subscribe = () => () => {};
const todayKey = () => format(new Date(), "yyyy-MM-dd");
const serverKey = () => null;

/**
 * Two one-tap date fills under the search - the next two Friday-to-Sunday
 * weekends. They only fill in the dates; the guest still chooses where, and
 * the results show only stays that are free then.
 */
export function WeekendShortcuts({
  value,
  onPick,
  className,
}: {
  value: DateRange | undefined;
  onPick: (range: DateRange) => void;
  className?: string;
}) {
  const key = useSyncExternalStore(subscribe, todayKey, serverKey);
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  const weekends = upcomingWeekends(new Date(y, m - 1, d));

  return (
    <div role="group" aria-label="Weekend dates" className={cn("flex flex-wrap items-center gap-2", className)}>
      <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
      {weekends.map(({ from, to }) => {
        const selected = Boolean(value?.from && value.to && isSameDay(value.from, from) && isSameDay(value.to, to));
        return (
          <button
            key={from.toISOString()}
            type="button"
            aria-pressed={selected}
            aria-label={`Weekend, Friday ${format(from, "d MMMM")} to Sunday ${format(to, "d MMMM")}`}
            onClick={() => onPick({ from, to })}
            className={cn(
              "focus-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              selected
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-current/30 hover:border-current/60 hover:bg-white/10",
            )}
          >
            Weekend · {format(from, "d")}-{format(to, "d MMM")}
          </button>
        );
      })}
    </div>
  );
}
