import { expect, test } from "@playwright/test";

const pages = [
  ["/", "Roots & Fruit"],
  ["/sections/", "Sections"],
  ["/layout/", "Layout"],
  ["/pieces/", "Pieces"],
  ["/the-site/", "The site"],
  ["/offer/", "Offer"],
  ["/pricing/", "Pricing"],
];

test.describe("R&F generated theme", () => {
  test("front page renders R&F identity and official logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".rf-identity").first()).toBeVisible();
    await expect(page.locator(".wp-block-site-logo img").first()).toHaveAttribute(
      "src",
      /rf-logo\.png/,
    );
    await expect(page.locator(".wp-block-site-title").first()).toContainText("Roots & Fruit");
    await expect(page.locator("body")).not.toContainText("Example Brand");
    await page.screenshot({ path: "test-results/playwright/rf-front-page.png", fullPage: true });
  });

  for (const [path, title] of pages) {
    test(`${path} renders the R&F shell`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok(), `${path} did not return a successful response`).toBeTruthy();
      await expect(page).toHaveTitle(new RegExp(title));
      await expect(page.locator(".rf-identity").first()).toBeVisible();
      await expect(page.locator("link#rf-layouts-css")).toHaveCount(1);
      await expect(page.locator("link#rf-components-css")).toHaveCount(1);
    });
  }

  test("responsive identity stays visible", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.locator(".rf-identity").first()).toBeVisible();
      await expect(page.locator(".wp-block-site-logo img").first()).toBeVisible();
    }
  });
});
