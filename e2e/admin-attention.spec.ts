import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../src/lib/referral";

// The admin overview opens with what needs a person: an open support ticket
// shows as a count that links to the tickets page, and resolving it removes it.

try {
  process.loadEnvFile();
} catch {
  // no .env file, so assume the environment already has DATABASE_URL set
}

const prisma = new PrismaClient();
const PASSWORD = "attention-e2e-123";
const stamp = Date.now();
const userIds: string[] = [];

async function createUser(label: string, role: "GUEST" | "ADMIN") {
  const user = await prisma.user.create({
    data: {
      name: `E2E ${label}`,
      email: `e2e-attention-${label}-${stamp}@fystay.dev`,
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
  await prisma.supportTicket.deleteMany({ where: { openedById: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

test("admin overview lists open support tickets under Needs attention", async ({ page }) => {
  const admin = await createUser("admin", "ADMIN");
  const guest = await createUser("guest", "GUEST");
  const ticket = await prisma.supportTicket.create({ data: { subject: "E2E attention ticket", openedById: guest.id } });

  await page.goto("/login");
  await page.fill("#email", admin.email);
  await page.fill("#password", PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  await page.goto("/admin");
  const section = page.getByRole("region", { name: "Needs attention" });
  const row = section.getByRole("link", { name: /Support tickets/ });
  await expect(row).toBeVisible();
  await row.click();
  await expect(page).toHaveURL(/\/admin\/support-tickets/);

  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: "RESOLVED" } });
  await page.goto("/admin");
  await expect(page.getByRole("region", { name: "Needs attention" }).getByRole("link", { name: /Support tickets/ })).toHaveCount(0);
});
