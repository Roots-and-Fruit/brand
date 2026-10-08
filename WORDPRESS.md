# R&F CDS WordPress projection

The R&F CDS is the source of truth. WordPress is a generated projection, not a second design system.

**Mandatory workflow:** [`WORDPRESS-GENERATION-CHECKLIST.md`](WORDPRESS-GENERATION-CHECKLIST.md). A generated folder is not a completed theme generation until the MU-plugin, Site Editor, identity, logo, and runtime gates pass.

## Commands

Run from `company-docs/brand-next/`:

```powershell
npm run compile:wordpress
node scripts/sync-theme.mjs --dest "C:/path/to/wp-content/themes/rf"
npm run test:wp
```

The sync command requires a reachable WordPress probe and runs the runtime test gate. It fails if the probe is unavailable. `--skip-test` is an explicit file-only exception; it prints `UNVERIFIED` and cannot be reported as a completed generation.

`compile:wordpress` reads `DESIGN.md` and `css/tokens.css`, generates the projection, and runs `scripts/verify-wordpress.mjs`. It must pass before any sync. It generates:

- `wordpress/theme.json` and `wordpress/design-tokens.json`
- `wordpress/rf/` — the thin block theme
- `wordpress/rf/assets/css/` — the R&F fonts, tokens, layouts, and components
- `wordpress/rf/brand-defaults.json` — Site Identity defaults

Do not hand-edit generated `theme.json`, `design-tokens.json`, or copied CSS. Edit the CDS source, then compile again.

## Projection rules

- Semantic WordPress palette slugs are kit-compatible jobs (`paper`, `paper-deep`, `surface`, `panel`, `primary`, `accent`, etc.); the compiler maps them to R&F's established names (`neutral`, `neutral-deep`, `tertiary`, and `on-tertiary`).
- R&F's public CSS remains `--rf-*`; the generated theme uses the same namespace and `.rf-*` layout classes.
- WordPress theme CSS skips element-reset CSS; `theme.json` owns Core element defaults while the generated assets provide R&F components and layout primitives.
- Layout jobs are CSS and block styles: Copy, Cluster, Switcher, Sidebar, Center, Box, Frame, and the symmetric grid rules. Page jobs are patterns: Hero, Proof, Card grid, Split, Quote, Dark band, CTA, and Alert.
- Two-up marketing uses Switcher (`.rf-switcher` / `is-style-rf-switcher`), not Core Columns.
- Header/footer use native Site Identity blocks. The compiler supplies the R&F mark only as a fallback when no Site Logo is set; the agent must still configure the official full Site Logo and Site Icon in the Site Editor.
- Pairing tokens (`on-*`), focus, elevation, content/wide sizes, and other non-picker values are custom tokens. Authors do not free-paint them.

## Source map

| Concern | Source | Generated projection |
| --- | --- | --- |
| Colors, type, spacing, radii | `DESIGN.md` front matter + `css/tokens.css` | `theme.json` presets |
| Component and layout rules | `css/layouts.css`, `css/components.css` | `wordpress/rf/assets/css/` |
| WP-specific layout behavior | `wordpress/rf/assets/css/block-styles.css` | hand-owned theme CSS |
| Page jobs | `wordpress/rf/patterns/` | Inserter patterns |
| Header/footer | `wordpress/rf/parts/` | native template parts |
| Site shell | `wordpress/rf/templates/` | block templates |

## Runtime obligations

The theme includes `design-tokens.json` and a guarded `register_design_token()` hook, but the Design Token Registration API is an external MU plugin. Before completion, verify the function exists at runtime and that all R&F custom tokens appear in the Site Editor UI and persist after a harmless edit. Also activate the theme, set Site Identity, assign the official logo/icon, configure navigation, and remove stale Site Editor overrides. These database-backed steps cannot be completed by copying theme files.

See `WORDPRESS-GENERATION-CHECKLIST.md` for the evidence required.

## Hard stops

- Do not change `company-docs/brand/`; this projection belongs to the isolated `brand-next` comparison fork.
- Do not commit Knile or Nunito binaries. `css/fonts.css` keeps the hosted R&F font URLs and fallbacks.
- Do not invent palette slugs, custom hex values, fluid type, or a competing theme.
- Do not hand-edit generated files. Change `DESIGN.md`, source CSS, patterns, or `block-styles.css`, then compile.
- Do not use a WP production destination without an explicit approval for that deployment step.

## Validation status

The compiler currently validates the generated palette, custom-token registry, typography, and Site Identity chrome. `npm run test:wp` requires a reachable WordPress probe and is not run automatically unless one is available.
