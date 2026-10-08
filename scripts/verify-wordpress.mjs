#!/usr/bin/env node
/**
 * Static gate for the generated R&F WordPress projection.
 *
 * This cannot prove that the MU plugin is active or that Site Editor state was
 * configured. Those are runtime gates in WORDPRESS-GENERATION-CHECKLIST.md.
 */

import { existsSync, readFileSync } from "node:fs";
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
  "wordpress/rf/parts/header.html",
  "wordpress/rf/parts/footer.html",
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
const footer = read("wordpress/rf/parts/footer.html");
for (const part of [header, footer]) {
  if (!part.includes("wp:site-logo")) errors.push("Site Identity parts must include wp:site-logo");
}

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

if (!existsSync(join(theme, "patterns"))) errors.push("theme patterns directory is missing");
if (!existsSync(join(theme, "templates"))) errors.push("theme templates directory is missing");
if (!existsSync(join(theme, "parts"))) errors.push("theme parts directory is missing");

if (errors.length) {
  console.error(`WordPress projection verification failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Static WordPress projection verification passed.");
console.log("Runtime gates still required: MU plugin, Site Editor identity, logo, and probe tests.");
