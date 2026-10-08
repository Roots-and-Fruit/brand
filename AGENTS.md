# R&F CDS sandbox fork agent contract

This folder is the Roots & Fruit design system that GitHub Pages publishes at [brand.rootsandfruit.com](https://brand.rootsandfruit.com), from [Roots-and-Fruit/brand](https://github.com/Roots-and-Fruit/brand). `company-docs/brand/` is the previous checkout. Do not edit it.

## Two stylesheets

| Load | When |
| --- | --- |
| `css/brand.css` | Fonts and tokens only. A rebrand, or a deck that must not pull components. |
| `css/ui.css` | Layout and components. It reads `var(--rf-*)` and does not declare hue values. |
| `css/rf.css` | Both. Marketing pages, this catalog, and forks. |

App shell, not the kit: `css/docs.css` (catalog sidebar). In the Hugo project, `articles.css` (site header and footer), `home.css`, `product.css`, and `hugo.css`. A wider nav is that header's width (`min(1200px, …)` in `articles.css`). It is not `--rf-max`.

Catalog labels (Atoms, Molecules, Organisms, Pages, Brand kit) are names on the reference pages. They are not folders. `DESIGN.md` stays one contract.

The served copy for the Solid State fork is `hugo/static/css/` mounted at `/cds/`. After a kit CSS edit, copy the changed files there. Example Brand (`design-kit-template`, `--cds-*`) is a different pack.

## Versions

`CHANGELOG.md` is the only changelog. Notable changes go under `## [Unreleased]` the same day, grouped Added, Changed, Deprecated, Removed, Fixed, Security. Omit empty groups. Unreleased has no date.

When Matt says ship: check Unreleased against what will actually be committed, cut it into `## [x.y.z] - YYYY-MM-DD`, leave an empty Unreleased on top, set `package.json` `version` to that number, update the compare links, and push `main`. GitHub Actions reads the version from `package.json` and the notes from `CHANGELOG.md`. Do not write release notes from the git log. This package has no `readme.txt`.

## Work order

1. Read `DESIGN.md` before changing tokens, components, layout, or reference specimens. Open `KIT-GAPS.md` before adding a component. Those four gaps are logged and not built.
2. Keep the fork on `--rf-*`, Knile/Nunito, warm cream, and the R&F logo rules.
3. Any update to `DESIGN.md` requires hub skill `rf-cds-contract` (`.cursor/skills/rf-cds-contract/SKILL.md`). Read and follow it before changing that file. After the edit, run `sync-design-md-embed.ps1` from this folder. Do not hand-edit the embed in `index.html`.
4. For WordPress generation, read `WORDPRESS.md` and complete every checkbox in `WORDPRESS-GENERATION-CHECKLIST.md`.
5. Run `npm run compile:wordpress`; do not sync a projection that fails the static verifier.
6. Sync only to an explicitly approved destination. The sync command must reach a WordPress probe and run `npm run test:wp` unless the agent documents an explicit, unverified `--skip-test` exception.
7. Do not call a generation complete until the MU-plugin custom-token UI, Site Editor identity, official logo/icon, and runtime visual gate are verified.

## WordPress source map

- Contract: `DESIGN.md`
- Shared source CSS: `css/brand.css`, `css/ui.css`, `css/rf.css`, `css/fonts.css`, `css/tokens.css`, `css/layouts.css`, `css/elements.css`, `css/components.css`, `css/chrome.css`, `css/disclosure.css`
- WP compiler: `scripts/compile-wordpress.mjs`
- Static gate: `scripts/verify-wordpress.mjs`
- Theme sync: `scripts/sync-theme.mjs`
- Generated theme: `wordpress/rf/`
- Theme-owned WP layer: `wordpress/rf/assets/css/block-styles.css`, `patterns/`, `parts/`, `templates/`
- Full workflow: `WORDPRESS-GENERATION-CHECKLIST.md`

## Generated files

Do not hand-edit generated `wordpress/rf/theme.json`, `design-tokens.json`, `brand-defaults.json`, or copied shared CSS. Edit the source contract/CSS, theme-owned WP layer, or Site Editor state as appropriate, then compile and validate again.

## Identity rules

- Default full logo: `logos/SVG/R&F_Logo.svg`.
- Dark fields: `logos/SVG/R&F_Logo_DarkBG.svg`.
- Tight icon/fallback only: `rf-mark.svg` or the approved icon asset.
- The theme fallback mark is not a substitute for configuring the official Site Logo and Site Icon in WordPress.

## Hard stops

- Do not edit `company-docs/brand/`.
- Do not update `DESIGN.md` without following `rf-cds-contract`. Do not regenerate `DESIGN.md` from that skill, from tokens, or from the Example Brand kit.
- Do not invent tokens, palette slugs, generic kit identity, or custom hex values.
- Do not commit font binaries or secrets.
- Do not deploy to production without explicit approval.
- Do not report an untested or Site-Editor-unconfigured theme as complete.
