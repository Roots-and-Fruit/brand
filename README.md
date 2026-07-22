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

## License

Brand marks and Knile webfonts are licensed for Roots & Fruit web use (including this site). Do not redistribute the font files outside Roots & Fruit properties without a matching license.
