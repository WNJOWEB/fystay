import type { Page } from "@playwright/test";

/**
 * Gives a test its own client address. Rate limits are keyed by IP (sign-up
 * allows 5 per hour, Spotlight events 120 per 10 minutes) and every test in a
 * run shares one, so without this one busy spec can use up another's allowance.
 * Addresses come from the documentation range (198.51.100.0/24).
 */
export async function isolateClientIp(page: Page): Promise<void> {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}`,
  });
}
