# R&F WordPress theme generation checklist

This is a release gate, not optional background reading. A theme generation is **not done** when files merely exist. It is done only when the static, runtime, MU-plugin, Site Editor, identity, and visual gates below have evidence.

## 0. Scope and safety

- [ ] Work only from `company-docs/brand-next/`; never modify `company-docs/brand/` during this comparison phase.
- [ ] Confirm the destination is the intended local probe or explicitly approved environment.
- [ ] Do not deploy to production from this workflow.
- [ ] Do not commit `.env`, font binaries, database exports, or secrets.

## 1. Compile the projection

From `company-docs/brand-next/`:

```powershell
npm run compile:wordpress
```

This must finish with both:

```text
Compiled Roots & Fruit: ...
Static WordPress projection verification passed.
```

The static verifier must pass. It checks:

- `Theme Name: Roots & Fruit`
- valid `theme.json`, `design-tokens.json`, and `brand-defaults.json`
- R&F `--rf-*` / `.rf-*` namespace with no stale `cds` namespace
- custom-token registry exists
- `register_design_token()` integration exists
- Site Logo fallback exists
- required patterns, templates, parts, CSS, and mark exist

If it fails, stop. Do not copy a partial theme.

## 2. Confirm the Design Token Registration API

Before syncing the theme, confirm the probe has the Design Token Registration API MU plugin installed and active.

Required runtime facts:

- `register_design_token()` exists before the theme’s `init` hook runs.
- The MU plugin exposes the custom-token UI in the Site Editor.
- The theme’s `wordpress/rf/design-tokens.json` tokens appear in that UI.
- At least one token can be read in the UI with its R&F default.
- A harmless token edit can be saved and persists after reload.

If `register_design_token()` is unavailable, stop and report the MU-plugin installation/activation problem. Do not claim custom-token support is working merely because `design-tokens.json` exists.

## 3. Sync to the probe

Use the actual theme directory:

```powershell
node scripts/sync-theme.mjs --dest "C:/path/to/wp-content/themes/rf"
```

The sync command now fails if the WordPress probe is unreachable. Do not use `--skip-test` for a normal generation. It is only for an explicitly documented file-only copy and prints `UNVERIFIED`.

## 4. Activate and configure the Site Editor

The theme cannot configure database-backed Site Editor state by copying files. In the probe:

- [ ] Activate **Roots & Fruit**.
- [ ] Confirm Site Identity: Site Title is `Roots & Fruit`.
- [ ] Set the R&F tagline intentionally; do not leave an accidental placeholder.
- [ ] Upload and assign the official full wordmark from `logos/SVG/R&F_Logo.svg` as Site Logo.
- [ ] Configure the dark-background logo where the Site Editor/theme surface requires it: `logos/SVG/R&F_Logo_DarkBG.svg`.
- [ ] Set the Site Icon/favicon from the approved R&F icon asset.
- [ ] Confirm header and footer use native Site Identity blocks, not hardcoded text or a generic kit mark.
- [ ] Configure the primary navigation and verify it persists after reload.
- [ ] Open Global Styles and confirm the R&F palette, type, spacing, radius, shadow, and custom-token groups are visible.
- [ ] Remove or reset stale Global Styles values inherited from the previous theme/probe when they override R&F defaults.
- [ ] Confirm the Page jobs/patterns appear under the intended R&F pattern category.

Do not silently substitute `rf-mark.svg` for the official full logo. The mark is only a fallback/tight icon; it is not the default wordmark.

## 5. Run the runtime gates

With the probe running:

```powershell
npm run test:wp
```

This HTTP smoke gate must pass and confirms the live front page renders the R&F identity, native Site Logo, official logo asset, and R&F token CSS. It is intentionally small and does not replace the Studio checks below.

Then run the probe-specific gates through Studio:

```powershell
studio wp theme list --status=active --format=table
studio wp eval "echo 'fn=' . (function_exists('register_design_token') ? 'yes' : 'no') . PHP_EOL; echo 'tokens=' . count(gutenberg_get_registered_design_tokens()) . PHP_EOL; echo 'merged=' . count(gutenberg_get_merged_design_tokens(wp_get_global_settings())) . PHP_EOL;"
studio wp option get site_logo
studio wp option get site_icon
```

The expected result is `rf` active, `fn=yes`, 14 registered tokens, 14 merged tokens, and nonzero logo/icon IDs.

Finally inspect the Site Editor and probe pages for:

- custom-token registration/UI availability and persistence after a harmless edit
- blank Core page defaults
- header/footer logo rendering
- page-job patterns and paired surfaces
- Copy/Switcher/Sidebar/Center/Box/Frame layout styles
- symmetric proof/card grids
- article frame and details/disclosure behavior
- responsive behavior at desktop and narrow widths
- no stale generic kit identity

HTTP 200 alone is not a pass. A complete gate combines smoke output, Studio/WP-CLI output, and Site Editor evidence.

## 6. Record evidence

Before declaring generation complete, record:

- compiler output
- static verifier output
- destination path and theme name
- MU-plugin/API check result
- Site Editor custom-token UI result
- Site Identity/logo/favicon result
- `npm run test:wp` result
- any intentional `--skip-test` exception and why

If any runtime or Site Editor check cannot be run, status is **unverified**, not complete.

## Hard stops

- Never claim custom-token support from the registry file alone.
- Never claim logo implementation from a theme fallback alone.
- Never claim Site Editor setup from `theme.json` alone.
- Never allow an unreachable probe to count as a successful generation.
- Never overwrite the original CDS while comparing the fork.
