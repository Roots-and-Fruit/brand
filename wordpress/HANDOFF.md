# R&F CDS WordPress handoff

The generated R&F block theme lives in `rf/`. It is generated from this folder.

## Current state

- `npm run compile:wordpress` succeeds.
- `rf/theme.json` exposes the R&F semantic palette, typography, spacing, radii, shadows, layout sizes, and custom-token registry.
- Shared CSS is copied from the fork and stays in the `--rf-*` / `.rf-*` namespace.
- Patterns, templates, parts, block styles, Site Identity fallback, and optional Playwright fixtures are included.
- Synced on 2026-10-13 to `C:\Users\reach\Studio\rf-static-probe`. `rf` is the active theme there. No production deploy has been run.

## Next step

That Studio site is the build for rootsandfruit.com. Follow its `LAUNCH.md` before any export is treated as the one to ship. Sync again only after `npm run compile:wordpress`, and only to that destination unless Matt names another. If the probe is reachable, `npm run test:wp` can still compare the WordPress pages with the R&F reference tabs.

## Hard stops

- Do not hand-edit `rf/theme.json`, `rf/design-tokens.json`, `rf/brand-defaults.json`, or copied `rf/assets/css/{fonts,tokens,layouts,components}.css`.
- Do not deploy this theme to production without explicit approval.
- Do not commit font binaries.
