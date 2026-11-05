"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { useNavTone } from "@/components/NavTone";
import { BrandMark } from "@/lib/brandMark";

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

// The "WEB & SAAS" descriptor line's size per logo size, spaced so it spans
// roughly the width of the "WNJO" wordmark above it.
const taglineSizeClasses = {
  sm: "mt-1 text-[7px] tracking-[0.42em]",
  md: "mt-1 text-[8px] tracking-[0.42em]",
  lg: "mt-1.5 text-[9px] tracking-[0.45em]",
  xl: "mt-1.5 text-[12px] tracking-[0.45em]",
};

/** The WNJO lockup: the W mark, the "WNJO" wordmark and its descriptor. */
export function Logo({
  size = "md",
  withTagline = false,
  taglineClassName,
  className,
}: {
  size?: keyof typeof sizeClasses;
  withTagline?: boolean;
  /** Extra classes for the "Web & SaaS" descriptor line. */
  taglineClassName?: string;
  className?: string;
}) {
  const tone = useNavTone();
  const isHero = tone === "hero";
  const gradientId = `wnjo-swoosh-${useId().replace(/:/g, "")}`;

  return (
    // w-fit: the lockup is only as wide as its content, even inside a
    // stretching flex column (the footer's).
    <span className={cn("inline-flex w-fit items-center gap-[0.4em]", sizeClasses[size], className)}>
      <BrandMark
        className="h-[1.7em] w-auto shrink-0"
        ribbonColor={isHero ? "#ffffff" : undefined}
        gradientId={gradientId}
      />
      <span className="inline-flex flex-col">
        <span
          className={cn(
            "font-[family-name:var(--font-geist-sans)] font-semibold leading-none tracking-[0.04em] text-[#3d2314]",
            isHero && "text-white",
          )}
        >
          WNJO
        </span>{" "}
        {withTagline && (
          <span
            className={cn(
              "whitespace-nowrap font-[family-name:var(--font-geist-sans)] font-medium uppercase leading-tight text-[#3d2314]",
              taglineSizeClasses[size],
              isHero && "text-white/90",
              taglineClassName,
            )}
          >
            Web &amp; SaaS
          </span>
        )}
      </span>
    </span>
  );
}
