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
import {
  parseCdsTokens,
  parseDesignMdFrontMatter,
  resolveInlineRefs,
  resolveTokenRef,
} from "./lib/parse-yaml-map.mjs";
import {
  articleHeroCopy,
  bookOpen,
  factsPattern,
  iconCardPattern,
  iconListPattern,
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

function copyHugoIllustrations() {
  const from = join(
    root,
    "..",
    "..",
    "..",
    "..",
    "Studio",
    "wiremd-projects",
    "hugo",
    "static",
    "illustrations",
  );
  const dest = join(root, "wordpress/rf/assets/illustrations");
  if (!existsSync(from)) {
    console.log("  illustrations not found next to the Hugo site; hero art skipped");
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
  top: 50%;
  right: max(1rem, calc((100% - 1200px) / 2));
  width: 18rem;
  aspect-ratio: 623 / 386;
  transform: translateY(-50%);
  background: url("../illustrations/apples-1.svg") no-repeat center / contain;
  opacity: var(--rf-atmosphere-spot);
  pointer-events: none;
}

.services-close > * {
  position: relative;
  z-index: 1;
}

@media (max-width: 50rem) {
  .services-close::before {
    width: min(14rem, 42%);
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

.services-close .wp-block-button__link {
  background: var(--rf-orange);
  color: var(--rf-ink);
  border-radius: var(--rf-radius-pill);
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

.rf-article-hero .wp-block-post-terms a {
  color: var(--rf-orange-web);
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
  --rf-prose-column: 65ch;
}

.wp-block-post-content.rf-prose {
  box-sizing: border-box;
  max-inline-size: none;
}

/* 65ch on a heading uses the heading's own font, so in the editor the
   title grows past the prose column and starts further left. The length
   is resolved on the prose wrapper, then inherited. */
.wp-block-post-content.rf-prose > :is(h1, h2, h3, h4, h5, h6),
.editor-styles-wrapper .is-root-container > :is(h1, h2, h3, h4, h5, h6) {
  max-width: var(--rf-prose-column);
}

/* block-styles zeros .wp-block-quote margin, which beats the prose gap.
   The editor spaces blocks with the post block gap instead, so this is
   the front only. */
.wp-block-post-content.rf-prose > .wp-block-quote {
  margin-top: var(--rf-space-6);
}

/* The code panel's own margin shorthand sets the top to 0, which beats the prose gap. */
.wp-block-post-content.rf-prose > .rf-code {
  margin-top: var(--rf-space-5);
}

.rf-article-rail {
  display: flex;
  flex-direction: column;
  gap: var(--rf-space-6);
}

.rf-article-rail .is-style-rf-logo .wp-block-button.btn--primary .wp-block-button__link {
  background-color: var(--rf-white);
  color: var(--rf-green-deep);
  border-radius: var(--rf-radius-pill);
}

.rf-article-close .wp-block-button.btn--cta .wp-block-button__link {
  background-color: var(--rf-orange);
  color: var(--rf-ink-deep);
  border-radius: var(--rf-radius-pill);
}

.rf-article-author {
  align-items: center;
  text-align: center;
}

.rf-article-author img {
  width: 5rem;
  height: 5rem;
  border-radius: var(--rf-radius-pill);
  object-fit: cover;
}

.rf-article-author h2 {
  font-family: var(--rf-font-serif);
  font-size: var(--rf-text-xl);
  font-weight: var(--rf-weight-semibold);
  line-height: var(--rf-leading-snug);
}

.rf-article-author h2 a {
  color: var(--rf-ink-deep);
  text-decoration: none;
}

.rf-article-author .rf-icon-link {
  color: var(--rf-ink);
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
  grid-template-columns: minmax(0, var(--rf-measure)) minmax(16rem, 1fr);
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
	<!-- wp:heading {"textAlign":"left","level":2} -->
	<h2 class="wp-block-heading">Book a discovery call</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>Grab a time. We’ll talk about where you are, which package fits, and whether we should work together at all.</p>
	<!-- /wp:paragraph -->

	<!-- wp:html -->
	${bookOpen()}
	<!-- /wp:html -->
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
  const articlesHero = `<!-- wp:group {"className":"article-wide","style":{"spacing":{"blockGap":"var:preset|spacing|space-4"}},"layout":{"type":"default"}} -->
		<div class="wp-block-group article-wide">
		<!-- wp:query-title {"type":"archive","showPrefix":false,"level":1,"className":"rf-display rf-display--lg"} /-->

		<!-- wp:paragraph {"className":"rf-lede"} -->
		<p class="rf-lede">I write these when a problem in the work is worth keeping. Leave your email if you want the next one.</p>
		<!-- /wp:paragraph -->

		<!-- wp:html -->
		${subscribeForm({ idPrefix: "articles", layout: "inline" })}
		<!-- /wp:html -->
		</div>
		<!-- /wp:group -->`;
  let home = marketing.replace(
    "<!-- wp:post-title {\"level\":1} /-->\n\n\t\t<!-- wp:post-excerpt /-->",
    articlesHero,
  ).replace(
      "<!-- wp:post-content {\"layout\":{\"type\":\"constrained\",\"contentSize\":\"1200px\"}} /-->",
      `<!-- wp:query {"className":"articles-list","query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","inherit":true},"layout":{"type":"default"}} -->
	<div class="wp-block-query articles-list">
		<!-- wp:post-template {"layout":{"type":"default"}} -->
			<!-- wp:post-terms {"term":"category"} /-->
			<!-- wp:post-title {"isLink":true,"level":2} /-->
			<!-- wp:post-date /-->
			<!-- wp:post-excerpt {"moreText":"Read more"} /-->
		<!-- /wp:post-template -->
	</div>
	<!-- /wp:query -->`,
  );
  home = home
    .replace('className":"page-hero"', 'className":"page-hero page-hero--articles"')
    .replace(
      'alignfull page-hero has-panel-background-color',
      'alignfull page-hero page-hero--articles has-panel-background-color',
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
			<!-- wp:post-content {"className":"rf-prose","style":{"spacing":{"blockGap":"var:preset|spacing|space-6"}},"layout":{"type":"constrained","contentSize":"${measure}"}} /-->

			<!-- wp:group {"className":"rf-article-author","layout":{"type":"default"}} -->
			<div class="wp-block-group rf-article-author">
				<!-- wp:html -->
				<img src="/wp-content/themes/rf/assets/articles/matt.jpg" alt="Matt Cromwell" width="80" height="80" />
				<!-- /wp:html -->
				<!-- wp:heading {"level":2} -->
				<h2 class="wp-block-heading"><a href="/about-matt/">Matt Cromwell</a></h2>
				<!-- /wp:heading -->
				<!-- wp:paragraph -->
				<p>Matt Cromwell is the founder of Roots &amp; Fruit, a fractional CGO agency helping product companies grow without burning out their teams or their customers. He co-founded, built, and sold GiveWP in an eight-figure acquisition, then led marketing and customer experience at scale across multiple products at StellarWP.</p>
				<!-- /wp:paragraph -->
				<!-- wp:html -->
				<p class="rf-cluster rf-cluster--center"><a class="rf-icon-link" href="https://x.com/learnwithmattc" aria-label="X"><svg class="rf-icon rf-icon--x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg></a><a class="rf-icon-link" href="https://youtube.com/@wpproducttalk" aria-label="YouTube"><svg class="rf-icon rf-icon--youtube" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a><a class="rf-icon-link" href="https://linkedin.com/in/mattcromwell" aria-label="LinkedIn"><svg class="rf-icon rf-icon--linkedin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a></p>
				<!-- /wp:html -->
			</div>
			<!-- /wp:group -->
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
    "icon-list.php",
    "subscribe.php",
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
	<!-- wp:heading {"level":3,"className":"rf-takeaways__title"} -->
	<h3 class="wp-block-heading rf-takeaways__title">Key Takeaways</h3>
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
    ["Icon list", "icon-list", iconListPattern()],
    ["Subscribe", "subscribe", subscribePattern()],
  ];
  for (const [title, slug, blocks] of pieces) {
    writeText(`wordpress/rf/patterns/${slug}.php`, patternFile(title, slug, blocks));
  }
}

function writeSidebarSubscribe() {
  const rel = "wordpress/rf/parts/sidebar-post.html";
  const current = read(rel);
  const form = subscribeForm({ idPrefix: "subscribe", name: true });
  if (current.includes(form)) return;
  const next = current.replace(/<form class="rf-copy rf-subscribe"[\s\S]*?<\/form>/, form);
  if (next === current || !next.includes('id="subscribe-email"')) {
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

  const hasArt = copyHugoIllustrations();
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
