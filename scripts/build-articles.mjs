/**
 * Turn the Hugo articles into WordPress block posts.
 * The live list is the six posts on rootsandfruit.com/articles/.
 * Hugo has the same six. Dates are the Hugo publication dates.
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hugo = join(root, "..", "..", "..", "..", "Studio", "wiremd-projects", "hugo");
const artFrom = join(hugo, "static", "articles");
const artTo = join(root, "wordpress", "rf", "assets", "articles");
const themeArt = "/wp-content/themes/rf/assets/articles";
const outDir = join(root, "scripts", "articles");

mkdirSync(artTo, { recursive: true });
mkdirSync(outDir, { recursive: true });
for (const file of readdirSync(artFrom)) {
  copyFileSync(join(artFrom, file), join(artTo, file));
}

function frontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error("Missing front matter");
  const fm = match[1];
  const field = (key) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    if (!line) return "";
    return line[1].trim().replace(/^"|"$/g, "");
  };
  const takeaways = [...fm.matchAll(/^\s+-\s+"(.*)"\s*$/gm)].map((item) =>
    item[1].replace(/\\"/g, '"'),
  );
  return {
    title: field("title"),
    date: field("date"),
    topic: field("topic"),
    summary: field("summary"),
    takeaways,
    body: raw.slice(match[0].length),
  };
}

function rewrite(html) {
  return html
    .replaceAll('src="/articles/', `src="${themeArt}/`)
    .replace(/href="\/(?!\/)/g, 'href="https://rootsandfruit.com/');
}

function inner(html, tag) {
  const match = html.match(new RegExp(`^<${tag}\\b[^>]*>([\\s\\S]*)<\\/${tag}>$`, "i"));
  if (!match) throw new Error(`Could not read <${tag}>`);
  return match[1].trim();
}

function elements(html) {
  const out = [];
  let i = 0;
  while (i < html.length) {
    while (i < html.length && /\s/.test(html[i])) i += 1;
    if (i >= html.length) break;
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html[i] !== "<") {
      const next = html.indexOf("<", i);
      i = next === -1 ? html.length : next;
      continue;
    }
    const tagMatch = html.slice(i).match(/^<([a-zA-Z0-9]+)/);
    if (!tagMatch) throw new Error(html.slice(i, i + 40));
    const tag = tagMatch[1].toLowerCase();
    const gt = html.indexOf(">", i);
    const selfClose = html[gt - 1] === "/" || tag === "img" || tag === "br" || tag === "hr";
    if (selfClose) {
      out.push({ tag, html: html.slice(i, gt + 1) });
      i = gt + 1;
      continue;
    }
    const open = `<${tag}`;
    const close = `</${tag}>`;
    let depth = 1;
    let pos = gt + 1;
    const lower = html.toLowerCase();
    while (depth > 0) {
      const nextOpen = lower.indexOf(open, pos);
      const nextClose = lower.indexOf(close, pos);
      if (nextClose === -1) throw new Error(`Unclosed <${tag}>`);
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        pos = nextOpen + open.length;
      } else {
        depth -= 1;
        pos = nextClose + close.length;
      }
    }
    out.push({ tag, html: html.slice(i, pos) });
    i = pos;
  }
  return out;
}

function paragraph(html) {
  return `<!-- wp:paragraph -->\n<p>${html}</p>\n<!-- /wp:paragraph -->`;
}

function heading(level, html) {
  return `<!-- wp:heading {"level":${level}} -->\n<h${level} class="wp-block-heading">${html}</h${level}>\n<!-- /wp:heading -->`;
}

function list(tag, html) {
  const ordered = tag === "ol";
  const items = [...inner(html, tag).matchAll(/<li>([\s\S]*?)<\/li>/g)].map((item) => item[1].trim());
  return `<!-- wp:list ${ordered ? '{"ordered":true} ' : ""}-->
<${tag} class="wp-block-list">${items.map((item) => `\n<!-- wp:list-item -->\n<li>${item}</li>\n<!-- /wp:list-item -->`).join("")}
</${tag}>
<!-- /wp:list -->`;
}

function image(html) {
  const img = html.match(/<img\b([^>]*)>/);
  if (!img) throw new Error("Figure is missing an image");
  const attr = (name) => {
    const found = img[1].match(new RegExp(`${name}="([^"]*)"`));
    return found ? found[1] : "";
  };
  const width = attr("width");
  const height = attr("height");
  const size = `${width ? ` width="${width}"` : ""}${height ? ` height="${height}"` : ""}`;
  return `<!-- wp:image -->
<figure class="wp-block-image"><img src="${attr("src")}" alt="${attr("alt")}"${size} /></figure>
<!-- /wp:image -->`;
}

function card(html) {
  const num = html.match(/<p class="rf-card__num">([\s\S]*?)<\/p>/);
  const title = html.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/);
  const paras = [...html.matchAll(/<p(?![^>]*rf-card__num)\b[^>]*>([\s\S]*?)<\/p>/g)];
  if (!title) return raw(html);
  const numBlock = num
    ? `<!-- wp:paragraph {"className":"rf-card__num"} -->\n<p class="rf-card__num">${num[1].trim()}</p>\n<!-- /wp:paragraph -->\n\n`
    : "";
  const body = paras.map((item) => paragraph(item[1].trim())).join("\n\n");
  return `<!-- wp:group {"tagName":"article","className":"rf-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card">
${numBlock}	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">${title[1].trim()}</h3>
	<!-- /wp:heading -->

${body}
</article>
<!-- /wp:group -->`;
}

function quoteBlock(html) {
  const text = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/);
  const cite = html.match(/<cite\b[^>]*>([\s\S]*?)<\/cite>/);
  if (!text) return raw(html);
  const citeBlock = cite ? `\n\t<cite>${cite[1].trim()}</cite>` : "";
  return `<!-- wp:quote -->
<blockquote class="wp-block-quote">
	<!-- wp:paragraph {"className":"rf-lede"} -->
	<p class="rf-lede">${text[1].trim()}</p>
	<!-- /wp:paragraph -->${citeBlock}
</blockquote>
<!-- /wp:quote -->`;
}

function raw(html) {
  return `<!-- wp:html -->\n${html}\n<!-- /wp:html -->`;
}

function grid(html) {
  const className = (html.match(/^<div\b[^>]*class="([^"]+)"/) || [, "rf-grid"])[1];
  const kids = elements(inner(html, "div")).map(convert).filter(Boolean).join("\n\n");
  return `<!-- wp:group {"className":"${className}","layout":{"type":"default"}} -->
<div class="wp-block-group ${className}">
${kids}
</div>
<!-- /wp:group -->`;
}

function takeaways(items) {
  const lis = items
    .map(
      (item) => `<!-- wp:list-item -->
<li>${item}</li>
<!-- /wp:list-item -->`,
    )
    .join("\n\n");
  return `<!-- wp:group {"className":"rf-takeaways","layout":{"type":"default"}} -->
<div class="wp-block-group rf-takeaways">
	<!-- wp:heading {"level":3,"className":"rf-takeaways__title"} -->
	<h3 class="wp-block-heading rf-takeaways__title">Key Takeaways</h3>
	<!-- /wp:heading -->

	<!-- wp:list {"ordered":true,"className":"rf-keytakeaways"} -->
	<ol class="wp-block-list rf-keytakeaways">
${lis}
	</ol>
	<!-- /wp:list -->
</div>
<!-- /wp:group -->`;
}

function convert(el) {
  const html = rewrite(el.html);
  if (el.tag === "p") return paragraph(inner(html, "p"));
  if (el.tag === "h2") return heading(2, inner(html, "h2"));
  if (el.tag === "h3") return heading(3, inner(html, "h3"));
  if (el.tag === "ol" || el.tag === "ul") return list(el.tag, html);
  if (el.tag === "figure") return image(html);
  if (el.tag === "article" && /\brf-card\b/.test(html)) return card(html);
  if (el.tag === "blockquote" && !/twitter-tweet/.test(html)) return quoteBlock(html);
  if (el.tag === "div" && /\brf-grid\b/.test(html)) return grid(html);
  return raw(html);
}

const manifest = [];
const contentDir = join(hugo, "content", "articles");
for (const file of readdirSync(contentDir)) {
  if (!file.endsWith(".md") || file.startsWith("_")) continue;
  const meta = frontMatter(readFileSync(join(contentDir, file), "utf8"));
  const blocks = [];
  if (meta.takeaways.length) blocks.push(takeaways(meta.takeaways));
  for (const el of elements(meta.body)) {
    const block = convert(el);
    if (block) blocks.push(block);
  }
  const slug = file.replace(/\.md$/, "");
  writeFileSync(join(outDir, `${slug}.html`), `${blocks.join("\n\n")}\n`);
  manifest.push({
    slug,
    title: meta.title,
    date: meta.date,
    excerpt: meta.summary,
    category: meta.topic,
  });
  console.log(`${slug}: ${blocks.length} blocks, ${meta.date}, ${meta.topic}`);
}

writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`wrote ${manifest.length} articles`);
