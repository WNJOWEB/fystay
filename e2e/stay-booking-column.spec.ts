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

async function aStay() {
  return prisma.listing.findFirstOrThrow({
    where: { published: true, suspendedAt: null, NOT: { propertyType: "HOTEL" }, photos: { isEmpty: false } },
    orderBy: { createdAt: "asc" },
  });
}

test("on a wide screen the booking panel stays in view as you read", async ({ page }) => {
  const stay = await aStay();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/listings/${stay.id}`);
  const panel = page.locator("#booking-widget");
  await expect(panel).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 1600));
  await page.waitForTimeout(300);
  const box = await panel.boundingBox();
  // Still at the top of the screen after scrolling well down the page.
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(200);
  // And it is not repeated as a second panel at the foot of the page.
  await expect(page.locator("#booking-widget")).toHaveCount(1);
});

test("on a tablet the booking panel comes after the page, as it always has", async ({ page }) => {
  const stay = await aStay();
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.goto(`/listings/${stay.id}`);
  const reviews = await page.locator("#reviews").boundingBox();
  const panel = await page.locator("#booking-widget").boundingBox();
  expect(reviews).not.toBeNull();
  expect(panel).not.toBeNull();
  expect(panel!.y).toBeGreaterThan(reviews!.y);
});
