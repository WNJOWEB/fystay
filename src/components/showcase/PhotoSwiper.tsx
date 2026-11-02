"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { isOptimizableImage } from "@/lib/image";
import type { ShowcasePhoto } from "@/lib/showcase/types";

const SETTLE_MS = 260;
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/** How far a drag must go (or how fast a flick) before it counts as a swipe. */
function isSwipe(dx: number, width: number, ms: number): boolean {
  const velocity = Math.abs(dx) / Math.max(ms, 1);
  return Math.abs(dx) > Math.min(70, width * 0.2) || (Math.abs(dx) > 24 && velocity > 0.45);
}

/**
 * The photo viewer's picture: the previous, current and next photos sit side
 * by side, and the strip follows your finger (or mouse) as you drag, then
 * glides to the next photo or springs back. Dragging is written straight to
 * the element's transform rather than through React state, so every frame
 * of the drag is cheap, and the neighbouring photos are already loaded when
 * you start, so nothing waits on the network once you let go.
 *
 * Arrows and keys still change the photo through `onStep`.
 */
export function PhotoSwiper({
  photos,
  index,
  onStep,
}: {
  photos: ShowcasePhoto[];
  index: number;
  onStep: (by: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; t: number; dx: number } | null>(null);
  const settling = useRef(false);
  const count = photos.length;
  const prev = (index - 1 + count) % count;
  const next = (index + 1) % count;

  const place = useCallback((offsetPx: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = animate ? `transform ${SETTLE_MS}ms ${EASE}` : "none";
    track.style.transform = `translate3d(calc(-100% + ${offsetPx}px), 0, 0)`;
  }, []);

  // Each time the photo changes, the strip jumps back to the middle slot (now holding the new photo).
  useLayoutEffect(() => {
    settling.current = false;
    place(0, false);
  }, [index, place]);

  function finish(by: number) {
    const track = trackRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (by === 0) {
      place(0, !reduced);
      return;
    }
    settling.current = true;
    const width = track?.parentElement?.clientWidth ?? 0;
    if (reduced) {
      onStep(by);
      return;
    }
    place(-by * width, true);
    let done = false;
    const commit = () => {
      if (done) return;
      done = true;
      onStep(by);
    };
    track?.addEventListener("transitionend", commit, { once: true });
    window.setTimeout(commit, SETTLE_MS + 80);
  }

  return (
    <div
      className="relative h-full w-full touch-pan-y select-none overflow-hidden"
      onPointerDown={(e) => {
        if (count < 2 || settling.current || (e.pointerType === "mouse" && e.button !== 0)) return;
        drag.current = { id: e.pointerId, x: e.clientX, t: e.timeStamp, dx: 0 };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        d.dx = e.clientX - d.x;
        place(d.dx, false);
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        drag.current = null;
        const width = e.currentTarget.clientWidth;
        finish(isSwipe(d.dx, width, e.timeStamp - d.t) ? (d.dx < 0 ? 1 : -1) : 0);
      }}
      onPointerCancel={() => {
        if (!drag.current) return;
        drag.current = null;
        finish(0);
      }}
    >
      <div ref={trackRef} className="flex h-full w-full will-change-transform" style={{ transform: "translate3d(-100%, 0, 0)" }}>
        {[prev, index, next].map((photoIndex, slot) => {
          const photo = photos[photoIndex];
          return (
            <div key={`${photoIndex}-${slot === 1 ? "c" : slot}`} className="relative h-full w-full shrink-0" aria-hidden={slot !== 1 || undefined}>
              <Image
                src={photo.src}
                alt={slot === 1 ? photo.alt : ""}
                fill
                draggable={false}
                loading="eager"
                decoding="async"
                unoptimized={!isOptimizableImage(photo.src)}
                sizes="(min-width: 1024px) 896px, 100vw"
                className="pointer-events-none select-none object-contain"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
