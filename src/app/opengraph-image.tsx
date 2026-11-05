import { ImageResponse } from "next/og";
import { BRAND_COLORS, BRAND_FONT_NAME, WORDMARK_FONT_NAME, brandFonts } from "@/lib/brandImage";
import { BrandMark } from "@/lib/brandMark";

// The default share image for any page without its own (listing pages use
// their cover photo): the WNJO lockup - mark, wordmark and "Web & SaaS" -
// and a line that makes no coverage claim (it's cached and shared widely, so
// it can't follow live inventory), centred with generous margins so nothing
// important is lost when a platform crops it to a square or a 1.91:1 card.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "WNJO - Web & SaaS. Independent holiday stays from local hosts.";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_COLORS.cream,
          fontFamily: BRAND_FONT_NAME,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontFamily: WORDMARK_FONT_NAME }}>
          <BrandMark width={420} height={184} />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 40 }}>
            <div style={{ display: "flex", fontSize: 150, lineHeight: 1, letterSpacing: 6, color: "#3d2314" }}>WNJO</div>
            <div style={{ marginTop: 18, display: "flex", fontSize: 38, letterSpacing: 19, color: "#3d2314" }}>
              WEB &amp; SAAS
            </div>
          </div>
        </div>
        <div style={{ marginTop: 44, width: 72, height: 3, background: BRAND_COLORS.terracotta, display: "flex" }} />
        <div style={{ marginTop: 40, display: "flex", fontSize: 34, color: "#6b5a52" }}>
          Independent holiday stays from local hosts
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
