/**
 * Atomic kit gate. Baseline computed styles are captured once, before edits.
 * Later runs compare the catalog to that file. Do not refresh the baseline
 * to match a new look.
 *
 *   node scripts/verify-atomic.mjs --capture
 *   node scripts/verify-atomic.mjs --phase 1
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = join(root, "scripts", "atomic-baseline.json");
const cssDir = join(root, "css");

const specimens = [
  {
    id: "surface",
    selector: "article.surface:not(.surface--panel):not(.surface--cream):not(.surface--tint):not(.surface--dark)",
    title: "h3",
    eyebrow: ".rf-meta",
  },
  {
    id: "surface-panel",
    selector: "article.surface.surface--panel",
    title: "h3",
  },
  {
    id: "surface-dark",
    selector: "article.surface.surface--dark",
    title: "h3",
    eyebrow: ".rf-meta",
    primaryButton: true,
  },
  {
    id: "card",
    selector: "article.rf-card",
    title: ".rf-card__title",
    eyebrow: ".rf-meta",
  },
  {
    id: "quote",
    selector: "figure.rf-quote",
    title: "blockquote p",
    name: ".rf-quote__name",
    role: ".rf-quote__role",
    photo: ".rf-quote__avatar",
    inset: "blockquote p",
  },
  {
    id: "review",
    selector: "article.rf-review",
    title: ".rf-review__title",
    name: ".rf-review__name",
    role: ".rf-review__role",
  },
  {
    id: "offer",
    selector: "article.rf-offer:not(.rf-offer--panel):not(.rf-offer--dark)",
    title: ".rf-offer__title",
    eyebrow: ".rf-offer__eyebrow",
    photo: ".rf-offer__portrait",
    name: ".rf-offer__name",
  },
  {
    id: "offer-panel",
    selector: "article.rf-offer.rf-offer--panel",
    title: ".rf-offer__title",
    eyebrow: ".rf-offer__eyebrow",
  },
  {
    id: "offer-dark",
    selector: "article.rf-offer.rf-offer--dark",
    title: ".rf-offer__title",
    eyebrow: ".rf-offer__eyebrow",
    primaryButton: ".btn--primary",
  },
];

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function kitCss() {
  return readdirSync(cssDir)
    .filter((name) => name.endsWith(".css"))
    .map((name) => stripComments(readFileSync(join(cssDir, name), "utf8")))
    .join("\n");
}

function countSubstring(css, needle) {
  let count = 0;
  let from = 0;
  while (from < css.length) {
    const at = css.indexOf(needle, from);
    if (at === -1) break;
    count += 1;
    from = at + needle.length;
  }
  return count;
}

function sourceErrors(phase) {
  const css = kitCss();
  const errors = [];
  if (phase >= 1) {
    const edges = countSubstring(css, "border: 4px solid var(--rf-cream-deep)");
    if (edges !== 1) {
      errors.push(`white edge declaration count is ${edges}, expected 1`);
    }
    const pillRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((match) => {
      const selector = match[1];
      const body = match[2];
      return selector.includes(".pill--green") || (selector.includes(".pill--active") && body.includes("--rf-green-soft"));
    });
    if (pillRules.length !== 1 || !pillRules[0][1].includes(".pill--green") || !pillRules[0][1].includes(".pill--active")) {
      errors.push("pill--green and pill--active are not one rule");
    }
  }
  if (phase >= 2) {
    const oklch = countSubstring(css, "oklch(from var(--rf-surface-fill)");
    if (oklch !== 1) {
      errors.push(`oklch surface-fill edge count is ${oklch}, expected 1`);
    }
    const offerFill = countSubstring(css, "--rf-offer-fill");
    if (offerFill !== 0) {
      errors.push(`--rf-offer-fill still appears ${offerFill} time(s)`);
    }
    const darkPrimary = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((match) => {
      const selector = match[1];
      const body = match[2];
      return selector.includes(".btn--primary") && body.includes("var(--rf-white)") && body.includes("var(--rf-green-deep)");
    });
    if (darkPrimary.length !== 1) {
      errors.push(`inverted primary rules: ${darkPrimary.length}, expected 1`);
    } else {
      const selector = darkPrimary[0][1];
      if (!selector.includes(".surface--dark") || !selector.includes(".rf-offer--dark")) {
        errors.push("inverted primary rule does not cover surface--dark and rf-offer--dark");
      }
    }
  }
  if (phase >= 3) {
    const nameRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((match) => {
      const selector = match[1];
      const body = match[2];
      return (selector.includes(".rf-quote__name") || selector.includes(".rf-review__name")) && body.includes("font-weight");
    });
    if (nameRules.length !== 1 || !nameRules[0][1].includes(".rf-quote__name") || !nameRules[0][1].includes(".rf-review__name")) {
      errors.push("quote and review names are not one weight rule");
    }
  }
  if (phase >= 4) {
    const offerEyebrow = [...css.matchAll(/\.rf-offer__eyebrow\s*\{([^{}]*)\}/g)];
    const size = offerEyebrow.map((match) => match[1]).join("\n");
    if (!size.includes("0.875rem")) {
      errors.push("offer eyebrow is no longer 0.875rem");
    }
  }
  return errors;
}

async function readCatalog() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const index = join(root, "index.html");
  await page.goto(`file:///${index.replace(/\\/g, "/")}`);
  await page.evaluate(() => document.fonts.ready);
  const measured = await page.evaluate((specs) => {
    function read(el) {
      if (!el) return null;
      const style = getComputedStyle(el);
      return {
        borderTopWidth: style.borderTopWidth,
        borderTopStyle: style.borderTopStyle,
        borderTopColor: style.borderTopColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        color: style.color,
        textTransform: style.textTransform,
        paddingInlineStart: style.paddingInlineStart,
        width: style.width,
        height: style.height,
        objectFit: style.objectFit,
      };
    }
    const out = {};
    for (const spec of specs) {
      const rootEl = document.querySelector(spec.selector);
      if (!rootEl) {
        out[spec.id] = { missing: true };
        continue;
      }
      const row = { box: read(rootEl) };
      if (spec.title) row.title = read(rootEl.querySelector(spec.title));
      if (spec.eyebrow) row.eyebrow = read(rootEl.querySelector(spec.eyebrow));
      if (spec.name) row.name = read(rootEl.querySelector(spec.name));
      if (spec.role) row.role = read(rootEl.querySelector(spec.role));
      if (spec.photo) row.photo = read(rootEl.querySelector(spec.photo));
      if (spec.inset) row.inset = read(rootEl.querySelector(spec.inset));
      if (spec.primaryButton === true) {
        const button = document.createElement("button");
        button.className = "btn btn--primary";
        button.type = "button";
        rootEl.appendChild(button);
        row.primaryButton = read(button);
        button.remove();
      } else if (typeof spec.primaryButton === "string") {
        row.primaryButton = read(rootEl.querySelector(spec.primaryButton));
      }
      out[spec.id] = row;
    }
    const meta = document.querySelector(".rf-meta");
    const disclosure = document.querySelector(".rf-disclosure__label");
    const toggle = document.querySelector(".rf-toggle__state");
    const subtitle = document.querySelector(".ds-sidebar__subtitle");
    const select = document.querySelector("select.select");
    const rfSelect = document.querySelector("select.rf-select");
    const catalogTitle = document.querySelector(".ds-hero h1, .ds-panel > h2.ds-h2, h2.ds-h2");
    out._extra = {
      meta: read(meta),
      disclosure: read(disclosure),
      toggle: read(toggle),
      subtitle: read(subtitle),
      select: read(select),
      rfSelect: read(rfSelect),
      catalogTitle: read(catalogTitle),
    };
    return out;
  }, specimens);
  await browser.close();
  return measured;
}

function diffValue(path, expected, actual, errors) {
  if (expected === null || actual === null) {
    if (expected !== actual) errors.push(`${path} missing on one side`);
    return;
  }
  if (typeof expected !== "object") {
    if (expected !== actual) errors.push(`${path}: expected ${expected}, got ${actual}`);
    return;
  }
  for (const key of Object.keys(expected)) {
    diffValue(`${path}.${key}`, expected[key], actual?.[key], errors);
  }
}

function computedErrors(measured, baseline, phase) {
  const errors = [];
  const boxIds = ["surface", "surface-panel", "surface-dark", "card", "quote", "review", "offer", "offer-panel", "offer-dark"];
  for (const id of boxIds) {
    if (measured[id]?.missing) {
      errors.push(`${id} specimen missing`);
      continue;
    }
    diffValue(`${id}.box`, baseline[id].box, measured[id].box, errors);
    if (phase >= 1) {
      diffValue(`${id}.title`, baseline[id].title, measured[id].title, errors);
    }
  }
  if (phase >= 1) {
    for (const id of ["surface-dark", "offer-dark"]) {
      diffValue(`${id}.primaryButton.backgroundColor`, baseline[id].primaryButton?.backgroundColor, measured[id].primaryButton?.backgroundColor, errors);
      diffValue(`${id}.primaryButton.color`, baseline[id].primaryButton?.color, measured[id].primaryButton?.color, errors);
    }
  }
  if (phase >= 3) {
    for (const id of ["quote", "review", "offer"]) {
      diffValue(`${id}.name`, baseline[id].name, measured[id].name, errors);
      diffValue(`${id}.role`, baseline[id].role, measured[id].role, errors);
      diffValue(`${id}.photo`, baseline[id].photo, measured[id].photo, errors);
    }
    diffValue("quote.inset.paddingInlineStart", baseline.quote.inset?.paddingInlineStart, measured.quote.inset?.paddingInlineStart, errors);
  }
  if (phase >= 4) {
    for (const id of ["surface", "card", "offer", "offer-panel", "offer-dark", "surface-dark"]) {
      diffValue(`${id}.eyebrow`, baseline[id].eyebrow, measured[id].eyebrow, errors);
    }
    diffValue("extra.meta", baseline._extra.meta, measured._extra.meta, errors);
    diffValue("extra.disclosure", baseline._extra.disclosure, measured._extra.disclosure, errors);
    diffValue("extra.toggle", baseline._extra.toggle, measured._extra.toggle, errors);
    diffValue("extra.subtitle", baseline._extra.subtitle, measured._extra.subtitle, errors);
  }
  if (phase >= 5) {
    diffValue("extra.catalogTitle", baseline._extra.catalogTitle, measured._extra.catalogTitle, errors);
    diffValue("extra.rfSelect.width", baseline._extra.rfSelect?.width, measured._extra.rfSelect?.width, errors);
    diffValue("extra.rfSelect.height", baseline._extra.rfSelect?.height, measured._extra.rfSelect?.height, errors);
    diffValue("extra.rfSelect.borderRadius", baseline._extra.rfSelect?.borderRadius, measured._extra.rfSelect?.borderRadius, errors);
  }
  return errors;
}

function parseArgs(argv) {
  const capture = argv.includes("--capture");
  const phaseFlag = argv.indexOf("--phase");
  const phase = phaseFlag === -1 ? 1 : Number(argv[phaseFlag + 1]);
  return { capture, phase };
}

const { capture, phase } = parseArgs(process.argv.slice(2));

if (!Number.isInteger(phase) || phase < 1 || phase > 5) {
  console.error("phase must be 1-5");
  process.exit(1);
}

const measured = await readCatalog();
if (capture) {
  if (existsSync(baselinePath)) {
    console.error("baseline already exists. Refusing to overwrite.");
    process.exit(1);
  }
  writeFileSync(baselinePath, `${JSON.stringify(measured, null, 2)}\n`);
  console.log(`captured ${baselinePath}`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error("missing atomic-baseline.json. Capture it before editing CSS.");
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const errors = [...sourceErrors(phase), ...computedErrors(measured, baseline, phase)];
if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}
console.log(`PASS phase ${phase}`);
