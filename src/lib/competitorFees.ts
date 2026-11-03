import { HOST_COMMISSION_RATE } from "@/lib/pricing";

/**
 * What other booking sites say they charge hosts, for the comparison on the
 * "List your place" page. Taken from each site's own published pages; they
 * change, so the page shows when they were last checked and links the
 * source. Re-check both before changing the date (docs/marketplace-audit-2026-11-03.md).
 *
 * - Airbnb (UK): a single 15.5% service fee paid by the host, which covers
 *   processing guest payments; exceptions apply (Brazil and Mexico are 16%).
 * - Booking.com: its partner help says commission varies by country and
 *   property type, roughly 10% to 25%; a partner's own rate is in their
 *   contract. (Its partner pages block automated reading, so the range is
 *   from its help text as search returns it.)
 */
export const FEES_CHECKED_ON = "3 November 2026";

export const AIRBNB_FEE_RATE = 0.155;
export const BOOKING_COM_FEE_RANGE = { low: 0.1, high: 0.25 } as const;

export const FEE_SOURCES = {
  airbnb: "https://www.airbnb.co.uk/resources/hosting-homes/a/how-much-does-airbnb-charge-hosts-288",
  bookingCom: "https://partner.booking.com/en-us/get-regional-support/how-much-does-bookingcom-charge-commission",
} as const;

export type EarningsComparison = {
  /** What the guest pays for the stay, in pence. */
  stayCents: number;
  fystay: number;
  airbnb: number;
  bookingComBest: number;
  bookingComWorst: number;
};

/** What a host keeps from one stay on each site, in pence, before tax: the stay price less each site's fee. */
export function compareHostEarnings(nightlyPounds: number, nights: number): EarningsComparison {
  const nightly = Number.isFinite(nightlyPounds) ? Math.max(0, nightlyPounds) : 0;
  const count = Number.isFinite(nights) ? Math.max(0, Math.floor(nights)) : 0;
  const stayCents = Math.round(nightly * 100) * count;
  const keep = (rate: number) => stayCents - Math.round(stayCents * rate);
  return {
    stayCents,
    fystay: keep(HOST_COMMISSION_RATE),
    airbnb: keep(AIRBNB_FEE_RATE),
    bookingComBest: keep(BOOKING_COM_FEE_RANGE.low),
    bookingComWorst: keep(BOOKING_COM_FEE_RANGE.high),
  };
}
