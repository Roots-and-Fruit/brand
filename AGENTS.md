# Roots & Fruit — Brand package

Open this folder when changing visual identity, the design-system reference page, or the agent design contract.

**Hub rule:** anything built to look like Roots & Fruit (site, plugin chrome, Phloem UI, decks, internal R&F tools) must follow this package. Hub index: root `AGENTS.md` → Brand / design system. Skill: `rf-brand`.

## Source of truth

| Artifact | Path | Role |
| --- | --- | --- |
| Agent contract | `DESIGN.md` | Normative tokens + rules for agents/generators |
| Shared CSS | `css/rf.css` (+ `tokens.css`, `layouts.css`, `components.css`, `fonts.css`) | Tokens, layout primitives, components |
| Reference page | `index.html` | Human-browsable specimens (+ embedded contract); GitHub Pages entry |
| Docs-only chrome | `css/docs.css` | Styles for the reference page shell only |
| Public repo | [Roots-and-Fruit/brand](https://github.com/Roots-and-Fruit/brand) | Published at brand.rootsandfruit.com |

`DESIGN.md` is canonical. The Agent contract tab in `index.html` is a **rendered copy** of that file inside the `.rf-code` block so the page works when opened as a local file.

## When building R&F UI (any job)

1. Read `DESIGN.md` before choosing color, type, radius, or components.
2. Prefer `--rf-*` from `css/tokens.css` and primitives in `css/layouts.css` / `css/components.css` (`.rf-stack`, `.rf-cluster`, `.rf-prose`, `.btn`, `.alert`, `.surface`, …).
3. Do not invent parallel palettes, type stacks, or component patterns.
4. Specimens and human reference: `index.html` or https://brand.rootsandfruit.com

**Out of scope for this contract:** public `skills/` packages (domain-agnostic) and third-party client brands, unless the deliverable is explicitly Roots & Fruit branded.

## Keep the HTML copy in sync

After **any** edit to `DESIGN.md`, run from this folder:

```powershell
.\sync-design-md-embed.ps1
```

Do not hand-edit the markdown inside `#design-md-source` in the HTML. Change `DESIGN.md`, then sync.

If you change brand tokens or components, update in this order:

1. `css/tokens.css` / `css/components.css` / `css/layouts.css` (and specimens in `index.html` if needed)
2. `DESIGN.md` (front matter + prose)
3. `.\sync-design-md-embed.ps1`

Optional lint: `npx -p "@google/design.md" designmd lint DESIGN.md`

## Boundaries

- Do not invent hex, type, or component patterns that are not in `DESIGN.md` / tokens.
- Do not commit secrets into this package (none should live here).
- Website theme/CSS on rootsandfruit.com is a separate apply step; this package is the brand SoR.
