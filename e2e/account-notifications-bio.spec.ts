import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../src/lib/referral";

// Optional-email switches save and stick; a host's bio saves, and a guest has none.

try {
  process.loadEnvFile();
} catch {
  // no .env file, so assume the environment already has DATABASE_URL set
}

const prisma = new PrismaClient();
const PASSWORD = "notify-e2e-123";
const stamp = Date.now();
const userIds: string[] = [];

async function createUser(label: string, role: "GUEST" | "HOST") {
  const user = await prisma.user.create({
    data: {
      name: `E2E ${label}`,
      email: `e2e-notify-${label}-${stamp}@fystay.dev`,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      role,
      emailVerifiedAt: new Date(),
      referralCode: generateReferralCode(),
    },
  });
  userIds.push(user.id);
  return user;
}

test.afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test("a guest can switch off arrival reminders and it sticks", async ({ page }) => {
  const guest = await createUser("guest", "GUEST");
  await login(page, guest.email);
  await page.goto("/account#notifications");
  const toggle = page.getByRole("switch", { name: "Arrival reminders" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect.poll(async () => (await prisma.user.findUniqueOrThrow({ where: { id: guest.id } })).emailArrivalReminders).toBe(false);
  await page.reload();
  await expect(page.getByRole("switch", { name: "Arrival reminders" })).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch", { name: "Review requests" })).toHaveAttribute("aria-checked", "true");
  // a guest has no public bio
  await expect(page.getByLabel("About you")).toHaveCount(0);
  const res = await page.request.patch("/api/account/profile", { data: { bio: "hello" } });
  expect(res.status()).toBe(403);
});

test("a host can write a bio, and it is saved", async ({ page }) => {
  const host = await createUser("host", "HOST");
  await login(page, host.email);
  await page.goto("/account");
  await page.getByLabel("About you").fill("I look after two flats near the Tower.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await prisma.user.findUniqueOrThrow({ where: { id: host.id } })).hostBio).toBe("I look after two flats near the Tower.");
  const tooLong = await page.request.patch("/api/account/profile", { data: { bio: "x".repeat(501) } });
  expect(tooLong.status()).toBe(400);
});
