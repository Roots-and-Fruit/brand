#!/usr/bin/env node
/**
 * Copy wordpress/rf into a WordPress themes directory.
 *
 *   node scripts/sync-theme.mjs --dest "C:/path/to/wp-content/themes/rf"
 *
 * Destination is required. Do not hardcode a local Studio path in this file.
 *
 * WordPress at RF_WP_BASE_URL (default http://localhost:8893) must be up;
 * runs `npm run test:wp` after the copy. `--skip-test` is an explicit,
 * exceptional escape hatch for file-only work and must be reported as unverified.
 */

import { cpSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const source = join(root, "wordpress", "rf");
const argv = process.argv.slice(2);

function destFromArgs(list) {
  const flag = list.indexOf("--dest");
  if (flag !== -1 && list[flag + 1]) return list[flag + 1];
  if (process.env.RF_WP_THEME_DEST) return process.env.RF_WP_THEME_DEST;
  return "";
}

function skipTest(list) {
  return list.includes("--skip-test");
}

async function wpIsUp(base) {
  try {
    const res = await fetch(base, { signal: AbortSignal.timeout(2500) });
    return res.status < 500;
  } catch {
    return false;
  }
}

const dest = destFromArgs(argv);
if (!dest) {
  console.error("Pass --dest <wp-content/themes/rf> or set RF_WP_THEME_DEST.");
  process.exit(1);
}
if (!existsSync(source)) {
  console.error("Missing wordpress/rf. Run npm run compile:wordpress first.");
  process.exit(1);
}

const required = [
  join(source, "theme.json"),
  join(source, "design-tokens.json"),
  join(source, "brand-defaults.json"),
  join(source, "functions.php"),
  join(source, "assets", "mark.svg"),
];
const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error(`Generated theme is incomplete:\n- ${missing.join("\\n- ")}`);
  console.error("Run npm run compile:wordpress and fix the static verifier before syncing.");
  process.exit(1);
}

cpSync(source, dest, { recursive: true });
const staleBundle = join(dest, "assets", "css", "rf-site.css");
if (existsSync(staleBundle)) {
  unlinkSync(staleBundle);
  console.log("  removed stale rf-site.css so WordPress rebuilds it");
}
const sourcePatterns = join(source, "patterns");
const destPatterns = join(dest, "patterns");
if (existsSync(destPatterns)) {
  const owned = new Set(
    existsSync(sourcePatterns)
      ? readdirSync(sourcePatterns).filter((name) => name.endsWith(".php"))
      : [],
  );
  for (const name of readdirSync(destPatterns)) {
    if (!name.endsWith(".php") || owned.has(name)) continue;
    unlinkSync(join(destPatterns, name));
    console.log(`  removed stale pattern ${name}`);
  }
}
console.log(`Copied wordpress/rf → ${dest}`);

if (skipTest(argv)) {
  console.warn("UNVERIFIED: --skip-test was supplied; no WordPress runtime or Site Editor validation was performed.");
  process.exit(0);
}

const base = process.env.RF_WP_BASE_URL || "http://localhost:8893";
const up = await wpIsUp(base);
if (!up) {
  console.error(`WordPress probe is not reachable at ${base}. Theme was copied but is unverified.`);
  console.error("Start the probe or explicitly rerun with --skip-test for a file-only copy.");
  process.exit(1);
}

const result = spawnSync("npm", ["run", "test:wp"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, RF_WP_BASE_URL: base },
});
process.exit(result.status === null ? 1 : result.status);
