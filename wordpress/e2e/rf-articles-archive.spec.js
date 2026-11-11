import { expect, test } from "@playwright/test";

test.describe("Articles archive layout and interactions", () => {
  test("renders split hero, lead spotlight, topic filtering, and takeaways peek", async ({ page }) => {
    await page.setViewportSize({ width: 1360, height: 1000 });
    const response = await page.goto("/articles/");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { level: 1, name: "Articles" })).toBeVisible();
    await expect(page.locator("form.rf-subscribe #articles-email")).toBeVisible();

    const lead = page.locator(".rf-card--lead");
    await expect(lead).toBeVisible();
    await expect(lead).toContainText("Latest essay");
    const leadLink = lead.locator(".rf-card__lead-title a");
    await expect(leadLink).toHaveCSS("text-decoration-line", "none");

    const allBtn = page.locator('button[data-rf-filter="all"]');
    const aiBtn = page.locator('button[data-rf-filter="ai-workflows"]');
    const status = page.locator("[data-rf-filter-status]");
    await expect(allBtn).toHaveAttribute("aria-pressed", "true");

    if ((await aiBtn.count()) > 0) {
      await aiBtn.click();
      await expect(aiBtn).toHaveAttribute("aria-pressed", "true");
      await expect(allBtn).toHaveAttribute("aria-pressed", "false");
      await expect(lead).toBeHidden();
      await expect(status).toContainText("AI & Workflows");

      await allBtn.click();
      await expect(lead).toBeVisible();
      await expect(allBtn).toHaveAttribute("aria-pressed", "true");
    }

    const firstPeek = page.locator(".rf-card--essay:visible .rf-card__peek").first();
    if ((await firstPeek.count()) > 0) {
      await firstPeek.locator("summary").click();
      await expect(firstPeek).toHaveJSProperty("open", true);
      await expect(firstPeek.locator("ol.rf-keytakeaways li").first()).toBeVisible();
    }
  });
});
