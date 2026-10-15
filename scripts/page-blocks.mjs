/**
 * Marketing page content. Heroes, offers, quotes, and button rows come from
 * block-snippets.mjs. The sentences live here. Compile writes the HTML files.
 */

import { buttonCluster, offer, pageHero, quote } from "./block-snippets.mjs";

const theme = "/wp-content/themes/rf/assets";

function paragraphs(lines) {
  return lines
    .map(
      (line) => `<!-- wp:paragraph -->
<p>${line}</p>
<!-- /wp:paragraph -->`,
    )
    .join("\n\n");
}

function copyPanel({ title, lede, button }) {
  return `<!-- wp:group {"className":"surface surface--panel rf-copy","layout":{"type":"default"}} -->
<div class="wp-block-group surface surface--panel rf-copy">
	<!-- wp:heading {"className":"rf-display rf-display--md"} -->
	<h2 class="wp-block-heading rf-display rf-display--md">${title}</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"className":"rf-lede"} -->
	<p class="rf-lede">${lede}</p>
	<!-- /wp:paragraph -->

${buttonCluster([button])}
</div>
<!-- /wp:group -->`;
}

function services() {
  const hero = pageHero({
    postTitle: true,
    subtitle: "Services designed to fit you and your team.",
    lede: "Solo Coaching, Team Coaching, or Fractional CGO. Time-boxed, outcome-driven, and built so we both know what we’re signing up for.",
    buttons: [
      { classes: "btn btn--cta", href: "#book", label: "Book a discovery call" },
      { classes: "btn btn--tertiary", href: "#packages", label: "See the packages" },
    ],
  });
  const intro = `<!-- wp:group {"anchor":"packages","className":"rf-copy","layout":{"type":"default"}} -->
<div class="wp-block-group rf-copy" id="packages">
	<!-- wp:paragraph {"className":"rf-meta"} -->
	<p class="rf-meta">Choose your path</p>
	<!-- /wp:paragraph -->

	<!-- wp:heading -->
	<h2 class="wp-block-heading">Three ways to work together</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>Every option starts the same way: a discovery call. We’ll confirm fit, scope, and which package makes sense for where you are right now.</p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->`;
  const offers = [
    offer({
      eyebrow: "For founders building alone",
      title: "Solo Coaching",
      lede: "Intense, focused 1:1 sessions for solopreneurs who need a strategic sounding board and real accountability, not another course.",
      items: [
        "Weekly sessions for six weeks",
        "Async support between calls",
        "Plan, execute, and set up systems you can scale later",
      ],
      amount: "€1,200",
      cadence: "Flat rate · weekly for 6 weeks",
      href: "#book",
      portrait: `${theme}/services/danny-van-kooten.jpg`,
      quote: "Did a 6-week block working with Matt to focus on growing Koko Analytics. Learned and already applied a lot, wish I had these sessions 14 years earlier. 10/10 would recommend.",
      by: '<span class="rf-offer__name">Danny van Kooten</span> Founder at ibericode, creator of Koko Analytics ● <a class="link-text" href="https://x.com/dannyvankooten/status/2094425204051091549">Read on X</a>',
    }),
    offer({
      modifier: "rf-offer--panel",
      eyebrow: "For small teams",
      title: "Team Coaching",
      lede: "Strategy with your team twice a month, Slack in between, plus one real deliverable each cycle. Built for progress between the meetings, not just good conversation.",
      items: [
        "Two working sessions per month with whoever you need on the call",
        "Slack access throughout",
        "One shippable deliverable between sessions",
        "Monthly goals tied to a bigger outcome",
      ],
      amount: "€2,000",
      cadence: "Twice a month · 3-month intervals",
      href: "#book",
      portrait: `${theme}/services/serg-sokhatskyi.jpg`,
      quote: "Just wrapped up a sprint with Matt. Got a lot of valuable insights, challenged some of our assumptions, and came away with a much clearer vision for WoodMart’s future and where we should focus next.",
      by: '<span class="rf-offer__name">Serg Sokhatskyi</span> Founder at XTemos, creators of WoodMart ● <a class="link-text" href="https://x.com/serg_sokhatskyi/status/2092583536884666496">Read on X</a>',
    }),
    offer({
      modifier: "rf-offer--dark",
      eyebrow: "For teams ready to execute",
      title: "Fractional CGO",
      lede: "Hands-on fractional growth leadership. One growth lever at a time, with clear accountability across product, CX, and marketing. Engagements run 1, 3, or 6 months (€5,000 flat, €4,600/mo, or €4,200/mo).",
      items: [
        "Embedded with your team, not a side consultant",
        "Time-boxed and outcome-driven",
        "Maximum three concurrent clients",
      ],
      amount: "From €4,200",
      cadence: "1, 3, or 6 month engagements",
      href: "#book",
      portrait: `${theme}/services/andrew-wilder.jpg`,
      quote: "Matt joined our team earlier this year, and he fit right in. I love that he brings a different perspective to our marketing efforts, leveraging his many years of experience with products and customer service. It really helps that he has great relationships with so many people in the WordPress space, and he’s using that to help grow our relationships with other collaborators. Five stars.",
      by: '<span class="rf-offer__name">Andrew Wilder</span> Founder, NerdPress',
    }),
  ];
  return [hero, intro, ...offers].join("\n\n");
}

function caseStudy({ mark, width, height, title, body, quoteText, name, role }) {
  return `<!-- wp:group {"tagName":"section","className":"case-study rf-stack rf-stack--md","layout":{"type":"default"}} -->
<section class="wp-block-group case-study rf-stack rf-stack--md">
	<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-copy">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">Case study</p>
		<!-- /wp:paragraph -->

		<!-- wp:group {"className":"case-study__title","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
		<div class="wp-block-group case-study__title">
			<!-- wp:html -->
			<img class="case-study__mark" src="${mark}" alt="" width="${width}" height="${height}" />
			<!-- /wp:html -->

			<!-- wp:heading {"className":"rf-display rf-display--md"} -->
			<h2 class="wp-block-heading rf-display rf-display--md">${title}</h2>
			<!-- /wp:heading -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-split case-study__split","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-split case-study__split">
		<!-- wp:group {"className":"rf-prose","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-prose">
${paragraphs(body)}
		</div>
		<!-- /wp:group -->

${quote({ text: quoteText, name, role })}
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->`;
}

function caseStudies() {
  const hero = pageHero({
    title: "Case studies",
    lede: "These case studies move past theory. They show how a specific choice simplified the work and unlocked growth. The details are practical: what changed, what I pushed for, and what the team did next.",
    buttons: [
      { classes: "btn btn--cta", href: "#book", label: "Book a discovery call" },
      { classes: "btn btn--tertiary", href: "#studies", label: "See the studies" },
    ],
  });
  const studies = [
    caseStudy({
      mark: `${theme}/case-studies/the-events-calendar.svg`,
      width: 32,
      height: 39,
      title: "The Events Calendar: raising prices without eroding trust",
      body: [
        "The Events Calendar needed new pricing for its PRO version. I was part of the cross-functional team that evaluated how bundling a popular add-on into PRO and raising the price would affect revenue, customers, and support. The change improved the product, but it also eliminated a standalone revenue stream and forced a harder decision about existing customers and renewals.",
        "The real risk was less about the price increase and more about how customers would react. I pushed for two things: pricing PRO at $149 based on its real value (a 50% increase), and communicating the change early and clearly without apologizing. Customers got six weeks’ notice. We knew that would increase cancellations, and that it would cut post-renewal refunds.",
        "The result was limited backlash. About 1.5% of customers replied with critical feedback or frustration. Renewal revenue went up 150%, and new sales revenue went up 135%. Refunds dropped, support pressure eased, and the price finally matched the product’s long-term value.",
      ],
      quoteText: "This pricing decision was a team effort, but Matt played a key role in helping us see the second-order effects clearly. He pushed us to price PRO based on its real value and to communicate the change directly and confidently. That combination reduced refunds, eased support pressure, and ultimately helped both the business and our customers.",
      name: "Zach Tirrell",
      role: "General Manager, StellarWP",
    }),
    caseStudy({
      mark: `${theme}/case-studies/stellarwp.svg`,
      width: 40,
      height: 34,
      title: "StellarWP: an AI-first support layer that kept customer trust",
      body: [
        "We wanted to introduce AI as a first-touch support layer, but only if it actually helped customers. Instead of launching it publicly, we started by using our docs-powered chatbot internally and stress-testing it against real support questions.",
        "Once the chatbot consistently resolved issues accurately, we rolled it out on the public documentation and watched it closely. After it reached roughly 80% resolution from chat, we expanded it into the plugins so the first touch could be AI.",
        "The real shift wasn’t the tool. It was operational. Support work moved upstream, toward documentation quality and chat monitoring, with a feedback loop to improve both. AI worked because the system around it was built to support it.",
      ],
      quoteText: "I was dead-set against AI support until Matt showed me how his process elevated the role of the human agent and got the customer to that expert help immediately.",
      name: "Ben Meredith",
      role: "Director of Support, StellarWP",
    }),
    caseStudy({
      mark: `${theme}/case-studies/give.png`,
      width: 36,
      height: 36,
      title: "GiveWP: respect intent instead of optimizing around it",
      body: [
        "Email open and click rates were declining, even as the list kept growing. What looked like an email performance problem turned into a full funnel audit, from the signup promise to what people actually received.",
        "The audit showed the real problem: expectations weren’t being met. We were making content promises in different ways, and then only sending fundraising tips. Rather than optimizing individual emails, we added a second cadence. Mondays were product updates. Wednesdays were fundraising tips.",
        "Engagement improved. Opens and clicks went up, and new subscribers stayed longer. That came from lining the content up with what people had signed up for, and then delivering it.",
      ],
      quoteText: "Stepping back to audit the entire funnel made the difference. Once expectations were clear and each stream had a purpose, engagement followed naturally.",
      name: "Taylor Waldon",
      role: "Marketing Lead, GiveWP",
    }),
  ];
  const stack = `<!-- wp:group {"anchor":"studies","className":"rf-stack rf-stack--lg","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stack rf-stack--lg" id="studies">
${studies.join("\n\n")}
</div>
<!-- /wp:group -->`;
  return [hero, stack].join("\n\n");
}

function surfaceCard({ classes = "surface", meta, title, body }) {
  return `<!-- wp:group {"tagName":"article","className":"${classes}","layout":{"type":"default"}} -->
<article class="wp-block-group ${classes}">
	<!-- wp:paragraph {"className":"rf-meta"} -->
	<p class="rf-meta">${meta}</p>
	<!-- /wp:paragraph -->

	<!-- wp:heading {"level":3} -->
	<h3 class="wp-block-heading">${title}</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>${body}</p>
	<!-- /wp:paragraph -->
</article>
<!-- /wp:group -->`;
}

function home() {
  const connect = buttonCluster([
    { classes: "btn btn--primary", href: "#book", label: "Let’s Connect" },
  ]);
  const cases = buttonCluster([
    { classes: "btn btn--tertiary", href: "/case-studies/", label: "See Case Studies" },
  ]);
  const work = [
    surfaceCard({
      meta: "01 / Listen",
      title: "Customer insights are your guide",
      body: "Embed qualitative feedback into product and leadership decisions — without forcing bad metrics on top.",
    }),
    surfaceCard({
      classes: "surface surface--tint",
      meta: "02 / Align",
      title: "Shared priorities across departments",
      body: "Product, CX, and marketing pulling on the same rope. Clear ownership, fewer crossed wires.",
    }),
    surfaceCard({
      classes: "surface surface--dark",
      meta: "03 / Iterate",
      title: "Operating foundations",
      body: "Now build the system that keeps growth happening when the founder steps away from the wheel.",
    }),
  ].join("\n\n");
  const track = [
    surfaceCard({ meta: "01", title: "GiveWP", body: "Co-founded, built, sold in an eight-figure acquisition." }),
    surfaceCard({ meta: "02", title: "StellarWP", body: "Led marketing &amp; CX at scale across multiple products." }),
    surfaceCard({ meta: "03", title: "Roots &amp; Fruit", body: "Now helping the next generation of product founders grow on purpose." }),
  ].join("\n\n");
  return `<!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|space-8","bottom":"var:preset|spacing|space-8"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--space-8);padding-bottom:var(--wp--preset--spacing--space-8)">
	<!-- wp:group {"className":"rf-split","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-split">
		<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-copy">
			<!-- wp:paragraph {"className":"pill pill--orange"} -->
			<p class="pill pill--orange">Fractional CGO for product companies</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":1,"className":"rf-display rf-display--lg"} -->
			<h1 class="wp-block-heading rf-display rf-display--lg">Sustainable revenue growth through earned experience and results</h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"rf-lede"} -->
			<p class="rf-lede"><strong>Roots &amp; Fruit</strong> works with product founders and teams to fix the systems underneath the work. I help turn customer feedback into clear product decisions, align teams around shared priorities, and build operating foundations that support steady growth without constant pressure.</p>
			<!-- /wp:paragraph -->

${connect}
		</div>
		<!-- /wp:group -->

		<!-- wp:html -->
		<figure class="rf-figure">
			<img class="rf-frame rf-frame--fit" src="${theme}/home/matt.jpg" alt="Matt Cromwell speaking on stage and pointing toward a slide." width="517" height="720" />
			<figcaption class="rf-caption">
				<p class="rf-caption__name">Matt Cromwell</p>
				<p class="rf-caption__role">Founder • Fractional CGO. Co-founded GiveWP, scaled CX &amp; marketing at StellarWP</p>
			</figcaption>
		</figure>
		<!-- /wp:html -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"align":"full","className":"home-brands","backgroundColor":"surface-dark","style":{"spacing":{"padding":{"top":"var:preset|spacing|space-6","bottom":"var:preset|spacing|space-6"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull home-brands has-surface-dark-background-color has-background" style="padding-top:var(--wp--preset--spacing--space-6);padding-bottom:var(--wp--preset--spacing--space-6)">
	<!-- wp:group {"className":"rf-stack rf-stack--md","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-stack rf-stack--md">
		<!-- wp:heading {"textAlign":"center","className":"rf-display rf-display--md"} -->
		<h2 class="wp-block-heading has-text-align-center rf-display rf-display--md">Some of the brands I’ve helped</h2>
		<!-- /wp:heading -->

		<!-- wp:html -->
		<img src="${theme}/home/brands.svg" width="7322" height="1902" alt="NerdPress, LearnDash, FooPlugins, Castos, Give, Siren, Conversion Bridge, Freemius, Barn2, KramaKit, Kadence WP, and The Events Calendar." />
		<!-- /wp:html -->

		<!-- wp:paragraph {"align":"center"} -->
		<p class="has-text-align-center"><em>… and counting!</em></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"rf-stack rf-stack--md","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stack rf-stack--md">
	<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-copy">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">The work</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"className":"rf-display rf-display--md"} -->
		<h2 class="wp-block-heading rf-display rf-display--md">Hands-on, collaborative, deliberate on purpose.</h2>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p>Three things that shape every engagement.</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-grid rf-grid--three","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-grid rf-grid--three">
${work}
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"rf-stack rf-stack--md","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stack rf-stack--md">
	<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-copy">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">Track record</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"className":"rf-display rf-display--md"} -->
		<h2 class="wp-block-heading rf-display rf-display--md">Success through trial and error is earned experience</h2>
		<!-- /wp:heading -->

${cases}
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-grid rf-grid--three","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-grid rf-grid--three">
${track}
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->`;
}

function aboutStop({ src, width, height, meta, body }) {
  return `<!-- wp:group {"tagName":"article","className":"surface about-stop","layout":{"type":"default"}} -->
<article class="wp-block-group surface about-stop">
	<!-- wp:html -->
	<img class="about-stop__mark" src="${src}" alt="" width="${width}" height="${height}" />
	<!-- /wp:html -->

	<!-- wp:group {"layout":{"type":"default"}} -->
	<div class="wp-block-group">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">${meta}</p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph -->
		<p>${body}</p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</article>
<!-- /wp:group -->`;
}

function about() {
  const quotes = [
    quote({
      text: "Matt is one of the most well-rounded product leaders I’ve worked with. Product instincts, customer success expertise, and real marketing chops.",
      name: "Devin Walker",
      role: "Co-founder of GiveWP, now Creative Director at Jetpack",
      avatar: { src: `${theme}/portraits/devin-walker.png`, width: 300, height: 300 },
    }),
    quote({
      text: "What truly sets Matt apart is his passion for people and process. He builds teams that love their work and systems that make it easier. He’s equally strong in strategic discussions and day-to-day execution, earning respect everywhere he goes.",
      name: "Joe Oesterling",
      role: "CTO at Falfurrias Management Partners",
      avatar: { src: `${theme}/portraits/joe-oesterling.jpg`, width: 496, height: 496 },
    }),
  ].join("\n\n");
  return `<!-- wp:group {"align":"full","className":"page-hero page-hero--about","backgroundColor":"panel","style":{"border":{"bottom":{"color":"var:custom|panel-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull page-hero page-hero--about has-panel-background-color has-background" style="border-bottom-color:var(--wp--custom--panel-deep);border-bottom-style:solid;border-bottom-width:4px;padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
	<!-- wp:group {"className":"rf-split about-hero__split","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-split about-hero__split">
		<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
		<div class="wp-block-group rf-copy">
			<!-- wp:heading {"level":1,"className":"rf-display rf-display--lg"} -->
			<h1 class="wp-block-heading rf-display rf-display--lg">Hi, I’m Matt.</h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"rf-lede"} -->
			<p class="rf-lede">I help WordPress product founders turn customer insight into sustainable revenue without burning out their team or their customers.</p>
			<!-- /wp:paragraph -->

			<!-- wp:paragraph -->
			<p>Co-founder of GiveWP. Former marketing and CX leadership at StellarWP.</p>
			<!-- /wp:paragraph -->

			<!-- wp:html -->
			<p class="rf-cluster"><a class="rf-icon-link" href="https://mattcromwell.com/" aria-label="Matt Cromwell"><svg class="rf-icon rf-icon--globe" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"/></svg></a><a class="rf-icon-link" href="https://de.linkedin.com/in/mattcromwell" aria-label="LinkedIn"><svg class="rf-icon rf-icon--linkedin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a><a class="rf-icon-link" href="https://profiles.wordpress.org/webdevmattcrom/" aria-label="WordPress.org"><svg class="rf-icon rf-icon--wordpress" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0"/></svg></a><a class="rf-icon-link" href="https://x.com/learnwithmattc" aria-label="X"><svg class="rf-icon rf-icon--x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg></a><a class="rf-icon-link" href="https://wpproducttalk.com/" aria-label="WP Product Talk"><svg class="rf-icon rf-icon--microphone" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 3V5M1 2V6M19 3V5M23 2V6"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 10V11C5 14.866 8.13401 18 12 18V18V18C15.866 18 19 14.866 19 11V10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 18V22M12 22H9M12 22H15"/></svg></a></p>
			<!-- /wp:html -->
		</div>
		<!-- /wp:group -->

		<!-- wp:html -->
		<figure class="rf-figure">
			<img class="rf-frame rf-frame--square" src="${theme}/portraits/matt.jpg" alt="Portrait of Matt Cromwell" width="640" height="640" />
		</figure>
		<!-- /wp:html -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"rf-split about-story","layout":{"type":"default"}} -->
<div class="wp-block-group rf-split about-story">
	<!-- wp:group {"className":"rf-prose","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-prose">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">The short version</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"className":"rf-display rf-display--md"} -->
		<h2 class="wp-block-heading rf-display rf-display--md">I learned this by doing the job</h2>
		<!-- /wp:heading -->

${paragraphs([
  "If you’re building a WordPress product you’re proud of, but growth still feels stuck, you’re not alone. That’s the gap I built Roots &amp; Fruit to fill.",
  "I’m a fractional CGO for product companies that want growth to feel rooted and intentional. I don’t sell more noise or a cookie-cutter playbook. I embed with your team, learn how the product actually gets built and supported, and help you make the decisions that move the needle.",
  "I co-founded GiveWP and helped grow it through an eight-figure acquisition. After the sale, I led marketing and customer experience at scale across StellarWP brands like LearnDash, Kadence, and The Events Calendar. For more than a decade, the work has been the same job: connect what customers feel with how teams build, and turn that into results you can measure.",
  '<a class="link-text" href="/case-studies/">Read the case studies</a>',
])}
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"about-path","layout":{"type":"default"}} -->
	<div class="wp-block-group about-path">
${aboutStop({ src: `${theme}/case-studies/give.png`, width: 64, height: 64, meta: "GiveWP", body: "I co-founded it and stayed through an eight-figure sale." })}

${aboutStop({ src: `${theme}/case-studies/stellarwp.svg`, width: 120, height: 32, meta: "StellarWP", body: "I led marketing and customer experience across the brands." })}

${aboutStop({ src: `${theme}/logos/rf-icon-light.svg`, width: 64, height: 64, meta: "Roots &amp; Fruit", body: "I take three fractional clients at a time, because the work is hands-on." })}
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"rf-stack rf-stack--md","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stack rf-stack--md">
	<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-copy">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">Who I work with</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"className":"rf-display rf-display--md"} -->
		<h2 class="wp-block-heading rf-display rf-display--md">A strong fit, and a clear no</h2>
		<!-- /wp:heading -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-grid rf-grid--two","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-grid rf-grid--two">
${surfaceCard({ meta: "A strong fit", title: "A solid product, and a gap between the teams", body: "Product, CX, and marketing are each doing real work, and growth still doesn’t add up. This is a strong fit if you sell WordPress products into a market that now competes with well-funded SaaS and rising customer expectations. Solo founders fit here too, when you need a sounding board and someone who can also do the work." })}

${surfaceCard({ classes: "surface surface--dark", meta: "Probably not a fit", title: "Ads, social, and quick wins", body: "If you want someone to run paid ads, manage social, or chase quick wins without owning the systems underneath, I’m the wrong person." })}
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"className":"rf-stack rf-stack--md","layout":{"type":"default"}} -->
<div class="wp-block-group rf-stack rf-stack--md">
	<!-- wp:group {"className":"rf-copy","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-copy">
		<!-- wp:paragraph {"className":"rf-meta"} -->
		<p class="rf-meta">What others say</p>
		<!-- /wp:paragraph -->

		<!-- wp:heading {"className":"rf-display rf-display--md"} -->
		<h2 class="wp-block-heading rf-display rf-display--md">From people who have done the work with me</h2>
		<!-- /wp:heading -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"className":"rf-grid rf-grid--two","layout":{"type":"default"}} -->
	<div class="wp-block-group rf-grid rf-grid--two">
${quotes}
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

${copyPanel({
  title: "If you want to talk",
  lede: 'I also co-host <a class="link-text" href="https://wpproducttalk.com">WP Product Talk</a>, where product founders share what actually works and what doesn’t. I’m based in Braunfels, Germany, and I work with teams globally.',
  button: { classes: "btn btn--primary", href: "#book", label: "Let’s connect" },
})}`;
}

export function marketingPages() {
  return {
    "scripts/home-blocks.html": home(),
    "scripts/services-blocks.html": services(),
    "scripts/case-studies-blocks.html": caseStudies(),
    "scripts/about-blocks.html": about(),
  };
}
