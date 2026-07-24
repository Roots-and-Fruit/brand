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
| `css/rf.css` | Shared CSS entry (`tokens`, `layouts`, `components`, `fonts`) |

After editing `DESIGN.md`:

```powershell
.\sync-design-md-embed.ps1
```

See `AGENTS.md` for agent workflow.

## Fonts

Knile WOFF2 files are **not** stored in this repository. `css/fonts.css` loads them from the marketing site:

`https://rootsandfruit.com/wp-content/uploads/rnf_assets/fonts/knile-*-webfont.woff2`

That path must allow CORS (Cloudflare response header on `/wp-content/uploads/rnf_assets/fonts/`).

## License

Brand marks and Knile webfonts are licensed for Roots & Fruit web use. Knile binaries live only on rootsandfruit.com (and other R&F-controlled hosts), not in this public GitHub tree.
