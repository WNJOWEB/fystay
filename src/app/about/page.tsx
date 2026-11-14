import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description: "Why FYStay - For Your Stay - exists: a local holiday accommodation marketplace that started on Blackpool and the Fylde Coast.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 lg:py-20">
      {/* Title on the left, the story on the right: the page reads like the
          opening spread of a small magazine, not a centred form. */}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h1 className="text-4xl leading-[1.05] text-foreground sm:text-5xl">About FYStay</h1>
          <p className="mt-4 font-serif text-2xl italic text-brand-700">For Your Stay</p>
        </div>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-stone-700 lg:col-span-7">
          <p>
            FYStay stands for &ldquo;For Your Stay&rdquo;. It is a booking site for independent holiday
            accommodation, and a local alternative to the big platforms. We started on Blackpool and the
            Fylde Coast and plan to grow across Lancashire and the North West as local hosts join.
          </p>
          <p>
            Guests get a simple way to search, compare and book real local stays. Hosts get one dashboard
            for listings, availability, pricing and bookings, without a large cut taken from every booking.
          </p>
        </div>
      </div>

      <figure className="mt-14 lg:mt-20">
        <div className="relative aspect-[16/8] overflow-hidden ring-1 ring-black/5 sm:aspect-[21/9]">
          <Image
            src="/images/destinations/blackpool-hero.jpg"
            alt="Blackpool Tower and the pier at sunset, seen from the beach"
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-3 text-sm italic text-stone-500">Blackpool, where FYStay started</figcaption>
      </figure>

      <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-14">
        <h2 className="text-3xl sm:text-4xl lg:col-span-5">What we hold to</h2>
        <div className="flex flex-col gap-6 text-lg leading-relaxed text-stone-700 lg:col-span-7">
          <p>
            <span className="font-semibold text-foreground">Local, not corporate.</span> Every stay is listed
            directly by its own independent host, not resold or collected from a big chain.
          </p>
          <p>
            <span className="font-semibold text-foreground">Reviews from people who stayed.</span> Only guests
            who have completed a paid stay can leave a review, so ratings reflect real experiences.
          </p>
          <p>
            <span className="font-semibold text-foreground">Payments we never see.</span> Payment runs through
            Stripe&apos;s encrypted checkout. We never see or store your full card details.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/host" className={cn(buttonVariants({ size: "lg" }))}>
              Host your place
            </Link>
            <Link
              href="/"
              className="focus-ring rounded text-base font-medium text-brand-700 underline decoration-brand-300 underline-offset-[6px] hover:decoration-brand-700"
            >
              Browse stays
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
