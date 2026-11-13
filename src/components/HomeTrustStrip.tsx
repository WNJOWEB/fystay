import { Lock, Receipt, Star } from "lucide-react";

// Three plain statements, each true of how FYStay works today (checkout shows
// the full price with no booking fee, reviews can only be left after a paid
// stay, and payment runs through Stripe's own page). Nothing counted or
// superlative: no figure here can go stale, and none is a claim FYStay can't back.
const ITEMS = [
  { icon: Receipt, text: "Full price shown before you pay" },
  { icon: Star, text: "Reviews only from guests who stayed" },
  { icon: Lock, text: "Secure payment with Stripe" },
] as const;

/** One quiet line of reassurance under the search, before the stays. */
export function HomeTrustStrip() {
  return (
    <ul
      aria-label="Why book with FYStay"
      className="mt-8 flex flex-col gap-2 text-sm text-stone-600 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8"
    >
      {ITEMS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
          {text}
        </li>
      ))}
    </ul>
  );
}
