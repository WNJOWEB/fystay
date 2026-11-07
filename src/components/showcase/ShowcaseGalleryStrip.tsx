"use client";

import { isOptimizableImage } from "@/lib/image";
import { PhotoSwiper } from "@/components/showcase/PhotoSwiper";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ShowcasePhoto } from "@/lib/showcase/types";

/**
 * A row of the property's photos straight under the hero, in FYStay's
 * editorial frame (square corners, terracotta rule); the last tile says how
 * many more there are. Any of them opens the full gallery in a viewer with
 * the owner's description of each photo, arrows and the keyboard.
 */
// Under a narrow hero the tiles fill its width, however many there are.
const NARROW_COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
};

export function ShowcaseGalleryStrip({
  photos,
  startAt = 0,
  narrow = false,
}: {
  photos: ShowcasePhoto[];
  /** Line up with a centred, narrower hero (photos too small for the wide one). */
  narrow?: boolean;
  /** Photos before this index are already on show above (the hero). */ startAt?: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (by: number) =>
      setOpen((i) =>
        i === null ? i : (i + by + photos.length) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  // Up to five tiles; the last says how many more there are. On a phone a full row of five drops its fourth, so it's a 2x2.
  const tiles = photos.slice(startAt, startAt + 5);
  const hasMore = photos.length > startAt + tiles.length;
  const hiddenOnPhone = tiles.length === 5 ? 3 : -1;
  if (tiles.length === 0) return null;

  return (
    <section
      id="photos"
      aria-label="Photos"
      className={cn(
        "mx-auto w-full scroll-mt-20 px-4 pt-2 sm:px-6 sm:pt-6",
        narrow ? "max-w-4xl" : "max-w-6xl",
      )}
    >
      <ul
        className={cn(
          "grid grid-cols-2 gap-2 sm:gap-3",
          narrow ? NARROW_COLUMNS[tiles.length] : "sm:grid-cols-5",
        )}
      >
        {tiles.map((p, i) => {
          const last = hasMore && i === tiles.length - 1;
          return (
            <li
              key={p.src}
              className={cn(i === hiddenOnPhone && "hidden sm:block")}
            >
              <button
                type="button"
                onClick={() => setOpen(startAt + i)}
                data-testid="gallery-tile"
                aria-label={
                  last
                    ? `View all ${photos.length} photos`
                    : `Open photo: ${p.alt}`
                }
                className="focus-ring group relative block w-full overflow-hidden border-b-[3px] border-brand-500 bg-surface-muted shadow-[var(--shadow-card)] ring-1 ring-black/5"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={p.src}
                    alt={last ? "" : p.alt}
                    fill
                    unoptimized={!isOptimizableImage(p.src)}
                    sizes="(min-width: 1024px) 220px, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {last && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/60 px-1 text-center text-xs font-semibold leading-tight text-white backdrop-blur-[1px] sm:text-sm">
                      View all {photos.length} photos
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-ink/95 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="focus-ring absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          {/* Drag along the photos: the strip follows your finger (PhotoSwiper). */}
          <div
            className="relative h-[70svh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PhotoSwiper photos={photos} index={open} onStep={step} />
          </div>
          <p
            className="max-w-2xl text-center text-sm text-white/85"
            onClick={(e) => e.stopPropagation()}
          >
            {photos[open].alt}
          </p>
          <div
            className="flex items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="focus-ring rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span className="text-xs tabular-nums text-white/70">
              {open + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="focus-ring rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
