/**
 * Block markup the kit already knows how to space.
 * Patterns and page scripts both call these. Do not copy the tags by hand.
 *
 * A hero stack is .rf-copy. The line under a title is a paragraph, not a heading.
 * Buttons in that stack are .rf-cluster. A raw button in a full-bleed band sits
 * inside a block, or WordPress parks it on the window edge.
 */

export function buttonLink({ classes, href, label }) {
  const hrefAttr = href ? ` href="${href}"` : "";
  return `<!-- wp:button {"className":"${classes}"} -->
<div class="wp-block-button ${classes}"><a class="wp-block-button__link wp-element-button"${hrefAttr}>${label}</a></div>
<!-- /wp:button -->`;
}

export function buttonCluster(buttons) {
  return `<!-- wp:buttons {"className":"rf-cluster"} -->
<div class="wp-block-buttons rf-cluster">
${buttons.map((button) => buttonLink(button)).join("\n\n")}
</div>
<!-- /wp:buttons -->`;
}

export function pageHero({ postTitle = false, title = "", subtitle = "", lede, buttons, extraClass = "" }) {
  const classes = ["page-hero", "rf-copy", extraClass].filter(Boolean).join(" ");
  const titleBlock = postTitle
    ? `<!-- wp:post-title {"level":1,"className":"rf-display rf-display--lg"} /-->`
    : `<!-- wp:heading {"level":1,"className":"rf-display rf-display--lg"} -->
<h1 class="wp-block-heading rf-display rf-display--lg">${title}</h1>
<!-- /wp:heading -->`;
  const subtitleBlock = subtitle
    ? `<!-- wp:paragraph {"className":"rf-display rf-display--md"} -->
<p class="rf-display rf-display--md">${subtitle}</p>
<!-- /wp:paragraph -->`
    : "";
  const parts = [
    titleBlock,
    subtitleBlock,
    `<!-- wp:paragraph {"className":"rf-lede"} -->
<p class="rf-lede">${lede}</p>
<!-- /wp:paragraph -->`,
    buttonCluster(buttons),
  ].filter(Boolean);
  return `<!-- wp:group {"align":"full","className":"${classes}","backgroundColor":"panel","style":{"border":{"bottom":{"color":"var:custom|panel-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull ${classes} has-panel-background-color has-background" style="border-bottom-color:var(--wp--custom--panel-deep);border-bottom-style:solid;border-bottom-width:4px;padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
${parts.join("\n\n")}
</div>
<!-- /wp:group -->`;
}

export function offer({
  modifier = "",
  eyebrow,
  title,
  lede,
  items,
  amount,
  cadence,
  href,
  portrait,
  quote,
  by,
}) {
  const classes = ["rf-offer", modifier].filter(Boolean).join(" ");
  const itemsHtml = items
    .map(
      (item) => `<!-- wp:list-item -->
<li>${item}</li>
<!-- /wp:list-item -->`,
    )
    .join("\n\n");
  return `<!-- wp:group {"className":"${classes}","layout":{"type":"default"}} -->
<div class="wp-block-group ${classes}">
	<!-- wp:group {"className":"rf-offer__main","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-offer__main">
		<!-- wp:paragraph {"className":"rf-offer__eyebrow"} -->
		<p class="rf-offer__eyebrow">${eyebrow}</p>
		<!-- /wp:paragraph -->

		<!-- wp:group {"className":"rf-offer__copy","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-offer__copy">
			<!-- wp:heading {"level":3,"className":"rf-offer__title"} -->
			<h3 class="wp-block-heading rf-offer__title">${title}</h3>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"rf-offer__lede"} -->
			<p class="rf-offer__lede">${lede}</p>
			<!-- /wp:paragraph -->

			<!-- wp:list -->
			<ul class="wp-block-list">
${itemsHtml}
			</ul>
			<!-- /wp:list -->
		</div>
		<!-- /wp:group -->

		<!-- wp:group {"className":"rf-offer__price","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-offer__price">
			<!-- wp:paragraph {"className":"rf-offer__amount"} -->
			<p class="rf-offer__amount">${amount}</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"className":"rf-offer__cadence"} -->
			<p class="rf-offer__cadence">${cadence}</p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons -->
			<div class="wp-block-buttons">
${buttonLink({ classes: "btn btn--primary btn--sm", href, label: "Book a discovery call" })}
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-offer__band","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-offer__band">
		<!-- wp:html -->
		<img class="rf-offer__portrait" src="${portrait}" alt="" width="72" height="72" />
		<!-- /wp:html -->

		<!-- wp:group {"className":"rf-offer__words","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-offer__words">
			<!-- wp:paragraph {"className":"rf-offer__quote"} -->
			<p class="rf-offer__quote">${quote}</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"className":"rf-offer__by"} -->
			<p class="rf-offer__by">${by}</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}

export function quote({ text, name, role, avatar, width }) {
  const dim = width ? `,"style":{"dimensions":{"width":"${width}"}}` : "";
  const styleAttr = width ? ` style="width:${width}"` : "";
  const avatarBlock = avatar
    ? `<!-- wp:html -->
<img class="rf-quote__avatar" src="${avatar.src}" alt="" width="${avatar.width}" height="${avatar.height}" />
<!-- /wp:html -->

`
    : "";
  return `<!-- wp:group {"tagName":"figure","className":"rf-quote"${dim},"layout":{"type":"default"}} -->
<figure class="wp-block-group rf-quote"${styleAttr}>
	<!-- wp:quote -->
	<blockquote class="wp-block-quote">
		<!-- wp:paragraph -->
		<p>${text}</p>
		<!-- /wp:paragraph -->
	</blockquote>
	<!-- /wp:quote -->

	<!-- wp:group {"tagName":"figcaption","layout":{"type":"default"}} -->
	<figcaption class="wp-block-group">
		<!-- wp:group {"className":"rf-quote__who","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-quote__who">
${avatarBlock}			<!-- wp:group {"className":"rf-quote__id","layout":{"type":"default"}} -->
			<div class="wp-block-group rf-quote__id">
				<!-- wp:paragraph {"className":"rf-quote__name"} -->
				<p class="rf-quote__name">${name}</p>
				<!-- /wp:paragraph -->

				<!-- wp:paragraph {"className":"rf-quote__role"} -->
				<p class="rf-quote__role">${role}</p>
				<!-- /wp:paragraph -->
			</div>
			<!-- /wp:group -->
		</div>
		<!-- /wp:group -->
	</figcaption>
	<!-- /wp:group -->
</figure>
<!-- /wp:group -->`;
}

/** Article top. Category, title, byline, excerpt. The kit spaces these as siblings. */
export function articleHeroCopy() {
  return `<!-- wp:group {"className":"rf-copy","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"default"}} -->
<div class="wp-block-group rf-copy">
	<!-- wp:post-terms {"term":"category","className":"rf-meta"} /-->
	<!-- wp:post-title {"level":1} /-->
	<!-- wp:group {"className":"rf-article-byline rf-byline","style":{"spacing":{"blockGap":"var:preset|spacing|space-2"}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"center"}} -->
	<div class="wp-block-group rf-article-byline rf-byline">
		<!-- wp:html -->
		<img src="/wp-content/themes/rf/assets/articles/matt.jpg" alt="" width="26" height="26" />
		<!-- /wp:html -->
		<!-- wp:paragraph -->
		<p>By</p>
		<!-- /wp:paragraph -->
		<!-- wp:post-author-name {"isLink":true} /-->
		<!-- wp:paragraph -->
		<p aria-hidden="true">·</p>
		<!-- /wp:paragraph -->
		<!-- wp:post-date {"format":"F j, Y"} /-->
	</div>
	<!-- /wp:group -->
	<!-- wp:post-excerpt {"moreText":"","className":"rf-lede"} /-->
</div>
<!-- /wp:group -->`;
}

/** Block wrapper. An inline button in a full-bleed band does not get the column. */
export function bookOpen(label = "Book a discovery call") {
  return `<div class="book-call__open">
	<button type="button" class="btn btn--cta" id="book-call">${label}</button>
</div>`;
}

const SUBSCRIBE_SITEKEY = "0x4AAAAAAFV-KGUd_wkXmGBY";

/**
 * The live subscribe form. Articles use the inline email row.
 * The post rail and the inserter pattern stack name and email.
 * Both post to /api/subscribe. The theme script binds form.rf-subscribe.
 */
export function subscribeForm({ idPrefix, name = false, layout = "stacked" }) {
  const turnstile = `<div class="rf-subscribe-turnstile" data-sitekey="${SUBSCRIBE_SITEKEY}" data-action="subscribe"></div>`;
  const status = `<p class="rf-meta rf-subscribe-status" role="status"></p>`;
  if (layout === "inline") {
    return `<form class="page-hero__optin rf-subscribe" method="post" action="/api/subscribe">
			<div class="field">
				<label for="${idPrefix}-email">Email</label>
				<div class="page-hero__optin-row">
					<input class="input" id="${idPrefix}-email" type="email" name="email" autocomplete="email" required maxlength="254">
					<button class="btn btn--primary" type="submit">Subscribe</button>
				</div>
			</div>
			${turnstile}
			${status}
		</form>`;
  }
  const nameField = name
    ? `<div class="field">
			<label for="${idPrefix}-name">Name</label>
			<input class="input" id="${idPrefix}-name" type="text" name="name" autocomplete="name" maxlength="100">
		</div>
		`
    : "";
  return `<form class="rf-copy rf-subscribe" method="post" action="/api/subscribe">
		<p class="rf-meta">Subscribe</p>
		<p>More context and resources, straight from Matt.</p>
		${nameField}<div class="field">
			<label for="${idPrefix}-email">Email</label>
			<input class="input" id="${idPrefix}-email" type="email" name="email" autocomplete="email" required maxlength="254">
		</div>
		${turnstile}
		<button class="btn btn--primary" type="submit">Subscribe</button>
		${status}
	</form>`;
}

function htmlBlock(inner) {
  return `<!-- wp:html -->
${inner}
<!-- /wp:html -->`;
}

function glyph(name) {
  return `<span class="rf-glyph rf-glyph--${name}" aria-hidden="true"></span>`;
}

export function iconCardPattern() {
  return `<!-- wp:group {"tagName":"article","className":"rf-card rf-icon-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card rf-icon-card">
	${htmlBlock(`<span class="rf-glyph-tile">${glyph("check")}</span>`)}

	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">A clear next step</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>The reader knows what to do this week.</p>
	<!-- /wp:paragraph -->
</article>
<!-- /wp:group -->`;
}

export function iconListPattern() {
  const rows = [
    ["check", "A named owner", "One person is accountable for the next step."],
    ["arrow", "A clear next step", "The page says what to do this week."],
    ["mail", "A note they can keep", "The follow-up lands in their inbox."],
  ];
  const items = rows
    .map(
      ([icon, title, text]) => `<!-- wp:group {"className":"rf-glyph-row","layout":{"type":"default"}} -->
<div class="wp-block-group rf-glyph-row">
	${htmlBlock(`<span class="rf-glyph-tile">${glyph(icon)}</span>`)}

	<!-- wp:group {"className":"rf-glyph-row__copy","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-glyph-row__copy">
		<!-- wp:heading {"level":3} -->
		<h3 class="wp-block-heading">${title}</h3>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p>${text}</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->`,
    )
    .join("\n\n");
  return `<!-- wp:group {"className":"rf-glyph-list","layout":{"type":"default"}} -->
<div class="wp-block-group rf-glyph-list">
${items}
</div>
<!-- /wp:group -->`;
}

export function factsPattern() {
  return htmlBlock(`<dl class="rf-facts">
	<div><dt>Client</dt><dd>Client name</dd></div>
	<div><dt>Date</dt><dd>2026</dd></div>
	<div><dt>Services</dt><dd>Offer, pricing</dd></div>
	<div><dt>Visit</dt><dd><a href="#study">Their site</a></dd></div>
</dl>`);
}

export function stepsPattern() {
  return htmlBlock(`<ol class="rf-steps">
	<li class="rf-step"><p class="rf-step__mark">01</p><div><h3 class="rf-step__title">Name the offer</h3><p>One conversation to say what the work is, and who it is for.</p></div></li>
	<li class="rf-step"><p class="rf-step__mark">02</p><div><h3 class="rf-step__title">Write the page</h3><p>The choice, what changed, and what the team did next.</p></div></li>
	<li class="rf-step"><p class="rf-step__mark">03</p><div><h3 class="rf-step__title">Leave the number where they can check it</h3><p>It stays on the page. It does not move into a deck.</p></div></li>
</ol>`);
}

function stat(value, label) {
  return `<!-- wp:group {"className":"rf-stat","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stat">
	<!-- wp:paragraph {"className":"rf-stat__value"} -->
	<p class="rf-stat__value">${value}</p>
	<!-- /wp:paragraph -->

	<!-- wp:paragraph {"className":"rf-meta"} -->
	<p class="rf-meta">${label}</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->`;
}

export function statsPattern() {
  return `<!-- wp:group {"className":"rf-stats","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stats">
${stat("6 weeks", "Notice")}
${stat("50%", "Price change")}
${stat("1 page", "The study")}
</div>
<!-- /wp:group -->`;
}

function person(file, name, role) {
  const src = `/wp-content/themes/rf/assets/services/${file}`;
  return `<!-- wp:group {"tagName":"article","className":"rf-person","layout":{"type":"default"}} -->
<article class="wp-block-group rf-person">
	${htmlBlock(`<img src="${src}" alt="" width="480" height="480" />`)}

	<!-- wp:heading {"level":3,"className":"rf-person__name"} -->
	<h3 class="wp-block-heading rf-person__name">${name}</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"className":"rf-person__role"} -->
	<p class="rf-person__role">${role}</p>
	<!-- /wp:paragraph -->
</article>
<!-- /wp:group -->`;
}

export function peoplePattern() {
  return `<!-- wp:group {"className":"rf-people","layout":{"type":"default"}} -->
<div class="wp-block-group rf-people">
${person("danny-van-kooten.jpg", "Danny van Kooten", "Founder, ibericode")}
${person("serg-sokhatskyi.jpg", "Serg Sokhatskyi", "Founder, XTemos")}
${person("andrew-wilder.jpg", "Andrew Wilder", "Founder, NerdPress")}
</div>
<!-- /wp:group -->`;
}

export function shotsPattern() {
  const img = (file, alt, className = "") => {
    const cls = className ? ` class="${className}"` : "";
    return htmlBlock(
      `<img src="/wp-content/themes/rf/assets/products/${file}" alt="${alt}"${cls} width="1200" height="800" />`,
    );
  };
  return `<!-- wp:group {"className":"rf-shots","layout":{"type":"default"}} -->
<div class="wp-block-group rf-shots">
	${img("shot-1.jpg", "A popup using a Kadence block", "rf-shots__lead")}

	<!-- wp:group {"className":"rf-shots__side","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-shots__side">
		${img("shot-2.jpg", "The patterns screen in wp-admin")}
		${img("shot-5.jpg", "A synced pattern in the editor")}
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}

export function logoRowPattern() {
  const logos = [
    ["the-events-calendar.svg", "The Events Calendar"],
    ["stellarwp.svg", "StellarWP"],
    ["give.png", "GiveWP"],
  ];
  const items = logos
    .map(
      ([file, name]) =>
        `\t<li><img src="/wp-content/themes/rf/assets/case-studies/${file}" alt="${name}" /></li>`,
    )
    .join("\n");
  return htmlBlock(`<ul class="rf-logo-row">
${items}
</ul>`);
}

export function subscribePattern() {
  return htmlBlock(subscribeForm({ idPrefix: "pattern-subscribe", name: true }));
}
