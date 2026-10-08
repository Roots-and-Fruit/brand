# Kit gaps

Logged 2026-10-05, from the Hugo product page at `wiremd-projects/hugo/content/products/synced-pattern-popups.md`. The layout reference was the Dotstore extra-fees sales page. The words were Synced Pattern Popups. These are Roots & Fruit kit gaps (`--rf-*`, this folder). They are not Example Brand (`design-kit-template`, `--cds-*`).

Do not add a ninth page job. Do not build these on the product page alone and leave the kit unchanged. When one ships, update `DESIGN.md`, run `sync-design-md-embed.ps1`, and mark it done here.

## 1. Viewport wash

Shipped 2026-10-05. Class `.rf-wash` (cream-deep) and `.rf-wash--dark` (moss). Copy sits in `.rf-wash__inner` on `--rf-max`. On a marketing page the stripe is the window. On the docs site it stops at the sidebar.

See it on Space & shape (the specimen), and in use on Page jobs (Proof, Split, Dark band) and Showcase (Landing, Plugin page).

## 2. Quote

Shipped 2026-10-05. Class `.rf-quote`. Words, a mark, and a person. Leave out the photo, the role, or both, and the row closes up. Schema.org Quotation: `text` on the words, `author` as a Person (`name`, optional `jobTitle`, optional `image`). A source URL is `citation` on the quotation, outside the Person. The mark is CSS so it is not part of `text`. Review schema stays with the review card.

See it on Page jobs (with a photo, and without). The Synced Pattern Popups pull quote uses the no-photo form.

## 3. Review card

Shipped 2026-10-05. Class `.rf-review`, in `.rf-grid--three`. Rating, title, words, person, and a date. The role line is optional. Stars are `--rf-orange`. A star without `.rf-review__star--on` stays a quiet orange. Schema.org Review: `reviewRating` (Rating), `name`, `reviewBody`, `author` as a Person, `datePublished`. A source link is `url` on the review, outside the Person. A job title is `jobTitle` on the Person.

See it on Page jobs. The Synced Pattern Popups reviews use it. A slider is still out.

## 4. Gallery

Shipped 2026-10-05. Class `.rf-gallery`. One image on a mat, its caption, and a count. The thumbs share the mat's width, up to six across. The current thumb uses the brown right-and-bottom edge. Open the mat for a dialog with a 5px `--rf-panel` frame. Round arrows sit on the picture. A panel-colored bar holds previous, next, the caption, and close. Schema.org ItemList of ImageObject (`position`, `caption`, `contentUrl`, `width`, `height`).

See it on Page jobs. The Synced Pattern Popups screenshots use it.

## 5. Product chrome (folder tabs, toggle, filter select)

Shipped 2026-10-05. From Agent Role settings UI. Classes in `css/chrome.css`:

- `.rf-tabs` — folder tabs with shoulder SVG and orange dot on the current tab
- `.rf-toggle` — tan/green switch with uppercase ON/OFF (or custom) state label
- `.rf-select` — tall filter dropdown with card-style picker where `base-select` is supported

See Components → Inputs & controls for `.rf-select` and `.rf-toggle`. See Patterns & layout → Content patterns for `.rf-tabs`. WordPress admin may need scoped resets on top of the kit CSS.

## Alongside the four

Shipped 2026-10-05. Modifier `.rf-split--shot` on the existing split. The copy track is 28rem, and it will not exceed `--rf-measure`. The other track takes the rest of the row, and the picture can sit on either side. `.rf-frame--fit` shows the whole image at its real ratio, with a 1px rule. The plain `.rf-frame` keeps the 4:3 crop for illustrations.

See it on Page jobs (Split with a screenshot). The Synced Pattern Popups "How it works" rows use it.

## Atoms (2026-10-05)

Shipped on Components: textarea (already styled), number stepper, slider, card, divider, badge, avatar, relative time, breadcrumb, pagination, skeleton, tooltip, dialog, and toast. A badge is a count or a status dot. A pill stays a short label. Dark mode stays out. Paid, experimental, and chart pieces from other libraries stay out.

## Not this round

- A larger disclosure, so a sales question is not the size of a design-system note. Size only. The component exists.
- A sticky section bar. Chrome, same family as the header. Wait until the washes exist.
- Pricing tables, a calculator, and a star chart. Those belong to a shop page, not to this kit yet.
