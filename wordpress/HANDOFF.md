# R&F CDS WordPress handoff

The generated R&F block theme lives in `rf/`. It is a projection of the isolated `brand-next` fork, not a replacement for `company-docs/brand/`.

## Current state

- `npm run compile:wordpress` succeeds.
- `rf/theme.json` exposes the R&F semantic palette, typography, spacing, radii, shadows, layout sizes, and custom-token registry.
- Shared CSS is copied from the fork and stays in the `--rf-*` / `.rf-*` namespace.
- Patterns, templates, parts, block styles, Site Identity fallback, and optional Playwright fixtures are included.
- No live WordPress probe or deployment has been run.

## Next step

Run `node scripts/sync-theme.mjs --dest <wp-content/themes/rf>` only after explicit approval for the target environment. If a probe is available, run `npm run test:wp` after syncing and compare the WordPress pages against the R&F reference tabs.

## Hard stops

- Do not hand-edit `rf/theme.json`, `rf/design-tokens.json`, `rf/brand-defaults.json`, or copied `rf/assets/css/{fonts,tokens,layouts,components}.css`.
- Do not deploy this sandbox fork to production yet.
- Do not commit font binaries.
