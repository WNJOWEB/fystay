import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { isolateClientIp } from "./isolate-ip";

// Without a Stripe key (CI, local development) a Spotlight purchase is
// activated straight away - the same dev-mode fallback every checkout uses -
// so the whole journey can run here.

async function logInAsHost(page: Page) {
  await page.goto("/login");
  await page.fill("#email", "host@fystay.dev");
  await page.fill("#password", "hostpass123");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

const prisma = new PrismaClient();

/**
 * A listing this test owns, so no other test can delete or change its
 * Spotlight placement while it runs (other specs create and delete their own
 * fixtures for the same host, and deleting a listing cascades to its
 * placements and view counts).
 */
async function createSpotlightFixture(): Promise<{ id: string; title: string }> {
  const host = await prisma.user.findUniqueOrThrow({ where: { email: "host@fystay.dev" } });
  const title = `E2E fixture: spotlight ${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const listing = await prisma.listing.create({
    data: {
      title,
      description: "Temporary listing created for the Spotlight test.",
      city: "Blackpool",
      country: "England",
      propertyType: "APARTMENT",
      pricePerNightCents: 8000,
      maxGuests: 4,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["Wifi"],
      photos: [],
      published: true,
      hostId: host.id,
    },
    select: { id: true },
  });
  return { id: listing.id, title };
}

/** Features one listing, by its exact title, for 7 days. */
async function featureListing(page: Page, title: string): Promise<void> {
  await page.goto("/host/promote");
  const listing = page
    .locator("main ul > li")
    .filter({ hasText: title })
    .filter({ has: page.getByRole("button", { name: /(Feature for|Add) 7 days/ }) });
  await listing.getByRole("button", { name: /(Feature for|Add) 7 days/ }).click();
  await expect(page.getByText(`${title} is in Spotlight`)).toBeVisible();
  await expect(listing.getByText(/Live until/)).toBeVisible();
}

function spotlight(page: Page) {
  return page.locator("section", { has: page.getByRole("heading", { name: "Popular stays" }) });
}

// Spotlight auto-advances; hold it still so the first card stays put.
test.use({ contextOptions: { reducedMotion: "reduce" } });

test("a featured listing leads the Spotlight carousel, labelled Promoted, and its host sees views and clicks", async ({
  page,
}) => {
  await isolateClientIp(page);
  const fixture = await createSpotlightFixture();
  try {
    await runSpotlightJourney(page, fixture.title);
  } finally {
    await prisma.listing.deleteMany({ where: { id: fixture.id } });
  }
});

async function runSpotlightJourney(page: Page, title: string) {
  await logInAsHost(page);
  await featureListing(page, title);

  // Listening from before the page loads: a promoted card reports its view
  // as soon as it's on screen.
  const impression = page.waitForRequest(
    (request) => request.url().endsWith("/api/spotlight/events") && request.postData()?.includes('"impression"') === true,
  );
  await page.goto("/");
  const row = spotlight(page);
  await row.scrollIntoViewIfNeeded();
  await expect(row.getByText("Stays marked Promoted are featured by their hosts.")).toBeVisible();
  // :visible - the rail also renders a hidden sizing copy of its first card.
  const card = row.locator("ul > li:visible", { has: page.getByRole("link", { name: title }) }).first();
  await expect(card.getByText("Promoted", { exact: true })).toBeVisible();
  // Paid placements come before the unpaid favourites.
  await expect(row.locator("ul > li:visible").first().getByText("Promoted", { exact: true })).toBeVisible();
  await impression;

  // Opening it is reported as a click.
  const click = page.waitForRequest(
    (request) => request.url().endsWith("/api/spotlight/events") && request.postData()?.includes('"click"') === true,
  );
  await card.getByTestId("listing-card-title").click();
  await click;
  await expect(page).toHaveURL(/\/listings\//);

  // The host sees it on their Spotlight page (counts may already include
  // earlier visits in this run - each visitor is counted once in a while).
  await page.goto("/host/promote");
  const hostCard = page.locator("main ul > li").filter({ hasText: title });
  await expect(async () => {
    await page.reload();
    await expect(hostCard.getByText(/Seen [1-9][\d,]* times?/)).toBeVisible({ timeout: 1000 });
    await expect(hostCard.getByText(/[1-9][\d,]* clicks? to your listing/)).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
}
