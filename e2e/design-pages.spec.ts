import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The redesigned /host and /about pages: no serious accessibility problems
// (the dark "What you keep" band and the photo-backed close are the risky
// parts for contrast), and the page structure a host or visitor relies on.
for (const path of ["/host", "/about"]) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
}

test("the host page leads with one primary action and numbers its four steps", async ({ page }) => {
  await page.goto("/host");
  await expect(page.getByRole("link", { name: "List your property" }).first()).toBeVisible();
  const steps = page.locator("#how-it-works ol > li");
  await expect(steps).toHaveCount(4);
  await expect(steps.first()).toContainText("Create your listing");
});
