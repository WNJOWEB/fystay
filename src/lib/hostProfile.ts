import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { bookableHostWhere } from "@/lib/stripeConnect";
import { computeHostResponseStats, isGreatHost } from "@/lib/hostStats";

/** The few facts a host's public page shows. Nothing private: no email, phone, address or earnings. */
export type HostPublicProfile = {
  id: string;
  name: string;
  image: string | null;
  hostingSinceYear: number;
  isIdentityVerified: boolean;
  isGreatHost: boolean;
  responseRate: number | null;
  medianResponseMinutes: number | null;
  reviewCount: number;
  averageRating: number | null;
  reviews: { id: string; rating: number; comment: string; createdAt: Date; authorFirstName: string; listingTitle: string }[];
  listings: {
    id: string;
    title: string;
    city: string;
    country: string;
    pricePerNightCents: number;
    weekendPricePerNightCents: number | null;
    weeklyDiscountPercent: number | null;
    monthlyDiscountPercent: number | null;
    photos: string[];
    amenities: string[];
    maxGuests: number;
    bedrooms: number;
    createdAt: Date;
    reviews: { rating: number }[];
  }[];
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "Guest";

/**
 * A host's public profile, or null when there isn't a real, active host to
 * show: no such user, not a host, suspended, deleted (anonymised), or with
 * no listing a guest can book - a page for someone nobody can stay with
 * would only be a dead end.
 */
export async function loadHostPublicProfile(hostId: string): Promise<HostPublicProfile | null> {
  const host = await prisma.user.findUnique({
    where: { id: hostId },
    select: { id: true, name: true, image: true, role: true, createdAt: true, deletedAt: true, suspendedAt: true, identityVerificationStatus: true },
  });
  if (!host || host.role !== "HOST" || host.deletedAt || host.suspendedAt) return null;

  const [listings, reviewStats, recentReviews, conversations, completedBookings] = await Promise.all([
    prisma.listing.findMany({
      where: { hostId, published: true, suspendedAt: null, ...bookableHostWhere() },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        city: true,
        country: true,
        pricePerNightCents: true,
        weekendPricePerNightCents: true,
        weeklyDiscountPercent: true,
        monthlyDiscountPercent: true,
        photos: true,
        amenities: true,
        maxGuests: true,
        bedrooms: true,
        createdAt: true,
        reviews: { where: { status: "PUBLISHED" }, select: { rating: true } },
      },
    }),
    prisma.review.aggregate({
      where: { status: "PUBLISHED", listing: { hostId } },
      _count: true,
      _avg: { rating: true },
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", listing: { hostId } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, rating: true, comment: true, createdAt: true, author: { select: { name: true } }, listing: { select: { title: true } } },
    }),
    prisma.conversation.findMany({
      where: { hostId, updatedAt: { gte: addDays(new Date(), -365) } },
      select: {
        hostId: true,
        guestId: true,
        messages: { select: { senderId: true, createdAt: true }, take: 20, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.booking.count({ where: { status: "COMPLETED", listing: { hostId } } }),
  ]);
  if (listings.length === 0) return null;

  const { responseRate, medianResponseMinutes } = computeHostResponseStats(conversations);
  return {
    id: host.id,
    name: host.name,
    image: host.image,
    hostingSinceYear: host.createdAt.getFullYear(),
    isIdentityVerified: host.identityVerificationStatus === "VERIFIED",
    isGreatHost: isGreatHost({ completedBookings, averageRating: reviewStats._avg.rating, responseRate }),
    responseRate,
    medianResponseMinutes,
    reviewCount: reviewStats._count,
    averageRating: reviewStats._avg.rating,
    reviews: recentReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      authorFirstName: firstName(review.author.name),
      listingTitle: review.listing.title,
    })),
    listings,
  };
}
