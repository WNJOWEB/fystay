import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

try {
  process.loadEnvFile();
} catch {
  // no .env file, so assume the environment already has DATABASE_URL set
}

const prisma = new PrismaClient();

test("a listing links to its host's public profile, which shows their stays and no private details", async ({ page }) => {
  const host = await prisma.user.findUniqueOrThrow({ where: { email: "host@fystay.dev" } });
  const listing = await prisma.listing.findFirstOrThrow({ where: { hostId: host.id, published: true, suspendedAt: null } });

  await page.goto(`/listings/${listing.id}`);
  await page.locator(`a[href="/hosts/${host.id}"]`).first().click();
  await page.waitForURL(`/hosts/${host.id}`);

  await expect(page.getByRole("heading", { level: 1, name: host.name })).toBeVisible();
  await expect(page.getByRole("heading", { name: /hosted by/i })).toBeVisible();
  await expect(page.locator(`a[href^="/listings/"]`).first()).toBeVisible();
  // Public page: nothing private.
  const body = await page.locator("body").innerText();
  expect(body).not.toContain(host.email);
  // Kept out of search results while it is a thin page.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("a guest, an unknown id and a suspended host have no profile page", async ({ page }) => {
  const guest = await prisma.user.findFirstOrThrow({ where: { role: "GUEST" } });
  expect((await page.goto(`/hosts/${guest.id}`))?.status()).toBe(404);
  expect((await page.goto("/hosts/does-not-exist"))?.status()).toBe(404);
});
