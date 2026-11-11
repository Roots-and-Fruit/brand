# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Author bio template part (`parts/author-bio.html`) and block pattern (`rf/author-bio`): framed `is-style-rf-surface` card with a `roots-1.svg` watermark, square portrait, Knile author link, role line, and a footer row pairing `More about Matt` with bordered social tiles.
- Icon pills: `.pill__icon` for a leading inline SVG on `.pill` chips (evidence, horizon, status).
- Action steps: `.rf-steps--action` for a tight mark column and orange step numbers, plus `.rf-step__head` for a title beside a pill.
- Numbered and outline-icon card leads: `.rf-card__num` for a muted Knile step, `.rf-card__icon` for a 2.5rem orange outline SVG. Patterns `rf/numbered-card` and `rf/outline-icon-card`. The green glyph-tile icon card stays its own piece.
- Outline icon list (`ul.rf-icon-list`, pattern `rf/outline-icon-list`): single-line summary rows at `--rf-text-xl` paired with outline SVGs in `--rf-space-7` moss tiles (`.rf-icon-list__icon`), `.rf-icon-list__item--accent` for a solid-moss milestone row, and `.rf-icon-list--detail` for multi-line titled rows in a framed white surface card.
- A dialogue pattern (`rf/dialogue`): a fieldset Group, the Legend block for the label, two turns, and an optional handoff line.
- Showcase cards (`.rf-card--showcase` / `.rf-grid--showcase`, pattern `rf/showcase-card`): a `5.25rem` inset brand stage (`.rf-card__stage`, `.rf-card__stage--dual`) or media header (`.rf-card__head`), rounded `1.5px` frame, `--rf-text-lg` linked titles with an inline `↗` cue, full-ink `body-md` copy, and `.rf-lead-in` prose proximity.

### Changed

- Articles archive (`templates/home.html`): split hero with a framed subscribe surface, client-side topic filter pills, a logo-olive latest-essay spotlight with key takeaways, and scannable essay cards with outline icons, reading time, and an expandable key-takeaways disclosure.
- Discovery call band (`parts/book.html`) and post sidebar (`parts/sidebar-post.html`, `patterns/subscribe.php`): split closing band with an `Advisory & Coaching` kicker and framed host/booking card, plus an elevated logo-olive rail CTA and framed newsletter subscribe card.

### Fixed

- Dynamic theme template blocks (`rf/articles-index`, `rf/term-*`, `rf/product-*`) register in `assets/js/editor-layout.js` so the Site Editor renders `rf/articles-index` via `ServerSideRender` without unsupported-block warnings.
- Article blocks keep the prose gap. A quote, a heading, and an embed sit on the same rhythm as the paragraphs.

## [2.1.0] - 2026-10-15

### Added

- The WordPress compile fails when a promised body-text pair is under 4.5:1, or when a theme image has no alt. The Color page matrix stays the picture of every pair.
- A Playwright check runs axe for WCAG 2 A and AA on the home, articles, and services pages when the Studio probe is up.

### Fixed

- The source link on a service offer uses the band's brown. Mid moss on the light green band was 4.14:1.

## [2.0.0] - 2026-10-15

### Added

- Case-study pieces that stay inside the existing page jobs: a fact list, steps, a three-stat row, people, a photo cluster, and a logo row.
- Check, arrow, and mail glyphs, plus an icon card and an icon list. Social marks stay inline icons.
- A Subscribe pattern on the same form as the articles hero and the post rail. It posts to `/api/subscribe`.
- A service offer: one full-width card with a price column and a green quote band. White, beige, and dark moss. The title is the extra-large step. The lede, the list, and the price are large. Each offer has its own small moss button, so a stack of offers does not spend the page's orange. The page still has one orange button, on the close.
- A beige page stripe beside the cream and moss washes.
- A primary nav: uppercase links, a hairline between them, a beige fill that rises on hover, and a cream fill on the current page. The header bar that holds the row stays site chrome.
- A logo-olive surface for a callout that should match the footer. Type and buttons follow the dark surface.
- X, YouTube, and LinkedIn marks in `icons/`, from Simple Icons. Each sits in the same square. YouTube is drawn larger inside it so the artwork matches the others.
- Research notes have an archive template and a single template. A term page has its own template.

### Changed

- Reading lines are 65 characters. Articles and marketing copy used 60.
- A quote is a white card with the shared 4px cream edge. The Knile mark sits in the top corner, one step darker than the fill, and the words start beside it.
- Cards use that same white edge. The brown offset rule, the rounded corner, and the shadow are gone.
- The gallery stage and thumbs use the white edge. The picture keeps a steady height and is shown whole, with beige in the gaps. A Knile title sits in a header the same height as the footer. Previous and next fade in on the picture. Thumbs crop to fill the frame. Open sits with Close. The dialog frame is 6px, square, and has no shadow. Cards stay 4px.

### Removed

- **Breaking:** The block theme no longer includes the 1.0.0 page-job patterns (hero, proof, split, card grid, landing, pricing, and the rest of that set). The inserter now has the offer, the case-study pieces, the card, the subscribe form, and the other patterns this site uses.

### Fixed

- The profile photo was 50 pixels wide. It is now a 640 pixel crop, so avatars and quote portraits stay sharp.
- The accessibility matrix on the Color page sits flush, with no gaps between rows, and stays inside the page margins.

## [1.0.0] - 2026-10-08

### Added

- The reference site has page jobs (a hero, proof, a card grid, a split, a quote, a dark band, a closing section, and an alert) and four assembled layouts: landing, plugin page, article, and tool.
- Styles load as `brand.css` (fonts and colors) or `ui.css` (layout and components). `rf.css` still loads both, so an existing page keeps working.
- A picture can sit in a circle, or on the other side of a split. On a dark green band, form labels and text links stay light enough to read.
- Tool screens can use folder tabs, an on/off toggle, and a taller filter menu.
- The reference pages are labeled Brand kit, Atoms, Molecules, Organisms, and Pages. Those labels are not new folders.
- A WordPress block theme in `wordpress/rf` is compiled from this contract.

### Changed

- A page gets one moss primary button. An orange button on a dark band uses the page's orange, so the closing section does not get a second orange button.
- The color guide lists the CSS variable beside each color name. Soft orange is `--rf-orange-soft`.

[Unreleased]: https://github.com/Roots-and-Fruit/brand/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/Roots-and-Fruit/brand/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Roots-and-Fruit/brand/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Roots-and-Fruit/brand/releases/tag/v1.0.0
