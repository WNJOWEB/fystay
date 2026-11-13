import { test, expect, type Page } from "@playwright/test";

async function logInAsHost(page: Page) {
  await page.goto("/login");
  await page.fill("#email", "host@fystay.dev");
  await page.fill("#password", "hostpass123");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a host's phone menu groups everything that is not a daily tab, in one sheet", async ({ page }) => {
    await logInAsHost(page);
    await page.goto("/host/dashboard");

    // The bottom bar: four daily tabs and Menu - no sideways row of extras at the top.
    const bar = page.getByRole("navigation", { name: "Hosting (mobile)" });
    for (const name of ["Today", "Bookings", "Calendar", "Messages"]) {
      await expect(bar.getByRole("link", { name })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "Hosting", exact: true })).toBeHidden();

    await bar.getByRole("button", { name: "Menu", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: "Hosting menu" });
    await expect(sheet).toBeVisible();
    for (const group of ["Your business", "Grow", "Account"]) {
      await expect(sheet.getByRole("region", { name: group })).toBeVisible();
    }
    for (const link of ["Listings", "Earnings", "Payouts", "Spotlight", "Channels"]) {
      await expect(sheet.getByRole("link", { name: new RegExp(`^${link}`) })).toBeVisible();
    }

    // Choosing one goes there and closes the sheet.
    await sheet.getByRole("link", { name: /^Earnings/ }).click();
    await page.waitForURL(/\/host\/earnings/);
    await expect(page.getByRole("dialog", { name: "Hosting menu" })).toHaveCount(0);
  });

  test("the account page has labelled sections and a jump bar", async ({ page }) => {
    await logInAsHost(page);
    await page.goto("/account");
    const jump = page.getByRole("navigation", { name: "Account sections" });
    // Verification appears only when Identity or phone checks are available.
    for (const name of ["Personal", "Notifications", "Security", "Privacy"]) {
      await expect(jump.getByRole("link", { name })).toBeVisible();
    }
    await jump.getByRole("link", { name: "Security" }).click();
    await expect(page.getByRole("heading", { name: "Login & security" })).toBeInViewport();
  });
});
