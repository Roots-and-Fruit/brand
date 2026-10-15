import { expect, test } from "@playwright/test";

test.describe("R&F generated theme", () => {
  test("front page renders the compiled shell", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".wp-block-site-logo img").first()).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Example Brand");
  });

  test("style fixture uses compiler-owned variations", async ({ page }) => {
    const response = await page.goto("/style-fixture/");
    expect(response?.ok()).toBeTruthy();

    const surface = page.locator(".wp-block-group.is-style-rf-surface");
    const button = page.locator(
      ".wp-block-button.is-style-rf-accent .wp-block-button__link",
    );
    await expect(surface).toBeVisible();
    await expect(button).toBeVisible();

    const surfaceValues = await surface.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        classes: [...element.classList],
        borderWidth: style.borderTopWidth,
        borderColor: style.borderTopColor,
        radius: style.borderTopLeftRadius,
      };
    });
    expect(surfaceValues.borderWidth).toBe("4px");
    expect(surfaceValues.borderColor).toBe("rgb(243, 237, 226)");
    expect(surfaceValues.radius).toBe("0px");
    expect(surfaceValues.classes).toContain("is-style-rf-surface");
    expect(
      surfaceValues.classes.filter((name) =>
        /^is-style-rf-surface--\d+$/.test(name),
      ),
    ).toHaveLength(1);
    await expect(button).toHaveCSS("background-color", "rgb(212, 132, 78)");
  });

  test("front page uses the marketing template", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();

    const hero = page.locator(".page-hero");
    const title = hero.locator(".wp-block-post-title");
    await expect(hero).toHaveCSS("background-color", "rgb(235, 228, 216)");
    await expect(hero).toHaveCSS("border-bottom-width", "4px");
    await expect(hero).toHaveCSS("border-bottom-color", "rgb(223, 214, 198)");
    expect((await title.boundingBox())?.width).toBeGreaterThan(1000);
    await expect(page.locator(".rf-article-hero")).toHaveCount(0);
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".services-close")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
  });

  test("single article uses the logo-olive hero", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    const response = await page.goto("/sample-essay/");
    expect(response?.ok()).toBeTruthy();

    const hero = page.locator(".rf-article-hero");
    await expect(hero).toHaveCSS("background-color", "rgb(80, 90, 73)");
    await expect(hero.locator(".wp-block-post-title")).toHaveCSS(
      "color",
      "rgb(255, 255, 255)",
    );
    await expect(hero).toHaveCSS("border-bottom-width", "0px");
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".services-close")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
  });

  test("case studies page still renders", async ({ page }) => {
    const response = await page.goto("/case-studies/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1, name: "Case studies" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The Events Calendar/ })).toBeVisible();
  });

  test("pattern demo shows the organism patterns", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    const response = await page.goto("/pattern-demo/");
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { level: 2, name: "Quote", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Key takeaways" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Service offer" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Portrait quote" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Review card" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Card", exact: true })).toBeVisible();

    const quote = page.locator(".rf-quote").first();
    await expect(quote).toHaveCSS("border-top-width", "4px");
    await expect(quote).toHaveCSS("border-left-width", "4px");
    await expect(quote).toHaveCSS("border-top-color", "rgb(243, 237, 226)");
    await expect(quote).toHaveCSS("border-top-left-radius", "0px");
    await expect(quote).toHaveCSS("padding-top", "24px");
    const mark = await quote.locator("p").first().evaluate((element) => getComputedStyle(element, "::before").content);
    expect(mark).toContain("“");

    const takeawayTitle = page.locator(".rf-takeaways__title");
    const takeaway = page.locator("ol.rf-keytakeaways > li").first();
    await expect(takeawayTitle).toHaveCSS("color", "rgb(98, 116, 77)");
    await expect(takeaway).toHaveCSS("border-left-width", "2px");
    await expect(takeaway).toHaveCSS("border-left-color", "rgb(212, 132, 78)");
    const numberColor = await takeaway.evaluate((element) =>
      getComputedStyle(element, "::before").color,
    );
    expect(numberColor).toBe("rgb(212, 132, 78)");

    const offer = page.locator(".rf-offer").first();
    const column = await offer.evaluate((element) => ({
      width: element.getBoundingClientRect().width,
      tracks: getComputedStyle(element.querySelector(".rf-offer__main")).gridTemplateColumns,
    }));
    expect(column.width).toBeGreaterThan(1000);
    expect(column.tracks.endsWith("260px")).toBe(true);
    await expect(offer).toHaveCSS("border-top-width", "4px");
    await expect(offer).toHaveCSS("border-top-color", "rgb(243, 237, 226)");
    await expect(offer).toHaveCSS("border-top-left-radius", "0px");
    await expect(offer.locator(".wp-block-button__link")).toHaveCSS(
      "background-color",
      "rgb(98, 116, 77)",
    );
    await expect(offer.locator(".rf-offer__band")).toHaveCSS(
      "background-color",
      "rgb(228, 234, 220)",
    );

    const portrait = page.locator(".rf-quote").nth(1);
    await expect(portrait.locator(".rf-quote__avatar")).toBeVisible();
    await expect(portrait.locator(".rf-quote__name")).toHaveText("Matt Cromwell");
    await expect(portrait.locator(".rf-quote__role")).toHaveText("Founder, Roots & Fruit");

    const review = page.locator(".rf-review");
    await expect(review).toHaveCSS("border-top-width", "4px");
    await expect(review).toHaveCSS("border-top-color", "rgb(243, 237, 226)");
    await expect(review.locator(".rf-review__star--on").first()).toHaveCSS(
      "background-color",
      "rgb(212, 132, 78)",
    );

    const card = page.locator("article.rf-card").first();
    await expect(card).toHaveCSS("border-top-width", "4px");
    await expect(card).toHaveCSS("border-top-color", "rgb(243, 237, 226)");
    const footBorder = await card.locator(".rf-card__foot").evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderTopWidth),
    );
    expect(footBorder).toBeGreaterThan(0);
    await expect(card.locator(".wp-block-button.btn")).toHaveCSS("border-top-width", "0px");
    const linkBorder = await card.locator(".wp-block-button__link").evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).borderTopWidth),
    );
    expect(linkBorder).toBe(1);
    await expect(card.locator(".wp-block-button__link")).toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)",
    );
    await expect(card.locator(".wp-block-button__link")).toHaveCSS(
      "color",
      "rgb(98, 116, 77)",
    );

    const facts = page.locator("dl.rf-facts");
    await expect(facts).toHaveCSS("border-top-width", "4px");
    await expect(facts).toHaveCSS("border-top-color", "rgb(243, 237, 226)");
    await expect(facts).toHaveCSS("border-top-left-radius", "0px");
    await expect(page.locator(".rf-steps .rf-step")).toHaveCount(3);
    await expect(page.locator(".rf-stat")).toHaveCount(3);
    const stats = page.locator(".rf-stats");
    const statTracks = await stats.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
    expect(statTracks.split(" ").length).toBe(3);
    await expect(page.locator(".rf-person")).toHaveCount(3);
    await expect(page.locator(".rf-shots img")).toHaveCount(3);
    await expect(page.locator(".rf-logo-row img")).toHaveCount(3);
    const columnLeft = await page
      .getByRole("heading", { level: 2, name: "Logo row" })
      .evaluate((element) => element.getBoundingClientRect().left);
    const logoLeft = await page
      .locator(".rf-logo-row img")
      .first()
      .evaluate((element) => element.getBoundingClientRect().left);
    const listLeft = await page
      .locator(".rf-glyph-list")
      .evaluate((element) => element.getBoundingClientRect().left);
    expect(Math.abs(logoLeft - columnLeft)).toBeLessThanOrEqual(2);
    expect(Math.abs(listLeft - columnLeft)).toBeLessThanOrEqual(2);

    const glyph = page.locator(".rf-glyph--check").first();
    await expect(glyph).toBeVisible();
    const glyphMask = await glyph.evaluate((element) => getComputedStyle(element).webkitMaskImage || getComputedStyle(element).maskImage);
    expect(glyphMask).not.toBe("none");
    const subscribe = page.locator("form.rf-subscribe");
    await expect(subscribe).toHaveAttribute("action", "/api/subscribe");
    await expect(subscribe.locator('input[type="email"]')).toHaveAttribute("name", "email");

    const quoteHeading = page.getByRole("heading", { level: 2, name: "Quote", exact: true });
    const quoteIntro = page.getByText(
      "A quotation and an attribution. The cream edge comes from the theme default.",
    );
    const edges = await Promise.all([
      quoteHeading.evaluate((element) => element.getBoundingClientRect().left),
      quoteIntro.evaluate((element) => element.getBoundingClientRect().left),
      offer.evaluate((element) => element.getBoundingClientRect().left),
    ]);
    expect(Math.abs(edges[0] - edges[1])).toBeLessThanOrEqual(2);
    expect(Math.abs(edges[0] - edges[2])).toBeLessThanOrEqual(2);
  });

  test("Hugo and WordPress match on the named parity regions", async ({ page }) => {
    const urls = [
      "http://127.0.0.1:1313/services/",
      "http://localhost:8893/",
      "http://127.0.0.1:1313/articles/launch/",
      "http://localhost:8893/sample-essay/",
    ];

    await page.setViewportSize({ width: 1200, height: 900 });
    for (const url of urls) {
      const response = await page.goto(url);
      expect(response?.ok(), `${url} did not return a successful response`).toBeTruthy();
      await expect(page.locator(".site-header")).toHaveCSS(
        "border-bottom-width",
        "4px",
      );
      await expect(page.locator(".site-header")).toHaveCSS(
        "border-bottom-color",
        "rgb(243, 237, 226)",
      );
      await expect(page.locator(".site-footer")).toHaveCSS(
        "background-color",
        "rgb(80, 90, 73)",
      );
    }

    await page.goto("http://127.0.0.1:1313/services/");
    const offer = page.locator(".rf-offer").first();
    await expect(offer).toHaveCSS("border-top-width", "4px");
    await expect(offer).toHaveCSS("border-top-color", "rgb(243, 237, 226)");
    await expect(offer).toHaveCSS("border-top-left-radius", "0px");

    await page.goto("http://localhost:8893/style-fixture/");
    const surface = page.locator(".wp-block-group.is-style-rf-surface");
    await expect(surface).toHaveCSS("border-top-width", "4px");
    await expect(surface).toHaveCSS(
      "border-top-color",
      "rgb(243, 237, 226)",
    );
    await expect(surface).toHaveCSS("border-top-left-radius", "0px");

    await page.goto("http://127.0.0.1:1313/articles/launch/");
    await expect(page.locator(".article-hero")).toHaveCSS(
      "background-color",
      "rgb(80, 90, 73)",
    );

    await page.goto("http://localhost:8893/sample-essay/");
    await expect(page.locator(".rf-article-hero")).toHaveCSS(
      "background-color",
      "rgb(80, 90, 73)",
    );
    const wordpressWidth = await page
      .locator(".rf-article-frame .wp-block-post-content")
      .evaluate((element) => {
        const probe = document.createElement("div");
        probe.style.font = getComputedStyle(element).font;
        probe.style.width = "65ch";
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        document.body.appendChild(probe);
        const expected = probe.getBoundingClientRect().width;
        probe.remove();
        return {
          width: element.getBoundingClientRect().width,
          expected,
        };
      });

    expect(
      Math.abs(wordpressWidth.width - wordpressWidth.expected),
      `article prose is ${wordpressWidth.width}px; 65ch is ${wordpressWidth.expected}px`,
    ).toBeLessThanOrEqual(2);
  });

  test("responsive site logo stays visible", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.locator(".wp-block-site-logo img").first()).toBeVisible();
    }
  });
});
