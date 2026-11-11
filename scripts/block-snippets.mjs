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
  const arrow = `<svg class="rf-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  return `<div class="book-call__open">
	<button type="button" class="btn btn--cta" id="book-call"><span>${label}</span>${arrow}</button>
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
  const mailIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`;
  const arrow = `<svg class="rf-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  return `<form class="rf-copy rf-subscribe" method="post" action="/api/subscribe">
		<div class="rf-subscribe__head">
			<span class="rf-subscribe__icon" aria-hidden="true">${mailIcon}</span>
			<div class="rf-subscribe__titles">
				<p class="rf-meta">Newsletter</p>
				<p class="rf-subscribe__title">Field notes from Matt</p>
			</div>
		</div>
		<p class="rf-subscribe__lede">More context and resources, straight from Matt.</p>
		${nameField}<div class="field">
			<label for="${idPrefix}-email">Email</label>
			<input class="input" id="${idPrefix}-email" type="email" name="email" autocomplete="email" required maxlength="254">
		</div>
		${turnstile}
		<button class="btn btn--primary rf-subscribe__submit" type="submit"><span>Subscribe</span>${arrow}</button>
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

export function numberedCardPattern() {
  return `<!-- wp:group {"tagName":"article","className":"rf-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card">
	<!-- wp:paragraph {"className":"rf-card__num"} -->
	<p class="rf-card__num">01</p>
	<!-- /wp:paragraph -->

	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">Email</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>Treat the list as a relationship channel that starts before someone buys.</p>
	<!-- /wp:paragraph -->
</article>
<!-- /wp:group -->`;
}

export function outlineIconCardPattern({
  title = "Email",
  text = "Treat the list as a relationship channel that starts before someone buys.",
  paths = `<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>`,
} = {}) {
  return `<!-- wp:group {"tagName":"article","className":"rf-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card">
	${htmlBlock(`<span class="rf-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${paths}</svg></span>`)}

	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">${title}</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>${text}</p>
	<!-- /wp:paragraph -->
</article>
<!-- /wp:group -->`;
}

export function showcaseCardPattern({
  logoSrc = "/wp-content/themes/rf/assets/case-studies/stellarwp.svg",
  logoAlt = "StellarWP",
  href = "#study",
  title = "StellarWP",
  text = "Product marketing and customer experience across a portfolio of commercial WordPress brands.",
} = {}) {
  return `<!-- wp:group {"tagName":"article","className":"rf-card rf-card--showcase","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card rf-card--showcase">
	${htmlBlock(`<a class="rf-card__stage" href="${href}" tabindex="-1" aria-hidden="true"><img src="${logoSrc}" alt="${logoAlt}" /></a>`)}

	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title"><a href="${href}">${title}</a></h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>${text}</p>
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

export function outlineIconListPattern() {
  return htmlBlock(`<ul class="rf-icon-list">
	<li><span class="rf-icon-list__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></svg></span>6 Fractional CGO clients</li>
	<li><span class="rf-icon-list__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg></span>13 Coaching clients</li>
	<li class="rf-icon-list__item--accent"><span class="rf-icon-list__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg></span><strong>Making 19 total brands supported</strong></li>
	<li><span class="rf-icon-list__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></span>Across 10 countries</li>
</ul>`);
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
  return `<!-- wp:group {"className":"is-style-rf-surface rf-rail-subscribe","layout":{"type":"default"}} -->
<div class="wp-block-group is-style-rf-surface rf-rail-subscribe">
	${htmlBlock(subscribeForm({ idPrefix: "pattern-subscribe", name: true }))}
</div>
<!-- /wp:group -->`;
}

export function authorBioBlocks() {
  const arrow = `<svg class="rf-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  return `<!-- wp:group {"tagName":"section","className":"is-style-rf-surface rf-article-author","layout":{"type":"default"}} -->
<section class="wp-block-group is-style-rf-surface rf-article-author">
	<!-- wp:group {"className":"rf-article-author__main","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-article-author__main">
		<!-- wp:html -->
		<a class="rf-article-author__portrait" href="/about-matt/" tabindex="-1" aria-hidden="true"><img class="rf-article-author__photo" src="/wp-content/themes/rf/assets/articles/matt.jpg" alt="" width="640" height="640" /></a>
		<!-- /wp:html -->

		<!-- wp:group {"className":"rf-article-author__body","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-article-author__body">
			<!-- wp:paragraph {"className":"rf-meta rf-article-author__eyebrow"} -->
			<p class="rf-meta rf-article-author__eyebrow">Written by</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":2,"className":"rf-article-author__name"} -->
			<h2 class="wp-block-heading rf-article-author__name"><a href="/about-matt/">Matt Cromwell</a></h2>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"rf-article-author__role"} -->
			<p class="rf-article-author__role">Founder &amp; Fractional CGO · Co-founder of GiveWP</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph {"className":"rf-article-author__bio"} -->
			<p class="rf-article-author__bio">Matt Cromwell is the founder of Roots &amp; Fruit, a fractional CGO agency helping product companies grow without burning out their teams or their customers. He co-founded, built, and sold GiveWP in an eight-figure acquisition, then led marketing and customer experience at scale across multiple products at StellarWP.</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-article-author__foot","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-article-author__foot">
		<!-- wp:html -->
		<a class="rf-article-author__more" href="/about-matt/"><span>More about Matt</span>${arrow}</a>
		<div class="rf-cluster rf-article-author__socials">
			<a class="rf-icon-link" href="https://x.com/learnwithmattc" aria-label="X"><svg class="rf-icon rf-icon--x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg></a>
			<a class="rf-icon-link" href="https://youtube.com/@wpproducttalk" aria-label="YouTube"><svg class="rf-icon rf-icon--youtube" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
			<a class="rf-icon-link" href="https://linkedin.com/in/mattcromwell" aria-label="LinkedIn"><svg class="rf-icon rf-icon--linkedin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
		</div>
		<!-- /wp:html -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->`;
}

export function authorBioPattern() {
  return authorBioBlocks();
}

export function dialoguePattern({
  label = "Problem Statement",
  themSrc = "/wp-content/themes/rf/assets/portraits/matt.jpg",
  themAlt = "",
  themText = "I changed it in English, and the other language stayed put.",
  usText = "Each language keeps its own order.",
  usSrc = "/wp-content/themes/rf/assets/mark.svg",
  usAlt = "Roots and Fruit",
  more = "The full steps are below.",
} = {}) {
  const face = (src, alt, extra = "") => {
    const classes = ["rf-avatar", extra].filter(Boolean).join(" ");
    return `<!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"${classes}"} -->
<figure class="wp-block-image size-full ${classes}"><img src="${src}" alt="${alt}"/></figure>
<!-- /wp:image -->`;
  };
  const moreBlock = more
    ? `
		<!-- wp:paragraph {"className":"rf-dialogue__more"} -->
		<p class="rf-dialogue__more">${more}</p>
		<!-- /wp:paragraph -->`
    : "";
  return `<!-- wp:group {"tagName":"fieldset","className":"rf-dialogue","layout":{"type":"default"}} -->
<fieldset class="wp-block-group rf-dialogue">
	<!-- wp:rf-static/legend {"className":"rf-dialogue__label","content":${JSON.stringify(label)}} /-->

	<!-- wp:group {"className":"rf-dialogue__thread","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-dialogue__thread">
		<!-- wp:group {"className":"rf-dialogue__turn","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-dialogue__turn">
			${face(themSrc, themAlt)}

			<!-- wp:paragraph {"className":"rf-dialogue__bubble"} -->
			<p class="rf-dialogue__bubble">${themText}</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->

		<!-- wp:group {"className":"rf-dialogue__turn rf-dialogue__turn--us","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-dialogue__turn rf-dialogue__turn--us">
			<!-- wp:paragraph {"className":"rf-dialogue__bubble"} -->
			<p class="rf-dialogue__bubble">${usText}</p>
			<!-- /wp:paragraph -->

			${face(usSrc, usAlt, "rf-avatar--mark")}
		</div>
		<!-- /wp:group -->${moreBlock}
	</div>
	<!-- /wp:group -->
</fieldset>
<!-- /wp:group -->`;
}
