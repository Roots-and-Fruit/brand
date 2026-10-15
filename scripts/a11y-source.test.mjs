import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { missingAltAttributes, missingAltInKit } from "./a11y-source.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("an img without alt fails", () => {
  const hits = missingAltAttributes('<img src="x.jpg">');
  assert.equal(hits.length, 1);
});

test("empty alt is decorative and passes", () => {
  assert.deepEqual(missingAltAttributes('<img src="x.jpg" alt="">'), []);
});

test("a description passes", () => {
  assert.deepEqual(missingAltAttributes('<img src="x.jpg" alt="A portrait">'), []);
});

test("theme patterns, templates, and parts have an alt on every img", () => {
  assert.deepEqual(missingAltInKit(root), []);
});

test("the focus ring ships in components.css and not brand.css", () => {
  const source = readFileSync(join(root, "css/components.css"), "utf8");
  const brand = readFileSync(join(root, "css/brand.css"), "utf8");
  const compiled = readFileSync(join(root, "wordpress/rf/assets/css/components.css"), "utf8");
  const rule = /:focus-visible\s*\{[^}]*box-shadow:\s*var\(--rf-focus\)/;
  assert.match(source, rule);
  assert.doesNotMatch(brand, /:focus-visible/);
  assert.match(compiled, rule);
});
