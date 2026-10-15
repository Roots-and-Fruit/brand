# Compiler learnings

What the Roots & Fruit WordPress projection taught us about turning a CDS kit into a theme. The kit was `brand-next`. The target was the Studio site `rf-static-probe`, theme `rf`, branch work on the compiler in `scripts/compile-wordpress.mjs`. These notes are for the next kit, not a changelog of one site.

The normative projection for this brand stays `WORDPRESS.md`. This file is the method.

## What the compiler owns

The compiler reads `DESIGN.md` and `css/tokens.css` and writes the theme. It should own:

- `theme.json` defaults, palette, and layout sizes
- Block style variations as JSON files under `styles/block/`. One file per style. Do not also register those slugs in PHP. WordPress already adds one numbered instance class (`is-style-rf-surface--2`). That class is platform behavior. A second PHP registration makes the visual values attach to the wrong class.
- Templates and template parts for chrome that is the same on every page of that type
- Site chrome CSS for rules `theme.json` cannot express (header bar, article frame, hero band, illustration position)
- Organism patterns, as unsynced theme files in `patterns/`

A hand-owned stylesheet is allowed only for nested rules `theme.json` cannot say (quote cite inset, takeaway contrast on a dark fill, the link inside a button). Keep it small. If a kit class already exists, use the class. Do not restyle the same thing in the hand file.

Atoms (button colors, quote edge, filled group padding) stay in `theme.json` and the block style JSON. Page jobs that are the same shape on every page of a type stay in the template. Page jobs whose words change per page become a pattern in the content.

## Three widths

Do not collapse these into one number.

| Width | Job | Where it lives |
| --- | --- | --- |
| `56rem` | `theme.json` `contentSize` and `wideSize` | Kit layout tokens. Leave them. |
| `1200px` | Header, hero, marketing column, footer | Chrome only. A block attribute or a site-chrome rule. |
| `65ch` (`--rf-measure`) | Article prose column | A grid track `minmax(0, var(--rf-measure))` beside a rail. |

`65ch` is the column. It is not a left offset on each block. Do not flex the post content. Flex plus WordPress `margin: auto` shrink-centers every child.

`ch` uses the font of the element the length is computed on. `max-width: 65ch` on a 48px heading is about 2000px, so in a wide editor the heading starts further left than the body. Define the measure on the prose wrapper and register it with `@property` as a `<length>` so children inherit the computed pixel value, not the token `65ch`.

## WordPress layout fights the kit

Constrained layout does two things that surprise a kit:

1. It sets `margin-left` and `margin-right` to `auto !important` on children that are not full or floated. A block narrower than the column (a 65ch quote, a 22rem card, a 22px lede whose `max-inline-size` is `65ch`) is centered. The fix is either to make the column the container, or to set the left margin to the same inset a full content-size block would have: `max(0px, (100% - 1200px) / 2)`.
2. It zeroes vertical margins. The kit’s rhythm then has to come from a class that puts the gap back (`.rf-prose > * + *`, `.rf-copy`, a stack). If that class is missing, blocks sit flush and the only “space” left is the line box of the type.

`margin: 0` on a core block (we did this on `.wp-block-quote`) is a physical shorthand. It beats a later logical `margin-block-start` from the kit. The editor will still look fine, because the editor spaces blocks with the list gap, not that margin. When the front is tighter than the editor, look for a shorthand that zeros the margin.

## Match the kit’s element, not just the class

Gestalt rules are sibling selectors. `.rf-copy > h1 + p` is not the same as `.rf-copy > h1 + h2`. Hugo’s hero subtitle is a paragraph with `rf-display rf-display--md`. Making it a heading in WordPress meant the hug rule never matched, and the lines sat on top of each other.

Before inventing a gap, check the kit markup:

- `.rf-copy` is the marketing stack. Eyebrow hugs the title (`space-3`). The lede hugs the title (`space-3`). The action steps away (`space-6`). The buttons wrapper has to be `.rf-cluster` or the action rule does not see it.
- `.rf-prose` is the article column. Direct-child cards lose the 22rem cap (`.rf-prose > .rf-card { max-inline-size: none }`). Following siblings get `space-5`. Headings get `space-6`.
- `.rf-card { max-inline-size: 22rem }` is correct for one card on a pattern page. It is wrong for a step card inside an article. The article has to be prose, not a new card width.

Putting `.rf-prose` on the post content also sets `box-sizing: content-box` and `max-inline-size: 65ch` on the shell. Override those two on `.wp-block-post-content.rf-prose` so the grid track stays the column. Keep the child rules.

## Templates, patterns, and meta

Use this split. It transferred cleanly and the services page is what tested it.

| Same on every page of that type | Changes per page |
| --- | --- |
| Template or template part | Unsynced pattern in the content |
| Article olive hero, byline chrome, rail, book band, footer | Marketing hero, offers, quotes, cards |

A hero baked into `page.html` cannot grow a lede and two buttons without editing the template for every page. A Page hero pattern in the content can. Seed it with the `default_content` filter so a new page is not empty. Existing pages need one backfill. The pattern is unsynced after that, so the words are ordinary blocks.

Page meta plus a template part is the other honest option when the shape never changes. Bind the post title, the excerpt, one lede, and button label plus URL. The moment a page needs a photo or a different button count, that page needs a second part, not more fields. Empty fields do not remove blocks.

Do not register patterns from a plugin. The theme folder is the registry. Syncing the theme must delete pattern files that the compiler no longer writes. A copy that only adds files leaves the old hero, pricing, and landing patterns in the inserter.

On current WordPress, the slash inserter lists blocks, not patterns. Patterns show in the inserter and in the new-page flow. Do not spend time hunting a registration flag that adds them to slash.

Saved post content does not update when the pattern file changes. Re-apply the setup script. The editor must be reloaded after CSS changes.

## Patterns worth generating

Generate an organism when an editor would drop it in as one unit and a core block cannot hold it.

- Quote (words, mark, attribution). A portrait is a second pattern. Core Quote cannot hold an image.
- Key takeaways.
- Service offer. Panel and dark fills are classes on that pattern, not new patterns.
- Review card. One card. A row of three is the card-grid job, which stays a recipe.
- Card. One card. Same rule.
- Page hero. Structure is shared, words are not, so it is a pattern seeded into pages, not a template slot.

Leave the gallery until the simple organisms are done. It is a stage, thumbs, and a dialog. Alerts, pills, and filled surfaces stay styles.

## Paint that is not a token

Illustrations are not one opacity. The tree is solid logo-olive vector art, so `0.1` (`--rf-atmosphere`) still reads. The apple is a pencil scan behind a color filter, so the same `0.1` disappears. The kit already has `--rf-atmosphere-spot` (`0.45`) for that. Use the spot token. Do not average them.

Position a corner illustration against the content column, not the viewport. `right: 4rem` on a full-bleed band parks it on the window. `right: max(1rem, (100% - 1200px) / 2)` parks it on the column. Fade it with a pseudo-element. Opacity on the band fades the background color too.

After stretching a nav to full height, the logo box stretches with it and the image sits on the top. Center the logo block. Do not set `height: 100%` on the nav root. That stops the flex stretch. Stretch the WordPress wrappers (responsive container, dialog, item, link).

## Buttons

Kit classes go on the button wrapper. The visible control is the inner link, which also receives `theme.json` button styles. If the wrapper and the link both draw a border, you get two rings. Zero the wrapper chrome and paint the link.

Do not put the small size on every outline button. `.btn--sm` is its own modifier. A hero pair (orange and outline) uses the normal `.btn` padding. The offer card uses `.btn--sm`.

## How to check

Measure the box. A screenshot can hide a second border, a `0` margin, or a heading whose max-width is `65ch` of a 48px font.

Compare to the kit page at the same viewport. Hugo and WordPress can both be “correct” at different column widths if one is still `776px` and the other is `65ch`. Say which width you are comparing.

A Playwright check that reads one element’s background will pass while the wrapper draws a second border. Assert the wrapper and the link. Assert the gap between siblings, not only that an element is visible.

When a kit rule does not seem to apply, the usual cause is context. The class is on the wrong element, the parent is not `.rf-prose` or `.rf-copy`, or a shorthand later in the theme zeros the property the kit set.

## Write the tags once

The compiler can rebuild this theme. The slow part was writing HTML the kit does not recognize, then patching CSS until a screenshot looked right. Three habits keep the next pass short.

Write the kit’s own tags the first time. A hero stack is `.rf-copy`. The eyebrow is `.rf-meta`. The byline is `.rf-byline`. The excerpt is `.rf-lede`. The line under a title is a paragraph with `rf-display rf-display--md`, not a heading. Buttons in that stack are `.rf-cluster`. A raw button in a full-bleed band sits inside a block (`book-call__open`). An inline button does not get WordPress’s column margin, so it sticks to the window edge. Those tags live in `scripts/block-snippets.mjs`. The article hero, the book button, and the quote, offer, and page-hero patterns all call that file.

Build the pages from those same pieces. Home, Services, Case Studies, and About are written by `scripts/page-blocks.mjs` during compile. The sentences live there. The hero, the offer, the quote, and the button row do not. A hand-edited HTML file is overwritten on the next compile. Re-run the setup script after that, because saved page content does not follow the file on its own.

Make the check fail when the tags are missing. `verify-wordpress.mjs` refuses a page hero whose subtitle is a heading, a hero without `.rf-copy`, `.rf-lede`, and `.rf-cluster`, an article top without `.rf-byline` and `.rf-lede`, and a book button that is not inside a block. The four page files are checked the same way.

Site chrome stays for things the kit does not have: the header bar, the apple, the 1200px inset on a full-bleed band. It is not the place to restyle a block the compiler itself wrote wrong.

## What not to carry forward

- Do not edit the kit to fix a projection miss, unless the kit and the projection disagree and the kit is wrong.
- Do not invent a container the parser or `theme.json` does not have, to paper over a missing class.
- Do not treat Block Runner as the writer. It inlines design. Block MCP writes blocks into a theme that already holds the design.
- Do not generate theme files, blocks, or MCP calls from the wireframe folder. The compiler in the kit folder is the writer.
