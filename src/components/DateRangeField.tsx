"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export function DateRangeField({
  id,
  range,
  onChange,
  disabledRanges,
  minNights = 1,
  maxNights,
}: {
  /** On the trigger button, so another control (e.g. "Choose your dates") can open the calendar. */
  id?: string;
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabledRanges: Matcher[];
  /** In nights, not calendar days - passed straight through as react-day-picker's day-count min/max. */
  minNights?: number;
  maxNights?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const label = range?.from
    ? range.to
      ? `${dateFormatter.format(range.from)} – ${dateFormatter.format(range.to)}`
      : `${dateFormatter.format(range.from)} – Add checkout`
    : "Add dates";

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-ring flex w-full items-center gap-2 rounded-lg border border-border-subtle px-3 py-2.5 text-left text-sm hover:border-stone-300",
          !range?.from && "text-stone-500",
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-stone-400" />
        {label}
      </button>

      {open && (
        <>
          {/* A phone: the calendar rises from the bottom as a sheet over a dimmed page, so
              nothing about the booking form is hidden behind it. From sm it is a popover. */}
          <div aria-hidden className="fixed inset-0 z-[60] bg-black/40 sm:hidden" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Choose check-in and check-out dates"
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[90svh] overflow-y-auto rounded-t-2xl border-t border-border-subtle bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-foreground shadow-[var(--shadow-popover)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-full sm:z-[60] sm:mt-2 sm:max-h-none sm:w-max sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:overflow-x-auto sm:rounded-2xl sm:border sm:p-3 sm:pb-3"
          >
            <div className="mb-2 sm:hidden">
              <p className="text-base font-semibold">Choose your dates</p>
              <p className="text-sm text-stone-600">
                {range?.from && !range.to
                  ? "Now choose your check-out day."
                  : minNights > 1
                    ? `${minNights}-night minimum stay.`
                    : "Choose your check-in, then check-out."}
              </p>
            </div>
            <div className="flex justify-center">
              <DayPicker
                mode="range"
                min={minNights}
                max={maxNights ?? undefined}
                selected={range}
                onSelect={(next) => {
                  onChange(next);
                  if (next?.from && next?.to) setOpen(false);
                }}
                disabled={disabledRanges}
                numberOfMonths={1}
                startMonth={new Date()}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 sm:hidden">
              <button
                type="button"
                onClick={() => onChange(undefined)}
                disabled={!range?.from}
                className="focus-ring h-11 rounded-xl px-4 text-sm font-semibold text-brand-700 underline disabled:text-stone-400 disabled:no-underline"
              >
                Clear dates
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring h-11 rounded-xl bg-brand-700 px-6 text-sm font-semibold text-white hover:bg-brand-800"
              >
                {range?.from && range.to ? "Done" : "Close"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
