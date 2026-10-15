import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { checkPairs, contrastRatio, PROMISED_PAIRS } from "./contrast.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const TOKEN_FOR_SLUG = {
  paper: "--rf-cream",
  "paper-deep": "--rf-cream-deep",
  surface: "--rf-white",
  panel: "--rf-panel",
  ink: "--rf-ink",
  "ink-muted": "--rf-ink-muted",
  primary: "--rf-green",
  "primary-deep": "--rf-green-deep",
  "primary-soft": "--rf-green-soft",
  accent: "--rf-orange",
  "surface-dark": "--rf-surface-dark",
  "on-primary": "--rf-on-primary",
  "on-accent": "--rf-on-tertiary",
  "on-dark": "--rf-on-dark",
};

function paletteFromTokens() {
  const css = readFileSync(join(root, "css/tokens.css"), "utf8");
  const palette = {};
  for (const [slug, token] of Object.entries(TOKEN_FOR_SLUG)) {
    const match = css.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`));
    if (!match) throw new Error(`css/tokens.css is missing ${token}`);
    palette[slug] = match[1];
  }
  return palette;
}

test("white on moss clears 4.5", () => {
  assert.ok(contrastRatio("#ffffff", "#62744d") >= 4.5);
});

test("the known miss stays under 4.5", () => {
  assert.ok(contrastRatio("#64748b", "#e2e8f0") < 4.5);
});

test("checkPairs reports the bad fixture and clears the good one", () => {
  const bad = checkPairs(
    { fg: "#64748b", bg: "#e2e8f0" },
    [{ fg: "fg", bg: "bg", min: 4.5 }],
  );
  assert.equal(bad.length, 1);
  assert.match(bad[0], /#64748b/);
  assert.match(bad[0], /#e2e8f0/);
  assert.match(bad[0], /needs 4\.5:1/);

  const good = checkPairs(
    { fg: "#ffffff", bg: "#62744d" },
    [{ fg: "fg", bg: "bg", min: 4.5 }],
  );
  assert.deepEqual(good, []);
});

test("R&F tokens clear the promised pairs", () => {
  const errors = checkPairs(paletteFromTokens(), PROMISED_PAIRS);
  assert.deepEqual(errors, []);
});
