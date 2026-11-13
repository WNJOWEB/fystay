import { test, expect } from "@playwright/test";

// The shelf only appears with at least three stays approved in the last 30 days,
// so a young catalogue never shows a thin row. Whatever the data, a shown shelf
// must hold at least three stays.
test("the New on FYStay shelf never shows fewer than three stays", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { name: "New on FYStay" });
  if ((await heading.count()) === 0) return;
  const shelf = page.locator("section", { has: heading });
  const stays = shelf.locator('a[href^="/listings/"]').filter({ hasText: /£/ });
  expect(await stays.count()).toBeGreaterThanOrEqual(3);
});
