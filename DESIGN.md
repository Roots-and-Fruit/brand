---
version: 1.0.0
name: Roots & Fruit
description: >-
  Core Design System (CDS) agent contract for Roots & Fruit visual identity.
  Use for marketing pages, product UI, plugin surfaces, and as the token source
  for the presentation layer (PDS / rf-reveal) that sits on top of CDS. Prefer
  CSS variables in css/tokens.css (--rf-*) when implementing in this repo.
colors:
  primary: "#62744d"
  primary-deep: "#4b5e2e"
  primary-soft: "#e4eadc"
  secondary: "#6b6560"
  tertiary: "#d4844e"
  tertiary-soft: "#f0d5c0"
  neutral: "#faf6ee"
  neutral-deep: "#f3ede2"
  surface: "#ffffff"
  panel: "#ebe4d8"
  panel-deep: "#dfd6c6"
  panel-soft: "#f3ece2"
  ink: "#2c2922"
  ink-deep: "#1a1a1a"
  ink-soft: "#9a948c"
  brown: "#40352a"
  rule: "rgba(44, 41, 34, 0.14)"
  info: "#1a5276"
  info-soft: "#d6e6f2"
  blue-muted: "#b8d0e4"
  danger: "#ad3a22"
  danger-soft: "#f7e4dc"
  on-primary: "#ffffff"
  on-info: "#ffffff"
  on-tertiary: "#1a1a1a"
  blue-nav: "#2a5f8f"
  blue-mid: "#245f8c"
  surface-dark: "#4b5e2e"
  on-dark: "#ffffff"
  on-dark-muted: "rgba(255, 255, 255, 0.78)"
  code-bg: "#f3ece2"
  code-fg: "#3d5c4e"
  code-border: "rgba(44, 41, 34, 0.12)"
  code-label-border: "rgba(44, 41, 34, 0.28)"
  code-meta: "#9a948c"
  green-1: "#c5d4b8"
  green-2: "#9aaf86"
  green-3: "#7a9268"
  green-5: "#4a5a38"
  green-6: "#2f3a24"
  green-logo: "#505a49"
typography:
  display-xl:
    fontFamily: Knile, Georgia, Times New Roman, serif
    fontSize: 3.5rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Knile, Georgia, Times New Roman, serif
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-md:
    fontFamily: Knile, Georgia, Times New Roman, serif
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Knile, Georgia, Times New Roman, serif
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Nunito Sans, system-ui, sans-serif
    fontSize: 1.375rem
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: Nunito Sans, system-ui, sans-serif
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: Nunito Sans, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Nunito Sans, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.35
  meta:
    fontFamily: Nunito Sans, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0.06em
  code:
    fontFamily: JetBrains Mono, ui-monospace, Consolas, monospace
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 0.55rem
  md: 0.75rem
  lg: 1.25rem
  pill: 999px
spacing:
  1: 0.25rem
  2: 0.5rem
  3: 0.75rem
  4: 1rem
  5: 1.5rem
  6: 2.25rem
  7: 3.375rem
  8: 5.0625rem
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  heading:
    textColor: "{colors.ink-deep}"
    typography: "{typography.display-md}"
  subhead:
    textColor: "{colors.primary}"
    typography: "{typography.display-sm}"
  body:
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  muted:
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
  link:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: 0.7rem 1.15rem
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 0.7rem 1.15rem
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 0.7rem 1.15rem
  button-cta:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.pill}"
    padding: 0.7rem 1.15rem
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.pill}"
    padding: 0.45rem 0.65rem
  button-sm:
    rounded: "{rounded.pill}"
    padding: 0.28rem 0.7rem
    # 14px control label — denser than body-sm; not a type-scale step
  button-product:
    backgroundColor: "{colors.blue-nav}"
    textColor: "{colors.on-info}"
    rounded: "{rounded.pill}"
    padding: 0.7rem 1.15rem
    typography: "{typography.label}"
  button-product-quiet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.pill}"
    padding: 0.7rem 1.15rem
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 0.65rem 0.8rem
    typography: "{typography.body-md}"
  surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 1.5rem
  surface-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 1.5rem
  alert-info:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 0.75rem 1rem
  alert-success:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 0.75rem 1rem
  alert-warning:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.brown}"
    rounded: "{rounded.md}"
    padding: 0.75rem 1rem
  alert-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: 0.75rem 1rem
  alert-note:
    backgroundColor: "{colors.panel-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 1.5rem
  pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 0.25rem 0.65rem
    typography: "{typography.meta}"
  pill-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.pill}"
    padding: 0.25rem 0.65rem
  surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.md}"
    padding: 1.5rem
  takeaways-title:
    textColor: "{colors.primary}"
    typography: "{typography.display-sm}"
  takeaways-item:
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
  takeaways-num:
    textColor: "{colors.tertiary}"
    typography: "{typography.label}"
  code-inline:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-fg}"
    rounded: "{rounded.sm}"
    padding: 0.08em 0.35em
  code-inline-label:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-fg}"
    borderColor: "{colors.code-label-border}"
    rounded: "{rounded.sm}"
    padding: 0.1em 0.45em
  code-block:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.code-fg}"
    rounded: "{rounded.md}"
    padding: 1rem
layout:
  measure: 60ch
  content-size: 56rem
  wide-size: 56rem
  gutter: spacing.5
  inset: spacing.6
  cluster: spacing.3
  stack: spacing.5
  grid: spacing.5
  section: spacing.6
  split: spacing.7
elevation:
  sm: "--rf-shadow"
  md: "--rf-shadow-md"
focus:
  ring: "--rf-focus"
---

## Overview

Roots & Fruit is Matt Cromwell’s practice for WordPress operators and product teams: clear strategy, practical systems, and work that holds up in the real world. The tone is earned and calm—craft over hype.

Visual identity feels like warm paper and moss: cream canvas, warm ink, Knile for voice, Nunito Sans for clarity, moss green as the steady accent.

Agents must treat this file as normative for any new UI, page, slide, dashboard, or plugin surface. Load `css/brand.css` for fonts and tokens, `css/ui.css` for layout and components, or `css/rf.css` for both. Map tokens here to `--rf-*` custom properties instead of inventing parallel values. App chrome (the catalog sidebar, and a site header or footer) stays outside those files. The human reference is `index.html` (Overview leads with who we are, then how to use the system).

Brand feel (always):
- Warm cream paper, not cool gray or pure white as the default page wash
- Soft, organic, grounded; never cyberpunk, glassmorphism, or neon
- One primary interactive accent (moss green); orange is rare and intentional
- Air over density; prefer an extra section or slide over crowding

Use cases this system must serve equally well:
1. Marketing / website pages
2. Presentations and client decks
3. Product UI (boards, forms, dashboards)
4. Compact plugin or admin chrome

The human reference is `index.html`. Overview is its own page. The grouped pages are Brand & assets, Tokens, Components, Patterns & layout, and Showcase. Each group is one page, and the sidebar items under it jump to a section on that page. Brand & assets and Tokens are the brand kit. On Components, Inputs is Atoms, Data & display and Navigation are Molecules, Feedback & overlays is Organisms, and Disclosure is a Molecule. On Patterns & layout, Primitives is Atoms, Content patterns is Organisms, and Page jobs is Pages. Showcase is Pages. Those words are catalog labels. They are not folders. DESIGN.md is the last item, on its own page.

## Token layers

Tokens come in three layers. Keep the names; only values change on a rebrand.

1. **Primitives** are the hue ramps in `css/tokens.css`: `--rf-green-1`…`--rf-green-6`, the cream / brown / tan / orange / blue families, and the `--rf-chart-1`…`--rf-chart-4` series aliases. Authors do not pick from this layer in a theme.
2. **Semantic tokens** are jobs: `colors` in the front matter — `neutral` (cream wash), `ink` / `ink-deep` / `secondary` / `ink-soft`, `primary` / `primary-deep` / `primary-soft`, `tertiary` (rare orange CTA), `info` (product blue), `danger`, plus the pairing tokens `on-primary`, `on-info`, `on-tertiary`, `on-dark`, `on-dark-muted`. Compilers and the deck (PDS) use this layer’s names. Each role’s CSS custom property is the Colors table, not `--rf-` plus the semantic name. `--rf-success` and `--rf-warning` alias `--rf-green` and `--rf-orange`; they are not `colors` keys.
3. **Component tokens** are the `components:` recipes (`button-primary`, `surface`, `pill`, `surface-tint`). Hierarchy words (`primary`, `tertiary`) belong to components, not to leftover brand colours.

Gap jobs (`layout.cluster` / `stack` / `grid` / `section` / `split`) are names on the existing `spacing` scale — one gap, not a second scale — and map to `--rf-cluster-gap` … `--rf-split-gap` in CSS. `layout.content-size` and `layout.wide-size` both resolve to `--rf-max` (56rem). 56rem stays. A wider nav is a different chrome width. It is not a second token, and it is not an edit to `--rf-max`. Reading width stays `layout.measure` (60ch) on flow text and is seeded by `layout.inset` (step 6) for framed modules. Do not put a hue in the semantic map: `green-3` is a ramp member, `primary` is a job.

## Pages

Marketing pages are stacks of the page jobs documented under the **Page jobs** tab of the reference site. Compose them from the primitives and components in this file; do not invent a ninth job or a new layout to cover a one-off. Header and footer are chrome, not jobs.

| Job | Composed from | Wash | CTA | Not |
| --- | --- | --- | --- | --- |
| Hero | `.rf-copy` + `.rf-split`; pill, `.rf-display--lg` (or `--xl` when the title has the full column), lede, the view's one `.btn--primary` when the hero holds it, optional proof meta, media right | cream | The view's one `.btn--primary` | A whole page, a bare `.rf-stack`, `core/columns`-style two-up |
| Proof | Three or five stats in `.rf-grid--center` even tracks, or a logo cluster | cream-deep | None | A feature grid, a leftover tile |
| Card grid | Three paired fills in `.rf-grid`: `surface`, `surface--tint`, `surface--dark`. A row of reviews is `.rf-review` in `.rf-grid--three` | cream | One tertiary link only when no `.btn--cta` has spent the page's orange | A dashboard, three identical whites |
| Split | Copy plus media via `.rf-split`. A screenshot uses `.rf-split--shot` (copy at 28rem, never wider than `--rf-measure`, picture takes the rest) and `.rf-frame--fit` (whole image) | cream | The view's one `.btn--primary` only when no earlier job took it | A blog layout (use `.rf-sidebar` for that) |
| Quote | `.rf-quote`. Words, a mark, and a person. Photo and role are optional. Schema.org Quotation: `text`, `author` as Person | cream | None | A reviews carousel |
| Dark band | `.rf-copy` on `surface--dark`, soft-blue/soft-orange meta eyebrows | moss | One `.btn--cta` spends the page's orange | A second theme |
| CTA | Short display title + one button | panel | No second `.btn--primary`. No second accent after a dark-band `.btn--cta` | Two buttons fighting |
| Alert | One status note, tones under Feedback | soft status | None | A hero |

Page recipes compose these: `landing` = hero → optional proof → one card grid or split → one CTA. One `.btn--primary` per view. A `.btn--cta` on a dark band spends the page's orange, so the closing job does not get a second accent. `article` is measured prose on cream — it is not this catalog. Washes (`cream-deep`, `surface-dark`) are viewport bands via `.rf-wash` and `.rf-wash--dark`. Copy stays in `.rf-wash__inner` on the header column (`--rf-max`). Never wrap `post-content` in a second constrained group, never mix `content` and `wide` on one landing. Grids are symmetrical (see Layout → Grid symmetry): three items, three tracks; five items, `--sym` or `--five`; never a leftover tile. A wash that is the last thing on the page flushes to the footer.

## Colors

Semantic roles. The compiler and `{colors.*}` use the Token column. CSS uses the custom property beside it. Hex values are in the front matter. Do not invent `--rf-` plus the semantic name.

| Role | Token | CSS | Hex | Use |
| --- | --- | --- | --- | --- |
| Page wash | `neutral` | `--rf-cream` | `#faf6ee` | Default page/background |
| Wash deep | `neutral-deep` | `--rf-cream-deep` | `#f3ede2` | Alternate bands on cream |
| Surface | `surface` | `--rf-white` | `#ffffff` | Cards, inputs, lifted modules |
| Panel | `panel` | `--rf-panel` | `#ebe4d8` | Warm grouping without heavy shadow |
| Ink | `ink` | `--rf-ink` | `#2c2922` | Body text on cream/white |
| Ink deep | `ink-deep` | `--rf-ink-deep` | `#1a1a1a` | Headings |
| Secondary | `secondary` | `--rf-ink-muted` | `#6b6560` | Captions, meta, helper text |
| Soft ink | `ink-soft` | `--rf-ink-soft` | `#9a948c` | Disabled-adjacent meta only |
| Primary | `primary` | `--rf-green` | `#62744d` | Links, primary buttons, accent subheads |
| Primary deep | `primary-deep` | `--rf-green-deep` | `#4b5e2e` | Primary hover / pressed |
| Logo olive | `green-logo` | `--rf-green-logo` | `#505a49` | Designer logo dark (RGB 80, 90, 73). Article hero and footer bands |
| Primary soft | `primary-soft` | `--rf-green-soft` | `#e4eadc` | Soft fills, success wash, chips |
| Tertiary | `tertiary` | `--rf-orange` | `#d4844e` | Rare CTA only (one per view max); takeaway rules / numbers |
| Surface dark | `surface-dark` | `--rf-surface-dark` | `#4b5e2e` | Dark callout cards and article hero bands (same as `primary-deep`) |
| On dark | `on-dark` | `--rf-on-dark` | `#ffffff` | Titles on `surface-dark` / dark green |
| Info soft | `info-soft` | `--rf-blue-soft` | `#d6e6f2` | Soft blue — allowed text on dark green (meta / eyebrows) |
| Tertiary soft | `tertiary-soft` | `--rf-orange-soft` | `#f0d5c0` | Soft orange — allowed text on dark green (meta / eyebrows) |
| Code bg | `code-bg` | `--rf-code-bg` | `#f3ece2` | Inline and block code paper |
| Code fg | `code-fg` | `--rf-code-fg` | `#3d5c4e` | Default monospace / syntax base (moss-teal) |
| Code label border | `code-label-border` | `--rf-code-label-border` | `rgba(44, 41, 34, 0.28)` | Outline for `.inline-label` / `.rf-inline-label` |
| Info | `info` | `--rf-blue` | `#1a5276` | Product nav / informational UI only |
| Danger | `danger` | `--rf-danger` | `#ad3a22` | Errors and destructive states (brick, not fire-engine — stays in the warm family) |

Rules:
- Default stack: `neutral` background + `ink` / `ink-deep` text + `primary` for interaction
- Marketing surfaces usually omit `info` blue; product UI may use it for nav and info alerts
- Never promote `tertiary` (orange) into a second brand theme or large background fills
- Before shipping text-on-color pairs, require WCAG AA (4.5:1) for body text; AA large (3:1) only for Knile headings / big stats
- Safe defaults: `ink` or `ink-deep` on `neutral`, `neutral-deep`, `surface`, `panel`, `primary-soft`; `on-primary` on `primary` / `primary-deep`; `on-tertiary` (`ink-deep`) on `tertiary` for CTA fills — never white on orange
- **Text on dark green** (`primary-deep` / `surface-dark` / `--rf-green-deep`): only `on-dark` (white), `neutral` (cream), `info-soft` (soft blue), or `tertiary-soft` (soft orange). Solid `tertiary` orange and solid `info` blue **fail** contrast on dark green — do not use them for labels, eyebrows, or body on moss-deep heroes. Mid `primary` green is stricter: soft blue / soft orange clear AA large only (headings/stats), not body copy.

Green scale (`green-1` … `green-6`) is for charts, illustrations, and progressive emphasis, not random decoration. `green-logo` (`#505a49`) is the logo olive from the designer palette. Article heroes and the site footer use it. `primary-deep` stays the press color.

## Typography

Three families only:
- **Knile** (serif): display, titles, section headers, accent subheads. Tracking `--rf-tracking-display` (`-0.02em`). Upright weights 400 / 600 / 700 only (WOFF2s hosted on rootsandfruit.com; see `css/fonts.css`). **No italic faces** — do not synthesize Knile italic.
- **Nunito Sans** (sans): body, UI labels, tables, forms, meta. High x-height: body leading `1.65`. Weights 400 / 600 / 700, each with a true italic. Host the latin variable-weight files (`nunito-sans-latin-wght-normal.woff2` + italic) on rootsandfruit.com next to Knile; load from `css/fonts.css`. Do not load Google Fonts.
- **JetBrains Mono** (or system mono stack): code only. Never use mono for marketing body copy.

Size scale (CSS `--rf-text-*`; **no `xs`**):

| Token | Size | Role |
| --- | --- | --- |
| `sm` | 16px (`1rem`) | Floor. Compact UI, labels, meta, table cells |
| `md` | 18px (`1.125rem`) | Default body and long-form (`.rf-prose`) |
| `lg` | 22px (`1.375rem`) | Short lead (`.rf-lede`) |
| `xl` | 28px (`1.75rem`) | Display sm (Knile subhead) |
| `2xl` | 36px (`2.25rem`) | Display md |
| `3xl` | 48px (`3rem`) | Display lg |
| `4xl` | 56px (`3.5rem`) | Display xl |

### Line-height

| Token | Value | Use |
| --- | --- | --- |
| `--rf-leading-display` | 1.1 | Knile `2xl`–`4xl` |
| `--rf-leading-snug` | 1.15 | Knile `xl` / short titles |
| `--rf-leading-body` | 1.65 | Nunito `md` / `lg` |
| `--rf-leading-callout` | 1.55 | Notes, alerts, contained copy |
| `--rf-leading-ui` | 1.35 | Nunito `sm` |

### Weights

| Token | Value | Typical use |
| --- | --- | --- |
| `--rf-weight-regular` | 400 | Nunito body; Knile regular rarely on screen |
| `--rf-weight-semibold` | 600 | Labels, buttons, Knile accent subheads |
| `--rf-weight-bold` | 700 | Knile display titles; Nunito meta / strong stress |

Do not introduce 500 or 800. Prefer semibold before bold for UI chrome.

### Italic

- **Nunito:** use `<em>` / `font-style: italic` for short inline emphasis in body; regular italic is the default stress. Semibold/bold italic are available but rare.
- **Knile:** upright only. For title emphasis, change weight or color — never fake an oblique.
- Do not italicize whole marketing heroes.

### Spacing around type

- Inside one piece, follow Gestalt proximity (Layout). The label sits with the title at `--rf-space-2` or `--rf-space-3`. The title sits with the first line at `--rf-space-3`. The action takes `--rf-space-5` or `--rf-space-6`.
- Article body: every direct child of `.rf-prose` (and `.rf-prose--wide`) is separated by `--rf-space-5`. A heading that follows another block uses `--rf-space-6`. Child margins are reset so a paragraph, list, figure, quote, surface, or card cannot sit flush. Same idea as `.rf-stack`.
- Meta eyebrow → title: `--rf-space-2` or `--rf-space-3`. The step of air is before the action.
- Measure: `--rf-measure` (`60ch`) on reading lines for articles and marketing; tracking meta `--rf-tracking-meta` (`0.06em`) for uppercase eyebrows.
- Analytical HTML reports (`rf-html-report`): use `.rf-prose--wide` (or report `.prose-block`) at `--rf-measure-report` (`64ch`) and `body-lg` (`--rf-text-lg`). Larger type makes each `ch` wider, so the measured column fills more of the shell without abandoning measure.
- Tool/product UI: prefer `--rf-content-max` for the shared column; do not nest article measure inside a wider card.
- Do not mix ad-hoc vertical margins with `.rf-stack` gap on the same children.

Roles:
- `display-*` = Knile hierarchy (xl → sm) with display/snug leading. Class `.rf-display` plus one size: `--xl` (4xl, full-column page title), `--lg` (3xl, title inside a split), `--md` (2xl, section), `--sm` (xl, semibold subhead). Do not size a marketing title with a one-off rule.
- `body-lg` = short lead (`.rf-lede`, `--rf-text-lg`); also report narrative with `--rf-measure-report`
- `body-md` = default reading (`--rf-text-md` on the body, or `.rf-prose` for a measured column)
- `body-sm` = `.rf-small` at `sm` (16px). An uppercase eyebrow is `.rf-meta`, not `.rf-small`.
- `meta` = uppercase eyebrows at `sm` + bold + meta tracking

Optical rules (size scales alone will not fix these):
- Constrain reading columns with a `ch` measure, not only the layout shell (`--rf-max`)
- Use `.rf-prose` for long-form articles: `--rf-measure` (`60ch`) + `body-md` + body leading
- Use `.rf-prose--wide` in analytical reports: `--rf-measure-report` (`64ch`) + `body-lg` so narrative feels balanced next to full-shell tables
- Inside callouts, use `--rf-leading-callout` and generous padding
- Do not rely on fluid viewport type alone to “fix” readability
- Do not drop measure to “full shell” for report prose; widen measure and type instead

Rules:
- Do not introduce Inter, Roboto, Arial, system-ui-only stacks, or a third display font
- Do not put Knile on long paragraphs
- Do not put Nunito Sans on the primary page title when Knile is available
- Prefer sentence case; never force all-caps on Knile display titles (meta uppercase is allowed for eyebrows only)
- If Knile webfonts are unavailable, fall back to Georgia / Times New Roman; still declare Knile first
- Do not use a size below `sm` (16px). There is no `xs` token
- Do not synthesize Knile italic; do not invent weights outside 400 / 600 / 700

## Layout

Principles drawn from *Every Layout* (Pickering & Bell): clarity and stability come from a few axioms and composable primitives, not from hard-coded breakpoints for every block. Do not invent one-off spacing like `13px` or `22px`.

### Axioms

- **Measure:** no line of narrative text should exceed its measure token. Use `ch`, never a fixed `px` width, so measure tracks font-size. Articles and marketing use `--rf-measure` (`60ch`). Analytical HTML reports use `--rf-measure-report` (`64ch`) at `body-lg` so the column is physically wider next to full-shell tables while staying measure-constrained. Structural shells (`html`, `body`, `main`, nav, generic wrappers) are not capped by measure.
- **Tool / product columns:** dashboards and task UIs (Phloem, plugin chrome) use a shared content shell `--rf-content-max` (`52rem`) so title, chrome, and body share one right edge. Do **not** nest `--rf-measure` on paragraphs inside a wider surface of the same component (that pinches copy next to full-width cards). Prefer shell-led width for tools; keep `ch` measure for article and report prose.
- **Suggestion over prescription:** prefer `max-inline-size`, `min-block-size`, `gap`, and `flex-basis` over fixed `width`/`height`. Avoid data loss from overflow.
- **One space ratio:** `--rf-ratio` (`1.5`) seeds modular space from `1rem` (`spacing.4` / s0). Larger steps (`5`–`8`) multiply by the ratio. Fine UI steps `1`–`3` stay below s0 for chrome only.
- **Boxes:** global `border-box`; logical properties (`margin-block`, `padding-inline`, `max-inline-size`); reading columns may use `content-box` so `ch` measures text, not padding. See also [Every Layout · Boxes](https://every-layout.dev/rudiments/boxes/).

### Primitives (`css/layouts.css`)

| Class | Job |
| --- | --- |
| `.rf-stack` | Vertical rhythm via `gap` (default `spacing.5`). Variants: `--sm`, `--md`, `--lg`. Child block margins reset so gap owns the rhythm. |
| `.rf-center` | Centered column at `--rf-measure`. Optional `.rf-center--gutter` for inline padding. |
| `.rf-cluster` | Wrapping horizontal group (buttons, pills) with even `gap`. |
| `.rf-copy` | Mixed marketing column (eyebrow → title → lede → action → proof meta) with Gestalt proximity, not one even gap. |
| `.rf-byline` | Credit line under a title inside `.rf-copy`. Tucks at `spacing.2`. The lede after it takes `spacing.6`. |
| `.rf-box` | Even inset on all sides (`spacing.6`); paint (surface variants) sits on this. |
| `.rf-grid` | Auto-fitting tiles that wrap at `--rf-grid-min`, no media query. Variants `--tight`, `--center`. |
| `.rf-grid--two` / `--three` | Named even tracks for pairs / triples / 2×2 rows. |
| `.rf-grid--sym` | Symmetric rows of three for odd counts: every row centers, so 5 → 3+2 and 7 → 3+3+1 with the remainder centered. |
| `.rf-grid--five` | Five even tracks (proof stats). Named exception; stacks to one column when the row cannot hold five. |
| `.rf-split` | Switcher: two equal tracks that wrap at `--rf-split-min`. |
| `.rf-split--shot` | Same split. The `.rf-copy` track is 28rem and will not exceed `--rf-measure`. The other track takes the rest of the row. The picture can sit on either side. |
| `.rf-split--flip` | Same split, with the media on the other side. Under 40rem the tracks stack in source order. |
| `.rf-sidebar` | One fixed side (`--rf-sidebar-side`) plus a fluid track; wraps at `--rf-sidebar-min`. |
| `.rf-frame` | Media holds `--rf-frame-ratio` (4/3) with `object-fit: cover`; no prescribed px. |
| `.rf-frame--square` | Same frame, cropped to 1:1. |
| `.rf-frame--wide` | Same frame, cropped to 16:9. |
| `.rf-frame--fit` | Same frame, with the crop lifted. The image keeps its real ratio. A large portrait uses this. A 1px `--rf-rule` edge keeps a pale screenshot visible on cream. |
| `.rf-frame--round` | Same frame, cropped to a circle, at most 18rem (14rem under 40rem). |
| `.rf-figure` | A frame with `.rf-caption` under it. The caption is as wide as the image. `.rf-figure--compact` uses a smaller name for the square and 16:9 crops. |
| `.rf-wash` | Stripe across the pane. Cream-deep by default. `.rf-wash--dark` is the moss band. `.rf-wash__inner` keeps the copy on `--rf-max`. On that dark band, `.field label` and `strong` use `on-dark` (`--rf-on-dark`). `.link-text` uses `on-dark` and lightens to cream on hover. On a marketing page the pane is the window. On this docs site the stripe stops at the sidebar. |
| `.rf-prose` | Long-form type + measure. Direct children share `--rf-space-5`. A following heading uses `--rf-space-6`. |
| `.rf-prose--wide` | Report long-form: `--rf-measure-report` (`64ch`) + `body-lg`. Wider measured column for analytical HTML reports; not the default for marketing articles. |

**Grid symmetry (contract):** a grid never strands a leftover tile. Pick tracks that fit the count: 2 items → `--two`; 3 → `--three` (or auto-fit `.rf-grid`); 4 → `--two` (2×2) or four across; 5 → `--sym` (3+2 centered) or `--five` across; 6 → two rows of `--three`; 7 → `--sym` (3+3+1, the one centered). If a count fights the layout, change the count or the tracks — do not ship an asymmetric row.

Shell / product chrome may still use grids and sidebars (this docs page’s `.ds-shell` is a sidebar composition). Prefer Stack + Center for article-like content.

### Gestalt proximity

Proximity is the space inside one piece. Related lines sit close. The action takes a step. Stack is the space between pieces, and that gap stays even. The reference site shows this under Primitives, on the specimen named Proximity.

Recipe, in order:

1. A label or eyebrow sits `--rf-space-2` or `--rf-space-3` above the title.
2. The title sits `--rf-space-3` above the first line. A byline between the title and the lede (`.rf-byline`) tucks at `--rf-space-2`. The lede after that byline takes `--rf-space-6`, the same step as an action, so the credit and the excerpt are two groups.
3. An action sits `--rf-space-5` or `--rf-space-6` below that line. A form action after fields uses `--rf-space-5`.
4. A note that belongs to the action sits `--rf-space-4` under it.

Use the space scale. Do not invent `0.35rem` or other off-scale gaps. A field label uses `--rf-space-1` because it is chrome on the control, not a title.

Do not wrap that piece in `.rf-stack` when the lines need more than one gap. One stack gap is one distance for every child. A later `margin: 0` on a child wipes a sibling gap of equal weight, so set `margin-block` on the sides you mean.

These pieces follow the recipe: `.rf-copy` (including `.rf-byline`), `.rf-display`, `.rf-figure`, `.rf-card`, `.rf-review`, `.surface`, `.rf-quote` (the person takes `--rf-space-5`), `.rf-dialog` (the actions take `--rf-space-5`), `.rf-gallery` (the thumb strip takes `--rf-space-5`), `.rf-takeaways` (the title sits `--rf-space-3` above the list), and `.rf-settings` (controls that belong together use `--rf-space-3`; the table takes `--rf-space-5`; a note under the table uses `--rf-space-4`). `.rf-lede { margin: 0 }` must not erase the lede's start inside `.rf-copy`.

`.rf-prose` and a stack of whole sections stay even. A split or a sidebar gutter is a column gap, not this recipe. The catalog’s own headings hug the line under them at `--rf-space-2` or `--rf-space-3`. A caption under a specimen takes `--rf-space-5` before the next heading.

Hierarchy:
- One job per section: one heading, one short supporting line, then content
- Prefer `.rf-stack` (or `spacing.5`–`spacing.7` gaps) between major blocks
- Inside a block, follow the proximity recipe above. Related lines sit close. The action takes the step.
- Avoid dashboard clutter on brand/marketing surfaces (no stat strips, pill clusters, or competing callout stacks in the first viewport)

Page shell:
- `--rf-max` (56rem) may wrap sidebars and specimens. 56rem stays. A wider nav is a different chrome width. It is not a second token, and it is not an edit to `--rf-max`. Article paragraphs obey `--rf-measure`
- `--rf-content-max` (~52rem) wraps tool/product reading columns (task detail, similar app views) when chrome and prose should share one edge
- Analytical reports: body prose uses `.rf-prose--wide` (`64ch` + `body-lg`); tables and charts may still span the full shell
- Marketing heroes may go full-bleed for atmosphere; text blocks keep measure

Breakpoints (practical defaults):
- Compact: below ~800px, collapse sidebars, stack columns, keep tap targets pill-button sized
- Comfortable: 800px+
- Prefer intrinsic layouts (Stack, Cluster, Center) over adding many width breakpoints

## Elevation & Depth

Depth is quiet.
- Default surfaces: 1px `rule` border, optional light shadow `0 2px 12px rgba(44, 41, 34, 0.06)`
- Stronger lift only when needed: `0 8px 28px rgba(44, 41, 34, 0.1)`
- Prefer border + background shift (`surface` / `panel` / `neutral-deep`) over stacked shadows
- No neon glow, no multi-layer colored shadows, no glass blur as a brand device

## Shapes

Corner radii:
- `rounded.sm` (0.55rem): inputs, small controls
- `rounded.md` (0.75rem): surfaces, alerts, tiles
- `rounded.lg` (1.25rem): large media frames when needed
- `rounded.pill` (999px): buttons, pills, chips

Buttons are pills by default. Do not mix sharp 0-radius chrome with pill buttons in the same view unless documenting a deliberate exception.

Chart / meta accents (shared with presentations): `--rf-orange-deep` for meta text; `--rf-chart-1`…`--rf-chart-4` (green-deep · orange · blue · brown) for multi-series charts. Do not build segments from adjacent soft greens. HTML report bar geometry (single series vs paired dual-metric rows; never two series on one baseline) is owned by the `rf-html-report` skill, not by these tokens.

Focus ring: soft green halo (`0 0 0 3px` color-mix of primary at ~35% opacity). Never remove focus styles.

## Components

Implement with these behaviors. Class names in this repo: `.btn`, `.input`, `.textarea`, `.rf-number`, `.rf-slider`, `.surface`, `.rf-card`, `.rf-divider`, `.rf-badge`, `.rf-avatar`, `.rf-time`, `.rf-breadcrumb`, `.rf-pagination`, `.alert` (including `.alert--note`), `.pill`, `.rf-skeleton`, `.rf-tooltip`, `.rf-dialog`, `.rf-toast`, `.rf-quote`, `.rf-cite`, `.rf-review`, `.rf-gallery`, `.rf-disclosure`, `.rf-tabs`, `.rf-toggle`, `.rf-select`, `.rf-display`, `.rf-lede`, `.rf-small`, `.rf-figure`, `.rf-caption`, plus layout primitives `.rf-stack` / `.rf-center` / `.rf-cluster` / `.rf-copy` / `.rf-byline` / `.rf-prose` and the settings column `.rf-settings` (see `css/components.css`, `css/chrome.css`, `css/disclosure.css`, `css/layouts.css`).

**Buttons**
- `button-primary` (`.btn--primary`): default main action (moss). One `.btn--primary` per view.
- `button-secondary`: warm panel fill for secondary actions.
- `button-tertiary`: outlined green for low-emphasis actions.
- `button-cta`: orange fill with dark ink text for contrast (Book, Pay, Submit final). A `.btn--cta` on a dark band spends the page's orange, so the closing job does not get a second accent. Do not use white text on orange. Hover lightens toward cream (`85%` orange / `15%` cream) so contrast improves; do not darken with brown.
- `button-ghost`: text-like dismissal / tertiary navigation.
- `button-sm` (`.btn--sm`): compact control size for cards, toolbars, and download rows. Compose with a color variant (e.g. `.btn--tertiary.btn--sm`). Keeps the pill radius; uses denser padding and a 14px control label (not a new body type-scale step — still no `xs` in the type ramp).
- `button-product` (`.btn--product`): **product UI only** — filled info blue (`blue-nav`) with white text. Use for selected app nav, board switches, and primary in-tool actions inside dashboards (Phloem, plugin chrome, ops boards). Signals “you’re in the product,” not a marketing pitch. Do not use on marketing heroes or as a brand CTA.
- `button-product-quiet` (`.btn--product-quiet`): idle product nav chrome (white + soft border). Hover tints toward info blue; selected state uses `aria-current="page"`, `aria-pressed="true"`, or `.is-active` and matches `button-product` fill.
- In a product nav cluster, prefer quiet siblings + one current product fill — not a row of filled blue buttons.
- Disabled: reduce opacity; do not invent a gray system.

**Links**
- Marketing / long-form: `primary` green, semibold when inline. Never default browser blue.
- On `.rf-wash--dark`, `.link-text` uses `on-dark` (`--rf-on-dark`) and lightens to cream on hover.
- Product UI title links may use `info` blue (as in Phloem task titles); do not use that blue for marketing body links.

**Forms**
- Labels above fields (`typography.label`). The label sits `--rf-space-1` above the control (`.field`, `.rf-field-row`). On `.rf-wash--dark` the label uses `on-dark` (`--rf-on-dark`).
- Inputs: white surface, soft ink border, `rounded.sm`, green focus ring
- Errors: danger border + text message under the field (never color-only)
- Selected choice chips / toggles: use `pill-active` (`.pill--active` or `.pill.is-active`) — `primary-soft` fill with `primary-deep` text. Do not use solid `primary` with `ink` (fails contrast). Solid `primary` fills must use `on-primary` (white).

**Product chrome** (`css/chrome.css`)
- For plugin settings, dashboards, and other tool surfaces on cream. First shipped in Agent Role settings (Agents / Settings / Activity).
- **Folder tabs** (`.rf-tabs`): a nav list (`.rf-tabs__list`) of tabs (`.rf-tabs__tab`) with an orange dot (`.rf-tabs__dot`) and slanted shoulder SVG (`.rf-tabs__shoulder`). The current tab uses `.is-current` and sits flush on the white panel (`.rf-tabs__panel`). Later tabs stack behind earlier ones so shoulders never cover labels. Production often uses links that reload the screen; the Content patterns specimen uses buttons with `role="tab"`. WordPress admin may need scoped resets on top of this file.
- **Toggle** (`.rf-toggle`): a checkbox (`.rf-toggle__input`), tan track (`.rf-toggle__track`), and uppercase state label (`.rf-toggle__state`) with `data-enabled` / `data-disabled` strings. Optional note (`.rf-toggle__note`) after the state. Swap the label text on `change` in JS; do not rely on color alone.
- **Filter select** (`.rf-select`): taller control for settings selects and filter bars. Bold label, 0.8rem radius, moss chevron. Use on the Forms specimen for `<select>`; pair with `.rf-field-row` / `.rf-filter-row` for Activity-style filter grids. Browsers that support `appearance: base-select` get a card-style picker list; others keep the classic chevron. The lighter `.select` in `components.css` remains for simple marketing forms when you do not need product chrome.
- **Settings panel** (`.rf-settings`): one column of tool controls. A filter row and the toggle that belongs with it use `--rf-space-3`. The table takes `--rf-space-5`. A note under the table uses `--rf-space-4`. Do not put this panel in `.rf-stack`.

**Textarea** (`.textarea`)
- Same chrome as `.input`. Multi-line, vertical resize, minimum block size `6rem`.

**Number** (`.rf-number`)
- A stepper around an `.input` of type `number`. Decrease and increase are buttons with names. The field keeps `min` and `max`. Hide the browser spinner so those buttons are the only step control.

**Slider** (`.rf-slider`)
- A range input. Moss accent on the panel track. Pair it with an `output` so the value is text, not the thumb alone.

**Pills**
- Default `.pill`: panel fill + ink
- `.pill--active` / `.pill.is-active`: selected state (`pill-active` in front matter)
- `.pill--green`: same soft-green recipe as active (status “success / in play”)
- Pills are **single-line chips**: `white-space: nowrap` and `flex-shrink: 0` (see `elements.css`). Keep labels short (about 1–3 words or a compact metric). In flex headers next to titles, allow the row to wrap (`flex-wrap: wrap`) so a tight card moves the pill below as a full chip instead of squeezing it into a tall oval.
- Filled moss buttons use `on-primary`, not bare `ink`

**Quote** (`.rf-quote`)
- One attribution. The words, a serif quotation mark, and a person. A photo and a role are optional. Omit the `<img>` when there is no photo so the row closes up. The person takes `--rf-space-5` under the words.
- The card has `2em` of padding, a 2px `--rf-brown` rule on the right and the bottom, and a 6px radius on that corner. The lift is `--rf-shadow`, clipped so the falloff stays on the right and the bottom.
- Markup is a schema.org [Quotation](https://schema.org/Quotation). `itemprop="text"` on the words. `itemprop="author"` is a Person with `name`, and when you have them, `jobTitle` and `image`. A source URL is `citation` on the quotation, outside the Person. The mark is CSS, so it stays out of `text`.
- `author` is the speaker. `spokenByCharacter` is for a character inside some other work. A rating lives on `.rf-review`.
- Do not build this as `surface` plus `.rf-lede`. `.surface p` beats the lede and the line goes small and gray.

**Citation** (`.rf-cite`)
- A passage from a document, with the source under the words. A person stays `.rf-quote`.
- The words hang on a 4px `--rf-orange` rule. The block shifts `38px` left so the words stay in line with the column and the rule sticks out. The background stays transparent. Padding is `--rf-space-6`. The block stops at `40rem`.
- A serif quotation mark sits outside the block on the right, at `32rem`, in `--rf-orange` at 28% opacity. The mark is CSS, so it stays out of the words.
- The words are Knile at `--rf-text-lg`. The source is Nunito at `--rf-text-md`, `--rf-space-5` under the words.
- Markup is a `blockquote`. The passage is a paragraph. The source is a `cite` with a link.

**Review card** (`.rf-review`)
- One review. It sits in `.rf-grid--three` with the other reviews. Rating, title, words, person, and a date. The role line is optional. Omit it and the name stands alone.
- The card is white, so it uses the same 4px `--rf-cream-deep` square edge as a white surface. No shadow.
- Proximity inside the card: stars sit `--rf-space-2` above the title, the title sits `--rf-space-3` above the words, and the person takes `--rf-space-5`. The person stays with the words. Do not pin the byline to the bottom of the card.
- Stars use `--rf-orange`. A star without `.rf-review__star--on` stays a quiet orange.
- Markup is a schema.org [Review](https://schema.org/Review). `reviewRating` is a Rating (`ratingValue`, `bestRating`). `name` is the title. `reviewBody` is the words. `author` is a Person (`name`, and `jobTitle` when the role is a job). `datePublished` is the date. A source link is `url` on the review, outside the Person.
- Keep the row in the grid. A slider is a later idea, and this is not a new page job. A single attribution stays `.rf-quote`.

**Gallery** (`.rf-gallery`)
- One image on a white mat, its caption, and a count (`1 of 6`). The thumb strip sits `--rf-space-5` under the mat. The rest of the set is a strip of thumbs that share the mat's width, up to six across. Fewer images grow to fill the row. On a narrow screen the strip wraps at three across, and each row still fills the width. The current thumb uses the quote's brown right-and-bottom edge. A single image hides the strip and the count.
- The mat keeps a steady height. The picture is shown whole (`object-fit: contain`). Opening the mat uses a native dialog with a 5px `--rf-panel` frame. The bar under the picture uses the same panel color. Round previous and next buttons sit outside the picture until the pointer is over it, then they fade and slide in over 500ms. That bar holds the same controls as text, the caption in the middle, and close. Orange stays the page CTA. A tall screenshot scrolls inside the frame so the bar stays put.
- Thumbs are buttons. The button name is the position plus the caption. The thumb image is decorative. The stage image keeps a real `alt`. The caption is the sentence, and the same text fills the dialog.
- Left and right change the image only while the gallery or the dialog has focus. Escape closes the dialog and focus returns to the control that opened it. Nothing auto-advances. Reduced motion skips the strip's smooth scroll.
- Markup is a schema.org ItemList of ImageObject: `position`, `caption`, `contentUrl`, `width`, `height`. `ImageGallery` is a web page type, so a section on a product page uses the list.

**Surfaces**
- `surface`: white module on cream. Square corners, no shadow. The edge is 4px `--rf-cream-deep`. Cream is the next paper step, and it is also the page wash, so that edge would disappear.
- `surface-panel` (`.surface--panel`): warm panel grouping. The edge is the fill taken one step darker, about 0.03 lightness, and it keeps the fill's hue.
- `.surface--cream`: cream-deep fill, same edge rule.
- `.surface--tint`: soft moss tile, same edge rule.
- `surface-dark` (`.surface--dark`): moss-deep callout on cream pages, same edge rule. Titles in white or cream; meta/eyebrows in soft blue (`info-soft`) or soft orange (`tertiary-soft`). Body may use white / cream / `on-dark-muted`. CTAs use `button-cta` with `ink-deep` on orange. A `.btn--cta` on a dark band spends the page's orange, so the closing job does not get a second accent. Prefer one dark card per sidebar or section.
- A quote stays `.rf-quote`. A document passage stays `.rf-cite`. Neither uses this edge.
- Title sits `--rf-space-2` above the body. The action takes `--rf-space-5`. Do not use an off-scale margin under the title.
- An eyebrow is a `.rf-meta` directly above the title. It sits `--rf-space-3` above that title. On `.surface--dark` the eyebrow is `tertiary-soft`, because solid orange fails on moss.

**Card** (`.rf-card`)
- One unit: an optional eyebrow (`.rf-meta`), a title (`.rf-card__title`), a body, and an action in `.rf-card__foot` under a hairline. Use this when the block is a single thing someone can open. The eyebrow sits `--rf-space-3` above the title.
- The card is white, so it uses the same 4px `--rf-cream-deep` square edge as a white surface. No shadow.
- The title sits `--rf-space-3` above the body. The footer takes `--rf-space-5`, then the hairline and its padding.
- A `.surface` stays the looser box for a mix of content. Do not turn every surface into a card.

**Divider** (`.rf-divider`)
- A 1px `--rf-rule` hairline. `.rf-divider--vertical` sits in a row. It is an `<hr>`, so it stays out of the reading order as decoration only when the regions already have names.

**Badge** (`.rf-badge`)
- A count, or a status dot (`.rf-badge--dot`). Moss fill with `on-primary` for a plain count. `.rf-badge--danger` uses the danger soft fill and danger text.
- A `.pill` carries a short label. Do not use a badge for words like “Waiting” or “Info”.

**Avatar** (`.rf-avatar`)
- Initials, a photo, or the tree mark (`.rf-avatar--mark` on `rf-mark.svg`) when the space is too tight for the wordmark. Give initials an accessible name. The mark image keeps a real `alt`.

**Relative time** (`.rf-time`)
- A `<time>` element. The visible phrase is relative (“3 hours ago”). The `datetime` attribute keeps the absolute moment, and `title` can repeat that moment for hover.

**Breadcrumb** (`.rf-breadcrumb`)
- An ordered list inside a nav. Parent links, then the current page with `aria-current="page"`. The separator is a small dot: `--rf-green-soft` fill with a `--rf-green-deep` outline.

**Pagination** (`.rf-pagination`)
- Previous, page buttons, next. The current page is `.btn--primary` with `aria-current="page"`. One current page. These are buttons on a specimen. A real list uses links to the page URL, so it does not spend the view's `.btn--primary`.

**Key takeaways** (`.rf-takeaways` / `ol.rf-keytakeaways`)
- Knile title in `primary` green (“Key Takeaways”). The title sits `--rf-space-3` above the list.
- Ordered items with 2px `tertiary` left rule, zero-padded numbers (`01`, `02`) in orange, body in `ink`
- Optional lead line: `<strong>` as the first child of each `li` (renders as a block title above the body). Do not put title and body in separate grid columns.
- Use in article sidebars or after the intro; keep to a short list (about 3–5 items)
- Do not restyle as bullets, pills, or icon rows

**Tables** (`.table-wrap` + `table.rf-table`)
- Every `th` and `td` is **left-aligned** (see `elements.css`). Do not right-align numeric columns (volume, CPC, counts) in R&F analytical reports or brand UI unless a product surface explicitly needs accounting-style columns.

**Code**
- Inline `code` (quiet): warm `code-bg`, moss-teal `code-fg`, **no border** — for terms in sentence flow (`write-a-skill`, short flags)
- Inline label (`.inline-label` / `.rf-inline-label`): same paper + `code-fg`, **outlined** with `code-label-border` — for named objects (files, paths: `SKILL.md`). Prefer this when the token is a thing the reader should clock as a label, not a slip of code in prose
- Do not use both chromes on the same string; do not outline every `<code>` by default
- Block `.rf-code`: same paper fill; optional window dots + copy control + language meta (matches the site’s Code Block Pro chrome). Soft-wrap long lines (`pre-wrap`); do not use horizontal scrollbars in snippets
- Keep the window chrome; retune syntax base to `code-fg` / warm Solarized-light on `code-bg` rather than cool cyan on gray
- One language label in `code-meta`; do not add neon terminal themes

**Feedback**
- Pills for compact status
- Alerts for full-sentence page messages (`alert-info`, `alert-success`, `alert-warning`, `alert-danger`)
- `alert-note` (`.alert--note`): instructional how-to / guidance on `panel-soft` with a moss left rule — not a status message
- Spinner for indeterminate wait; progress bar only when percent is known
- **Skeleton** (`.rf-skeleton`): placeholder shapes while content loads. A line, a short line, and an avatar-sized circle. The pulse stops under `prefers-reduced-motion`. Mark the group `aria-hidden` when it is not real content.
- **Tooltip** (`.rf-tooltip`): a short note in `.rf-tooltip__bubble` with `role="tooltip"`. It sits under the trigger, aligned to the trigger's start, on hover and on keyboard focus, so it does not cover the label above. It does not hold actions. A decision belongs in a dialog.
- **Dialog** (`.rf-dialog`): a native `<dialog>` opened with `showModal()`. One title, one sentence, and two actions (keep working, confirm). The title sits `--rf-space-3` above the sentence. The actions take `--rf-space-5`. Do not put the form in `.rf-stack`. Escape closes it. Focus returns to the control that opened it. The gallery lightbox stays `.rf-gallery` and is not this pattern.
- **Toast** (`.rf-toast`): a brief confirmation in a live region (`role="status"`). It leaves on its own after a few seconds, or when dismissed. It does not ask a question. On a product page, pin the stack to the viewport. The specimen pins it inside `.rf-toast-stage` so the docs chrome stays put.

**Disclosure** (`.rf-disclosure` in `css/disclosure.css`)
- One expandable section via native `<details>` / `<summary>` (a11y name: disclosure). Prefer this over custom accordion JS for a single panel.
- Closed: bordered white box, meta-style uppercase label, arrow pointing right
- Open: cream panel with generous padding; the arrow rotates 90° to point down
- Summary label uses meta tracking; slight size nudge on hover / open is allowed
- The arrow is inline SVG (`.rf-disclosure__arrow`), not an image URL. Light half is `--rf-green-1`, lower half is `--rf-green-2`, outline is `--rf-brown`. It points right at rest.
- Use for secondary background (context, sources, footnotes) that should stay out of the way. Do not hide the primary action or completion test behind a disclosure.
- An “accordion” (coordinated group, one-open-at-a-time) is out of scope for this primitive; stack independent `.rf-disclosure` elements when several sections collapse.

**Brand assets (non-token but mandatory)**
- Wordmark vs tree icon: wordmark when naming the brand; tree icon for favicons, avatars, tight badges
- **Default wordmark (hard stop):** when Matt says “the logo,” “full logo,” “full wordmark,” “R&F logo,” or similar without naming a variant, use **`logos/SVG/R&F_Logo.svg`** — the multi-tone full-color canopy on cream/light. On dark fields, default to **`logos/SVG/R&F_Logo_DarkBG.svg`**. Do **not** default to `*_Flat_Color_*` (mono moss / simplified) or flat black/white. Flat / mono variants only when he explicitly asks for flat, mono, one-color, or small-size simplification.
- UI caret: the inline disclosure arrow (see Disclosure). Do not load `icons/leaf-arrow.svg` for this control.
- Illustrations (`illustrations/roots-1.svg`, `illustrations/apples-1.svg`): atmosphere only. Use tokens `--rf-atmosphere` (≈0.10), `--rf-atmosphere-quiet` (≈0.065 under dense title/hero text), `--rf-atmosphere-spot` (≈0.45 for apples). Utilities: `.rf-atmosphere`, `.rf-atmosphere--quiet`, `.rf-atmosphere--spot`. When small copy sits on roots, prefer `.rf-lede-over-atmosphere` (Nunito 600 + `--rf-ink-muted`) before frosting or further dimming art. One watermark per surface. Never treat illustrations as logos or links.
- Prefer SVG for on-screen marks; PNG profile/square exports for host uploads that require raster

**Presentations (PDS layer on CDS)**
- One design system: CDS owns tokens here; the presentation layer (`/rf-reveal`) owns Pitch layouts and reveal.js chrome
- PDS vendors `css/tokens.css` via `sync-cds-tokens.ps1` (`cds-tokens.css`); do not invent parallel hex, opacities, or lede weights in the deck
- Presentations pick a PDS **layout id** first, then compose elements from this package (surfaces, quiet `rf-table`, buttons/pills, `code` / `.inline-label`, `.rf-code`). Element-kit gallery slides are operator QA only — not client layout ids (`/rf-reveal` · `company-docs/03-Marketing/social/pds/REFERENCE.md`). Vertical social: open `company-docs/03-Marketing/social/AGENTS.md` · templates `…/social/templates/` · forks `…/social/presentations/` · `/rf-shorts-li` · `/rf-shorts-yt`
- Same color/type language; more whitespace; fixed slide canvas is fine
- One atmosphere treatment per slide; do not stack watermarks

## Do's and Don'ts

**Do**
- Start from cream (`neutral`) + ink + moss (`primary`)
- Use Knile for titles and Nunito Sans for reading/UI
- Keep orange (`tertiary`) rare and singular
- Check contrast for body text (AA) before shipping
- Use the spacing and radius scales exactly
- Keep sections simple: one purpose, clear hierarchy
- Compose marketing pages from the page jobs; mixed hero / CTA copy lives in `.rf-copy`, not a bare `.rf-stack`
- Reuse `css/rf.css`, or `css/brand.css` when a surface only needs fonts and tokens

**Don't**
- Don't use purple gradients, indigo glow, cool gray glass, or “AI slop” aesthetic defaults
- Don't use Inter, Roboto, Arial, or comic display fonts
- Don't make orange a theme color or page background
- Don't put more than one `.btn--primary` per view. A `.btn--cta` on a dark band spends the page's orange, so the closing job does not get a second accent.
- Don't use pure black (`#000`) or pure white as the default page wash
- Don't invent new hex values when a token exists
- Don't use illustrations as logos, or logos as decorative watermarks at full opacity
- Don't substitute `*_Flat_Color_*` or flat mono wordmarks when “full logo” / default brand mark is requested — use `R&F_Logo.svg` (light) or `R&F_Logo_DarkBG.svg` (dark)
- Don't add drop shadows, outlines, recolors, or stretch transforms to official logo files
- Don't build dense marketing heroes with stats, chip rows, and multiple competing CTAs
- Don't remove focus indicators
- Don't use blue (`info` / `button-product`) as a marketing accent or site-wide primary; reserve it for product/info UI
- Don't mix a moss primary and a filled product button as competing “main” actions in the same cluster
- Don't create a dark-mode palette unless explicitly asked (light cream system is default)
- Don't use cool cyan/gray IDE chrome for code; stay on warm `code-bg` + moss-teal base
- Don't outline every inline `code` (that chrome is for `.inline-label` only); don't use `.inline-label` for ordinary in-flow terms
- Don't put white text on orange CTAs (including on dark cards); use `ink-deep` on `tertiary`
- Don't put solid `tertiary` orange (or solid `info` blue) text on dark green / `surface-dark` — use `white`, `cream`, `info-soft`, or `tertiary-soft` only
- Don't invent a second takeaways pattern (cards, checkmarks, emoji numbers)
- Don't introduce an `xs` size or any readable text below `sm` (16px)
- Don't invent parallel layout utilities when `.rf-stack`, `.rf-center`, or `.rf-cluster` already fit
- Don't invent a ninth page job and don't auto-fit proof or stats into a leftover tile (three items, three tracks; five items, five tracks)
- Don't set paragraph measure in `px`; use `--rf-measure` (`ch`)
- Don't nest `--rf-measure` on prose inside a wider tool surface; use `--rf-content-max` for the shared column instead
- Don't hide primary next actions inside `.rf-disclosure`
- Don't fake Knile italic or add font weights outside 400 / 600 / 700
- Don't commit Knile or Nunito WOFF/WOFF2 binaries to any public GitHub repo (`brand`, `slides`, or forks). Host them only on rootsandfruit.com (`/wp-content/uploads/rnf_assets/fonts/`); load via absolute URL in `css/fonts.css`. Offline/file opens may fall back to Georgia / system-ui.

## Agent directives

When generating or editing UI for Roots & Fruit:

1. Read this file before choosing colors, type, radius, or components.
2. Prefer token names and `{colors.*}` references over raw hex in reasoning; emit CSS variables `--rf-*` when editing this repo’s brand CSS.
3. If a request conflicts with Do's and Don'ts, follow this file and note the conflict briefly.
4. Validate text/background pairs against WCAG AA for body copy.
5. After UI changes, self-check: cream paper present? Knile on titles? One `.btn--primary` per view? No purple/gray-glass drift? No extra orange?
6. For brand marks and illustrations, use files under `logos/` and `illustrations/`; do not regenerate lookalikes.
7. Dark mode stays out of scope. Dialog, toast, tooltip, and folder tabs are specified in this file. Anything still unnamed stays out of scope until it is added here. Improvise with existing tokens and keep the same constraints.
