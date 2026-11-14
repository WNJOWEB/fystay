// Three plain statements, each true of how FYStay works today (checkout shows
// the full price with no booking fee, reviews can only be left after a paid
// stay, and payment runs through Stripe's own page). Nothing counted or
// superlative: no figure here can go stale, and none is a claim FYStay can't back.
const ITEMS = [
  "Full price shown before you pay.",
  "Reviews only from guests who stayed.",
  "Secure payment with Stripe.",
] as const;

/**
 * One line of reassurance under the search, set as type rather than as a row
 * of icons: three short sentences in the display serif, split by a terracotta
 * slash, reading like a standing line on a shop sign.
 */
export function HomeTrustStrip() {
  return (
    <ul
      aria-label="Why book with FYStay"
      className="mt-9 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-serif text-lg leading-snug text-stone-700 sm:mt-12 sm:text-xl"
    >
      {ITEMS.map((text, index) => (
        <li key={text} className="flex items-baseline gap-3">
          {text}
          {/* The slash trails its sentence, so a wrapped line never starts
              with one; on a phone, where each sentence has its own line, it
              is dropped. */}
          {index < ITEMS.length - 1 && (
            <span aria-hidden className="hidden text-brand-500 sm:inline">
              /
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
