/**
 * The WNJO "W" mark (owner's logo, 5 Nov 2026): two espresso ribbons and an
 * orange swoosh, traced as SVG so it stays sharp at every size and works in
 * the site, the favicon and the share image (next/og renders inline SVG).
 * Pass `ribbonColor` to recolour the ribbons (white on the dark hero).
 */
export const MARK_COLORS = {
  ribbon: "#4a2a17",
  swooshFrom: "#e6913f",
  swooshTo: "#c2561c",
} as const;

/** Width / height of the mark's viewBox, for sizing. */
export const MARK_ASPECT = 960 / 420;

export function BrandMark({
  ribbonColor = MARK_COLORS.ribbon,
  width,
  height,
  className,
  gradientId = "wnjo-swoosh",
}: {
  ribbonColor?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  /** Unique per page if the mark appears more than once with different colours. */
  gradientId?: string;
}) {
  return (
    <svg
      viewBox="25 40 960 420"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={MARK_COLORS.swooshFrom} />
          <stop offset="1" stopColor={MARK_COLORS.swooshTo} />
        </linearGradient>
      </defs>
      <path
        fill={ribbonColor}
        d="M30 105 L160 105 C190 105 205 120 220 140 L395 355 C405 362 415 360 425 350 L455 322 L470 335 L400 420 C370 455 320 455 295 425 L75 140 C65 125 50 112 30 105 Z"
      />
      <path
        fill={ribbonColor}
        d="M315 105 L440 105 C470 105 488 118 502 138 L715 380 C722 392 718 400 705 408 L655 445 C620 465 585 455 565 430 L360 140 C350 125 335 112 315 105 Z"
      />
      <path
        fill={`url(#${gradientId})`}
        d="M592 182 C640 125 700 50 790 45 C860 42 900 90 925 140 L975 265 C978 280 950 300 915 302 L820 170 C800 135 780 118 745 118 C700 118 650 150 600 192 Z"
      />
    </svg>
  );
}
