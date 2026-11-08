import { CalendarCheck, Compass, MapPinned } from "lucide-react";

/**
 * Three plain steps for a guest who hasn't used FYStay before. Each claim is
 * one the booking flow already keeps: no booking fee on top of the host's
 * price, and the host's contact details on a confirmed booking.
 */
const STEPS = [
  {
    icon: Compass,
    title: "Find a stay",
    text: "Search by town, dates and guests, or explore the local guide.",
  },
  {
    icon: CalendarCheck,
    title: "Book with no booking fees",
    text: "Guests pay the host's price. Nothing is added on top.",
  },
  {
    icon: MapPinned,
    title: "Arrive knowing the area",
    text: "Your host's contact details are on your booking, and every town has a local guide.",
  },
];

export function HowItWorksStrip() {
  return (
    <section aria-labelledby="how-it-works-heading" className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
      <h2 id="how-it-works-heading" className="sr-only">
        How FYStay works
      </h2>
      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="flex items-start gap-3 border-t-[3px] border-brand-500 bg-surface px-4 py-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
            <div>
              <p className="font-serif text-lg font-bold text-brand-800">
                <span className="mr-1.5 text-brand-600">{index + 1}.</span>
                {title}
              </p>
              <p className="mt-1 text-sm text-stone-600">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
