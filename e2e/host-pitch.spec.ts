import { test, expect } from "@playwright/test";

test("the List your place page shows what a host keeps, with each site's fee, source and date", async ({ page }) => {
  await page.goto("/host");
  const section = page.locator("#what-you-keep");
  await expect(section.getByRole("heading", { name: "What you keep" })).toBeVisible();

  await section.getByLabel("Price a night (£)").fill("100");
  await section.getByLabel("Nights").fill("3");
  const figures = section.locator("dl");
  // £300 stay: FYStay's 10% leaves £270; Airbnb's 15.5% leaves £253.50; Booking.com's range £225-£270.
  await expect(figures).toContainText("£270");
  await expect(figures).toContainText("£253.50");
  await expect(figures).toContainText("£225");

  // The comparison says where its numbers come from and when they were checked.
  await expect(section.getByRole("link", { name: "Airbnb" })).toHaveAttribute("href", /airbnb\.co\.uk/);
  await expect(section.getByRole("link", { name: "Booking.com" })).toHaveAttribute("href", /booking\.com/);
  await expect(section.getByText(/published by each site on \d+ \w+ \d{4}/)).toBeVisible();
  // Payout timing is stated, not hidden.
  await expect(section.getByText(/the day after your guest checks in/)).toBeVisible();
});
