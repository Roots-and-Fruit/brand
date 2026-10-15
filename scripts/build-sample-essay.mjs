/**
 * Turn the Hugo plugin-reviews article into block markup for the sample essay.
 * Images are copied into the theme so the post does not depend on the Hugo server.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hugo = join(root, "..", "..", "..", "..", "Studio", "wiremd-projects", "hugo");
const source = join(hugo, "content", "articles", "create-products-customers-love.md");
const artFrom = join(hugo, "static", "articles");
const artTo = join(root, "wordpress", "rf", "assets", "articles");
const themeArt = "/wp-content/themes/rf/assets/articles";

mkdirSync(artTo, { recursive: true });
for (const file of ["matt.jpg", "one-star.png", "five-star.png"]) {
  copyFileSync(join(artFrom, file), join(artTo, file));
}

const raw = readFileSync(source, "utf8");
const body = raw.replace(/^---[\s\S]*?---\s*/, "");
const blocks = [];

blocks.push(`<!-- wp:group {"className":"rf-takeaways","layout":{"type":"default"}} -->
<div class="wp-block-group rf-takeaways">
	<!-- wp:heading {"level":3,"className":"rf-takeaways__title"} -->
	<h3 class="wp-block-heading rf-takeaways__title">Key Takeaways</h3>
	<!-- /wp:heading -->

	<!-- wp:list {"ordered":true,"className":"rf-keytakeaways"} -->
	<ol class="wp-block-list rf-keytakeaways">
		<!-- wp:list-item -->
		<li>Reliability failures, not feature gaps, drive 42% of the one-star reviews across 77 of WordPress's most popular plugins.</li>
		<!-- /wp:list-item -->

		<!-- wp:list-item -->
		<li>A crippled free tier discovered after setup earns more anger than aggressive upsell nags do, by a wide margin.</li>
		<!-- /wp:list-item -->

		<!-- wp:list-item -->
		<li>Support barely registers as a reason people leave a one-star review, but it's the third biggest reason they leave a five-star one.</li>
		<!-- /wp:list-item -->
	</ol>
	<!-- /wp:list -->
</div>
<!-- /wp:group -->`);

function inner(html, tag) {
  const match = html.match(new RegExp(`^<${tag}\\b[^>]*>([\\s\\S]*)<\\/${tag}>$`));
  if (!match) throw new Error(`Could not read <${tag}> from ${html.slice(0, 80)}`);
  return match[1].trim();
}

function paragraph(html) {
  return `<!-- wp:paragraph -->\n<p>${html}</p>\n<!-- /wp:paragraph -->`;
}

function heading(level, html) {
  return `<!-- wp:heading {"level":${level}} -->\n<h${level} class="wp-block-heading">${html}</h${level}>\n<!-- /wp:heading -->`;
}

function rewrite(html) {
  return html
    .replaceAll('href="/articles/', 'href="https://rootsandfruit.com/articles/')
    .replaceAll('src="/articles/', `src="${themeArt}/`);
}

const pattern = /<(p|h2|h3|ol|figure|article|blockquote)\b[\s\S]*?<\/\1>/g;
for (const chunk of body.match(pattern) ?? []) {
  const html = rewrite(chunk);
  if (html.startsWith("<p")) {
    blocks.push(paragraph(inner(html, "p")));
  } else if (html.startsWith("<h2")) {
    blocks.push(heading(2, inner(html, "h2")));
  } else if (html.startsWith("<h3")) {
    blocks.push(heading(3, inner(html, "h3")));
  } else if (html.startsWith("<ol")) {
    const items = [...inner(html, "ol").matchAll(/<li>([\s\S]*?)<\/li>/g)].map((item) => item[1].trim());
    blocks.push(`<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list">${items.map((item) => `\n<!-- wp:list-item -->\n<li>${item}</li>\n<!-- /wp:list-item -->`).join("")}
</ol>
<!-- /wp:list -->`);
  } else if (html.startsWith("<figure")) {
    const img = html.match(/<img\s+src="([^"]+)"\s+alt="([^"]*)">/);
    if (!img) throw new Error("Figure is missing an image");
    blocks.push(`<!-- wp:image -->
<figure class="wp-block-image"><img src="${img[1]}" alt="${img[2]}" /></figure>
<!-- /wp:image -->`);
  } else if (html.startsWith("<article")) {
    const title = html.match(/<h3 class="rf-card__title">([\s\S]*?)<\/h3>/);
    const copy = html.match(/<p>([\s\S]*?)<\/p>/);
    if (!title || !copy) throw new Error("Card is missing a title or body");
    blocks.push(`<!-- wp:group {"tagName":"article","className":"rf-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card">
	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">${title[1]}</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>${copy[1]}</p>
	<!-- /wp:paragraph -->
</article>
<!-- /wp:group -->`);
  } else if (html.startsWith("<blockquote")) {
    const quote = html.match(/<p class="rf-lede">([\s\S]*?)<\/p>/);
    const cite = html.match(/<cite class="rf-meta">([\s\S]*?)<\/cite>/);
    if (!quote || !cite) throw new Error("Quote is missing words or a source");
    blocks.push(`<!-- wp:quote -->
<blockquote class="wp-block-quote">
	<!-- wp:paragraph -->
	<p>${quote[1]}</p>
	<!-- /wp:paragraph -->
	<cite>${cite[1]}</cite>
</blockquote>
<!-- /wp:quote -->`);
  }
}

const out = join(root, "scripts", "sample-essay-blocks.html");
writeFileSync(out, `${blocks.join("\n\n")}\n`);
console.log(`wrote ${blocks.length} blocks to scripts/sample-essay-blocks.html`);
