#!/usr/bin/env node
/**
 * Compile DESIGN.md + css/tokens.css into a WordPress projection.
 *
 *   node scripts/compile-wordpress.mjs
 *
 * Writes:
 *   wordpress/rf/theme.json         into the thin block theme
 *   wordpress/rf/styles/block/       named block style variations
 *   wordpress/rf/design-tokens.json Layer B registry
 *   wordpress/rf/assets/css/        copied kit CSS (no base.css)
 *   wordpress/rf/assets/mark.svg    kit mark (Site Logo fallback)
 *   wordpress/rf/brand-defaults.json name + tagline for first-run identity
 *   wordpress/theme.json             same JSON, for copy-only use
 *
 * DESIGN.md stays the source of truth. Re-run after customize or token edits.
 * Zero install. Do not hand-edit the generated files.
 */

import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { missingAltInKit } from "./a11y-source.mjs";
import { checkPairs, PROMISED_PAIRS } from "./contrast.mjs";
import {
  parseCdsTokens,
  parseDesignMdFrontMatter,
  resolveInlineRefs,
  resolveTokenRef,
} from "./lib/parse-yaml-map.mjs";
import {
  articleHeroCopy,
  authorBioBlocks,
  authorBioPattern,
  bookOpen,
  factsPattern,
  iconCardPattern,
  numberedCardPattern,
  outlineIconCardPattern,
  showcaseCardPattern,
  iconListPattern,
  outlineIconListPattern,
  logoRowPattern,
  offer,
  pageHero,
  peoplePattern,
  quote,
  shotsPattern,
  statsPattern,
  stepsPattern,
  subscribeForm,
  subscribePattern,
  dialoguePattern,
} from "./block-snippets.mjs";
import { marketingPages } from "./page-blocks.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "wordpress");

/** Fallback when DESIGN.md has no layout.content-size yet. Same as wide / --rf-max. */
const CONTENT_SIZE = "60rem";

const HUE_SLUG = /^(green|cream|orange|cyan|rose|blue|brown|navy|slate|yellow|red|purple|pink|teal|moss|neutral|secondary|tertiary)(-|$)/i;

/** Semantic colors authors may paint. `info` stays off the marketing palette. */
const PALETTE = [
  ["paper", "Paper"],
  ["paper-deep", "Paper deep"],
  ["surface", "Surface"],
  ["panel", "Panel"],
  ["panel-soft", "Panel soft"],
  ["ink", "Ink"],
  ["ink-deep", "Ink deep"],
  ["ink-muted", "Ink muted"],
  ["primary", "Primary"],
  ["primary-deep", "Primary deep"],
  ["primary-soft", "Primary soft"],
  ["accent", "Accent"],
  ["accent-soft", "Accent soft"],
  ["surface-dark", "Surface dark"],
  ["logo", "Logo olive"],
  ["success", "Success"],
  ["success-soft", "Success soft"],
  ["warning", "Warning"],
  ["warning-soft", "Warning soft"],
  ["danger", "Danger"],
  ["danger-soft", "Danger soft"],
];

const FONT_SIZE_ROLES = [
  "display-xl",
  "display-lg",
  "display-md",
  "display-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label",
  "meta",
  "code",
];

const RADIUS_NAMES = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  pill: "Pill",
};

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function writeJson(rel, data) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`  wrote ${rel}`);
}

function prettyName(slug) {
  return slug
    .split("-")
    .map((part) => {
      if (/^(xl|lg|md|sm)$/i.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function quoteStack(stack) {
  return String(stack)
    .split(",")
    .map((part) => {
      const name = part.trim();
      if (!name) return "";
      if (/^["'].*["']$/.test(name)) return name;
      if (/\s/.test(name)) return `"${name}"`;
      return name;
    })
    .filter(Boolean)
    .join(", ");
}

function preset(kind, slug) {
  return `var:preset|${kind}|${slug}`;
}

function custom(path) {
  return `var:custom|${path}`;
}

function splitPadding(value) {
  const parts = String(value).trim().split(/\s+/);
  if (parts.length >= 2) return { block: parts[0], inline: parts[1] };
  return { block: parts[0] || "0", inline: parts[0] || "0" };
}

function idToCustomKey(id) {
  const slug = id.replaceAll("/", "-").replace(/[^a-z0-9-]/gi, "");
  return slug
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

function loadSources() {
  const design = parseDesignMdFrontMatter(read("DESIGN.md"));
  const tokens = parseCdsTokens(read("css/tokens.css"));
  const required = ["colors", "typography", "rounded", "spacing", "components"];
  for (const key of required) {
    if (!design[key] || typeof design[key] !== "object") {
      throw new Error(`DESIGN.md front matter missing "${key}"`);
    }
  }
  return { design, tokens };
}

function loadBrandDefaults(design) {
  let name = design.name || "Example Brand";
  let tagline = "";
  try {
    const brand = JSON.parse(read("brand.json"));
    if (brand.name) name = brand.name;
    if (brand.tagline) tagline = brand.tagline;
  } catch {
    // DESIGN.md name is enough for a missing or broken brand.json
  }
  return {
    name,
    tagline,
    mark: "assets/mark.svg",
    logo: "assets/logos/R&F_Logo.svg",
    dark_logo: "assets/logos/R&F_Logo_DarkBG.svg",
  };
}

function color(design, tokens, slug) {
  // The generic compiler names paper/accent semantically. R&F keeps its
  // established neutral/tertiary names in DESIGN.md, so resolve those aliases
  // without changing the public R&F contract.
  const aliases = {
    paper: "neutral",
    "paper-deep": "neutral-deep",
    accent: "tertiary",
    "accent-soft": "tertiary-soft",
    "on-accent": "on-tertiary",
    logo: "green-logo",
    "on-dark-muted": "on-dark-muted",
    "success-soft": "success-bg",
    "warning-soft": "warning-bg",
    "danger-soft": "danger-bg",
  };
  const sourceSlug = aliases[slug] || slug;
  const value = resolveTokenRef(
    design.colors[sourceSlug] ?? tokens[sourceSlug],
    design,
    tokens,
  );
  if (!value) throw new Error(`Missing color token "${slug}" (mapped from "${sourceSlug}")`);
  return value;
}

function css(design, tokens, name, fallback) {
  const value = resolveTokenRef(tokens[name], design, tokens);
  return value || fallback;
}

function yamlOrCss(design, tokens, group, key, cssName, fallback) {
  const yaml = design[group]?.[key];
  if (yaml != null && String(yaml).trim() !== "") {
    return resolveInlineRefs(yaml, design, tokens);
  }
  return css(design, tokens, cssName, fallback);
}

function buildPalette(design, tokens) {
  return PALETTE.map(([slug, name]) => {
    if (HUE_SLUG.test(slug)) {
      throw new Error(`Palette slug "${slug}" is a hue/alias, not a job`);
    }
    return { slug, name, color: color(design, tokens, slug) };
  });
}

function tokensFont(design, tokenName, fallback) {
  const role = design.typography[tokenName];
  return role?.fontFamily || fallback;
}

function buildFontFamilies(design) {
  const type = design.typography;
  return [
    {
      slug: "display",
      name: "Display",
      fontFamily: quoteStack(type["display-xl"].fontFamily),
    },
    {
      slug: "body",
      name: "Body",
      fontFamily: quoteStack(type["body-md"].fontFamily),
    },
    {
      slug: "mono",
      name: "Mono",
      fontFamily: quoteStack(type.code.fontFamily),
    },
  ];
}

function buildFontSizes(design) {
  return FONT_SIZE_ROLES.map((slug) => {
    const role = design.typography[slug];
    if (!role?.fontSize) throw new Error(`typography.${slug}.fontSize missing`);
    return {
      slug,
      name: prettyName(slug),
      size: String(role.fontSize),
    };
  });
}

function buildSpacing(design) {
  return Object.keys(design.spacing)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => ({
      slug: `space-${key}`,
      name: `Space ${key}`,
      size: String(design.spacing[key]),
    }));
}

function buildRadii(design) {
  return Object.entries(design.rounded).map(([slug, size]) => ({
    slug,
    name: RADIUS_NAMES[slug] || prettyName(slug),
    size: String(size),
  }));
}

function buildShadows(design, tokens) {
  return [
    {
      slug: "sm",
      name: "Small",
      shadow: yamlOrCss(
        design,
        tokens,
        "elevation",
        "sm",
        "shadow",
        "0 2px 14px rgba(15, 23, 42, 0.06)",
      ),
    },
    {
      slug: "md",
      name: "Medium",
      shadow: yamlOrCss(
        design,
        tokens,
        "elevation",
        "md",
        "shadow-md",
        "0 10px 32px rgba(15, 23, 42, 0.1)",
      ),
    },
  ];
}

function buildCustom(design, tokens) {
  const button = design.components["button-primary"] || {};
  const padding = splitPadding(button.padding || "0.7rem 1.15rem");
  const buttonRadius = resolveTokenRef(
    button.rounded || "{rounded.pill}",
    design,
    tokens,
  );
  const surface = design.components.surface || {};
  const input = design.components.input || {};

  return {
    on: {
      primary: color(design, tokens, "on-primary"),
      accent: color(design, tokens, "on-accent"),
      dark: color(design, tokens, "on-dark"),
      "dark-muted": color(design, tokens, "on-dark-muted"),
    },
    rule: color(design, tokens, "rule"),
    "ink-soft": color(design, tokens, "ink-soft"),
    "panel-deep": color(design, tokens, "panel-deep"),
    info: color(design, tokens, "info"),
    "info-soft": color(design, tokens, "info-soft"),
    "line-height": {
      display: String(design.typography["display-xl"].lineHeight),
      snug: String(design.typography["display-sm"].lineHeight),
      body: String(design.typography["body-md"].lineHeight),
      callout: css(design, tokens, "leading-callout", "1.5"),
      ui: String(design.typography["body-sm"].lineHeight),
    },
    "letter-spacing": {
      display: String(design.typography["display-xl"].letterSpacing ?? "0"),
      meta: String(design.typography.meta.letterSpacing ?? "0.06em"),
    },
    "font-weight": {
      regular: String(design.typography["body-md"].fontWeight),
      emphasis: String(design.typography.label.fontWeight),
      bold: String(design.typography["display-xl"].fontWeight),
    },
    layout: {
      measure: yamlOrCss(design, tokens, "layout", "measure", "measure", "62ch"),
      "content-size": yamlOrCss(
        design,
        tokens,
        "layout",
        "content-size",
        "content-size",
        CONTENT_SIZE,
      ),
      "wide-size": yamlOrCss(design, tokens, "layout", "wide-size", "max", "60rem"),
    },
    button: {
      radius: String(buttonRadius),
      "padding-block": padding.block,
      "padding-inline": padding.inline,
    },
    input: {
      radius: String(
        resolveTokenRef(input.rounded || "{rounded.sm}", design, tokens),
      ),
    },
    surface: {
      radius: String(
        resolveTokenRef(surface.rounded || "{rounded.md}", design, tokens),
      ),
      padding: String(surface.padding || "1.5rem"),
    },
    focus: {
      ring: yamlOrCss(
        design,
        tokens,
        "focus",
        "ring",
        "focus",
        "0 0 0 3px color-mix(in srgb, var(--rf-primary) 38%, transparent)",
      ),
    },
  };
}

function buildRegistry(customValues) {
  const tokens = [
    ["rf/on-primary", "On primary", "color", customValues.on.primary],
    ["rf/on-accent", "On accent", "color", customValues.on.accent],
    ["rf/on-dark", "On dark", "color", customValues.on.dark],
    [
      "rf/on-dark-muted",
      "On dark muted",
      "color",
      customValues.on["dark-muted"],
    ],
    ["rf/rule", "Rule", "color", customValues.rule],
    [
      "rf/button-radius",
      "Button radius",
      "border-radius",
      customValues.button.radius,
    ],
    [
      "rf/button-padding-block",
      "Button padding block",
      "spacing",
      customValues.button["padding-block"],
    ],
    [
      "rf/button-padding-inline",
      "Button padding inline",
      "spacing",
      customValues.button["padding-inline"],
    ],
    [
      "rf/input-radius",
      "Input radius",
      "border-radius",
      customValues.input.radius,
    ],
    [
      "rf/surface-radius",
      "Surface radius",
      "border-radius",
      customValues.surface.radius,
    ],
    [
      "rf/surface-padding",
      "Surface padding",
      "spacing",
      customValues.surface.padding,
    ],
    [
      "rf/layout-content-size",
      "Content size",
      "spacing",
      customValues.layout["content-size"],
    ],
    [
      "rf/layout-wide-size",
      "Wide size",
      "spacing",
      customValues.layout["wide-size"],
    ],
    ["rf/focus-ring", "Focus ring", "text", customValues.focus.ring],
  ];

  return tokens.map(([id, label, type, value]) => ({
    id,
    label,
    type,
    default: String(value),
    scope: "global",
    custom_key: idToCustomKey(id),
  }));
}

function layoutSpacingPreset(design, key, fallbackStep) {
  const yaml = design.layout?.[key];
  const match = String(yaml ?? "").match(/\{spacing\.(\d+)\}/);
  const step = match ? match[1] : String(fallbackStep);
  return preset("spacing", `space-${step}`);
}

function buildStyles(design) {
  return {
    color: {
      background: preset("color", "paper"),
      text: preset("color", "ink"),
    },
    typography: {
      fontFamily: preset("font-family", "body"),
      fontSize: preset("font-size", "body-md"),
      lineHeight: custom("line-height|body"),
    },
    spacing: {
      blockGap: layoutSpacingPreset(design, "stack", 5),
      padding: {
        top: "0",
        bottom: "0",
        left: layoutSpacingPreset(design, "gutter", 5),
        right: layoutSpacingPreset(design, "gutter", 5),
      },
    },
    elements: {
      link: {
        color: { text: preset("color", "primary") },
        typography: { fontWeight: custom("font-weight|emphasis") },
        ":hover": {
          typography: { textDecoration: "underline" },
        },
      },
      button: {
        color: {
          background: preset("color", "primary"),
          text: custom("on|primary"),
        },
        typography: {
          fontFamily: preset("font-family", "body"),
          fontSize: preset("font-size", "label"),
          fontWeight: custom("font-weight|emphasis"),
        },
        border: { radius: custom("button|radius") },
        spacing: {
          padding: {
            top: custom("button|padding-block"),
            bottom: custom("button|padding-block"),
            left: custom("button|padding-inline"),
            right: custom("button|padding-inline"),
          },
        },
        ":hover": {
          color: { background: preset("color", "primary-deep") },
        },
      },
      caption: {
        color: { text: preset("color", "ink-muted") },
        typography: { fontSize: preset("font-size", "body-sm") },
      },
      cite: {
        color: { text: preset("color", "ink-muted") },
        typography: { fontSize: preset("font-size", "body-sm") },
      },
      h1: {
        color: { text: preset("color", "ink-deep") },
        typography: {
          fontFamily: preset("font-family", "display"),
          fontSize: preset("font-size", "display-xl"),
          lineHeight: custom("line-height|display"),
          letterSpacing: custom("letter-spacing|display"),
        },
      },
      h2: {
        color: { text: preset("color", "ink-deep") },
        typography: {
          fontFamily: preset("font-family", "display"),
          fontSize: preset("font-size", "display-lg"),
          lineHeight: custom("line-height|display"),
        },
      },
      h3: {
        color: { text: preset("color", "ink-deep") },
        typography: {
          fontFamily: preset("font-family", "display"),
          fontSize: preset("font-size", "display-md"),
          lineHeight: custom("line-height|display"),
        },
      },
      h4: {
        color: { text: preset("color", "ink-deep") },
        typography: {
          fontFamily: preset("font-family", "display"),
          fontSize: preset("font-size", "display-sm"),
          lineHeight: custom("line-height|snug"),
        },
      },
      h5: {
        typography: {
          fontSize: preset("font-size", "body-lg"),
          fontWeight: custom("font-weight|emphasis"),
        },
      },
      h6: {
        typography: {
          fontSize: preset("font-size", "label"),
          fontWeight: custom("font-weight|emphasis"),
        },
      },
      heading: {
        color: { text: preset("color", "ink-deep") },
        typography: { fontFamily: preset("font-family", "display") },
      },
      code: {
        color: { background: preset("color", "panel-soft") },
        typography: { fontFamily: preset("font-family", "mono") },
        border: { radius: preset("border-radius", "sm") },
      },
    },
    blocks: {
      "core/quote": {
        border: {
          color: preset("color", "paper-deep"),
          width: "4px",
          style: "solid",
          radius: "0",
        },
        color: { background: preset("color", "surface") },
        shadow: "none",
        spacing: {
          padding: preset("spacing", "space-5"),
        },
      },
      "core/code": {
        color: {
          background: preset("color", "panel-soft"),
          text: preset("color", "ink"),
        },
        typography: { fontFamily: preset("font-family", "mono") },
        border: { radius: preset("border-radius", "md") },
        spacing: {
          padding: preset("spacing", "space-4"),
        },
      },
      "core/preformatted": {
        color: {
          background: preset("color", "panel-soft"),
          text: preset("color", "ink"),
        },
        typography: { fontFamily: preset("font-family", "mono") },
        border: { radius: preset("border-radius", "md") },
        spacing: {
          padding: preset("spacing", "space-4"),
        },
      },
      "core/separator": {
        color: { background: custom("rule") },
      },
      "core/buttons": {
        spacing: { blockGap: layoutSpacingPreset(design, "cluster", 3) },
      },
      "core/post-content": {
        spacing: { blockGap: layoutSpacingPreset(design, "section", 6) },
      },
      "core/group": {
        spacing: { blockGap: layoutSpacingPreset(design, "stack", 5) },
      },
      "core/image": {
        border: { radius: "0" },
      },
      "core/columns": {
        spacing: { blockGap: preset("spacing", "space-5") },
      },
      "core/table": {
        typography: { fontSize: preset("font-size", "body-sm") },
        border: { radius: preset("border-radius", "md") },
      },
      "core/details": {
        typography: {
          fontSize: preset("font-size", "body-sm"),
          fontWeight: custom("font-weight|emphasis"),
        },
      },
      "core/site-logo": {
        spacing: { padding: { right: "0", left: "0" } },
      },
      "core/site-title": {
        typography: {
          fontFamily: preset("font-family", "display"),
          fontSize: preset("font-size", "body-lg"),
          fontWeight: custom("font-weight|emphasis"),
        },
        elements: {
          link: {
            color: { text: preset("color", "ink-deep") },
            typography: { textDecoration: "none" },
            ":hover": {
              color: { text: preset("color", "primary") },
              typography: { textDecoration: "none" },
            },
          },
        },
      },
      "core/site-tagline": {
        color: { text: preset("color", "ink-muted") },
        typography: { fontSize: preset("font-size", "body-sm") },
      },
      "core/navigation": {
        color: { text: preset("color", "ink") },
        typography: { fontWeight: custom("font-weight|emphasis") },
        elements: {
          link: {
            color: { text: preset("color", "ink") },
            ":hover": {
              color: { text: preset("color", "primary-deep") },
              typography: { textDecoration: "none" },
            },
          },
        },
      },
      "core/post-date": {
        color: { text: preset("color", "ink-muted") },
        typography: { fontSize: preset("font-size", "meta") },
      },
      "core/post-terms": {
        color: { text: preset("color", "ink-muted") },
        typography: { fontSize: preset("font-size", "meta") },
      },
    },
  };
}

function buildBlockStyleVariations() {
  const filledPadding = {
    top: preset("spacing", "space-6"),
    right: preset("spacing", "space-6"),
    bottom: preset("spacing", "space-6"),
    left: preset("spacing", "space-6"),
  };
  const surfaceBorder = {
    color: preset("color", "paper-deep"),
    radius: "0",
    style: "solid",
    width: "4px",
  };
  const inkOnLight = { text: preset("color", "ink") };

  return [
    {
      file: "rf-surface.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-surface",
        title: "Surface",
        blockTypes: ["core/group"],
        styles: {
          border: surfaceBorder,
          color: {
            background: preset("color", "surface"),
            ...inkOnLight,
          },
          shadow: "none",
          spacing: { padding: filledPadding },
        },
      },
    },
    {
      file: "rf-tint.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-tint",
        title: "Tint",
        blockTypes: ["core/group"],
        styles: {
          color: {
            background: preset("color", "primary-soft"),
            ...inkOnLight,
          },
          spacing: { padding: filledPadding },
        },
      },
    },
    {
      file: "rf-panel.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-panel",
        title: "Panel",
        blockTypes: ["core/group"],
        styles: {
          color: {
            background: preset("color", "panel"),
            ...inkOnLight,
          },
          spacing: { padding: filledPadding },
        },
      },
    },
    {
      file: "rf-dark.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-dark",
        title: "Dark",
        blockTypes: ["core/group"],
        styles: {
          color: {
            background: preset("color", "surface-dark"),
            text: custom("on|dark"),
          },
          spacing: { padding: filledPadding },
        },
      },
    },
    {
      file: "rf-logo.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-logo",
        title: "Logo olive",
        blockTypes: ["core/group"],
        styles: {
          border: surfaceBorder,
          color: {
            background: preset("color", "logo"),
            text: custom("on|dark"),
          },
          shadow: "none",
          spacing: { padding: filledPadding },
        },
      },
    },
    {
      file: "rf-accent.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-accent",
        title: "Accent",
        blockTypes: ["core/button"],
        styles: {
          border: {
            color: "transparent",
            radius: custom("button|radius"),
            style: "solid",
            width: "1.5px",
          },
          color: {
            background: preset("color", "accent"),
            text: custom("on|accent"),
          },
          ":hover": {
            color: {
              background: "color-mix(in srgb, var(--wp--preset--color--accent) 85%, var(--wp--preset--color--paper))",
              text: custom("on|accent"),
            },
          },
        },
      },
    },
    {
      file: "rf-outline.json",
      data: {
        $schema: "https://schemas.wp.org/trunk/theme.json",
        version: 3,
        slug: "rf-outline",
        title: "Outline",
        blockTypes: ["core/button"],
        styles: {
          border: {
            color: preset("color", "primary-deep"),
            radius: custom("button|radius"),
            style: "solid",
            width: "1.5px",
          },
          color: {
            background: "transparent",
            text: preset("color", "primary-deep"),
          },
          ":hover": {
            color: {
              background: preset("color", "primary-soft"),
              text: preset("color", "primary-deep"),
            },
          },
        },
      },
    },
  ];
}

function buildThemeJson({ design, tokens, customValues }) {
  const wideSize = customValues.layout["wide-size"];
  return {
    $schema: "https://schemas.wp.org/trunk/theme.json",
    version: 3,
    settings: {
      appearanceTools: false,
      useRootPaddingAwareAlignments: true,
      color: {
        custom: false,
        customDuotone: false,
        customGradient: false,
        defaultDuotone: false,
        defaultGradients: false,
        defaultPalette: false,
        palette: buildPalette(design, tokens),
      },
      typography: {
        customFontSize: false,
        defaultFontSizes: false,
        fluid: false,
        fontFamilies: buildFontFamilies(design),
        fontSizes: buildFontSizes(design),
      },
      spacing: {
        defaultSpacingSizes: false,
        spacingSizes: buildSpacing(design),
        units: ["px", "rem", "em", "%", "ch"],
      },
      border: {
        radiusSizes: buildRadii(design),
      },
      shadow: {
        defaultPresets: false,
        presets: buildShadows(design, tokens),
      },
      layout: {
        contentSize: customValues.layout["content-size"],
        wideSize,
      },
      blocks: {
        "core/group": {
          dimensions: { width: true },
        },
      },
      custom: customValues,
    },
    styles: buildStyles(design),
    customTemplates: [
      { name: "page-canvas", title: "Canvas", postTypes: ["page"] },
    ],
    templateParts: [
      { name: "header", title: "Header", area: "header" },
      { name: "footer", title: "Footer", area: "footer" },
      { name: "book", title: "Discovery call", area: "uncategorized" },
      { name: "author-bio", title: "Author bio", area: "uncategorized" },
      { name: "sidebar-post", title: "Post rail", area: "uncategorized" },
    ],
  };
}

function validate(theme, registry) {
  const errors = [];
  const slugs = theme.settings.color.palette.map((item) => item.slug);
  for (const slug of slugs) {
    if (HUE_SLUG.test(slug)) {
      errors.push(`palette slug "${slug}" is a hue or reserved alias`);
    }
  }
  for (const need of ["paper", "ink", "ink-deep", "primary", "accent"]) {
    if (!slugs.includes(need)) errors.push(`palette missing "${need}"`);
  }
  if (slugs.includes("info")) {
    errors.push("info must stay off the marketing palette");
  }
  if (slugs.includes("green") || slugs.includes("cream") || slugs.includes("orange")) {
    errors.push("hue names leaked into the palette");
  }
  if (registry.length > 48) {
    errors.push(`registry has ${registry.length} tokens; Gutenberg max is 48`);
  }
  const types = new Set(["color", "border-radius", "spacing", "text"]);
  for (const token of registry) {
    if (!types.has(token.type)) {
      errors.push(`${token.id} has invalid type "${token.type}"`);
    }
  }
  if (!theme.settings.color.palette.every((item) => item.color)) {
    errors.push("palette entry missing color value");
  }
  if (theme.settings.typography.fluid !== false) {
    errors.push("typography.fluid must be false");
  }
  const palette = {};
  for (const item of theme.settings.color.palette) {
    palette[item.slug] = item.color;
  }
  for (const token of registry) {
    if (token.id === "rf/on-primary") palette["on-primary"] = token.default;
    if (token.id === "rf/on-accent") palette["on-accent"] = token.default;
    if (token.id === "rf/on-dark") palette["on-dark"] = token.default;
  }
  errors.push(...checkPairs(palette, PROMISED_PAIRS));
  if (errors.length) {
    throw new Error(`compile-wordpress checks failed:\n- ${errors.join("\n- ")}`);
  }
}

function writeText(rel, text) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, text.endsWith("\n") ? text : `${text}\n`, "utf8");
  console.log(`  wrote ${rel}`);
}

function copyKitIllustrations() {
  const from = join(root, "illustrations");
  const dest = join(root, "wordpress/rf/assets/illustrations");
  if (!existsSync(from)) {
    console.log("  kit illustrations folder missing; hero art skipped");
    return false;
  }
  mkdirSync(dest, { recursive: true });
  for (const file of ["roots-1.svg", "apples-1.svg"]) {
    const src = join(from, file);
    if (!existsSync(src)) continue;
    copyFileSync(src, join(dest, file));
    console.log(`  copied illustrations/${file}`);
  }
  return existsSync(join(dest, "roots-1.svg"));
}

function siteChromeCss(hasArt) {
  const heroArt = hasArt
    ? `
.page-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("../illustrations/roots-1.svg") no-repeat 75% 100% / 600px auto;
  opacity: 0.1;
  pointer-events: none;
}`
    : "";
  const apple = hasArt
    ? `
.services-close::before {
  content: "";
  position: absolute;
  z-index: 0;
  bottom: -2.25rem;
  left: max(32rem, calc(50% - 4rem));
  width: 17.5rem;
  aspect-ratio: 623 / 386;
  background: url("../illustrations/apples-1.svg") no-repeat center / contain;
  opacity: 0.14;
  pointer-events: none;
}

.services-close > * {
  position: relative;
  z-index: 1;
}

@media (max-width: 64rem) {
  .services-close::before {
    left: auto;
    right: -1.5rem;
    top: 1rem;
    bottom: auto;
    width: min(14rem, 42%);
    opacity: 0.11;
  }
}`
    : "";
  return `/* Site chrome written by the compiler. The kit does not own the header bar or footer. */

.site-header {
  background: var(--rf-white);
  border-bottom: 4px solid var(--rf-cream-deep);
}

.site-header__inner {
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  width: min(1200px, calc(100% - 2rem));
  min-height: calc(4.75rem + var(--rf-space-4));
  margin-inline: auto;
  padding-block: var(--rf-space-2);
}

.site-header .rf-nav {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  margin: 0;
}

@media (min-width: 600px) {
  .site-header .rf-nav .wp-block-navigation__responsive-container,
  .site-header .rf-nav .wp-block-navigation__responsive-close,
  .site-header .rf-nav .wp-block-navigation__responsive-dialog,
  .site-header .rf-nav .wp-block-navigation__responsive-container-content,
  .site-header .rf-nav .wp-block-navigation__container,
  .site-header .rf-nav .wp-block-navigation-item,
  .site-header .rf-nav a.wp-block-navigation-item__content {
    display: flex;
    align-items: stretch;
    height: 100%;
    margin: 0;
  }
}

@media (max-width: 599px) {
  .site-header .rf-nav:has(.is-menu-open) {
    overflow: visible;
  }

  .site-header .wp-block-navigation.rf-nav:not(.has-background) .wp-block-navigation__responsive-container.is-menu-open:not(.disable-default-overlay) {
    background-color: var(--rf-panel-soft);
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-close {
    top: var(--rf-space-4);
    right: var(--rf-space-4);
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__responsive-container-content {
    box-sizing: border-box;
    width: 100%;
    align-items: stretch;
    gap: var(--rf-space-3);
    padding: var(--rf-space-7) var(--rf-gutter) var(--rf-space-6);
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation__container {
    align-items: stretch;
    width: 100%;
    gap: var(--rf-space-3);
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-item {
    width: 100%;
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content {
    width: 100%;
    height: auto;
    box-sizing: border-box;
    justify-content: flex-end;
    padding: var(--rf-space-3) var(--rf-space-4);
    border-left: 0;
    border-bottom: 1px solid var(--rf-rule);
    background-image: none;
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:hover {
    background: var(--rf-cream);
    color: var(--rf-green-deep);
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content:focus-visible {
    outline: 2px solid var(--rf-green-deep);
    outline-offset: 2px;
  }

  .site-header .rf-nav .wp-block-navigation__responsive-container.is-menu-open a.wp-block-navigation-item__content[aria-current="page"] {
    background: var(--rf-green-soft);
    color: var(--rf-green-deep);
  }
}
.site-header .wp-block-site-logo {
  align-self: center;
}

.site-header .custom-logo,
.site-header .site-logo img {
  display: block;
  width: 6.7rem;
  height: auto;
}

.site-header .rf-nav .wp-block-navigation__container {
  gap: 0;
  padding: 0;
  list-style: none;
}

.site-header .rf-nav a.wp-block-navigation-item__content {
  display: flex;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  background-color: transparent;
  background-image: linear-gradient(var(--rf-panel), var(--rf-panel));
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: 100% 0%;
  color: var(--rf-ink-deep);
  transition: background-size 250ms ease, color 250ms ease;
}

.site-header .rf-nav a.wp-block-navigation-item__content:hover,
.site-header .rf-nav a.wp-block-navigation-item__content:focus-visible {
  background-size: 100% 100%;
  color: var(--rf-green-deep);
  text-decoration: none;
}

.site-header .rf-nav a.wp-block-navigation-item__content[aria-current="page"] {
  background: var(--rf-cream);
  color: var(--rf-green-deep);
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .site-header .rf-nav a.wp-block-navigation-item__content {
    transition: none;
  }
}

.wp-block-group.rf-quote,
.wp-block-group.rf-review {
  max-inline-size: 100%;
}

/* WordPress centers a constrained child with margin: auto. A piece
   narrower than the column (a 36rem list, a 65ch line) then starts
   in the middle. Keep the column's left edge for every child.
   Center only with .rf-center or an alignment class. */
.is-layout-constrained > :where(
  :not(.alignleft):not(.alignright):not(.alignfull):not(.alignwide):not(.aligncenter):not(.rf-center)
),
.wp-block-group.rf-quote,
.wp-block-group.rf-card,
.wp-block-group.rf-review {
  margin-left: max(0px, calc((100% - 1200px) / 2)) !important;
  margin-right: auto !important;
}

.page-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 31.25rem;
  overflow: hidden;
  border-bottom: 4px solid var(--rf-panel-deep);
  background: var(--rf-panel);
}

.page-hero > .wp-block-post-title,
.page-hero > .rf-display--lg,
.page-hero > .rf-lede,
.page-hero > .wp-block-buttons,
.page-hero > .rf-display--md,
.page-hero > .rf-split {
  margin-left: max(0px, calc((100% - 1200px) / 2)) !important;
  margin-right: auto !important;
}

.page-hero > .wp-block-post-title,
.page-hero > .rf-display--lg,
.page-hero > .rf-lede,
.page-hero > .rf-split {
  max-width: 1200px;
}

.page-hero .rf-display--lg {
  color: var(--rf-green-logo);
}

.page-hero .rf-display--md {
  max-inline-size: 36.7rem;
  color: var(--rf-green);
  font-weight: var(--rf-weight-semibold);
}

.page-hero .rf-lede {
  max-inline-size: 1200px;
  color: var(--rf-brown);
}

.page-hero .wp-block-buttons {
  width: fit-content;
}

.page-hero--articles {
  min-height: 0;
}

.page-hero--articles.has-global-padding {
  padding-left: 0;
  padding-right: 0;
}

.page-hero--articles .article-wide,
.articles-list {
  box-sizing: border-box;
  width: min(1200px, calc(100% - 2rem));
  max-width: none;
  margin-inline: auto;
}

/* The constrained-column rule pins this child to the left below 1200px,
   which leaves the hero flush while the article list stays inset. */
.page-hero--articles .article-wide {
  margin-left: auto !important;
  margin-right: auto !important;
}

.page-hero--articles .wp-block-query-title {
  max-inline-size: 36.7rem;
  margin-inline: 0;
}

.page-hero--articles .rf-lede {
  max-inline-size: var(--rf-measure);
  margin-inline: 0;
}

.page-hero--articles .page-hero__optin {
  margin-left: 0;
  margin-right: auto;
}

.articles-list.has-global-padding {
  padding-left: 0;
  padding-right: 0;
}

.articles-list {
  padding-block: var(--rf-space-7) var(--rf-space-8);
}

.articles-list .wp-block-post-template {
  gap: var(--rf-space-7);
}

.articles-list .wp-block-post {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.articles-list .wp-block-post > * {
  margin-block: 0;
}

.articles-list .pill {
  margin-block-end: var(--rf-space-3);
}

.articles-list .wp-block-post-title {
  margin-block-start: 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-2xl);
  font-weight: var(--rf-weight-semibold);
  line-height: var(--rf-leading-snug);
  letter-spacing: 0;
}

.articles-list .wp-block-post-title a {
  color: var(--rf-green-deep);
  font-weight: var(--rf-weight-semibold);
  text-decoration: none;
}

.articles-list .wp-block-post-date {
  margin-block-start: var(--rf-space-2);
  font-size: var(--rf-text-sm);
  color: var(--rf-ink-muted);
}

.articles-list .wp-block-post-excerpt {
  margin-block-start: var(--rf-space-4);
  max-inline-size: 42rem;
}

.articles-list .wp-block-post-content.rf-prose {
  margin-block-start: var(--rf-space-4);
  max-inline-size: 52.5rem;
}

/* Articles archive (templates/home.html): split hero, topic filter bar,
   logo-olive lead spotlight, and scannable editorial essay cards. */
.page-hero--essays .page-hero__essays-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 26.5rem);
  gap: var(--rf-space-6) var(--rf-space-7);
  align-items: center;
}

.page-hero--essays .page-hero__essays-grid > * {
  margin: 0 !important;
  min-inline-size: 0;
}

.page-hero--essays .page-hero__kicker {
  background: var(--rf-surface-dark);
  color: var(--rf-on-dark);
}

.page-hero--essays .wp-block-query-title {
  max-inline-size: none;
  color: var(--rf-green-logo);
}

.page-hero--essays .page-hero__essays-copy .rf-lede {
  max-inline-size: 52ch;
  color: var(--rf-brown);
}

.wp-block-group.is-style-rf-surface.page-hero__subscribe {
  padding: var(--rf-space-5);
  border-color: var(--rf-panel-deep);
  background: var(--rf-white);
}

.page-hero__subscribe > * {
  margin-block: 0;
}

.page-hero__subscribe-head {
  display: flex;
  align-items: flex-start;
  gap: var(--rf-space-3);
  margin-block-end: var(--rf-space-4);
}

.page-hero__subscribe-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--rf-green-soft);
  color: var(--rf-green-deep);
}

.page-hero__subscribe-icon svg {
  display: block;
  width: 1.35rem;
  height: 1.35rem;
}

.page-hero__subscribe-head .rf-meta {
  color: var(--rf-green-deep);
  margin: 0 0 var(--rf-space-1);
}

.page-hero__subscribe-lede {
  margin: 0;
  font-size: var(--rf-text-sm);
  line-height: var(--rf-leading-ui);
  color: var(--rf-ink-muted);
}

.page-hero__subscribe .page-hero__optin {
  width: 100%;
}

.rf-articles-index {
  padding-block: var(--rf-space-6) var(--rf-space-8);
}

.rf-articles-index .pill {
  margin-block: 0;
}

.rf-articles-index [hidden] {
  display: none !important;
}

.rf-articles-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rf-space-4);
  padding-block-end: var(--rf-space-5);
  margin-block-end: var(--rf-space-6);
  border-block-end: 1px solid var(--rf-rule);
}

.rf-articles-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-2);
}

button.rf-filter-pill {
  font-family: var(--rf-font-sans);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-semibold);
  letter-spacing: 0;
  text-transform: none;
  padding: 0.42rem 0.85rem;
  gap: 0.45rem;
  background: var(--rf-white);
  color: var(--rf-ink);
  border: 1.5px solid var(--rf-panel-deep);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

button.rf-filter-pill:hover {
  background: var(--rf-green-soft);
  color: var(--rf-green-deep);
  border-color: var(--rf-green);
}

button.rf-filter-pill.is-active,
button.rf-filter-pill[aria-pressed="true"] {
  background: var(--rf-green-deep);
  color: var(--rf-on-dark);
  border-color: var(--rf-green-deep);
}

.rf-filter-pill .pill__icon {
  inline-size: 1rem;
  block-size: 1rem;
}

.rf-filter-pill__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 1.45rem;
  padding-inline: 0.35rem;
  border-radius: var(--rf-radius-pill);
  background: var(--rf-cream-deep);
  color: var(--rf-ink-muted);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-bold);
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

button.rf-filter-pill:hover .rf-filter-pill__count {
  background: var(--rf-white);
  color: var(--rf-green-deep);
}

button.rf-filter-pill.is-active .rf-filter-pill__count,
button.rf-filter-pill[aria-pressed="true"] .rf-filter-pill__count {
  background: rgba(255, 255, 255, 0.2);
  color: var(--rf-on-dark);
}

.rf-articles-status {
  margin: 0;
  font-weight: var(--rf-weight-semibold);
  color: var(--rf-ink-muted);
}

/* Lead spotlight: latest essay on logo-olive with right-hand key takeaways. */
.rf-card.rf-card--lead {
  position: relative;
  overflow: hidden;
  max-inline-size: none;
  width: 100%;
  margin: 0 0 var(--rf-space-7);
  padding: var(--rf-space-6);
  background: var(--rf-green-logo);
  color: var(--rf-on-dark);
  border: 4px solid var(--rf-cream-deep);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--rf-space-6);
  align-items: stretch;
}

.rf-card.rf-card--lead.has-takeaways {
  grid-template-columns: minmax(0, 1.2fr) minmax(19rem, 0.9fr);
  gap: var(--rf-space-6) var(--rf-space-7);
}

.rf-card.rf-card--lead::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("../illustrations/roots-1.svg") no-repeat 102% 110% / 26rem auto;
  opacity: 0.08;
  pointer-events: none;
}

.rf-card.rf-card--lead > * {
  margin-block: 0;
}

.rf-card__lead-main,
.rf-card__lead-aside {
  position: relative;
  z-index: 1;
  margin: 0;
  min-inline-size: 0;
}

.rf-card__lead-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rf-space-4);
}

.rf-card__lead-eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-3);
}

.rf-card__lead-topic {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--rf-orange-soft);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-bold);
  letter-spacing: var(--rf-tracking-meta);
  text-transform: uppercase;
}

.rf-meta-icon,
.rf-btn-icon {
  display: block;
  width: 1rem;
  height: 1rem;
  flex: none;
}

.rf-articles-index .rf-card.rf-card--lead .rf-card__lead-title {
  margin: 0;
  font-family: var(--rf-font-serif);
  font-size: clamp(var(--rf-text-xl), 2.5vw, 2.65rem);
  font-weight: var(--rf-weight-bold);
  line-height: var(--rf-leading-display);
  letter-spacing: var(--rf-tracking-display);
  color: var(--rf-on-dark);
}

.rf-articles-index .rf-card.surface--logo .rf-card__lead-title a {
  color: var(--rf-on-dark);
  font-weight: var(--rf-weight-bold);
  text-decoration: none;
}

.rf-articles-index .rf-card.surface--logo .rf-card__lead-title a:hover,
.rf-articles-index .rf-card.surface--logo .rf-card__lead-title a:focus-visible {
  color: var(--rf-cream);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.14em;
}

.rf-card.rf-card--lead .rf-card__lead-excerpt {
  margin: 0;
  max-inline-size: 58ch;
  font-size: var(--rf-text-lg);
  line-height: var(--rf-leading-callout);
  color: var(--rf-cream);
}

.rf-card__lead-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-4);
  margin-block-start: auto;
  padding-block-start: var(--rf-space-2);
}

.rf-card.rf-card--lead a.btn.rf-card__lead-cta {
  color: var(--rf-on-dark);
  border-color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
}

.rf-card.rf-card--lead a.btn.rf-card__lead-cta:hover,
.rf-card.rf-card--lead a.btn.rf-card__lead-cta:focus-visible {
  background: var(--rf-white);
  color: var(--rf-green-deep);
  border-color: var(--rf-white);
  text-decoration: none;
}

.rf-card__lead-meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-2);
  color: var(--rf-cream);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-semibold);
}

.rf-card__readtime {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.rf-card__lead-aside {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--rf-space-5);
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.rf-card__lead-aside .rf-card__lead-kicker {
  margin: 0 0 var(--rf-space-3);
  color: var(--rf-orange-soft);
}

.rf-card__lead-aside ol.rf-keytakeaways {
  gap: var(--rf-space-3);
}

.rf-card__lead-aside ol.rf-keytakeaways > li {
  border-left-color: var(--rf-orange-soft);
  color: var(--rf-cream);
}

.rf-card__lead-aside ol.rf-keytakeaways > li::before {
  color: var(--rf-orange-soft);
}

.rf-card__lead-aside ol.rf-keytakeaways > li > strong:first-child {
  color: var(--rf-on-dark);
}

.rf-articles-subhead {
  display: flex;
  align-items: center;
  gap: var(--rf-space-4);
  margin: 0 0 var(--rf-space-5);
}

.rf-articles-subhead .rf-meta {
  flex: none;
  color: var(--rf-ink-muted);
}

.rf-articles-subhead__rule {
  flex: 1 1 auto;
  height: 1px;
  background: var(--rf-rule);
}

/* Scannable editorial essay cards. */
.rf-articles-feed {
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-4);
}

.rf-card.rf-card--essay {
  max-inline-size: none;
  width: 100%;
  margin: 0;
  padding: var(--rf-space-5);
  background: var(--rf-white);
  border: 4px solid var(--rf-cream-deep);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.rf-card.rf-card--essay:hover,
.rf-card.rf-card--essay:focus-within {
  border-color: var(--rf-panel-deep);
  box-shadow: inset 4px 0 0 var(--rf-green), var(--rf-shadow);
}

.rf-card__essay-row {
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 1fr) auto;
  gap: var(--rf-space-5);
  align-items: start;
  margin: 0;
}

.rf-card__topic-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-block-start: 0.15rem;
  border-radius: var(--rf-radius-sm);
  background: var(--rf-green-soft);
  color: var(--rf-green-deep);
  border: 1px solid color-mix(in srgb, var(--rf-green) 24%, transparent);
}

.rf-card__topic-tile--ai {
  background: var(--rf-orange-soft);
  color: var(--rf-brown);
  border-color: color-mix(in srgb, var(--rf-orange) 36%, transparent);
}

.rf-card__topic-tile--news {
  background: var(--rf-panel);
  color: var(--rf-brown);
  border-color: var(--rf-panel-deep);
}

.rf-card__topic-svg {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
}

.rf-card__essay-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rf-space-2);
  min-inline-size: 0;
}

.rf-card__essay-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-3);
}

.rf-card__essay-byline {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-2);
  color: var(--rf-ink-muted);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-semibold);
}

.rf-articles-index .rf-card__essay-title {
  margin: var(--rf-space-1) 0 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-xl);
  font-weight: var(--rf-weight-bold);
  line-height: var(--rf-leading-snug);
  letter-spacing: var(--rf-tracking-display);
}

.rf-articles-index .rf-card__essay-title a {
  color: var(--rf-ink-deep);
  font-weight: var(--rf-weight-bold);
  text-decoration: none;
  transition: color 150ms ease;
}

.rf-articles-index .rf-card__essay-title a:hover,
.rf-articles-index .rf-card__essay-title a:focus-visible {
  color: var(--rf-green-deep);
  text-decoration: underline;
  text-underline-offset: 0.14em;
}

.rf-card.rf-card--essay .rf-card__essay-excerpt {
  margin: 0;
  max-inline-size: 65ch;
  font-size: var(--rf-text-md);
  line-height: var(--rf-leading-body);
  color: var(--rf-ink);
}

.rf-card__peek {
  margin-block-start: var(--rf-space-2);
  inline-size: fit-content;
  max-inline-size: 100%;
  border: 1.5px solid var(--rf-cream-deep);
  border-radius: var(--rf-radius-pill);
  background: var(--rf-cream);
  transition: border-color 150ms ease, background-color 150ms ease;
}

.rf-card__peek:not([open]):hover {
  border-color: var(--rf-panel-deep);
  background: var(--rf-panel-soft);
}

.rf-card__peek[open] {
  inline-size: min(100%, 48rem);
  border-radius: var(--rf-radius-sm);
}

.rf-card__peek-summary {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--rf-space-2);
  padding: 0.32rem 0.85rem;
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-semibold);
  color: var(--rf-green-deep);
  cursor: pointer;
  list-style: none;
}

.rf-card__peek[open] .rf-card__peek-summary {
  padding: var(--rf-space-2) var(--rf-space-4);
}

.rf-card__peek-summary::-webkit-details-marker,
.rf-card__peek-summary::marker {
  display: none;
  content: "";
}

.rf-card__peek-arrow {
  flex: none;
  transition: transform 220ms ease;
}

.rf-card__peek[open] .rf-card__peek-arrow {
  transform: rotate(90deg);
}

.rf-card__peek-panel {
  padding: var(--rf-space-4);
  border-block-start: 1px solid var(--rf-cream-deep);
  background: var(--rf-white);
}

.rf-card__peek-panel ol.rf-keytakeaways {
  gap: var(--rf-space-3);
}

.rf-card__essay-go {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--rf-radius-pill);
  background: var(--rf-cream);
  border: 1.5px solid var(--rf-cream-deep);
  color: var(--rf-green-deep);
  text-decoration: none;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 150ms ease;
}

.rf-card__go-icon {
  display: block;
  width: 1.15rem;
  height: 1.15rem;
}

.rf-card.rf-card--essay:hover .rf-card__essay-go,
.rf-card.rf-card--essay:focus-within .rf-card__essay-go {
  background: var(--rf-green);
  border-color: var(--rf-green);
  color: var(--rf-on-primary);
  transform: translateX(2px);
}

@media (max-width: 58rem) {
  .page-hero--essays .page-hero__essays-grid,
  .rf-card.rf-card--lead.has-takeaways {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 40rem) {
  .rf-card.rf-card--lead,
  .rf-card.rf-card--essay {
    padding: var(--rf-space-4);
  }

  .rf-card__essay-row {
    grid-template-columns: 2.75rem minmax(0, 1fr);
    gap: var(--rf-space-3);
  }

  .rf-card__topic-tile {
    width: 2.75rem;
    height: 2.75rem;
  }

  .rf-card__essay-go {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  button.rf-filter-pill,
  .rf-card.rf-card--essay,
  .rf-articles-index .rf-card__essay-title a,
  .rf-card__peek-arrow,
  .rf-card__essay-go {
    transition: none;
  }

  .rf-card.rf-card--essay:hover .rf-card__essay-go,
  .rf-card.rf-card--essay:focus-within .rf-card__essay-go {
    transform: none;
  }
}

.rf-updates-archive {
  padding-block: var(--rf-space-7) var(--rf-space-8);
}

.rf-updates-feed .wp-block-post-template {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.rf-updates-feed .wp-block-post {
  margin: 0;
}

.rf-updates-feed .wp-block-post + .wp-block-post {
  margin-top: var(--rf-space-6);
  padding-top: var(--rf-space-6);
  border-top: 2px dotted var(--rf-green);
}

.wp-block-group.rf-update-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--rf-space-4);
  align-items: start;
  margin: 0;
}

.rf-update-item__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-top: 0.15rem;
  border: 1px solid color-mix(in srgb, var(--rf-green) 28%, transparent);
  border-radius: var(--rf-radius-sm);
  background: var(--rf-green-soft);
  color: var(--rf-green-deep);
}

.rf-update-item__icon {
  display: block;
  width: 1.35rem;
  height: 1.35rem;
}

.wp-block-group.rf-update-item__copy {
  min-width: 0;
}

.rf-update-item__copy > * {
  margin-block: 0;
}

.rf-update-item__title {
  margin: 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-2xl);
  font-weight: var(--rf-weight-bold);
  line-height: var(--rf-leading-snug);
}

.rf-update-item__title a {
  color: var(--rf-ink-deep);
  text-decoration: none;
}

.rf-update-item__title a:hover,
.rf-update-item__title a:focus {
  color: var(--rf-green-deep);
  text-decoration: underline;
  text-underline-offset: 0.12em;
}

.rf-update-item__date {
  margin-top: var(--rf-space-1) !important;
  color: var(--rf-ink-muted);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-semibold);
  line-height: var(--rf-leading-snug);
}

.rf-update-item__body.wp-block-post-content {
  margin-top: var(--rf-space-3) !important;
  max-inline-size: 52.5rem;
}

.articles-list .wp-block-post-excerpt__more-text {
  margin-block-start: var(--rf-space-3);
}

.page-hero__optin {
  position: relative;
  z-index: 1;
  width: min(100%, 32rem);
}

.page-hero__optin-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rf-space-3);
}

.page-hero__optin-row .input {
  flex: 1 1 14rem;
  inline-size: auto;
  min-inline-size: 0;
}

.page-hero__optin-row .btn {
  flex: none;
}

/* Section blocks (a hero, then a band) keep a wide step.
   Running text uses the prose rhythm: space-5 between paragraphs,
   space-6 before a heading. Articles already opt into .rf-prose. */
.wp-block-post-content.is-layout-constrained:not(.rf-prose) > * + * {
  margin-block-start: var(--rf-space-7);
}

.wp-block-post-content.is-layout-constrained:not(.rf-prose) > * + :is(p, ul, ol) {
  margin-block-start: var(--rf-space-5);
}

.wp-block-post-content.is-layout-constrained:not(.rf-prose) > * + :is(h1, h2, h3, h4) {
  margin-block-start: var(--rf-space-6);
}
${heroArt}

.page-hero--about::before {
  background: url("../illustrations/apples-1.svg") no-repeat 0% 100% / 28rem auto;
  opacity: 0.16;
}

.wp-block-group.rf-stack.is-layout-flow > * + * {
  margin-block-start: 0;
}

.wp-block-group.rf-split.is-layout-flow > *,
.wp-block-group.rf-grid--two.is-layout-flow > *,
.wp-block-group.rf-grid--three.is-layout-flow > * {
  margin-block: 0;
}

.wp-block-group.rf-prose.is-layout-flow > * + * {
  margin-block-start: var(--rf-space-5);
}

.wp-block-group.rf-prose.is-layout-flow > * + :is(h1, h2, h3, h4) {
  margin-block-start: var(--rf-space-6);
}

.home-brands {
  text-align: center;
}

.home-brands :is(h2, h3) {
  color: var(--rf-on-dark);
}

.home-brands :is(p, em) {
  color: var(--rf-on-dark-muted);
}

.home-brands img {
  display: block;
  width: 100%;
  height: auto;
}

.about-hero__split {
  align-items: center;
}

.about-hero__split > .rf-copy {
  flex: 1 1 20rem;
  max-inline-size: 34rem;
}

.about-hero__split > .wp-block-html,
.about-hero__split > .rf-figure {
  flex: 1 1 28rem;
  max-inline-size: 36rem;
}

.about-story > .rf-prose,
.case-study__split > .rf-prose {
  flex: 1 1 26rem;
  max-inline-size: none;
}

.about-story > .about-path {
  flex: 0 1 22rem;
  max-inline-size: 22rem;
}

.about-path {
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-4);
}

.about-stop {
  display: flex;
  align-items: flex-start;
  gap: var(--rf-space-4);
}

.about-stop > .wp-block-html,
.case-study__title > .wp-block-html {
  flex: none;
}

img.about-stop__mark,
img.case-study__mark {
  height: 2.25rem;
  width: auto;
  max-width: 6.5rem;
  flex: none;
  margin-top: 0.15rem;
  border-radius: 0;
  object-fit: contain;
}

.case-study__title {
  display: flex;
  align-items: flex-start;
  gap: var(--rf-space-4);
  align-self: stretch;
}

.case-study .rf-copy > .rf-meta + .case-study__title {
  margin-block-start: var(--rf-space-3);
}

.case-study__title .rf-display {
  min-inline-size: 0;
}

.case-study__split > .rf-quote {
  flex: 0 1 26rem;
  max-inline-size: 26rem;
  width: auto;
}

@media (max-width: 50rem) {
  .page-hero--articles::before {
    background-size: 16rem auto;
    background-position: 80% 100%;
  }

  .page-hero__optin-row .btn {
    flex: 1 1 100%;
  }

  .page-hero--about::before {
    background-size: 14rem auto;
  }

  .about-story > .about-path {
    max-inline-size: none;
  }
}

.services-close {
  position: relative;
  overflow: hidden;
  margin: 0;
  padding-block: var(--rf-space-7);
  border-top: 4px solid var(--rf-panel-deep);
  background-color: var(--rf-panel);
}
${apple}

.services-close__grid {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(20rem, 25.5rem);
  gap: var(--rf-space-6) var(--rf-space-7);
  align-items: center;
  width: min(1200px, calc(100% - 2rem));
  max-width: none !important;
  margin-inline: auto !important;
}

.services-close__grid > * {
  margin: 0 !important;
  min-inline-size: 0;
}

.services-close__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rf-space-3);
}

.services-close__copy > * {
  margin-block: 0;
}

.services-close__kicker {
  background: var(--rf-surface-dark);
  color: var(--rf-on-dark);
}

.services-close__title {
  color: var(--rf-green-logo);
  max-inline-size: none;
}

.services-close__lede {
  max-inline-size: 46ch;
  color: var(--rf-brown);
}

.wp-block-group.is-style-rf-surface.services-close__box {
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-4);
  padding: var(--rf-space-5);
  border-color: var(--rf-panel-deep);
  background: var(--rf-white);
}

.services-close__box > * {
  margin-block: 0;
}

.services-close__host {
  display: flex;
  align-items: center;
  gap: var(--rf-space-3);
  padding-block-end: var(--rf-space-4);
  border-block-end: 1px solid var(--rf-rule);
}

.services-close__avatar {
  flex: none;
  display: block;
  width: 3.25rem;
  height: 3.25rem;
  border: 3px solid var(--rf-cream-deep);
  border-radius: 0;
  object-fit: cover;
}

.services-close__host-id {
  display: grid;
  gap: 0.15rem;
  min-inline-size: 0;
}

.services-close__host-name {
  margin: 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-lg);
  font-weight: var(--rf-weight-semibold);
  line-height: var(--rf-leading-snug);
  letter-spacing: var(--rf-tracking-display);
  color: var(--rf-ink-deep);
}

.services-close__host-role {
  margin: 0;
  font-size: var(--rf-text-sm);
  line-height: var(--rf-leading-ui);
  color: var(--rf-ink-muted);
}

.services-close .book-call__open {
  margin: 0;
  width: 100%;
}

.services-close #book-call {
  width: 100%;
  justify-content: center;
  gap: 0.5rem;
  padding-block: 0.85rem;
  font-size: var(--rf-text-md);
}

.services-close #book-call .rf-btn-icon {
  transition: transform 160ms ease;
}

.services-close #book-call:hover .rf-btn-icon,
.services-close #book-call:focus-visible .rf-btn-icon {
  transform: translateX(3px);
}

.services-close__note {
  margin: var(--rf-space-3) 0 0;
  text-align: center;
  font-size: var(--rf-text-sm);
  line-height: var(--rf-leading-ui);
  color: var(--rf-ink-muted);
}

.services-close .wp-block-button__link {
  background: var(--rf-orange);
  color: var(--rf-ink);
  border-radius: var(--rf-radius-pill);
}

@media (max-width: 56rem) {
  .services-close__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 40rem) {
  .services-close__title {
    font-size: var(--rf-text-2xl);
  }
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

.book-call {
  width: min(72rem, calc(100vw - 2rem));
  height: min(52rem, calc(100dvh - 3rem));
}

.book-call__frame {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  border: 0;
  background: var(--rf-white);
}

.rf-article-hero {
  background-color: var(--rf-green-logo);
  color: var(--rf-on-dark);
}

.rf-article-hero :is(h1, h2, p, a, time) {
  color: var(--rf-on-dark);
}

.rf-article-hero h1 {
  font-size: var(--rf-text-3xl);
  font-weight: var(--rf-weight-bold);
  line-height: var(--rf-leading-display);
  letter-spacing: var(--rf-tracking-display);
}

.rf-article-hero .rf-lede {
  max-inline-size: none;
  color: var(--rf-on-dark);
}

.rf-article-hero .wp-block-post-terms a,
.rf-article-hero .rf-meta {
  /* #fac9a3 is 4.81:1 on --rf-green-logo. --rf-orange-web is 2.77:1. */
  color: var(--rf-orange-on-dark, #fac9a3);
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-bold);
  letter-spacing: var(--rf-tracking-meta);
  text-decoration: none;
  text-transform: uppercase;
}

.rf-article-byline {
  align-items: center;
}

.rf-article-byline p,
.rf-article-byline .wp-block-post-author-name,
.rf-article-byline .wp-block-post-date {
  margin: 0;
}

.rf-article-byline a {
  color: var(--rf-on-dark);
  text-decoration: none;
}

.rf-article-byline img {
  display: block;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: var(--rf-radius-pill);
  object-fit: cover;
}

.rf-article-copy {
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-6);
  min-inline-size: 0;
}

@property --rf-prose-column {
  syntax: "<length>";
  inherits: true;
  initial-value: 0px;
}

.wp-block-post-content.rf-prose,
.editor-styles-wrapper {
  /* 70% of the 1200px article shell. A ch length tracks the heading font
     and the column drifts. This length does not. */
  --rf-prose-column: 52.5rem;
}

.wp-block-post-content.rf-prose {
  box-sizing: border-box;
  max-inline-size: none;
  /* Root padding is for the page shell. This element is already the article
     column, and the extra inset makes the front narrower than the editor. */
  padding-inline: 0;
}

/* A heading's own font used to widen a ch measure past the body. The length
   is resolved on the prose wrapper, then inherited. */
.wp-block-post-content.rf-prose > :is(h1, h2, h3, h4, h5, h6),
.editor-styles-wrapper .is-root-container > :is(h1, h2, h3, h4, h5, h6) {
  max-width: var(--rf-prose-column);
}

/* Body copy owns the vertical rhythm. A component's margin: 0 must not
   erase the gap, and the previous element stays at 0 so the gap is not doubled. */
.wp-block-post-content.rf-prose > * + * {
  margin-block-start: var(--rf-space-5);
}

.wp-block-post-content.rf-prose > * + :is(h1, h2, h3, h4) {
  margin-block-start: var(--rf-space-6);
}

.rf-article-rail {
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-5);
}

.wp-block-group.is-style-rf-logo.rf-rail-cta {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-3);
  padding: var(--rf-space-5);
  background-color: var(--rf-green-logo);
  color: var(--rf-on-dark);
  border: 4px solid var(--rf-cream-deep);
}

.wp-block-group.is-style-rf-logo.rf-rail-cta::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("../illustrations/roots-1.svg") no-repeat 115% 115% / 14rem auto;
  opacity: 0.09;
  pointer-events: none;
}

.rf-rail-cta > * {
  position: relative;
  z-index: 1;
  margin-block: 0;
}

.rf-rail-cta__head {
  display: flex;
  align-items: center;
  gap: var(--rf-space-3);
}

.rf-rail-cta__avatar {
  flex: none;
  display: block;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-radius: 0;
  object-fit: cover;
}

.wp-block-group.rf-rail-cta p.rf-rail-cta__eyebrow {
  margin: 0;
  color: var(--rf-orange-on-dark, #fac9a3);
}

.wp-block-group.rf-rail-cta h2.rf-rail-cta__title {
  margin: 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-lg);
  font-weight: var(--rf-weight-bold);
  line-height: var(--rf-leading-snug);
  letter-spacing: var(--rf-tracking-display);
  color: var(--rf-on-dark);
}

.wp-block-group.rf-rail-cta p.rf-rail-cta__copy {
  margin: 0;
  font-size: var(--rf-text-sm);
  line-height: var(--rf-leading-callout);
  color: var(--rf-cream);
}

.rf-rail-cta__actions {
  margin-block-start: var(--rf-space-2) !important;
  width: 100%;
}

.wp-block-group.rf-rail-cta a.btn.rf-rail-cta__btn {
  width: 100%;
  justify-content: center;
  gap: 0.45rem;
  background-color: var(--rf-orange);
  color: var(--rf-ink-deep);
  border-radius: var(--rf-radius-pill);
  text-decoration: none;
}

.wp-block-group.rf-rail-cta a.btn.rf-rail-cta__btn .rf-btn-icon {
  transition: transform 160ms ease;
}

.wp-block-group.rf-rail-cta a.btn.rf-rail-cta__btn:hover,
.wp-block-group.rf-rail-cta a.btn.rf-rail-cta__btn:focus-visible {
  background-color: color-mix(in srgb, var(--rf-orange) 86%, var(--rf-white));
  color: var(--rf-ink-deep);
  text-decoration: none;
}

.wp-block-group.rf-rail-cta a.btn.rf-rail-cta__btn:hover .rf-btn-icon,
.wp-block-group.rf-rail-cta a.btn.rf-rail-cta__btn:focus-visible .rf-btn-icon {
  transform: translateX(3px);
}

.rf-article-rail .is-style-rf-logo .wp-block-button.btn--primary .wp-block-button__link {
  background-color: var(--rf-white);
  color: var(--rf-green-deep);
  border-radius: var(--rf-radius-pill);
}

.wp-block-group.is-style-rf-surface.rf-rail-subscribe {
  padding: var(--rf-space-5);
  background: var(--rf-white);
  border: 4px solid var(--rf-cream-deep);
}

.rf-rail-subscribe > * {
  margin-block: 0;
}

.rf-rail-subscribe form.rf-subscribe {
  display: grid;
  gap: var(--rf-space-3);
}

.rf-rail-subscribe form.rf-subscribe > * {
  margin-block: 0;
}

.rf-subscribe__head {
  display: flex;
  align-items: center;
  gap: var(--rf-space-3);
}

.rf-subscribe__icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--rf-green-soft);
  color: var(--rf-green-deep);
}

.rf-subscribe__icon svg {
  display: block;
  width: 1.35rem;
  height: 1.35rem;
}

.rf-subscribe__titles {
  display: grid;
  gap: 0.1rem;
  min-inline-size: 0;
}

.rf-subscribe__titles .rf-meta {
  margin: 0;
  color: var(--rf-green-deep);
}

.rf-subscribe__title {
  margin: 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-lg);
  font-weight: var(--rf-weight-semibold);
  line-height: var(--rf-leading-snug);
  letter-spacing: var(--rf-tracking-display);
  color: var(--rf-ink-deep);
}

.rf-subscribe__lede {
  margin: 0;
  font-size: var(--rf-text-sm);
  line-height: var(--rf-leading-ui);
  color: var(--rf-ink-muted);
}

.rf-rail-subscribe .input {
  background: var(--rf-cream);
  border-color: color-mix(in srgb, var(--rf-ink) 18%, transparent);
}

.rf-rail-subscribe .input:focus {
  background: var(--rf-white);
}

.rf-subscribe__submit {
  width: 100%;
  justify-content: center;
  gap: 0.45rem;
  margin-block-start: var(--rf-space-1);
}

.rf-subscribe__submit .rf-btn-icon {
  transition: transform 160ms ease;
}

.rf-subscribe__submit:hover:not(:disabled) .rf-btn-icon,
.rf-subscribe__submit:focus-visible .rf-btn-icon {
  transform: translateX(3px);
}

.rf-rail-subscribe .rf-subscribe-status:empty {
  display: none;
}

.rf-article-close .wp-block-button.btn--cta .wp-block-button__link {
  background-color: var(--rf-orange);
  color: var(--rf-ink-deep);
  border-radius: var(--rf-radius-pill);
}

.wp-block-group.is-style-rf-surface.rf-article-author {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-5);
  margin-block-start: var(--rf-space-4);
  padding: var(--rf-space-6);
  background: var(--rf-white);
  border: 4px solid var(--rf-cream-deep);
  text-align: left;
  align-items: stretch;
}

.wp-block-group.is-style-rf-surface.rf-article-author::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("../illustrations/roots-1.svg") no-repeat 104% 112% / 20rem auto;
  opacity: 0.06;
  pointer-events: none;
}

.rf-article-author > * {
  position: relative;
  z-index: 1;
  margin-block: 0;
}

.rf-article-author__main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--rf-space-5);
  align-items: start;
}

.rf-article-author__main > * {
  margin-block: 0;
}

.rf-article-author__portrait {
  display: block;
  flex: none;
  line-height: 0;
}

.rf-article-author img.rf-article-author__photo {
  display: block;
  width: 5.5rem;
  height: 5.5rem;
  border: 4px solid var(--rf-cream-deep);
  border-radius: 0;
  object-fit: cover;
}

.rf-article-author__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--rf-space-2);
  min-inline-size: 0;
}

.rf-article-author__body > * {
  margin-block: 0;
}

.rf-article-author__eyebrow {
  color: var(--rf-green-deep);
}

.rf-article-author h2.rf-article-author__name {
  margin: 0;
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-2xl);
  font-weight: var(--rf-weight-bold);
  line-height: var(--rf-leading-snug);
  letter-spacing: var(--rf-tracking-display);
}

.rf-article-author h2.rf-article-author__name a {
  color: var(--rf-ink-deep);
  text-decoration: none;
}

.rf-article-author h2.rf-article-author__name a:hover,
.rf-article-author h2.rf-article-author__name a:focus-visible {
  color: var(--rf-green-deep);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.14em;
}

.rf-article-author__role {
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-semibold);
  line-height: var(--rf-leading-ui);
  color: var(--rf-ink-muted);
}

.rf-article-author__bio {
  margin-block-start: var(--rf-space-1) !important;
  font-size: var(--rf-text-sm);
  line-height: var(--rf-leading-body);
  color: var(--rf-ink);
  max-inline-size: 60ch;
}

.rf-article-author__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rf-space-3);
  padding-block-start: var(--rf-space-4);
  border-block-start: 1px solid var(--rf-rule);
}

.rf-article-author__foot > * {
  margin-block: 0;
}

.rf-article-author__more {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--rf-text-sm);
  font-weight: var(--rf-weight-bold);
  color: var(--rf-green-deep);
  text-decoration: none;
}

.rf-article-author__more .rf-btn-icon {
  transition: transform 160ms ease;
}

.rf-article-author__more:hover,
.rf-article-author__more:focus-visible {
  color: var(--rf-green-6);
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.rf-article-author__more:hover .rf-btn-icon,
.rf-article-author__more:focus-visible .rf-btn-icon {
  transform: translateX(3px);
}

.rf-article-author__socials {
  gap: var(--rf-space-2);
}

.rf-article-author .rf-icon-link {
  width: 2.35rem;
  height: 2.35rem;
  background: var(--rf-cream);
  border: 1.5px solid var(--rf-cream-deep);
  color: var(--rf-ink);
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}

.rf-article-author .rf-icon-link:hover,
.rf-article-author .rf-icon-link:focus-visible {
  background: var(--rf-green-soft);
  border-color: var(--rf-green);
  color: var(--rf-green-deep);
}

@media (max-width: 36rem) {
  .wp-block-group.is-style-rf-surface.rf-article-author {
    padding: var(--rf-space-5);
  }

  .rf-article-author__main {
    grid-template-columns: 1fr;
    gap: var(--rf-space-4);
  }
}

.rf-updated {
  color: var(--rf-ink-muted);
  font-size: var(--rf-text-sm);
}

.rf-updated .rf-icon {
  width: 1em;
  height: 1em;
  flex: none;
}

.rf-updated .rf-meta,
.rf-updated .wp-block-post-date {
  margin: 0;
  color: inherit;
  font-size: inherit;
  font-weight: var(--rf-weight-bold);
  letter-spacing: var(--rf-tracking-meta);
  text-transform: uppercase;
}

.rf-article-frame {
  display: grid;
  /* Copy is 70% of the shell. The rail keeps a 16rem floor and takes the rest. */
  grid-template-columns: minmax(0, 70%) minmax(16rem, 1fr);
  column-gap: 4.5rem;
  align-items: start;
  width: min(1200px, calc(100% - 2rem));
  margin-inline: auto;
}

.rf-article-frame > :last-child {
  position: sticky;
  top: var(--rf-space-5);
  align-self: start;
}

@media (max-width: 880px) {
  .rf-article-frame {
    grid-template-columns: 1fr;
  }

  .rf-article-frame > :last-child {
    position: static;
  }
}

.rf-back-top {
  position: fixed;
  z-index: 20;
  bottom: 1.25rem;
  left: max(0.75rem, calc((100vw - min(1200px, 100vw - 2rem)) / 2 - 6.5rem));
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 2px solid var(--rf-cream-deep);
  border-radius: 50%;
  background: var(--rf-green-logo);
  color: var(--rf-on-dark);
  text-decoration: none;
  visibility: hidden;
}

.rf-back-top.is-visible {
  visibility: visible;
}

.rf-back-top svg {
  width: 1.15rem;
  height: 1.15rem;
}

.rf-back-top:hover {
  background: var(--rf-green-deep);
  color: var(--rf-on-dark);
}

@media (max-width: 767px) {
  .rf-back-top {
    display: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  html:has(.rf-back-top) {
    scroll-behavior: smooth;
  }
}

.site-footer {
  background: var(--rf-green-logo);
  color: var(--rf-on-dark);
  text-align: center;
  padding: var(--rf-space-6) var(--rf-gutter) var(--rf-space-5);
  margin: 0;
}

.site-footer a {
  color: var(--rf-on-dark);
  font-size: var(--rf-text-sm);
  text-decoration: none;
}

.site-footer p {
  margin: var(--rf-space-4) 0 0;
  font-size: var(--rf-text-sm);
}

main.wp-block-group {
  padding-block-end: var(--rf-space-8);
}

@media (max-width: 800px) {
  .site-header__inner {
    flex-wrap: wrap;
  }

  .site-header .rf-nav {
    width: 100%;
    overflow-x: auto;
  }
}

/* The overlay menu is the hamburger below 600px. A full-width nav wraps
   that button onto its own row. Keep it beside the logo. */
@media (max-width: 599px) {
  .site-header__inner {
    flex-wrap: nowrap;
  }

  .site-header .rf-nav {
    width: auto;
    overflow: visible;
  }
}
`;
}

function writeChromeParts(hasArt, measure) {
  writeText(
    "wordpress/rf/assets/css/site-chrome.css",
    siteChromeCss(hasArt),
  );
  writeText(
    "wordpress/rf/parts/header.html",
    `<!-- wp:group {"align":"full","className":"site-header","style":{"border":{"bottom":{"color":"var:preset|color|paper-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignfull site-header" style="border-bottom-color:var(--wp--preset--color--paper-deep);border-bottom-style:solid;border-bottom-width:4px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
	<!-- wp:group {"className":"site-header__inner","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"stretch"}} -->
	<div class="wp-block-group site-header__inner">
		<!-- wp:site-logo {"shouldSyncIcon":false,"className":"site-logo"} /-->

		<!-- wp:navigation {"overlayMenu":"mobile","className":"rf-nav","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","justifyContent":"right"}} /-->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
`,
  );
  writeText(
    "wordpress/rf/parts/footer.html",
    `<!-- wp:group {"align":"full","backgroundColor":"logo","textColor":"surface","className":"site-footer","style":{"spacing":{"padding":{"top":"var:preset|spacing|space-6","bottom":"var:preset|spacing|space-5"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull site-footer has-logo-background-color has-surface-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--space-6);padding-bottom:var(--wp--preset--spacing--space-5)">
	<!-- wp:paragraph {"align":"center"} -->
	<p class="has-text-align-center"><a href="/privacy-policy/">Privacy Policy · This site is privacy-first</a> <a href="/terms-of-service/">Terms of Service</a></p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"align":"center"} -->
	<p class="has-text-align-center">© 2026 Roots &amp; Fruit</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
`,
  );
  writeText(
    "wordpress/rf/parts/book.html",
    `<!-- wp:group {"align":"full","className":"services-close","anchor":"book","style":{"border":{"top":{"color":"var:custom|panel-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull services-close" id="book" style="border-top-color:var(--wp--custom--panel-deep);border-top-style:solid;border-top-width:4px;padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
	<!-- wp:group {"className":"services-close__grid","layout":{"type":"default"}} -->
	<div class="wp-block-group services-close__grid">
		<!-- wp:group {"className":"rf-copy services-close__copy","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-copy services-close__copy">
			<!-- wp:html -->
			<p class="pill services-close__kicker"><svg class="pill__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></svg><span>Advisory &amp; Coaching</span></p>
			<!-- /wp:html -->

			<!-- wp:heading {"textAlign":"left","level":2,"className":"rf-display rf-display--lg services-close__title"} -->
			<h2 class="wp-block-heading has-text-align-left rf-display rf-display--lg services-close__title">Book a discovery call</h2>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"rf-lede services-close__lede"} -->
			<p class="rf-lede services-close__lede">Grab a time. We’ll talk about where you are, which package fits, and whether we should work together at all.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->

		<!-- wp:group {"className":"is-style-rf-surface services-close__box","layout":{"type":"default"}} -->
		<div class="wp-block-group is-style-rf-surface services-close__box">
			<!-- wp:html -->
			<div class="services-close__host">
				<img class="services-close__avatar" src="/wp-content/themes/rf/assets/articles/matt.jpg" alt="" width="640" height="640" />
				<div class="services-close__host-id">
					<p class="services-close__host-name">Matt Cromwell</p>
					<p class="services-close__host-role">Founder, Roots &amp; Fruit</p>
				</div>
			</div>
			${bookOpen()}
			<p class="services-close__note">Direct 1-on-1 with Matt · Pick a time that works</p>
			<!-- /wp:html -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:html -->
<dialog class="rf-gallery__dialog rf-edge--thick book-call" id="book-call-dialog" aria-labelledby="book-call-title">
	<iframe class="book-call__frame" title="Choose a time"></iframe>
	<div class="rf-gallery__dialog-foot">
		<h2 class="rf-gallery__dialog-caption" id="book-call-title">Book a discovery call</h2>
		<button type="button" class="rf-gallery__close" data-book-close>
			<svg class="rf-gallery__close-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7.2 7.2 12.8 12.8M12.8 7.2 7.2 12.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
			Close
		</button>
	</div>
</dialog>
<!-- /wp:html -->
`,
  );
  writeText("wordpress/rf/parts/author-bio.html", `${authorBioBlocks()}\n`);
  const marketing = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->
<main class="wp-block-group" style="margin-top:0;margin-bottom:0">
	<!-- wp:group {"align":"full","className":"page-hero","backgroundColor":"panel","style":{"border":{"bottom":{"color":"var:custom|panel-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
	<div class="wp-block-group alignfull page-hero has-panel-background-color has-background" style="border-bottom-color:var(--wp--custom--panel-deep);border-bottom-style:solid;border-bottom-width:4px;padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
		<!-- wp:post-title {"level":1} /-->

		<!-- wp:post-excerpt /-->
	</div>
	<!-- /wp:group -->

	<!-- wp:post-content {"layout":{"type":"constrained","contentSize":"1200px"}} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"book"} /-->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;
  const marketingShell = marketing.replace(
      `\t<!-- wp:group {"align":"full","className":"page-hero","backgroundColor":"panel","style":{"border":{"bottom":{"color":"var:custom|panel-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
	<div class="wp-block-group alignfull page-hero has-panel-background-color has-background" style="border-bottom-color:var(--wp--custom--panel-deep);border-bottom-style:solid;border-bottom-width:4px;padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
		<!-- wp:post-title {"level":1} /-->

		<!-- wp:post-excerpt /-->
	</div>
	<!-- /wp:group -->

	<!-- wp:post-content`,
    "\t<!-- wp:post-content",
  );
  writeText("wordpress/rf/templates/front-page.html", marketingShell);
  writeText("wordpress/rf/templates/page.html", marketingShell);
  const articlesHero = `<!-- wp:group {"className":"article-wide page-hero__essays-grid","layout":{"type":"default"}} -->
		<div class="wp-block-group article-wide page-hero__essays-grid">
			<!-- wp:group {"className":"rf-copy page-hero__essays-copy","layout":{"type":"default"}} -->
			<div class="wp-block-group rf-copy page-hero__essays-copy">
				<!-- wp:html -->
				<p class="pill page-hero__kicker"><svg class="pill__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg><span>Field notes &amp; essays</span></p>
				<!-- /wp:html -->

				<!-- wp:query-title {"type":"archive","showPrefix":false,"level":1,"className":"rf-display rf-display--xl"} /-->

				<!-- wp:paragraph {"className":"rf-lede"} -->
				<p class="rf-lede">I write these when a problem in the work is worth keeping. Practical notes on WordPress product strategy, customer experience, and the AI workflows I actually use.</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->

			<!-- wp:group {"className":"is-style-rf-surface page-hero__subscribe","layout":{"type":"default"}} -->
			<div class="wp-block-group is-style-rf-surface page-hero__subscribe">
				<!-- wp:html -->
				<div class="page-hero__subscribe-head">
					<span class="page-hero__subscribe-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></span>
					<div>
						<p class="rf-meta">Newsletter</p>
						<p class="page-hero__subscribe-lede">Leave your email if you want the next one when I publish it.</p>
					</div>
				</div>
				${subscribeForm({ idPrefix: "articles", layout: "inline" })}
				<!-- /wp:html -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:group -->`;
  let home = marketing.replace(
    "<!-- wp:post-title {\"level\":1} /-->\n\n\t\t<!-- wp:post-excerpt /-->",
    articlesHero,
  ).replace(
      "<!-- wp:post-content {\"layout\":{\"type\":\"constrained\",\"contentSize\":\"1200px\"}} /-->",
      `<!-- wp:rf/articles-index /-->`,
  );
  home = home
    .replace('className":"page-hero"', 'className":"page-hero page-hero--articles page-hero--essays"')
    .replace(
      'alignfull page-hero has-panel-background-color',
      'alignfull page-hero page-hero--articles page-hero--essays has-panel-background-color',
    )
    .replace(
      '"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}',
      '"blockGap":"var:preset|spacing|space-4","padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}',
    );
  writeText("wordpress/rf/templates/home.html", home);

  const templates = readdirSync(join(root, "wordpress/rf/templates")).filter((name) => name.endsWith(".html"));
  const footer = '<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->';
  const bookAndFooter = `<!-- wp:template-part {"slug":"book"} /-->\n\n${footer}`;
  for (const name of templates) {
    if (name === "front-page.html" || name === "page.html" || name === "home.html") continue;
    const rel = `wordpress/rf/templates/${name}`;
    const html = read(rel);
    if (!html.includes(footer) || html.includes('slug":"book"')) continue;
    writeText(rel, html.replace(footer, bookAndFooter));
  }

  writeText(
    "wordpress/rf/templates/single.html",
    `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"0"}}},"layout":{"type":"default"}} -->
<main class="wp-block-group" style="margin-top:0">
	<!-- wp:group {"align":"full","className":"rf-article-hero","backgroundColor":"logo","textColor":"surface","style":{"spacing":{"margin":{"top":"0","bottom":"var:preset|spacing|space-6"},"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
	<div class="wp-block-group alignfull rf-article-hero has-logo-background-color has-surface-color has-text-color has-background" style="margin-top:0;margin-bottom:var(--wp--preset--spacing--space-6);padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
		${articleHeroCopy()}
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-article-frame","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-article-frame">
		<!-- wp:group {"className":"rf-article-copy","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-article-copy">
			<!-- wp:post-content {"className":"rf-prose","style":{"spacing":{"blockGap":"var:preset|spacing|space-6"}},"layout":{"type":"constrained","contentSize":"52.5rem"}} /-->

			<!-- wp:template-part {"slug":"author-bio"} /-->
		</div>
		<!-- /wp:group -->
		<!-- wp:template-part {"slug":"sidebar-post","tagName":"aside"} /-->
	</div>
	<!-- /wp:group -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"book"} /-->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`,
  );
}

function patternFile(title, slug, blocks, headers = []) {
  const extra = headers.map((line) => ` * ${line}`).join("\n");
  return `<?php
/**
 * Title: ${title}
 * Slug: rf/${slug}
 * Categories: rf
 * Inserter: true
${extra ? `${extra}\n` : ""} */
?>
${blocks.trim()}
`;
}

function writePatterns(measure) {
  const patternDir = join(root, "wordpress/rf/patterns");
  mkdirSync(patternDir, { recursive: true });
  const owned = new Set([
    "quote.php",
    "takeaways.php",
    "offer.php",
    "quote-portrait.php",
    "review.php",
    "card.php",
    "page-hero.php",
    "facts.php",
    "steps.php",
    "stats.php",
    "people.php",
    "shots.php",
    "logo-row.php",
    "icon-card.php",
    "numbered-card.php",
    "outline-icon-card.php",
    "showcase-card.php",
    "icon-list.php",
    "outline-icon-list.php",
    "subscribe.php",
    "author-bio.php",
    "dialogue.php",
  ]);
  for (const name of readdirSync(patternDir)) {
    if (name.endsWith(".php") && !owned.has(name)) {
      unlinkSync(join(patternDir, name));
      console.log(`  removed patterns/${name}`);
    }
  }
  writeText(
    "wordpress/rf/patterns/quote.php",
    patternFile(
      "Quote",
      "quote",
      quote({
        text: "The work moved in the weeks between the calls, not only during them.",
        name: "A founder",
        role: "Product studio",
        width: measure,
      }),
    ),
  );

  writeText(
    "wordpress/rf/patterns/takeaways.php",
    patternFile(
      "Key takeaways",
      "takeaways",
      `<!-- wp:group {"className":"rf-takeaways","layout":{"type":"default"}} -->
<div class="wp-block-group rf-takeaways">
	<!-- wp:heading {"level":2,"className":"rf-takeaways__title"} -->
	<h2 class="wp-block-heading rf-takeaways__title">Key Takeaways</h2>
	<!-- /wp:heading -->

	<!-- wp:list {"ordered":true,"className":"rf-keytakeaways"} -->
	<ol class="wp-block-list rf-keytakeaways">
		<!-- wp:list-item -->
		<li>Lead with one clear action the reader can take this week.</li>
		<!-- /wp:list-item -->

		<!-- wp:list-item -->
		<li>Name the constraint before you name the tactic.</li>
		<!-- /wp:list-item -->

		<!-- wp:list-item -->
		<li>Keep the list short enough to scan without scrolling twice.</li>
		<!-- /wp:list-item -->
	</ol>
	<!-- /wp:list -->
</div>
<!-- /wp:group -->`,
    ),
  );

  writeText(
    "wordpress/rf/patterns/offer.php",
    patternFile(
      "Service offer",
      "offer",
      offer({
        eyebrow: "For founders building alone",
        title: "Solo Coaching",
        lede: "A sounding board and real accountability, for someone building the company alone.",
        items: ["Weekly sessions for six weeks", "Async support between calls"],
        amount: "€1,200",
        cadence: "Flat rate · weekly for 6 weeks",
        portrait: "/wp-content/themes/rf/assets/mark.svg",
        quote: "The work moved in the weeks between the calls, not only during them.",
        by: '<span class="rf-offer__name">A founder</span> Product studio',
      }),
    ),
  );

  writeText(
    "wordpress/rf/patterns/quote-portrait.php",
    patternFile(
      "Portrait quote",
      "quote-portrait",
      quote({
        text: "I believe there’s a short list of people you should listen to when building your product, and it doesn’t start with me.",
        name: "Matt Cromwell",
        role: "Founder, Roots &amp; Fruit",
        width: measure,
        avatar: { src: "/wp-content/themes/rf/assets/mark.svg", width: 44, height: 44 },
      }),
    ),
  );

  writeText(
    "wordpress/rf/patterns/review.php",
    patternFile(
      "Review card",
      "review",
      `<!-- wp:group {"tagName":"article","className":"rf-review","style":{"dimensions":{"width":"24rem"}},"layout":{"type":"default"}} -->
<article class="wp-block-group rf-review" style="width:24rem">
	<!-- wp:html -->
	<p class="rf-review__rating"><span class="rf-review__stars" aria-hidden="true"><span class="rf-review__star rf-review__star--on"></span><span class="rf-review__star rf-review__star--on"></span><span class="rf-review__star rf-review__star--on"></span><span class="rf-review__star rf-review__star--on"></span><span class="rf-review__star rf-review__star--on"></span></span><span class="rf-review__score"><span>5</span> out of <span>5</span></span></p>
	<!-- /wp:html -->

	<!-- wp:heading {"level":3,"className":"rf-review__title"} -->
	<h3 class="wp-block-heading rf-review__title">Impressive and easy to use</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"className":"rf-review__body"} -->
	<p class="rf-review__body">This plugin absolutely blew my mind. The modals are well-designed, and I didn't need to use CSS at all.</p>
	<!-- /wp:paragraph -->

	<!-- wp:group {"tagName":"footer","className":"rf-review__by","layout":{"type":"default"}} -->
	<footer class="wp-block-group rf-review__by">
		<!-- wp:group {"className":"rf-review__who","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-review__who">
			<!-- wp:paragraph {"className":"rf-review__name"} -->
			<p class="rf-review__name">Angela Blake</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"className":"rf-review__role"} -->
			<p class="rf-review__role">WordPress.org</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->

		<!-- wp:paragraph {"className":"rf-review__date"} -->
		<p class="rf-review__date"><time datetime="2026-01-20">January 20, 2026</time></p>
		<!-- /wp:paragraph -->
	</footer>
	<!-- /wp:group -->
</article>
<!-- /wp:group -->`,
    ),
  );

  writeText(
    "wordpress/rf/patterns/card.php",
    patternFile(
      "Card",
      "card",
      `<!-- wp:group {"tagName":"article","className":"rf-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card">
	<!-- wp:paragraph {"className":"rf-meta"} -->
	<p class="rf-meta">Note</p>
	<!-- /wp:paragraph -->

	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">A plugin note</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>The pattern stays in the editor. The popup reads from that same pattern.</p>
	<!-- /wp:paragraph -->

	<!-- wp:group {"tagName":"footer","className":"rf-card__foot","layout":{"type":"default"}} -->
	<footer class="wp-block-group rf-card__foot">
		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button {"className":"btn btn--tertiary btn--sm"} -->
			<div class="wp-block-button btn btn--tertiary btn--sm"><a class="wp-block-button__link wp-element-button">Open</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</footer>
	<!-- /wp:group -->
</article>
<!-- /wp:group -->`,
    ),
  );

  writeText(
    "wordpress/rf/patterns/page-hero.php",
    patternFile(
      "Page hero",
      "page-hero",
      pageHero({
        postTitle: true,
        subtitle: "A short line under the title.",
        lede: "One or two sentences on what this page is for.",
        buttons: [
          { classes: "btn btn--cta", href: "#book", label: "Book a discovery call" },
          { classes: "btn btn--tertiary", href: "#packages", label: "See the packages" },
        ],
      }),
      ["Block Types: core/post-content", "Post Types: page"],
    ),
  );

  const pieces = [
    ["Facts", "facts", factsPattern()],
    ["Steps", "steps", stepsPattern()],
    ["Stat row", "stats", statsPattern()],
    ["People", "people", peoplePattern()],
    ["Photo cluster", "shots", shotsPattern()],
    ["Logo row", "logo-row", logoRowPattern()],
    ["Icon card", "icon-card", iconCardPattern()],
    ["Numbered card", "numbered-card", numberedCardPattern()],
    ["Outline icon card", "outline-icon-card", outlineIconCardPattern()],
    ["Showcase card", "showcase-card", showcaseCardPattern()],
    ["Icon list", "icon-list", iconListPattern()],
    ["Outline icon list", "outline-icon-list", outlineIconListPattern()],
    ["Subscribe", "subscribe", subscribePattern()],
    ["Author bio", "author-bio", authorBioPattern()],
    ["Dialogue", "dialogue", dialoguePattern()],
  ];
  for (const [title, slug, blocks] of pieces) {
    writeText(`wordpress/rf/patterns/${slug}.php`, patternFile(title, slug, blocks));
  }
}

function writeSidebarSubscribe() {
  const rel = "wordpress/rf/parts/sidebar-post.html";
  const form = subscribeForm({ idPrefix: "subscribe", name: true });
  const next = `<!-- wp:group {"className":"rf-article-rail","layout":{"type":"default"}} -->
<div class="wp-block-group rf-article-rail">
	<!-- wp:group {"className":"is-style-rf-logo rf-rail-cta","layout":{"type":"default"}} -->
	<div class="wp-block-group is-style-rf-logo rf-rail-cta">
		<!-- wp:html -->
		<div class="rf-rail-cta__head">
			<img class="rf-rail-cta__avatar" src="/wp-content/themes/rf/assets/articles/matt.jpg" alt="" width="640" height="640" />
			<p class="rf-meta rf-rail-cta__eyebrow">Work with Matt</p>
		</div>
		<!-- /wp:html -->

		<!-- wp:heading {"level":2,"className":"rf-rail-cta__title"} -->
		<h2 class="wp-block-heading rf-rail-cta__title">Is your product business stagnating?</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph {"className":"rf-rail-cta__copy"} -->
		<p class="rf-rail-cta__copy">Book a free discovery call with Matt to look at where growth is stalling and what to fix next.</p>
		<!-- /wp:paragraph -->

		<!-- wp:html -->
		<div class="rf-rail-cta__actions">
			<a class="btn btn--cta rf-rail-cta__btn" href="#book"><span>Book a discovery call</span><svg class="rf-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
		</div>
		<!-- /wp:html -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"is-style-rf-surface rf-rail-subscribe","layout":{"type":"default"}} -->
	<div class="wp-block-group is-style-rf-surface rf-rail-subscribe">
		<!-- wp:html -->
		${form}
		<!-- /wp:html -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
`;
  if (!next.includes('id="subscribe-email"')) {
    throw new Error("sidebar subscribe form was not refreshed from the shared snippet");
  }
  writeText(rel, next);
}

function validateChromeParts() {
  const errors = [];
  const header = read("wordpress/rf/parts/header.html");
  const footer = read("wordpress/rf/parts/footer.html");
  const chrome = read("wordpress/rf/assets/css/site-chrome.css");
  for (const needle of ["wp:site-logo", "wp:navigation", "rf-nav", "site-header", "4px"]) {
    if (!header.includes(needle)) errors.push(`parts/header.html missing ${needle}`);
  }
  for (const needle of ["site-footer", "backgroundColor\":\"logo\"", "/privacy-policy/", "/terms-of-service/"]) {
    if (!footer.includes(needle)) errors.push(`parts/footer.html missing ${needle}`);
  }
  for (const needle of [".site-header", "6.7rem", ".site-footer", "--rf-green-logo", ".page-hero"]) {
    if (!chrome.includes(needle)) errors.push(`site-chrome.css missing ${needle}`);
  }
  errors.push(...missingAltInKit(root));
  if (errors.length) {
    throw new Error(`compile-wordpress chrome checks failed:\n- ${errors.join("\n- ")}`);
  }
}

function main() {
  const { design, tokens } = loadSources();
  const customValues = buildCustom(design, tokens);
  const theme = buildThemeJson({ design, tokens, customValues });
  const registry = buildRegistry(customValues);
  validate(theme, registry);

  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(root, "wordpress/rf/assets/css"), { recursive: true });

  const registryFile = {
    $comment:
      "Generated Layer B registry. Feed to register_design_token(). Do not edit.",
    source: {
      design: "DESIGN.md",
      tokens: "css/tokens.css",
      brand: design.name,
    },
    tokens: registry,
  };

  writeJson("wordpress/theme.json", theme);
  writeJson("wordpress/design-tokens.json", registryFile);
  writeJson("wordpress/rf/theme.json", theme);
  writeJson("wordpress/rf/design-tokens.json", registryFile);
  for (const variation of buildBlockStyleVariations()) {
    writeJson(`wordpress/rf/styles/block/${variation.file}`, variation.data);
  }

  const defaults = loadBrandDefaults(design);
  writeJson("wordpress/rf/brand-defaults.json", {
    $comment:
      "Generated from brand.json. Theme seeds Site Title / Tagline on first run, and when those options still match the last seed. Do not edit.",
    name: defaults.name,
    tagline: defaults.tagline,
    mark: defaults.mark,
    logo: defaults.logo,
    dark_logo: defaults.dark_logo,
  });

  for (const file of ["brand.css", "ui.css", "rf.css", "fonts.css", "tokens.css", "layouts.css", "elements.css", "components.css", "chrome.css", "disclosure.css"]) {
    copyFileSync(join(root, "css", file), join(root, "wordpress/rf/assets/css", file));
    console.log(`  copied css/${file} → wordpress/rf/assets/css/${file}`);
  }

  const markSrc = join(root, "assets", "mark.svg");
  if (!existsSync(markSrc)) {
    throw new Error("Missing assets/mark.svg (Site Logo fallback).");
  }
  copyFileSync(markSrc, join(root, "wordpress/rf/assets/mark.svg"));
  console.log("  copied assets/mark.svg → wordpress/rf/assets/mark.svg");

  const glyphDir = join(root, "wordpress/rf/assets/icons");
  mkdirSync(glyphDir, { recursive: true });
  for (const file of ["check.svg", "arrow.svg", "mail.svg"]) {
    const src = join(root, "icons", file);
    if (!existsSync(src)) throw new Error(`Missing glyph: icons/${file}`);
    copyFileSync(src, join(glyphDir, file));
    console.log(`  copied icons/${file} → wordpress/rf/assets/icons/${file}`);
  }

  const productDir = join(root, "products");
  const productDest = join(root, "wordpress/rf/assets/products");
  mkdirSync(productDest, { recursive: true });
  for (const file of readdirSync(productDir)) {
    if (!/\.(jpg|png|webp)$/i.test(file)) continue;
    copyFileSync(join(productDir, file), join(productDest, file));
    console.log(`  copied products/${file} → wordpress/rf/assets/products/${file}`);
  }

  const logoDir = join(root, "assets", "logos");
  mkdirSync(join(root, "wordpress/rf/assets/logos"), { recursive: true });
  for (const file of ["R&F_Logo.svg", "R&F_Logo_DarkBG.svg"]) {
    const src = join(logoDir, file);
    if (!existsSync(src)) throw new Error(`Missing official logo asset: assets/logos/${file}`);
    copyFileSync(src, join(root, "wordpress/rf/assets/logos", file));
    console.log(`  copied assets/logos/${file} → wordpress/rf/assets/logos/${file}`);
  }

  const mediaSrc = join(root, "assets", "media");
  if (existsSync(mediaSrc)) {
    cpSync(mediaSrc, join(root, "wordpress/rf/assets/media"), { recursive: true });
    console.log("  copied assets/media → wordpress/rf/assets/media");
  }

  const hasArt = copyKitIllustrations();
  const staleBundle = join(root, "wordpress/rf/assets/css/rf-site.css");
  if (existsSync(staleBundle)) unlinkSync(staleBundle);

  writeChromeParts(hasArt, customValues.layout.measure);
  writePatterns(customValues.layout.measure);
  writeSidebarSubscribe();
  for (const [rel, html] of Object.entries(marketingPages())) {
    writeText(rel, html.endsWith("\n") ? html : `${html}\n`);
  }
  validateChromeParts();

  console.log(
    `Compiled ${design.name}: ${theme.settings.color.palette.length} colors, ${registry.length} custom tokens.`,
  );
}

main();
