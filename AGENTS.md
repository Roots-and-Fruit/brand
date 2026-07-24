# Roots & Fruit — Core Design System (CDS)

Open this folder when changing visual identity, the design-system reference page, or the agent design contract.

**One system:** this package is the **Core Design System (CDS)**. Presentations use a **Presentation layer (PDS)** at `.cursor/skills/rf-reveal/` that sits on top of CDS (Pitch layouts + reveal.js). PDS vendors CDS tokens via `sync-cds-tokens.ps1`; it must not invent a second palette.

**Hub rule:** anything built to look like Roots & Fruit (site, plugin chrome, Phloem UI, decks, internal R&F tools) must follow CDS. Hub index: root `AGENTS.md` → Brand / design system. Skills: `rf-brand` (CDS), `rf-reveal` (PDS layer).

## Source of truth

| Artifact | Path | Role |
| --- | --- | --- |
| Agent contract | `DESIGN.md` | Normative tokens + rules for agents/generators |
| Shared CSS | `css/rf.css` (+ `tokens.css`, `layouts.css`, `components.css`, `fonts.css`) | Tokens, layout primitives, components |
| Atmosphere (thin) | `--rf-atmosphere*` + `.rf-atmosphere*` / `.rf-lede-over-atmosphere` | Roots/apples as soft background; lede weight over art |
| Reference page | `index.html` | Human-browsable specimens (+ embedded contract); GitHub Pages entry |
| Docs-only chrome | `css/docs.css` | Styles for the reference page shell only |
| Public repo | [Roots-and-Fruit/brand](https://github.com/Roots-and-Fruit/brand) | Published at brand.rootsandfruit.com |
| PDS layer | `.cursor/skills/rf-reveal/` | Slide layouts; consumes CDS via `cds-tokens.css` |

`DESIGN.md` is canonical. The Agent contract tab in `index.html` is a **rendered copy** of that file inside the `.rf-code` block so the page works when opened as a local file.

## When building R&F UI (any job)

1. Read `DESIGN.md` before choosing color, type, radius, or components.
2. Prefer `--rf-*` from `css/tokens.css` and primitives in `css/layouts.css` / `css/components.css`.
3. Do not invent parallel palettes, type stacks, or component patterns.
4. For decks: use the PDS layer (`rf-reveal`) for layouts; keep tokens coming from CDS (`sync-cds-tokens.ps1` after token edits).
5. Specimens: `index.html` or https://brand.rootsandfruit.com

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
4. If tokens changed: from hub root, `.\.cursor\skills\rf-reveal\sync-cds-tokens.ps1`

Optional lint: `npx -p "@google/design.md" designmd lint DESIGN.md`

## Knile fonts (hard stop)

Knile webfont **binaries are not part of this package** and must **never** be committed to public GitHub (`Roots-and-Fruit/brand`, `Roots-and-Fruit/slides`, or any public fork).

| Host | Role |
| --- | --- |
| `https://rootsandfruit.com/wp-content/uploads/rnf_assets/fonts/` | Only place Knile WOFF2s are stored for web use |
| `css/fonts.css` | `@font-face` points at those absolute URLs (CORS on that path) |
| Georgia / Times | Fallback when the CDN is unreachable (`file://`, offline) |

**Agents:** do not add `fonts/knile-*.woff2` (or copies under `assets/fonts/`) to git. Do not vendor Knile into client repos for “convenience.” If a surface needs Knile, load from the marketing-site URLs (or keep binaries only in private hub storage, never in a public remote).

## Boundaries

- Do not invent hex, type, or component patterns that are not in `DESIGN.md` / tokens.
- Do not commit secrets into this package (none should live here).
- Do not commit Knile font files to GitHub (see Knile hard stop above).
- Website theme/CSS on rootsandfruit.com is a separate apply step; this package is the brand SoR.
- Do not grow CDS into a slide layout library — that stays in the PDS layer.
