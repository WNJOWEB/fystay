import { test, expect } from "@playwright/test";

test("a host can choose No refund, and Custom still lets them set their own percentage", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", "host@fystay.dev");
  await page.fill("#password", "hostpass123");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  await page.goto("/host/listings/new");
  const select = page.getByLabel("Refund rules for guest cancellations");

  await select.selectOption("NO_REFUND");
  await expect(page.getByText("No refund if you cancel, at any time after booking.")).toBeVisible();
  await expect(page.getByLabel("Refund percentage before cutoff")).toHaveCount(0);

  await select.selectOption("CUSTOM");
  const percent = page.getByLabel("Refund percentage before cutoff");
  await expect(percent).toBeVisible();
  // Leaving No refund for Custom starts from a sensible percentage, not 0 (which would still mean No refund).
  await expect(percent).toHaveValue("50");

  await select.selectOption("NON_REFUNDABLE");
  await expect(page.getByText(/Full refund if you cancel within 24 hours of paying/)).toBeVisible();
});
