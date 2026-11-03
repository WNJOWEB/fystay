"use client";

import { useState } from "react";
import { compareHostEarnings, AIRBNB_FEE_RATE, BOOKING_COM_FEE_RANGE, FEES_CHECKED_ON, FEE_SOURCES } from "@/lib/competitorFees";
import { HOST_COMMISSION_RATE } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

/** "What you'd keep": one stay, what a host is left with after each site's fee. */
export function HostEarningsCalculator() {
  const [nightly, setNightly] = useState("120");
  const [nights, setNights] = useState("3");
  const result = compareHostEarnings(Number(nightly), Number(nights));
  const has = result.stayCents > 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calc-nightly">Price a night (£)</Label>
          <Input id="calc-nightly" type="number" inputMode="decimal" min={0} value={nightly} onChange={(e) => setNightly(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="calc-nights">Nights</Label>
          <Input id="calc-nights" type="number" inputMode="numeric" min={1} value={nights} onChange={(e) => setNights(e.target.value)} />
        </div>
      </div>

      <dl className="mt-5 divide-y divide-border-subtle text-sm" aria-live="polite">
        <div className="flex items-baseline justify-between gap-3 pb-3">
          <dt className="font-semibold text-foreground">
            FYStay <span className="font-normal text-stone-500">· {pct(HOST_COMMISSION_RATE)}</span>
          </dt>
          <dd className="font-serif text-2xl font-bold text-brand-800">{has ? formatPrice(result.fystay) : "-"}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 py-3">
          <dt className="text-stone-700">
            Airbnb <span className="text-stone-500">· {pct(AIRBNB_FEE_RATE)}</span>
          </dt>
          <dd className="font-semibold text-stone-700">{has ? formatPrice(result.airbnb) : "-"}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-3">
          <dt className="text-stone-700">
            Booking.com{" "}
            <span className="text-stone-500">
              · {pct(BOOKING_COM_FEE_RANGE.low)}-{pct(BOOKING_COM_FEE_RANGE.high)}
            </span>
          </dt>
          <dd className="font-semibold text-stone-700">
            {has ? `${formatPrice(result.bookingComWorst)} - ${formatPrice(result.bookingComBest)}` : "-"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-stone-500">
        What you keep from one stay, before tax. Fees as published by each site on {FEES_CHECKED_ON}; they change, so check{" "}
        <a href={FEE_SOURCES.airbnb} target="_blank" rel="noopener noreferrer" className="underline">
          Airbnb
        </a>{" "}
        and{" "}
        <a href={FEE_SOURCES.bookingCom} target="_blank" rel="noopener noreferrer" className="underline">
          Booking.com
        </a>{" "}
        for yours. Booking.com&apos;s rate depends on country and property type.
      </p>
    </div>
  );
}
