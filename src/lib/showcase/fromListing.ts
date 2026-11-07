import { PROPERTY_TYPE_LABEL } from "@/lib/propertyType";
import type { ShowcaseContent, ShowcasePhoto } from "@/lib/showcase/types";
import type { PropertyType } from "@prisma/client";

/** Up to this many photos open the phone's swipeable hero; the rest are one tap away in the gallery. */
const CAROUSEL_PHOTOS = 6;

type ListingForShowcase = {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  propertyType: PropertyType;
  photos: string[];
  pricePerNightCents: number;
  weekendPricePerNightCents: number | null;
  minNights: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
};

/**
 * The page's content for any listing, from what the host has already given:
 * the photos (the first is the hero, the rest the gallery), the name, the
 * place, the first line of the description as a tagline, and the facts.
 * Hosts with more to say (bedrooms, an evening section) get a richer page by
 * adding to this; a listing with nothing extra still gets a good one.
 */
export function showcaseFromListing(listing: ListingForShowcase): ShowcaseContent {
  const photoAt = (src: string, i: number): ShowcasePhoto => ({ src, alt: `${listing.title} - photo ${i + 1}` });
  const gallery = listing.photos.map(photoAt);
  return {
    title: listing.title,
    place: `${PROPERTY_TYPE_LABEL[listing.propertyType]} · ${listing.city}, ${listing.country}`,
    // No description-derived line over the hero photo (owner, 2 Nov): the page shows the name and place only.
    headline: { before: "", accent: "", after: "" },
    intro: "",
    hero: gallery[0],
    carousel: gallery.slice(0, CAROUSEL_PHOTOS),
    gallery,
    facts: [
      { label: "Sleeps", value: `${listing.maxGuests}`, icon: "users" },
      { label: listing.bedrooms === 1 ? "Bedroom" : "Bedrooms", value: `${listing.bedrooms}`, icon: "door" },
      { label: listing.bathrooms === 1 ? "Bathroom" : "Bathrooms", value: `${listing.bathrooms}`, icon: "bath" },
      { label: listing.beds === 1 ? "Bed" : "Beds", value: `${listing.beds}`, icon: "bed" },
    ],
    amenities: [],
    goodToKnow: [],
    hostNote: "",
    price: {
      fromCents: listing.pricePerNightCents,
      weekendCents: listing.weekendPricePerNightCents ?? undefined,
      minNights: listing.minNights,
      cancellation: "",
    },
  };
}

