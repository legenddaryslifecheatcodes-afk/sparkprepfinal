// Builds the SparkPrep Guides section (/guides/) from content/guides/*.json.
// Run after adding or editing a guide:  npm run guides
// Writes public/guides/index.html (the hub), public/guides/<slug>/index.html (one page per guide)
// and the guide URLs in public/sitemap.xml (between the GUIDES markers). Output is committed, so the
// normal build and deploy publish it with no extra step. Guides dated in the future stay hidden.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from "node:fs";

const SITE = "https://sparkprep.legenddary.com";
const ROOT = new URL("../", import.meta.url);
const TODAY = process.env.GUIDES_TODAY || new Date().toISOString().slice(0, 10);

export const CATEGORIES = [
  { key: "cover", name: "Cover & Spine", blurb: "Spine width, bleed, barcode placement and spine text." },
  { key: "interior", name: "Interior Formatting", blurb: "Page size, margins and gutters, safety areas and fonts." },
  { key: "color", name: "Color & Resolution", blurb: "300 DPI images, CMYK vs RGB and ink limits." },
  { key: "platform", name: "Platform Specifics", blurb: "KDP, IngramSpark, Barnes & Noble Press and Lulu rules, translated." },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const prettyDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

const REQUIRED = ["slug", "category", "title", "h1", "description", "date", "error", "why", "diy", "cta"];

function load() {
  const dir = new URL("content/guides/", ROOT);
  const guides = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
    const g = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
    for (const k of REQUIRED) if (!g[k]) throw new Error(`${f}: missing "${k}"`);
    if (`${g.slug}.json` !== f) throw new Error(`${f}: slug must match the file name`);
    if (!CATEGORIES.some((c) => c.key === g.category)) throw new Error(`${f}: unknown category "${g.category}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(g.date)) throw new Error(`${f}: date must be YYYY-MM-DD`);
    return g;
  });
  return guides.filter((g) => g.date <= TODAY).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
}

function head({ title, description, url, type, extra = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="SparkPrep">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/brand/sparkprep-logo.png">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/tools/tools.css">
${extra}
</head>
<body>
<header class="site">
  <a class="brand" href="/"><img src="/brand/sparkprep-logo.png" alt="SparkPrep logo" width="120" height="34"></a>
  <nav><a href="/guides/">Guides</a><a class="hide-sm" href="/tools/">Free tools</a><a href="/">SparkPrep</a></nav>
</header>
<main>`;
}

const FOOT = `
  <p class="note">SparkPrep is an independent tool and is not affiliated with Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu.</p>
</main>
<footer class="site">© SparkPrep by Legenddary · <a href="/">Home</a><a href="/guides/">Guides</a><a href="/tools/">Free tools</a><a href="/pricing">Pricing</a></footer>
</body>
</html>
`;

function article(g, all) {
  const url = `${SITE}/guides/${g.slug}/`;
  const cat = CATEGORIES.find((c) => c.key === g.category);
  const faq = g.faq || [];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.h1,
        description: g.description,
        datePublished: g.date,
        dateModified: g.updated || g.date,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "SparkPrep", url: `${SITE}/` },
        publisher: { "@type": "Organization", name: "SparkPrep", logo: { "@type": "ImageObject", url: `${SITE}/brand/sparkprep-logo.png` } },
        image: `${SITE}/brand/sparkprep-logo.png`,
        articleSection: cat.name,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "SparkPrep", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 3, name: g.h1, item: url },
        ],
      },
      ...(faq.length
        ? [{ "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })) }]
        : []),
    ],
  };
  const related = all.filter((o) => o.slug !== g.slug && o.category === g.category).slice(0, 4);
  const more = related.length ? related : all.filter((o) => o.slug !== g.slug).slice(0, 4);
  const diy = g.diy.map((d) => `
  <h3>${esc(d.app)}</h3>
  <ol>${d.steps.map((s) => `<li>${s}</li>`).join("")}</ol>`).join("");
  return `${head({ title: g.title, description: g.description, url, type: "article", extra: ld(schema) })}
  <div class="eyebrow"><a href="/guides/" style="color:inherit">Guides</a> · ${esc(cat.name)}</div>
  <h1>${esc(g.h1)}</h1>
  <p class="note">Updated ${prettyDate(g.updated || g.date)} · ${esc(g.platforms || "")}</p>
  <p class="lead">${g.lead || ""}</p>

  <h2>1. The error</h2>
  <blockquote>${esc(g.error)}</blockquote>
  ${g.errorNote ? `<p class="note">${g.errorNote}</p>` : ""}

  <h2>2. Why the printer rejected it</h2>
  ${g.why}

  <h2>3. The do-it-yourself fix</h2>
  ${g.diyIntro || ""}${diy}

  <section class="cta">
    <h2>4. The automated fix</h2>
    <p><strong>${g.cta.text}</strong></p>
    <a class="btn" href="${g.cta.href || "/"}">${esc(g.cta.button)}</a>
  </section>
${faq.length ? `
  <h2>Quick answers</h2>
${faq.map((f) => `  <h3>${esc(f.q)}</h3>\n  <p>${f.a}</p>`).join("\n")}
` : ""}
  <h2>More guides</h2>
  <ul class="links">
${more.map((o) => `    <li><a href="/guides/${o.slug}/">${esc(o.h1)}</a></li>`).join("\n")}
    <li><a href="/guides/">All guides</a></li>
  </ul>
${FOOT}`;
}

function hub(all) {
  const url = `${SITE}/guides/`;
  const title = "Print Book Rejection Fixes: KDP, IngramSpark & Lulu Guides | SparkPrep";
  const description = "Plain-English guides to every common print book rejection: the error, why it happens, how to fix it yourself in Word, Acrobat or InDesign, and the fast fix with SparkPrep.";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: "SparkPrep Guides", url, description },
      { "@type": "ItemList", itemListElement: all.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/guides/${g.slug}/`, name: g.h1 })) },
    ],
  };
  const sections = CATEGORIES.map((c) => {
    const list = all.filter((g) => g.category === c.key);
    if (!list.length) return "";
    return `
  <h2 id="${c.key}">${esc(c.name)}</h2>
  <p class="note">${esc(c.blurb)}</p>
${list.map((g) => `  <div class="card"><h3 style="margin-top:0"><a href="/guides/${g.slug}/">${esc(g.h1)}</a></h3>
    <p>${esc(g.description)}</p></div>`).join("\n")}`;
  }).join("\n");
  return `${head({ title, description, url, type: "website", extra: ld(schema) })}
  <div class="eyebrow">SparkPrep Guides</div>
  <h1>Fix Your Print Book Rejection</h1>
  <p class="lead">Got a rejection from KDP, IngramSpark, Barnes &amp; Noble Press or Lulu? Find your error below. Every guide shows the error, why it happened, how to fix it yourself, and the fast fix with SparkPrep.</p>
  <p>${CATEGORIES.filter((c) => all.some((g) => g.category === c.key)).map((c) => `<a href="#${c.key}">${esc(c.name)}</a>`).join(" · ")}</p>
${sections}

  <section class="cta">
    <h2>Rather not fix it by hand?</h2>
    <p>Upload your cover and interior. SparkPrep checks them against your printer's rules, explains every problem in plain English and fixes it for you.</p>
    <a class="btn" href="/">Check my book files</a>
  </section>
${FOOT}`;
}

const guides = load();
const out = new URL("public/guides/", ROOT);
mkdirSync(out, { recursive: true });
// Remove pages for guides that are no longer published (renamed, deleted, or dated in the future).
const live = new Set(guides.map((g) => g.slug));
for (const d of readdirSync(out, { withFileTypes: true })) {
  if (d.isDirectory() && !live.has(d.name)) rmSync(new URL(`${d.name}/`, out), { recursive: true });
}
writeFileSync(new URL("index.html", out), hub(guides));
for (const g of guides) {
  mkdirSync(new URL(`${g.slug}/`, out), { recursive: true });
  writeFileSync(new URL(`${g.slug}/index.html`, out), article(g, guides));
}

const sitemapUrl = new URL("public/sitemap.xml", ROOT);
let sitemap = readFileSync(sitemapUrl, "utf8");
const entry = (loc, lastmod, pri) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${pri}</priority>\n  </url>\n`;
const block = "  <!-- GUIDES START (written by scripts/build-guides.mjs) -->\n"
  + entry(`${SITE}/guides/`, guides[0]?.date || TODAY, "0.8")
  + guides.map((g) => entry(`${SITE}/guides/${g.slug}/`, g.updated || g.date, "0.7")).join("")
  + "  <!-- GUIDES END -->\n";
if (sitemap.includes("<!-- GUIDES START")) sitemap = sitemap.replace(/  <!-- GUIDES START[\s\S]*?<!-- GUIDES END -->\n/, block);
else sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
writeFileSync(sitemapUrl, sitemap);
console.log(`guides: ${guides.length} published (as of ${TODAY})`);
