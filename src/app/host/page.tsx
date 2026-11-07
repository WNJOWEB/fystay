import type { Metadata } from "next";
import Link from "next/link";
import { BecomeHostButton } from "@/components/BecomeHostButton";
import {
  CalendarCheck,
  Camera,
  Handshake,
  House,
  LayoutDashboard,
  MapPin,
  PoundSterling,
  Rocket,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { DEFAULT_SHARE_IMAGE, SITE_URL } from "@/lib/seo";
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
 * Each reason is written as a direct, factual statement about how FYStay
 * itself works - never a claim about a competitor's algorithm or conversion
 * rate, since none of that is something this app could support. The one
 * comparison made is on fees (the "What you keep" section): each site's own
 * published rate, linked and dated (src/lib/competitorFees.ts), applied to
 * the same stay.
 */
const REASONS = [
  {
    icon: MapPin,
    title: "Seen locally",
    description:
      "Your place sits among a handful of local stays, not millions worldwide.",
  },
  {
    icon: Users,
    title: "Guests who chose the area",
    description:
      "People come to FYStay already set on the area.",
  },
  {
    icon: LayoutDashboard,
    title: "One simple dashboard",
    description:
      "Listing, calendar, bookings and reviews in one dashboard.",
  },
  {
    icon: Handshake,
    title: "A direct line to your guests",
    description:
      "Once a booking is confirmed, your guest has your contact details. No middleman.",
  },
  {
    icon: PoundSterling,
    title: "Clear fees",
    description:
      `Guests pay your price, with no booking fee added. FYStay takes ${hostCommissionText(smartPricingMode())} of each booking. No card fees, no subscription.`,
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
    icon: House,
    title: "1. Create your listing",
    description: "Add your property's title, description, location, price and details.",
  },
  {
    icon: Camera,
    title: "2. Add real photos and amenities",
    description: "The details that help a guest choose your place with confidence.",
  },
  {
    icon: CalendarCheck,
    title: "3. Set your availability and cancellation policy",
    description: "Flexible, Moderate, Strict, Non-refundable or a Custom policy - entirely your call.",
  },
  {
    icon: Rocket,
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
      {/* Full-bleed gradient hero, same brand-teal palette as the homepage
          hero and the search card's signature strip, so this reads as
          FYStay's own page rather than a bolted-on marketing microsite. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-400 sm:text-sm">
            For holiday let owners across the North West
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">
            List your place on FYStay
          </h1>
          <p className="mt-4 text-base text-white/85 sm:text-lg">
            A local booking site for the Fylde Coast and the North West. Reach guests who want to
            stay near you, and keep more of what they pay.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {cta(cn(buttonVariants({ size: "lg" }), "bg-white text-brand-800 hover:bg-white/90"))}
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 text-white hover:bg-white/10",
              )}
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Why list with FYStay
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title: reasonTitle, description: reasonDescription }) => (
            <div key={reasonTitle} className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-card)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-foreground">{reasonTitle}</p>
              <p className="text-sm leading-relaxed text-stone-600">{reasonDescription}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="what-you-keep" className="scroll-mt-20 border-t border-border-subtle bg-surface-muted">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-14 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">What you keep</h2>
            <p className="mt-1 text-sm text-stone-500">
              FYStay takes {hostCommissionText(smartPricingMode())} of each booking. Nothing else.
            </p>
            <h3 className="mt-6 text-sm font-semibold text-foreground">Good to know</h3>
            <ul className="mt-2 flex flex-col gap-2 text-sm text-stone-700">
              {GOOD_TO_KNOW.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  {line}
                </li>
              ))}
            </ul>
            <Link href="/host-guide" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
              Read the host guide →
            </Link>
          </div>
          <HostEarningsCalculator />
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-t border-border-subtle">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">How listing works</h2>
          <p className="mt-1 text-sm text-stone-500">
            Four steps from an empty dashboard to a bookable listing.
          </p>
          <div className="mt-8 flex flex-col gap-6">
            {STEPS.map(({ icon: StepIcon, ...step }) => (
              <div key={step.title} className="flex items-start gap-3">
                <StepIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-sm text-stone-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/host-guide"
            className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline"
          >
            Read the full host guide →
          </Link>
        </div>
      </section>

      <section className="px-6 py-14 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Ready to welcome your first guest?
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            It takes a few minutes to create a listing, and you choose when to publish it.
          </p>
          {cta(cn(buttonVariants({ size: "lg" }), "mt-6"))}
        </div>
      </section>
    </div>
  );
}
