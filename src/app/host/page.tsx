import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BecomeHostButton } from "@/components/BecomeHostButton";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { hostCommissionText } from "@/lib/pricingPolicy";
import { HostEarningsCalculator } from "@/components/HostEarningsCalculator";
import { smartPricingMode } from "@/lib/smartPricingMode";

const title = "List Your Holiday Let in Lancashire & the North West";
const description =
  "List your holiday home, apartment, lodge or guest house on FYStay - a local marketplace that started on Blackpool and the Fylde Coast and welcomes hosts across Lancashire and the North West. Reach guests directly, manage bookings from one dashboard, and see exactly what you earn.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/host` },
  openGraph: { title, description, url: `${SITE_URL}/host`, type: "website", images: [DEFAULT_SHARE_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [DEFAULT_SHARE_IMAGE] },
};

/**
 * Each reason is a direct, factual statement about how FYStay itself works -
 * never a claim about a competitor's algorithm or conversion rate, since none
 * of that is something this app could support. The one comparison made is on
 * fees (the "What you keep" section): each site's own published rate, linked
 * and dated (src/lib/competitorFees.ts), applied to the same stay.
 */
const REASONS = [
  {
    label: "Local",
    text: "FYStay is a regional site. Your listing sits alongside other local stays, and guests arrive having already chosen the area.",
  },
  {
    label: "One dashboard",
    text: "Your listing, calendar, availability, cancellation policy, bookings and reviews, in one place.",
  },
  {
    label: "Direct contact",
    text: "Once a booking is confirmed, the guest's contact details are on it. There is no anonymised relay or call centre in between.",
  },
  {
    label: "Plain fees",
    text: `You set your nightly rate, cleaning included. Guests pay exactly that, with no booking fees added. FYStay's only charge is a ${hostCommissionText(smartPricingMode())} commission on each booking, taken before your payout. No card fees, no subscription.`,
  },
];

const GOOD_TO_KNOW = [
  "Guests pay your price. No booking fee is added on top.",
  "Your share is paid to your bank the day after your guest checks in, through Stripe.",
  "You connect a Stripe account before guests can book.",
  "You choose your cancellation policy.",
  "Keeping the property safe and legal (gas, fire, electrics) is your responsibility.",
];

const STEPS = [
  {
    title: "1. Create your listing",
    description: "Add your property's title, description, location, price and details.",
  },
  {
    title: "2. Add real photos and amenities",
    description: "The details that help a guest choose your place with confidence.",
  },
  {
    title: "3. Set your availability and cancellation policy",
    description: "Flexible, Moderate, Strict, Non-refundable or a Custom policy - entirely your call.",
  },
  {
    title: "4. Publish and start hosting",
    description: "Manage bookings, message guests and respond to reviews from your dashboard.",
  },
];

export default async function BecomeAHostPage() {
  const session = await auth();
  const isHost = session?.user?.role === "HOST";
  // A signed-in guest upgrades this same account rather than registering a
  // second one (see /api/account/become-host).
  const isGuest = session?.user?.role === "GUEST";

  const ctaHref = isHost ? "/host/listings/new" : "/register?role=host";
  const ctaLabel = isHost ? "Add a new listing" : "List your property";
  const cta = (className: string) =>
    isGuest ? (
      <BecomeHostButton className={className}>{ctaLabel}</BecomeHostButton>
    ) : (
      <Link href={ctaHref} className={className}>
        {ctaLabel}
      </Link>
    );

  return (
    <div className="flex-1">
      {/* The hero is a composition, not a banner: the headline on the left,
          a local photograph in the brand's arch on the right, dropped a
          little so the two don't line up. One button; "how it works" is a
          plain link, not a second button competing with it. */}
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-14 pt-10 lg:grid-cols-12 lg:gap-14 lg:pb-24 lg:pt-16">
        <div className="lg:col-span-7 lg:pt-8">
          <h1 className="text-[2.5rem] leading-[1.04] text-foreground sm:text-5xl lg:text-[3.75rem]">
            Let your place to guests who came for the coast.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-700">
            {SITE_NAME} is a small booking site that started on the Fylde Coast. You set the nightly price.
            We take {hostCommissionText(smartPricingMode())} of each booking, and you are paid the day after your guest
            checks in.
          </p>
          <p className="mt-3 max-w-xl text-stone-600">
            For owners of holiday homes, apartments, lodges and guest houses across Lancashire and the North West.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            {cta(buttonVariants({ size: "lg" }))}
            <Link
              href="#how-it-works"
              className="focus-ring rounded text-base font-medium text-brand-700 underline decoration-brand-300 underline-offset-[6px] hover:decoration-brand-700"
            >
              How it works
            </Link>
          </div>
        </div>
        <figure className="mx-auto w-full max-w-sm lg:col-span-5 lg:mx-0 lg:max-w-none lg:translate-y-10">
          <div className="relative aspect-[4/5] overflow-hidden rounded-b-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 [border-top-left-radius:50%] [border-top-right-radius:50%]">
            <Image
              src="/images/destinations/cleveleys.jpg"
              alt="Evening light through a concrete porthole on the Cleveleys promenade, looking out over the sand to the sea"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm italic text-stone-500 lg:text-left">
            Cleveleys, on the Fylde Coast
          </figcaption>
        </figure>
      </section>

      {/* The money, on a dark band: the page's one change of mood, so the
          numbers are what a host remembers. The calculator sits on a cream
          sheet so it keeps its own light styling. */}
      <section id="what-you-keep" className="scroll-mt-20 bg-ink text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <div className="lg:col-span-5">
            <h2 className="text-3xl text-white sm:text-4xl">What you keep</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              FYStay takes {hostCommissionText(smartPricingMode())} of each booking. Nothing else.
            </p>
            <h3 className="mt-10 text-sm font-semibold uppercase tracking-wide text-white/60">Good to know</h3>
            <ul className="mt-3 divide-y divide-white/15 border-y border-white/15 text-white/90">
              {GOOD_TO_KNOW.map((line) => (
                <li key={line} className="py-3">
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/host-guide"
              className="focus-ring mt-6 inline-block rounded text-brand-200 underline underline-offset-4 hover:text-white"
            >
              Read the host guide
            </Link>
          </div>
          <div className="rounded-2xl bg-background p-5 text-foreground sm:p-7 lg:col-span-7 lg:self-start">
            <HostEarningsCalculator />
          </div>
        </div>
      </section>

      {/* Why a small site: a ruled list, label on the left and the plain
          sentence on the right - no cards, no icons. */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <h2 className="text-3xl sm:text-4xl lg:col-span-4">Why a small, local site</h2>
          <dl className="divide-y divide-border-subtle border-y border-border-subtle lg:col-span-8">
            {REASONS.map(({ label, text }) => (
              <div key={label} className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-8">
                <dt className="font-serif text-xl text-brand-800">{label}</dt>
                <dd className="leading-relaxed text-stone-700 sm:col-span-2">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Four steps as big serif numerals, each row stepped in a little
          further than the last, so the eye travels down the page. The title
          sits on the left, on the same grid as the section above. */}
      <section id="how-it-works" className="scroll-mt-20 bg-surface-muted">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24">
          <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <h2 className="text-3xl sm:text-4xl">How listing works</h2>
            <p className="mt-3 max-w-xs text-stone-600">Four steps from an empty dashboard to a bookable listing.</p>
            <Link
              href="/host-guide"
              className="focus-ring mt-6 inline-block rounded text-base font-medium text-brand-700 underline underline-offset-4"
            >
              Read the full host guide
            </Link>
          </div>
          <ol className="flex flex-col gap-8 sm:gap-10 lg:col-span-8">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex items-baseline gap-5 sm:gap-8"
                style={{ marginLeft: `min(${index * 2.5}rem, 12vw)` }}
              >
                <span aria-hidden className="font-serif text-6xl leading-none text-brand-500 sm:text-7xl">
                  {index + 1}
                </span>
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold text-foreground">{step.title.replace(/^\d+\.\s*/, "")}</h3>
                  <p className="mt-1 leading-relaxed text-stone-700">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The close is a photograph with one line and one button, left-aligned. */}
      <section className="relative isolate overflow-hidden bg-ink">
        <Image
          src="/images/destinations/lytham-st-annes.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover"
        />
        {/* A scrim so the words sit on clean ground, heaviest where they are. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink/75 sm:bg-gradient-to-r sm:from-ink/90 sm:via-ink/60 sm:to-ink/10" />
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <h2 className="max-w-xl text-3xl text-white sm:text-5xl">Ready when you are.</h2>
          <p className="mt-4 max-w-md text-lg text-white/85">
            It takes a few minutes to start a listing, and you choose when to publish it.
          </p>
          {cta(cn(buttonVariants({ size: "lg" }), "mt-8"))}
        </div>
      </section>
    </div>
  );
}
