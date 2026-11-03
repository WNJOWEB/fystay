import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, MessageCircle, Star, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ListingCard } from "@/components/ListingCard";
import { loadHostPublicProfile } from "@/lib/hostProfile";
import { formatResponseTime } from "@/lib/hostStats";
import { pageMetadata, SITE_URL } from "@/lib/seo";

type Params = { id: string };

// A thin page for most hosts at first (one or two stays), so it is kept out of
// search results; the listings it links to are what should rank.
const NOINDEX = { index: false, follow: true } as const;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await loadHostPublicProfile(id);
  if (!profile) return { robots: NOINDEX };
  return pageMetadata({
    title: `${profile.name}, host on FYStay`,
    description: `Stays hosted by ${profile.name} on FYStay.`,
    path: `/hosts/${profile.id}`,
    robots: NOINDEX,
  });
}

export default async function HostProfilePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [profile, session] = await Promise.all([loadHostPublicProfile(id), auth().catch(() => null)]);
  if (!profile) notFound();

  const savedIds = session?.user
    ? new Set(
        (
          await prisma.savedListing
            .findMany({ where: { userId: session.user.id, listingId: { in: profile.listings.map((l) => l.id) } }, select: { listingId: true } })
            .catch(() => [])
        ).map((saved) => saved.listingId),
      )
    : new Set<string>();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: profile.name, item: `${SITE_URL}/hosts/${profile.id}` },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar name={profile.name} src={profile.image} size={96} className="ring-2 ring-brand-50" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Host</p>
          <h1 className="mt-0.5 font-serif text-3xl font-bold text-foreground sm:text-4xl">{profile.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {profile.isGreatHost && (
              <Badge variant="brand" className="gap-1">
                <Award className="h-3 w-3" aria-hidden />
                Great Host
              </Badge>
            )}
            {profile.isIdentityVerified && (
              <Badge variant="success" className="gap-1">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Identity verified
              </Badge>
            )}
          </div>
        </div>
      </header>

      {profile.bio && <p className="mt-5 max-w-2xl whitespace-pre-line text-stone-700">{profile.bio}</p>}

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border-subtle py-4 text-sm">
        <div>
          <dt className="text-xs text-stone-500">Hosting since</dt>
          <dd className="font-semibold text-foreground">{profile.hostingSinceYear}</dd>
        </div>
        {profile.reviewCount > 0 && (
          <div>
            <dt className="text-xs text-stone-500">Reviews</dt>
            <dd className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden />
              {profile.averageRating?.toFixed(1)} · {profile.reviewCount}
            </dd>
          </div>
        )}
        {profile.responseRate !== null && (
          <div>
            <dt className="text-xs text-stone-500">Response rate</dt>
            <dd className="flex items-center gap-1 font-semibold text-foreground">
              <MessageCircle className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              {profile.responseRate}%
            </dd>
          </div>
        )}
        {profile.medianResponseMinutes !== null && (
          <div>
            <dt className="text-xs text-stone-500">Usually replies</dt>
            <dd className="flex items-center gap-1 font-semibold text-foreground">
              <Zap className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              {formatResponseTime(profile.medianResponseMinutes)}
            </dd>
          </div>
        )}
      </dl>

      <section className="mt-8" aria-labelledby="host-stays">
        <h2 id="host-stays" className="text-xl font-bold text-foreground">
          {profile.listings.length === 1 ? "Stay" : "Stays"} hosted by {profile.name.split(/\s+/)[0]}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {profile.listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={savedIds.has(listing.id)}
              isLoggedIn={Boolean(session?.user)}
            />
          ))}
        </div>
      </section>

      {profile.reviews.length > 0 && (
        <section className="mt-12" aria-labelledby="host-reviews">
          <h2 id="host-reviews" className="text-xl font-bold text-foreground">
            Recent reviews
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {profile.reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border-subtle bg-surface p-5">
                <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden />
                  {review.rating}
                  <span className="font-normal text-stone-500">
                    · {review.authorFirstName} · {review.createdAt.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </span>
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-stone-700">{review.comment}</p>
                <p className="mt-2 truncate text-xs text-stone-500">{review.listingTitle}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-sm text-stone-500">
        <Link href="/" className="text-brand-700 hover:underline">
          Back to FYStay
        </Link>
      </p>
    </div>
  );
}
