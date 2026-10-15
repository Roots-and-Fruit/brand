#!/usr/bin/env node
/**
 * Static gate for the generated R&F WordPress projection.
 *
 * This cannot prove that the MU plugin is active or that Site Editor state was
 * configured. Those are runtime gates in WORDPRESS-GENERATION-CHECKLIST.md.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const theme = join(root, "wordpress", "rf");
const errors = [];

function read(rel) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    errors.push(`missing ${rel}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function json(rel) {
  const raw = read(rel);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${rel} is not valid JSON: ${error.message}`);
    return null;
  }
}

for (const rel of [
  "wordpress/rf/style.css",
  "wordpress/rf/functions.php",
  "wordpress/rf/theme.json",
  "wordpress/rf/design-tokens.json",
  "wordpress/rf/brand-defaults.json",
  "wordpress/rf/assets/mark.svg",
  "wordpress/rf/assets/logos/R&F_Logo.svg",
  "wordpress/rf/assets/logos/R&F_Logo_DarkBG.svg",
  "wordpress/rf/assets/css/brand.css",
  "wordpress/rf/assets/css/ui.css",
  "wordpress/rf/assets/css/rf.css",
  "wordpress/rf/assets/css/fonts.css",
  "wordpress/rf/assets/css/tokens.css",
  "wordpress/rf/assets/css/layouts.css",
  "wordpress/rf/assets/css/elements.css",
  "wordpress/rf/assets/css/components.css",
  "wordpress/rf/assets/css/chrome.css",
  "wordpress/rf/assets/css/disclosure.css",
  "wordpress/rf/assets/css/block-styles.css",
  "wordpress/rf/assets/css/site-chrome.css",
  "wordpress/rf/styles/block/rf-surface.json",
  "wordpress/rf/styles/block/rf-logo.json",
  "wordpress/rf/styles/block/rf-accent.json",
  "wordpress/rf/styles/block/rf-outline.json",
  "wordpress/rf/parts/header.html",
  "wordpress/rf/parts/footer.html",
  "wordpress/rf/parts/book.html",
  "wordpress/rf/templates/front-page.html",
  "wordpress/rf/templates/page.html",
  "wordpress/rf/templates/home.html",
  "wordpress/rf/templates/single.html",
  "wordpress/rf/patterns/quote.php",
  "wordpress/rf/patterns/takeaways.php",
  "wordpress/rf/patterns/offer.php",
]) read(rel);

const style = read("wordpress/rf/style.css");
if (!/^Theme Name:\s*Roots & Fruit$/m.test(style)) {
  errors.push("wordpress/rf/style.css must declare Theme Name: Roots & Fruit");
}

const functions = read("wordpress/rf/functions.php");
for (const needle of [
  "register_design_token",
  "design-tokens.json",
  "rf_render_site_logo_fallback",
]) {
  if (!functions.includes(needle)) errors.push(`functions.php missing ${needle}`);
}

const header = read("wordpress/rf/parts/header.html");
if (!header.includes("wp:site-logo")) errors.push("Header must include wp:site-logo");
if (!header.includes("rf-nav")) errors.push("Header nav must use the kit rf-nav class");

const tokens = json("wordpress/rf/design-tokens.json");
if (!tokens?.tokens?.length) errors.push("design-tokens.json has no registered tokens");
if (tokens?.source?.brand !== "Roots & Fruit") {
  errors.push("design-tokens.json source brand is not Roots & Fruit");
}

const defaults = json("wordpress/rf/brand-defaults.json");
for (const key of ["logo", "dark_logo"]) {
  if (!defaults?.[key]) errors.push(`brand-defaults.json is missing ${key}`);
}

const themeJson = json("wordpress/rf/theme.json");
if (themeJson?.settings?.typography?.fluid !== false) {
  errors.push("theme.json must disable fluid typography");
}
if (!themeJson?.settings?.custom) errors.push("theme.json is missing settings.custom");
if (
  themeJson?.settings?.layout?.contentSize !== "56rem" ||
  themeJson?.settings?.layout?.wideSize !== "56rem"
) {
  errors.push("theme.json contentSize and wideSize must remain 56rem");
}
const logo = themeJson?.settings?.color?.palette?.find((item) => item.slug === "logo");
if (logo?.color?.toLowerCase() !== "#505a49") {
  errors.push("theme.json palette is missing logo olive #505a49");
}
const quote = themeJson?.styles?.blocks?.["core/quote"]?.border;
if (quote?.width !== "4px" || quote?.color !== "var:preset|color|paper-deep") {
  errors.push("core/quote must use the 4px cream edge");
}
if (themeJson?.styles?.blocks?.["core/group"]?.variations) {
  errors.push("custom Group variations belong in styles/block, not theme.json");
}
if (themeJson?.styles?.blocks?.["core/button"]?.variations) {
  errors.push("custom Button variations belong in styles/block, not theme.json");
}

const blockVariations = [
  ["rf-surface", "core/group"],
  ["rf-tint", "core/group"],
  ["rf-panel", "core/group"],
  ["rf-dark", "core/group"],
  ["rf-logo", "core/group"],
  ["rf-accent", "core/button"],
  ["rf-outline", "core/button"],
];
for (const [slug, blockType] of blockVariations) {
  const variation = json(`wordpress/rf/styles/block/${slug}.json`);
  if (
    variation?.slug !== slug ||
    !variation?.blockTypes?.includes(blockType) ||
    !variation?.styles
  ) {
    errors.push(`${slug}.json must own the ${blockType} variation`);
  }
  if (functions.includes(`'${slug}'`)) {
    errors.push(`functions.php must not register ${slug}`);
  }
}

const dark = json("wordpress/rf/styles/block/rf-dark.json")?.styles;
if (
  dark?.color?.background !== "var:preset|color|surface-dark" ||
  dark?.color?.text !== "var:custom|on|dark" ||
  dark?.spacing?.padding?.top !== "var:preset|spacing|space-6"
) {
  errors.push("rf-dark must use white text and the strong inset padding");
}
if (json("wordpress/rf/theme.json")?.styles?.blocks?.["core/group"]?.spacing?.padding) {
  errors.push("the default Group style must not carry fill padding");
}
const surface = json("wordpress/rf/styles/block/rf-surface.json")?.styles;
if (
  surface?.border?.width !== "4px" ||
  surface?.border?.color !== "var:preset|color|paper-deep" ||
  surface?.border?.radius !== "0"
) {
  errors.push("rf-surface must use the 4px square cream edge");
}
const accent = json("wordpress/rf/styles/block/rf-accent.json")?.styles;
if (accent?.color?.background !== "var:preset|color|accent") {
  errors.push("rf-accent must use the accent palette color");
}

const blockCss = read("wordpress/rf/assets/css/block-styles.css");
if (/\.wp-block-group\.is-style-rf-surface\s*\{/.test(blockCss)) {
  errors.push("block-styles.css must not paint the rf-surface base style");
}
if (/^\.wp-block-button\.is-style-rf-(accent|outline)\s+\.wp-block-button__link\s*\{/m.test(blockCss)) {
  errors.push("block-styles.css must not paint rf-accent or rf-outline");
}
const chromeCss = read("wordpress/rf/assets/css/site-chrome.css");
if (!chromeCss.includes("6.7rem") || !chromeCss.includes("--rf-green-logo")) {
  errors.push("site-chrome.css is missing the Hugo header or footer");
}
if (!chromeCss.includes("minmax(0, var(--rf-measure))")) {
  errors.push("site-chrome.css must size the article prose track to the measure");
}
if (blockCss.includes("776px") || blockCss.includes("margin-inline-start: max(")) {
  errors.push("block-styles.css must not offset flow text or pin the article column to 776px");
}

const frontPage = read("wordpress/rf/templates/front-page.html");
for (const needle of [
  '"contentSize":"1200px"',
  'slug":"header"',
  'slug":"book"',
  'slug":"footer"',
  "wp:post-content",
]) {
  if (!frontPage.includes(needle)) {
    errors.push(`front-page.html missing ${needle}`);
  }
}
if (frontPage.includes('className":"page-hero"')) {
  errors.push("front-page.html must leave the homepage layout to the page content");
}
if (frontPage.includes("rf-article-hero") || frontPage.includes("is-style-rf-surface")) {
  errors.push("front-page.html must not contain an article hero or surface fixture");
}

const single = read("wordpress/rf/templates/single.html");
for (const needle of [
  'className":"rf-article-hero"',
  '"backgroundColor":"logo"',
  '"contentSize":"1200px"',
  '"contentSize":"65ch"',
  'slug":"sidebar-post"',
  'slug":"header"',
  'slug":"book"',
  'slug":"footer"',
]) {
  if (!single.includes(needle)) errors.push(`single.html missing ${needle}`);
}
if (single.includes('"backgroundColor":"surface-dark"')) {
  errors.push("single.html article hero must use logo olive, not surface-dark");
}

const quotePattern = read("wordpress/rf/patterns/quote.php");
for (const needle of ["Slug: rf/quote", "<!-- wp:quote -->", "wp-block-quote"]) {
  if (!quotePattern.includes(needle)) {
    errors.push(`patterns/quote.php missing ${needle}`);
  }
}
if (/wp:quote[\s\S]*border(?:-left)?:/i.test(quotePattern)) {
  errors.push("patterns/quote.php must rely on the core Quote default");
}
if (!quotePattern.includes('"width":"65ch"')) {
  errors.push("the quote pattern must default to the reading measure");
}

const takeawaysPattern = read("wordpress/rf/patterns/takeaways.php");
for (const needle of ["Slug: rf/takeaways", "rf-takeaways", "rf-keytakeaways"]) {
  if (!takeawaysPattern.includes(needle)) {
    errors.push(`patterns/takeaways.php missing ${needle}`);
  }
}

const offerPattern = read("wordpress/rf/patterns/offer.php");
for (const needle of [
  "Slug: rf/offer",
  "rf-offer",
  "rf-offer__band",
  "btn btn--primary btn--sm",
]) {
  if (!offerPattern.includes(needle)) {
    errors.push(`patterns/offer.php missing ${needle}`);
  }
}
if (offerPattern.includes("rf-offer--panel") || offerPattern.includes("rf-offer--dark")) {
  errors.push("the first offer pattern is the white fill only");
}

const portraitPattern = read("wordpress/rf/patterns/quote-portrait.php");
for (const needle of [
  "Slug: rf/quote-portrait",
  "rf-quote__avatar",
  "rf-quote__name",
  "rf-quote__role",
  '"width":"65ch"',
  "<!-- wp:quote -->",
]) {
  if (!portraitPattern.includes(needle)) {
    errors.push(`patterns/quote-portrait.php missing ${needle}`);
  }
}

const reviewPattern = read("wordpress/rf/patterns/review.php");
for (const needle of [
  "Slug: rf/review",
  "rf-review__star--on",
  "rf-review__title",
  "rf-review__body",
  "rf-review__date",
  '"width":"24rem"',
]) {
  if (!reviewPattern.includes(needle)) {
    errors.push(`patterns/review.php missing ${needle}`);
  }
}

const cardPattern = read("wordpress/rf/patterns/card.php");
for (const needle of [
  "Slug: rf/card",
  "rf-card__title",
  "rf-card__foot",
  "rf-meta",
  "btn btn--tertiary btn--sm",
]) {
  if (!cardPattern.includes(needle)) {
    errors.push(`patterns/card.php missing ${needle}`);
  }
}

const pageHeroPattern = read("wordpress/rf/patterns/page-hero.php");
for (const needle of [
  "Slug: rf/page-hero",
  "Block Types: core/post-content",
  "Post Types: page",
  "page-hero rf-copy",
  "rf-display rf-display--md",
  "wp:post-title",
]) {
  if (!pageHeroPattern.includes(needle)) {
    errors.push(`patterns/page-hero.php missing ${needle}`);
  }
}
if (/<h2[^>]*rf-display--md/.test(pageHeroPattern)) {
  errors.push("the page hero subtitle must be a paragraph, not a heading");
}
if (!pageHeroPattern.includes("rf-cluster") || !pageHeroPattern.includes('class="rf-lede"')) {
  errors.push("the page hero must use rf-cluster and rf-lede so the kit spacing runs");
}

const bookPart = read("wordpress/rf/parts/book.html");
if (!bookPart.includes('class="book-call__open"') || !bookPart.includes('id="book-call"')) {
  errors.push("book.html must wrap the discovery button in a block");
}
for (const needle of ['className":"rf-copy"', "rf-byline", 'className":"rf-lede"', 'className":"rf-meta"']) {
  if (!single.includes(needle)) errors.push(`single.html article hero missing ${needle}`);
}

const pageChecks = {
  "scripts/services-blocks.html": ["page-hero rf-copy", 'class="rf-display rf-display--md"', "rf-cluster", "rf-offer"],
  "scripts/case-studies-blocks.html": ["page-hero rf-copy", 'class="rf-lede"', "rf-cluster", "rf-quote__name"],
  "scripts/about-blocks.html": ["page-hero--about", "rf-copy", "rf-quote__avatar", "rf-cluster"],
  "scripts/home-blocks.html": ["rf-copy", "rf-cluster", 'href="#book"'],
};
for (const [file, needles] of Object.entries(pageChecks)) {
  const html = read(file);
  for (const needle of needles) {
    if (!html.includes(needle)) errors.push(`${file} missing ${needle}`);
  }
}
const pageTemplate = read("wordpress/rf/templates/page.html");
if (pageTemplate.includes('className":"page-hero"')) {
  errors.push("page.html must leave the hero to the page content pattern");
}
if (!pageTemplate.includes('slug":"header"') || !pageTemplate.includes("wp:post-content")) {
  errors.push("page.html must keep the shell around post content");
}

const generatedFiles = [
  "wordpress/rf/assets/css/brand.css",
  "wordpress/rf/assets/css/ui.css",
  "wordpress/rf/assets/css/rf.css",
  "wordpress/rf/assets/css/fonts.css",
  "wordpress/rf/assets/css/tokens.css",
  "wordpress/rf/assets/css/layouts.css",
  "wordpress/rf/assets/css/elements.css",
  "wordpress/rf/assets/css/components.css",
  "wordpress/rf/assets/css/chrome.css",
  "wordpress/rf/assets/css/disclosure.css",
  "wordpress/rf/assets/css/block-styles.css",
  "wordpress/rf/assets/css/site-chrome.css",
];
for (const rel of generatedFiles) {
  const content = read(rel);
  if (/--cds-|is-style-cds|\.cds-/.test(content)) {
    errors.push(`${rel} contains stale cds namespace`);
  }
  if (/\/(fonts|brand|ui|rf)\.css$/.test(rel)) continue;
  if (!content.includes("--rf-")) {
    errors.push(`${rel} does not contain R&F tokens`);
  }
}

const piecePatterns = {
  "wordpress/rf/patterns/facts.php": "rf-facts",
  "wordpress/rf/patterns/steps.php": "rf-steps",
  "wordpress/rf/patterns/stats.php": "rf-stats",
  "wordpress/rf/patterns/people.php": "rf-people",
  "wordpress/rf/patterns/shots.php": "rf-shots",
  "wordpress/rf/patterns/logo-row.php": "rf-logo-row",
  "wordpress/rf/patterns/icon-card.php": "rf-glyph--check",
  "wordpress/rf/patterns/icon-list.php": "rf-glyph-list",
  "wordpress/rf/patterns/subscribe.php": 'action="/api/subscribe"',
};
for (const [rel, needle] of Object.entries(piecePatterns)) {
  const html = read(rel);
  if (!html.includes(needle)) errors.push(`${rel} missing ${needle}`);
}
const homeHtml = read("wordpress/rf/templates/home.html");
const railHtml = read("wordpress/rf/parts/sidebar-post.html");
for (const [label, html] of [
  ["templates/home.html", homeHtml],
  ["parts/sidebar-post.html", railHtml],
]) {
  if (!html.includes('action="/api/subscribe"')) errors.push(`${label} subscribe action drifted`);
  if (!html.includes("0x4AAAAAAFV-KGUd_wkXmGBY")) errors.push(`${label} subscribe sitekey drifted`);
  if (!html.includes("rf-subscribe")) errors.push(`${label} missing rf-subscribe`);
}
if (!homeHtml.includes('id="articles-email"')) errors.push("articles subscribe id drifted");
if (!railHtml.includes('id="subscribe-email"')) errors.push("rail subscribe id drifted");
for (const file of ["check.svg", "arrow.svg", "mail.svg"]) {
  if (!existsSync(join(theme, "assets", "icons", file))) errors.push(`missing assets/icons/${file}`);
}
if (!existsSync(join(theme, "patterns"))) errors.push("theme patterns directory is missing");
if (!existsSync(join(theme, "templates"))) errors.push("theme templates directory is missing");
if (!existsSync(join(theme, "parts"))) errors.push("theme parts directory is missing");

function isPaintProperty(property) {
  if (property === "border" || property === "box-shadow") return true;
  if (property === "background" || property === "background-color" || property === "background-image") {
    return true;
  }
  if (property.startsWith("border-radius")) return true;
  if (/^border-(top|right|bottom|left)(-|$)/.test(property)) return true;
  if (/^border-(width|style|color)$/.test(property)) return true;
  return false;
}

function paintDeclarations(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const found = [];
  const stack = [];
  let buffer = "";
  for (const ch of source) {
    if (ch === "{") {
      stack.push(buffer.trim());
      buffer = "";
      continue;
    }
    if (ch === "}") {
      const prelude = stack.pop();
      const body = buffer;
      buffer = "";
      if (prelude && !prelude.startsWith("@")) {
        const selector = prelude.replace(/\s+/g, " ").trim();
        for (const declaration of body.split(";")) {
          const property = declaration.split(":")[0].trim().toLowerCase();
          if (isPaintProperty(property)) found.push(`${selector}|${property}`);
        }
      }
      continue;
    }
    buffer += ch;
  }
  return found;
}

const paintBaselinePath = join(root, "scripts", "block-styles-paint-baseline.json");
const paintBaseline = json("scripts/block-styles-paint-baseline.json");
const allowedPaint = new Set(Array.isArray(paintBaseline) ? paintBaseline : []);
if (!Array.isArray(paintBaseline)) {
  errors.push("scripts/block-styles-paint-baseline.json must be an array of selector|property keys");
}
for (const key of paintDeclarations(blockCss)) {
  const selector = key.slice(0, key.lastIndexOf("|"));
  if (selector.includes("is-style-rf-")) continue;
  if (!allowedPaint.has(key)) {
    errors.push(
      `block-styles.css added paint (${key}). Use a pattern or an is-style-rf-* block style.`,
    );
  }
}
if (!existsSync(paintBaselinePath)) {
  errors.push("missing scripts/block-styles-paint-baseline.json");
}

const allowedSurface = /^(?:rf-card|rf-quote|rf-review|page-hero|rf-article-hero)(?:__|--|$)|^is-style-rf-|^wp-block-quote(?:__|$)/;
const surfaceRole = /(?:^|-)(?:card|quote|hero|review)(?:-|$)/;
for (const dir of ["templates", "parts"]) {
  for (const name of readdirSync(join(theme, dir))) {
    if (!name.endsWith(".html")) continue;
    const rel = `wordpress/rf/${dir}/${name}`;
    const html = read(rel);
    const classes = [
      ...html.matchAll(/className":"([^"]+)"/g),
      ...html.matchAll(/class="([^"]+)"/g),
    ];
    for (const match of classes) {
      const tokens = match[1].split(/\s+/).filter(Boolean);
      const invented = tokens.filter((token) => surfaceRole.test(token) && !allowedSurface.test(token));
      if (invented.length) {
        errors.push(
          `${rel} uses ${invented.join(", ")} without an existing pattern or block style`,
        );
      }
    }
  }
}

if (errors.length) {
  console.error(`WordPress projection verification failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Static WordPress projection verification passed.");
console.log("Runtime gates still required: MU plugin, Site Editor identity, logo, and probe tests.");
