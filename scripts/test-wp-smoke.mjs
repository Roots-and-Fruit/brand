#!/usr/bin/env node
/**
 * Runtime smoke gate for the local R&F WordPress probe.
 * Full token registration and Site Editor checks still run through Studio WP-CLI
 * and the manual checklist; this verifies the public theme output over HTTP.
 */

const base = (process.env.RF_WP_BASE_URL || "http://localhost:8893").replace(/\/$/, "");
const response = await fetch(`${base}/`, { signal: AbortSignal.timeout(5000) });
if (!response.ok) {
  throw new Error(`Front page ${base}/ returned HTTP ${response.status}`);
}

const html = await response.text();
const required = [
  ["Roots &amp; Fruit", "R&F Site Identity"],
  ["rf-identity", "R&F identity wrapper"],
  ["wp-block-site-logo", "native Site Logo block"],
  ["rf-logo.png", "configured official logo asset"],
  ["--rf-", "R&F token CSS"],
];
const missing = required.filter(([needle]) => !html.includes(needle));
if (missing.length) {
  throw new Error(`Runtime smoke gate failed:\n- ${missing.map(([, label]) => label).join("\n- ")}`);
}

console.log(`R&F WordPress smoke gate passed: ${base}/`);
console.log("Studio WP-CLI token count and Site Editor persistence remain required gates.");
