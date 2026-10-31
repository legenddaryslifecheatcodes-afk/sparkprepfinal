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
  { key: "compare", name: "Compare Your Options", blurb: "SparkPrep vs freelancers, Reedsy and formatting software: real prices and real time." },
];

// Freelancer prices, from Reedsy's own published data (checked 2026-10-28). Update the date when re-checked.
const REEDSY = {
  cover: 930, // median professional cover design: reedsy.com/blog/guide/how-to-self-publish-a-book/cost-to-self-publish/
  interior: 800, // average professional interior design / typesetting, same page
  source: "https://reedsy.com/blog/guide/how-to-self-publish-a-book/cost-to-self-publish/",
};
// What a guide's problem would cost to hand to a freelancer: the cover, the inside pages, or both.
const JOB = { cover: "cover", interior: "interior", color: "both", platform: "both", compare: "both" };

function costBox(g) {
  const job = g.job || JOB[g.category];
  const pro = job === "cover" ? REEDSY.cover : job === "interior" ? REEDSY.interior : REEDSY.cover + REEDSY.interior;
  const what = job === "cover" ? "a professional cover designer" : job === "interior" ? "a professional interior formatter"
    : "a professional cover designer and interior formatter";
  const proLine = job === "both"
    ? `About <strong>$${REEDSY.cover}</strong> for the cover plus about <strong>$${REEDSY.interior}</strong> for the inside pages: around <strong>$${pro.toLocaleString("en-US")}</strong>`
    : `About <strong>$${pro}</strong>`;
  // The SparkPrep price is read live from /api/pricing (the price the checkout charges), never written into the page.
  return `
  <h2>${g.category === "compare" ? "The bottom line: price and time" : "What it costs to get this fixed"}</h2>
  <div class="table-wrap"><table>
    <tr><th></th><th>Hire ${what}</th><th>SparkPrep</th></tr>
    <tr><td>Price</td><td>${proLine}</td><td><strong class="sp-book-price">One price per book</strong> for the cover, the inside pages, or both</td></tr>
    <tr><td>Time</td><td>Book a freelancer, wait for their schedule, then go back and forth on changes</td><td>Upload and get your fixed, print-ready files <strong>in minutes</strong></td></tr>
    <tr><td>Printer check</td><td>Depends on the freelancer</td><td>Checked against your printer's own rules, every time</td></tr>
  </table></div>
  <p class="note">Freelancer prices are Reedsy's own published figures (<a href="${REEDSY.source}" rel="nofollow noopener">source</a>). A great designer is worth it for original artwork. If you just need your files right for the printer, you don't need to pay designer prices.<span class="sp-times" data-pro="${pro}"></span></p>`;
}

const PRICE_SCRIPT = `<script>
(function(){fetch("https://sparkprep-v9fp.onrender.com/api/pricing").then(function(r){return r.json()}).then(function(p){
var c=p&&p.book&&p.book.price_cents;if(!c)return;var d="$"+(c/100).toFixed(2);
document.querySelectorAll(".sp-book-price").forEach(function(e){e.textContent=d+" per book";});
document.querySelectorAll(".sp-times").forEach(function(e){var x=Math.floor(Number(e.dataset.pro)/(c/100));if(x>=2)e.textContent=" That's about "+x+" times what SparkPrep costs.";});
}).catch(function(){});})();
</script>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const prettyDate = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

const REQUIRED = ["slug", "category", "title", "h1", "description", "date", "cta"];

function load() {
  const dir = new URL("content/guides/", ROOT);
  const guides = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
    const g = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
    for (const k of REQUIRED) if (!g[k]) throw new Error(`${f}: missing "${k}"`);
    if (`${g.slug}.json` !== f) throw new Error(`${f}: slug must match the file name`);
    if (!CATEGORIES.some((c) => c.key === g.category)) throw new Error(`${f}: unknown category "${g.category}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(g.date)) throw new Error(`${f}: date must be YYYY-MM-DD`);
    if (!g.body) for (const k of g.manual ? ["error", "why"] : ["error", "why", "diy"]) if (!g[k]) throw new Error(`${f}: missing "${k}" (or give a "body")`);
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

// Trey's rejection-guide format (2026-10-28): the error + a quick-fix line up top, "Why did your file get
// rejected?", "How to fix it manually (the hard way)" in numbered steps, then "the SparkPrep way" with the
// same CTA on every guide. Claims kept to what SparkPrep really does (no "guaranteed to pass").
// The error's own words, short enough to use in headings, so a guide's H2s match what authors type into Google
// (2026-10-31). Long errors give "errorShort"; guides about a question rather than an error message get none.
function errorHeading(g) {
  if (g.errorShort) return g.errorShort;
  if (!g.error || g.error.length > 72 || /^"/.test(g.error) || /^Not (an|one) error/.test(g.errorNote || "")) return null;
  return g.error;
}
const q = (s) => `“${esc(s)}”`;

// Other wordings of the same error that authors search for ("aka" in the guide JSON), shown as a short list.
function akaList(g) {
  if (!g.aka || !g.aka.length) return "";
  return `
  <h3>Other ways people search for this error</h3>
  <ul>${g.aka.map((a) => `<li>${q(a)}</li>`).join("")}</ul>`;
}

// The soft bridge in the middle of a guide: fix it by hand, or let SparkPrep do it.
function bridge(g) {
  return `
  <div class="card"><p style="margin:0">You can fix this by hand with the steps above. Or drop your file into SparkPrep and let it find the problem and fix it for you, in minutes. <a href="${g.cta.href || "/"}">Try it on your file</a>.</p></div>`;
}

function treyFormat(g, diy) {
  const eh = errorHeading(g);
  return `${eh ? `  <h2>The error: ${q(eh)}</h2>
` : ""}  <blockquote>${esc(g.error)}</blockquote>
  ${g.errorNote ? `<p class="note">${g.errorNote}</p>` : ""}${akaList(g)}
  <div class="card"><p style="margin:0"><strong>Quick fix:</strong> ${g.quickfix || "SparkPrep scans your cover and interior against the exact platform rules, pinpoints the issue, and fixes it for you with one click."}</p>
    <p style="margin:10px 0 0">👉 <a href="${g.cta.href || "/"}">Fix your file instantly at sparkprep.legenddary.com</a></p></div>

  <h2>${eh ? `Why you get ${q(eh)}` : "Why did your file get rejected?"}</h2>
  ${g.why}

  <h2>${eh ? `How to fix ${q(eh)} manually (the hard way)` : "How to fix it manually (the hard way)"}</h2>
  <p>If you want to try adjusting the files yourself, here are the steps you need to follow:</p>
  <ol>${g.manual.map((s) => `<li>${s}</li>`).join("")}</ol>
${diy ? `  <h3 style="margin-top:28px">Step by step in your app</h3>${diy.replace(/<h3>/g, "<h4>").replace(/<\/h3>/g, "</h4>")}` : ""}
${bridge(g)}

  <section class="cta">
    <h2>How to fix it instantly (the SparkPrep way)</h2>
    <p>If you don't have expensive design software, or you just want to get your book published without the headache, let SparkPrep handle it.</p>
    <p>SparkPrep was built by a self-published author whose own book was rejected 18 times. It checks your files against the exact print rules Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu publish.</p>
    <p>When you upload your file to SparkPrep:</p>
    <ul>
      <li>We automatically scan for page size, bleed, spine width, safety margins, ink coverage and embedded fonts.</li>
      <li>We explain any hidden errors in plain English.</li>
      <li>We fix what can be fixed automatically, tell you exactly what's left, and export a print-ready PDF/X-1a, checked again before you download it.</li>
    </ul>
    ${g.spNote ? `<p>${g.spNote}</p>` : ""}
    <p><strong>Stop fighting the bots. Drop your file into SparkPrep today and get back to marketing your book!</strong></p>
    <a class="btn" href="${g.cta.href || "/"}">${esc(g.cta.button)}</a>
  </section>
${costBox(g)}`;
}

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
  const diy = (g.diy || []).map((d) => `
  <h3>${esc(d.app)}</h3>
  <ol>${d.steps.map((s) => `<li>${s}</li>`).join("")}</ol>`).join("");
  return `${head({ title: g.title, description: g.description, url, type: "article", extra: ld(schema) })}
  <div class="eyebrow"><a href="/guides/" style="color:inherit">Guides</a> · ${esc(cat.name)}</div>
  <h1>${esc(g.h1)}</h1>
  <p class="note">Updated ${prettyDate(g.updated || g.date)} · ${esc(g.platforms || "")}</p>
  <p class="lead">${g.lead || ""}</p>

${g.manual ? treyFormat(g, diy) : `${g.body ? g.body : `  <h2>1. The error${errorHeading(g) ? `: ${q(errorHeading(g))}` : ""}</h2>
  <blockquote>${esc(g.error)}</blockquote>
  ${g.errorNote ? `<p class="note">${g.errorNote}</p>` : ""}${akaList(g)}

  <h2>2. Why the printer rejected it</h2>
  ${g.why}

  <h2>3. The do-it-yourself fix</h2>
  ${g.diyIntro || ""}${diy}
${bridge(g)}`}
${costBox(g)}

  <section class="cta">
    <h2>${g.body ? "Get it done in minutes" : "4. The automated fix"}</h2>
    <p><strong>${g.cta.text}</strong></p>
    <a class="btn" href="${g.cta.href || "/"}">${esc(g.cta.button)}</a>
  </section>
`}${faq.length ? `
  <h2>Quick answers</h2>
${faq.map((f) => `  <h3>${esc(f.q)}</h3>\n  <p>${f.a}</p>`).join("\n")}
` : ""}
  <h2>More guides</h2>
  <ul class="links">
${more.map((o) => `    <li><a href="/guides/${o.slug}/">${esc(o.h1)}</a></li>`).join("\n")}
    <li><a href="/guides/">All guides</a></li>
  </ul>
${PRICE_SCRIPT}
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

  <h2>Free tools that catch these problems early</h2>
  <ul class="links">
    <li><a href="/kdp-cover-calculator/">KDP cover size calculator and template</a></li>
    <li><a href="/book-spine-width-calculator/">Book spine width calculator</a></li>
    <li><a href="/book-margin-calculator/">Book margin and bleed calculator</a></li>
    <li><a href="/image-dpi-checker/">Image DPI checker</a></li>
    <li><a href="/free-manuscript-checklist/">Free manuscript checklist</a></li>
    <li><a href="/free-book-formatting-guide/">Free book formatting guide</a></li>
  </ul>

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
