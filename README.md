# Roots & Fruit — Brand

Public design system for [Roots & Fruit](https://rootsandfruit.com): tokens, components, layout primitives, logos, and the agent contract (`DESIGN.md`).

**Live:** [brand.rootsandfruit.com](https://brand.rootsandfruit.com) (GitHub Pages)

## Browse locally

Open `index.html` in a browser, or serve the folder:

```powershell
npx --yes serve .
```

## Maintain

| File | Role |
| --- | --- |
| `DESIGN.md` | Canonical agent / generator contract |
| `index.html` | Human reference (specimens + embedded contract) |
| `css/brand.css` | Fonts and tokens |
| `css/ui.css` | Layout and components |
| `css/rf.css` | Both. This is what pages load. |
| `CHANGELOG.md` | Notable changes. The only changelog. |

After editing `DESIGN.md`:

```powershell
.\sync-design-md-embed.ps1
```

See `AGENTS.md` for agent workflow.

## Versions

`CHANGELOG.md` is the only changelog. Write notable changes under `## [Unreleased]` as they land. When a version ships, that section becomes `## [x.y.z] - YYYY-MM-DD`, `package.json` `version` matches it, and the compare links at the bottom of `CHANGELOG.md` are updated. Pushing `main` lets GitHub Actions read that version, take the notes from `CHANGELOG.md`, and open the GitHub release. Do not write release notes from the git log.

This folder is what [brand.rootsandfruit.com](https://brand.rootsandfruit.com) publishes, from [Roots-and-Fruit/brand](https://github.com/Roots-and-Fruit/brand).

## Fonts

Knile and Nunito Sans WOFF2 files are stored in `assets/fonts/` within this repository. `css/fonts.css` loads them with relative paths.

Required font files:
- `knile-regular-webfont.woff2`, `knile-semibold-webfont.woff2`, `knile-bold-webfont.woff2`
- `nunito-sans-latin-wght-normal.woff2`, `nunito-sans-latin-wght-italic.woff2` (variable weight, latin only)

Each project stores its own copy of the font files. No cross-project or hosted dependencies.

## WordPress projection

See `WORDPRESS.md`. The generated block theme is `wordpress/rf/`; source files are `DESIGN.md`, `css/tokens.css`, the shared CSS, `wordpress/rf/assets/css/block-styles.css`, patterns, parts, and templates. Run `npm run compile:wordpress` after source changes. Do not hand-edit generated theme JSON or copied CSS.

## License

Brand marks and Knile webfonts are licensed for Roots & Fruit web use.
