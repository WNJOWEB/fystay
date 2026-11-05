import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BrandMark, MARK_ASPECT } from "@/lib/brandMark";

/**
 * The FYStay identity for generated images (favicon, app icon, share
 * image), which can't use the site's next/font serif: ImageResponse needs
 * the font file itself. DM Serif Display ships in assets/fonts under the
 * SIL Open Font License (see DMSerifDisplay-OFL.txt there). Colours match
 * globals.css; see docs/brand/fystay-brand.md for the rules.
 */
export const BRAND_COLORS = {
  terracotta: "#bc522f", // brand-600: the "FY" and the monogram tile
  ink: "#2b1712", // "Stay" and descriptor text
  cream: "#f8ecdf", // logo tile and share-image background
} as const;

export const BRAND_FONT_NAME = "DM Serif Display";

/** The WNJO wordmark's sans (Inter SemiBold, SIL OFL - see Inter-OFL.txt). */
export const WORDMARK_FONT_NAME = "Inter";

export async function brandFonts() {
  const [serif, sans] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/DMSerifDisplay-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-SemiBold.otf")),
  ]);
  return [
    { name: BRAND_FONT_NAME, data: serif, style: "normal" as const, weight: 400 as const },
    { name: WORDMARK_FONT_NAME, data: sans, style: "normal" as const, weight: 600 as const },
  ];
}

/** The WNJO "W" mark on a cream tile - favicon and app icon. */
export function MonogramTile({ size, rounded = true }: { size: number; rounded?: boolean }) {
  const markWidth = Math.round(size * 0.84);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_COLORS.cream,
        borderRadius: rounded ? Math.round(size * 0.22) : 0,
      }}
    >
      <BrandMark width={markWidth} height={Math.round(markWidth / MARK_ASPECT)} />
    </div>
  );
}
