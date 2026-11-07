import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../src/lib/referral";

// An admin sees a failed email or webhook at /admin/failures, marks it handled,
// and it moves to the Handled tab and leaves the Overview's Needs attention list.

const prisma = new PrismaClient();
const PASSWORD = "failures-e2e-123";
const stamp = Date.now();
let adminId = "";
const failureIds: string[] = [];

test.beforeAll(async () => {
  const admin = await prisma.user.create({
    data: {
      name: "E2E failures admin",
      email: `e2e-failures-admin-${stamp}@fystay.dev`,
      passwordHash: await bcrypt.hash(PASSWORD, 10),
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      referralCode: generateReferralCode(),
    },
  });
  adminId = admin.id;
  const failure = await prisma.deliveryFailure.create({
    data: { kind: "WEBHOOK", label: `E2E Stripe checkout ${stamp}`, reason: "Error: test failure" },
  });
  failureIds.push(failure.id);
});

test.afterAll(async () => {
  await prisma.deliveryFailure.deleteMany({ where: { id: { in: failureIds } } });
  await prisma.user.deleteMany({ where: { id: adminId } });
  await prisma.$disconnect();
});

test("an admin marks a failed webhook handled, and it moves to the Handled tab", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", `e2e-failures-admin-${stamp}@fystay.dev`);
  await page.fill("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  await page.goto("/admin/failures");
  const row = page.locator("li", { hasText: `E2E Stripe checkout ${stamp}` });
  await expect(row).toBeVisible();
  await expect(row.getByText("Webhook", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Mark handled" }).click();
  await expect(page.getByText("Marked as handled")).toBeVisible();

  await page.goto("/admin/failures?status=handled");
  await expect(page.locator("li", { hasText: `E2E Stripe checkout ${stamp}` })).toBeVisible();
  await expect(page.locator("li", { hasText: `E2E Stripe checkout ${stamp}` }).getByRole("button", { name: "Mark handled" })).toHaveCount(0);
});
