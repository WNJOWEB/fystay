import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

// Playwright's test process doesn't load .env the way `next dev` does.
try {
  process.loadEnvFile();
} catch {
  // no .env file, so assume the environment already has DATABASE_URL set
}

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("homepage: a short trust line, and weekend chips that fill the dates", async ({ page }) => {
  await page.goto("/");
  const trust = page.getByRole("list", { name: "Why book with FYStay" });
  await expect(trust.getByRole("listitem")).toHaveCount(3);
  await expect(trust).toContainText("Full price shown before you pay");

  const chips = page.getByRole("button", { name: /^Weekend, Friday/ });
  await expect(chips).toHaveCount(2);
  await expect(chips.first()).toHaveAttribute("aria-pressed", "false");
  await chips.first().click();
  await expect(chips.first()).toHaveAttribute("aria-pressed", "true");
  // Picking a weekend fills both dates; the guest still has to choose where.
  await expect(page.getByText("Add date")).toHaveCount(0);
});

test("search cards say free cancellation only where the policy refunds in full", async ({ page }) => {
  const flexible = await prisma.listing.findFirst({ where: { published: true, suspendedAt: null, cancellationPolicy: "FLEXIBLE" } });
  const strict = await prisma.listing.findFirst({ where: { published: true, suspendedAt: null, cancellationPolicy: "STRICT" } });
  test.skip(!flexible || !strict, "needs a published Flexible and a published Strict listing");

  await page.goto(`/search?city=${encodeURIComponent(flexible!.city)}`);
  const flexibleCard = page.locator(`a[href^="/listings/${flexible!.id}"]`).filter({ hasText: flexible!.title }).first();
  await expect(flexibleCard).toContainText("Free cancellation up to 1 day before check-in");

  await page.goto(`/search?city=${encodeURIComponent(strict!.city)}`);
  const strictCard = page.locator(`a[href^="/listings/${strict!.id}"]`).filter({ hasText: strict!.title }).first();
  await expect(strictCard).toBeVisible();
  await expect(strictCard).not.toContainText("Free cancellation");
});

test("the stay page's booking card states the free-cancellation cutoff", async ({ page }) => {
  const moderate = await prisma.listing.findFirst({ where: { published: true, suspendedAt: null, cancellationPolicy: "MODERATE" } });
  test.skip(!moderate, "needs a published Moderate listing");
  await page.goto(`/listings/${moderate!.id}`);
  await expect(page.getByText("up to 5 days before check-in").first()).toBeVisible();
});
