// Builds the SparkPrep topic sites: one small static site per subdomain of legenddary.com.
//   node scripts/build-landing-sites.mjs        (or: npm run landing-sites)
// Content lives in content/landing-sites/<key>.mjs; shared settings and prices in shared.mjs.
// Output: sites/<key>/ (index.html per page, style.css, sitemap.xml, robots.txt, 404.html, logo, IndexNow key).
// Each sites/<key>/ folder is deployed as its own Cloudflare Pages project (see .github/workflows/deploy-landing-sites.yml).
// This does NOT touch the main React site or its build.
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MAIN, MAIN_LINKS, PRICE_LINE, SITES, UPDATED } from "../content/landing-sites/shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "content", "landing-sites");
const OUT = join(ROOT, "sites");
const INDEXNOW_KEY = "ab609d74f8251ec3"; // same key as the main site; a copy is served on every host

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const CSS = `:root{--bg:#0b0b0c;--panel:#141416;--card:#1b1b1e;--line:#2c2c30;--text:#f3f0e8;--muted:#aaa497;--gold:#d4af37;--gold-soft:#f1d27a;--accent:ACCENT}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:17px/1.7 "Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif}
a{color:var(--gold-soft)}a:hover{color:#fff}
.wrap{max-width:900px;margin:0 auto;padding:0 16px}
header.site{border-bottom:1px solid var(--line);background:#0e0e10;position:sticky;top:0;z-index:5}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:10px;padding-bottom:10px}
.brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none;font-weight:700;line-height:1.2;min-width:0}
.brand img{height:40px;width:auto;flex:none}.brand small{display:block;color:var(--accent);font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
.btn{display:inline-block;background:var(--gold);color:#111;font-weight:700;text-decoration:none;padding:11px 18px;border-radius:10px;white-space:nowrap}
.btn:hover{background:var(--gold-soft);color:#111}.btn.small{padding:8px 13px;font-size:15px}
.btn.ghost{background:transparent;color:var(--gold-soft);border:1px solid var(--gold)}
nav.sub{border-bottom:1px solid var(--line);background:#101012;overflow-x:auto;white-space:nowrap}
nav.sub a{display:inline-block;color:var(--muted);text-decoration:none;padding:9px 12px;font-size:15px}nav.sub a[aria-current]{color:var(--text);box-shadow:inset 0 -2px var(--accent)}
.crumbs{font-size:14px;color:var(--muted);margin:18px 0 0}.crumbs a{color:var(--muted)}
main{padding-bottom:50px}
.eyebrow{color:var(--accent);font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:13px;margin:22px 0 0}
h1{font-size:clamp(28px,5.4vw,42px);line-height:1.15;margin:6px 0 12px}
h2{font-size:clamp(22px,3.6vw,27px);line-height:1.25;margin:40px 0 10px;color:var(--gold-soft)}
h3{font-size:19px;margin:26px 0 6px}
p.lead{font-size:19px;color:#e2ddd0}
.answer{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;padding:14px 18px;margin:18px 0}
.answer > strong:first-child{display:block;color:var(--accent);font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
.strip{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin:18px 0;font-size:16px}
.strip span{flex:1 1 260px}
.cta{background:linear-gradient(135deg,#1d1a10,#141416);border:1px solid #5a4a17;border-radius:14px;padding:22px;margin:40px 0}
.cta h2{margin-top:0;color:#fff}.cta .btn{margin:4px 8px 4px 0}.cta p{margin:8px 0 14px}.cta .fine{font-size:14px;color:var(--muted);margin:12px 0 0}
.table-wrap{overflow-x:auto;margin:14px 0}table{border-collapse:collapse;width:100%;font-size:15.5px}
th,td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}th{background:var(--card);color:var(--gold-soft)}
.note{font-size:14.5px;color:var(--muted)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:14px 0}
.card{display:block;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;color:var(--text);text-decoration:none}
.card:hover{border-color:var(--accent)}.card b{display:block;color:var(--gold-soft);margin-bottom:4px}.card span{color:var(--muted);font-size:15px}
ol.steps,ul.checks{padding-left:22px}ol.steps li,ul.checks li{margin:6px 0}
.box{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:16px 0}
.box h3{margin-top:4px}
details{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:8px 0}summary{cursor:pointer;font-weight:600}
footer.site{border-top:1px solid var(--line);background:#0e0e10;padding:28px 0 36px;font-size:15px;color:var(--muted)}
footer.site h2{font-size:16px;margin:0 0 8px;color:var(--text)}footer.site .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px}
footer.site ul{list-style:none;padding:0;margin:0}footer.site li{margin:5px 0}footer.site a{color:var(--muted)}footer.site a:hover{color:#fff}
footer.site .legal{margin-top:22px;font-size:13px}
@media (max-width:620px){.brand img{height:32px}.brand span.name{font-size:15px}header.site .btn{padding:8px 11px;font-size:14px}}
`;

function pageUrl(s, path) {
  return `https://${s.host}${path}`;
}

function jsonLd(s, page, url) {
  const graph = [];
  const org = { "@type": "Organization", "@id": `${MAIN}/#org`, name: "SparkPrep", url: `${MAIN}/`, logo: `${MAIN}/brand/sparkprep-logo.png`, parentOrganization: { "@type": "Organization", name: "Legenddary", url: "https://legenddary.com/" } };
  graph.push(org);
  if (page.path === "/") {
    graph.push({ "@type": "WebSite", "@id": `https://${s.host}/#site`, name: `SparkPrep: ${s.name}`, url: `https://${s.host}/`, description: s.blurb, publisher: { "@id": `${MAIN}/#org` }, inLanguage: "en-US" });
  }
  graph.push({
    "@type": page.path === "/" ? "WebPage" : "Article",
    "@id": `${url}#page`,
    ...(page.path === "/" ? { name: page.title } : { headline: page.h1 }),
    description: page.description,
    url,
    inLanguage: "en-US",
    datePublished: page.published || UPDATED,
    dateModified: page.updated || UPDATED,
    author: { "@type": "Person", name: "Joshua Davis", jobTitle: "Founder, SparkPrep" },
    publisher: { "@id": `${MAIN}/#org` },
    isPartOf: { "@type": "WebSite", name: `SparkPrep: ${s.name}`, url: `https://${s.host}/` },
    about: { "@type": "SoftwareApplication", name: "SparkPrep", applicationCategory: "BusinessApplication", operatingSystem: "Web", url: `${MAIN}/` },
  });
  const crumbs = [{ "@type": "ListItem", position: 1, name: s.name, item: `https://${s.host}/` }];
  if (page.path !== "/") crumbs.push({ "@type": "ListItem", position: 2, name: page.crumb || page.h1, item: url });
  graph.push({ "@type": "BreadcrumbList", itemListElement: crumbs });
  if (page.faq && page.faq.length) {
    graph.push({ "@type": "FAQPage", mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })) });
  }
  if (page.extraLd) graph.push(...[].concat(page.extraLd));
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function header(s, page, pages) {
  const nav = pages
    .filter((p) => p.nav)
    .map((p) => `<a href="${p.path}"${p.path === page.path ? ' aria-current="page"' : ""}>${esc(p.nav)}</a>`)
    .join("");
  return `<header class="site"><div class="wrap">
<a class="brand" href="/"><img src="/logo.png" width="60" height="40" alt="SparkPrep logo"><span class="name">${esc(s.name)}<small>by SparkPrep</small></span></a>
<a class="btn small" href="${MAIN_LINKS.audit}">Check my book</a>
</div></header>
<nav class="sub" aria-label="${esc(s.name)} pages"><div class="wrap">${nav}</div></nav>`;
}

function ctaBox(page) {
  const c = page.cta || {};
  return `<section class="cta" aria-label="Check your book with SparkPrep">
<h2>${esc(c.title || "Find out what's wrong with your files before the printer does")}</h2>
<p>${c.text || "SparkPrep checks your cover and every interior page against the exact rules Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu use, tells you each problem in plain English, and can fix it for you."}</p>
<a class="btn" href="${c.href || MAIN_LINKS.audit}">${esc(c.button || "Scan my book free")}</a>
<a class="btn ghost" href="${MAIN_LINKS.home}">See how SparkPrep works</a>
<p class="fine">${PRICE_LINE}</p>
</section>`;
}

function topStrip(page) {
  return `<div class="strip"><span>${page.stripText || "Want the answer for <em>your</em> book? Upload it and SparkPrep checks it against your printer's own rules."}</span><a class="btn small" href="${MAIN_LINKS.audit}">Scan my book free</a></div>`;
}

function related(s, page, pages) {
  const others = pages.filter((p) => p.path !== page.path);
  if (!others.length) return "";
  return `<h2>More on this site</h2><div class="cards">${others
    .map((p) => `<a class="card" href="${p.path}"><b>${esc(p.crumb || p.h1)}</b><span>${esc(p.cardText || p.description)}</span></a>`)
    .join("")}</div>`;
}

function network(s) {
  const others = SITES.filter((x) => x.key !== s.key);
  return `<h2>Free help from SparkPrep</h2><div class="cards">${others
    .map((x) => `<a class="card" href="https://${x.host}/"><b>${esc(x.name)}</b><span>${esc(x.blurb)}</span></a>`)
    .join("")}<a class="card" href="${MAIN_LINKS.tools}"><b>Free book tools</b><span>Cover calculator, spine width, margins, DPI checker and page count, on sparkprep.legenddary.com.</span></a></div>`;
}

function footer(s) {
  return `<footer class="site"><div class="wrap"><div class="cols">
<div><h2>SparkPrep</h2><ul>
<li><a href="${MAIN_LINKS.home}">SparkPrep home</a></li>
<li><a href="${MAIN_LINKS.audit}">Scan my book free</a></li>
<li><a href="${MAIN_LINKS.coverStudio}">Cover Studio (free templates)</a></li>
<li><a href="${MAIN_LINKS.interiorStudio}">Interior Studio (format your pages)</a></li>
<li><a href="${MAIN_LINKS.pricing}">Pricing</a></li></ul></div>
<div><h2>Free tools &amp; guides</h2><ul>
<li><a href="${MAIN_LINKS.kdpCalc}">KDP cover size calculator</a></li>
<li><a href="${MAIN_LINKS.spineCalc}">Spine width calculator</a></li>
<li><a href="${MAIN_LINKS.marginCalc}">Margin &amp; bleed calculator</a></li>
<li><a href="${MAIN_LINKS.dpiChecker}">Image DPI checker</a></li>
<li><a href="${MAIN_LINKS.guides}">All SparkPrep guides</a></li></ul></div>
<div><h2>SparkPrep help sites</h2><ul>${SITES.map((x) => `<li><a href="https://${x.host}/">${esc(x.name)}</a></li>`).join("")}</ul></div>
</div>
<p class="legal">© 2026 Legenddary · SparkPrep, made by Joshua Davis after his own book was rejected by the printer 18 times. Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu are trademarks of their owners; SparkPrep is not affiliated with them. Printer rules change, so always check your printer's current guide before you upload.</p>
</div></footer>`;
}

function renderPage(s, page, pages) {
  const url = pageUrl(s, page.path);
  const crumbs = page.path === "/" ? "" : `<p class="crumbs"><a href="/">${esc(s.name)}</a> › ${esc(page.crumb || page.h1)}</p>`;
  const faq = page.faq && page.faq.length
    ? `<h2>Questions people ask</h2>${page.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`).join("")}`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta property="og:type" content="${page.path === "/" ? "website" : "article"}">
<meta property="og:site_name" content="SparkPrep: ${esc(s.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${MAIN}/brand/sparkprep-logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0b0c">
<link rel="icon" href="/favicon.png">
<link rel="stylesheet" href="/style.css">
<script type="application/ld+json">${jsonLd(s, page, url)}</script>
</head>
<body>
${header(s, page, pages)}
<main class="wrap">
${crumbs}
<p class="eyebrow">${esc(page.eyebrow || s.short)}</p>
<h1>${esc(page.h1)}</h1>
<p class="lead">${page.lead}</p>
${page.answer ? `<div class="answer"><strong>Quick answer</strong>${page.answer}</div>` : ""}
${topStrip(page)}
${page.body}
${ctaBox(page)}
${faq}
${related(s, page, pages)}
${network(s)}
<p class="note">Last updated ${page.updated || UPDATED}. Written by Joshua Davis, founder of SparkPrep. Numbers come from each printer's own published guides; always double-check your printer's current rules before you upload.</p>
</main>
${footer(s)}
</body>
</html>
`;
}

function render404(s, pages) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | SparkPrep: ${esc(s.name)}</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/style.css"></head>
<body>${header(s, { path: "" }, pages)}<main class="wrap"><h1>That page isn't here</h1>
<p class="lead">It may have moved. Try one of these, or check your book right now.</p>
<div class="cards">${pages.map((p) => `<a class="card" href="${p.path}"><b>${esc(p.crumb || p.h1)}</b><span>${esc(p.description)}</span></a>`).join("")}</div>
<p><a class="btn" href="${MAIN_LINKS.audit}">Scan my book free</a></p></main>${footer(s)}</body></html>
`;
}

function sitemap(s, pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${pageUrl(s, p.path)}</loc><lastmod>${p.updated || UPDATED}</lastmod><priority>${p.path === "/" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
}

const robots = (s) => `User-agent: *\nAllow: /\n\nSitemap: https://${s.host}/sitemap.xml\n`;

// ---- build ----
const problems = [];
for (const s of SITES) {
  const mod = await import(join(SRC, `${s.key}.mjs`));
  const pages = mod.pages;
  const dir = join(OUT, s.key);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const seenTitles = new Set();
  for (const p of pages) {
    for (const f of ["path", "title", "description", "h1", "lead", "body"]) if (!p[f]) problems.push(`${s.key}${p.path || "?"}: missing ${f}`);
    if (p.title && p.title.length > 65) problems.push(`${s.key}${p.path}: title is ${p.title.length} chars (aim for 65 or fewer)`);
    if (p.description && (p.description.length < 70 || p.description.length > 160)) problems.push(`${s.key}${p.path}: description is ${p.description.length} chars (aim for 70-160)`);
    if (seenTitles.has(p.title)) problems.push(`${s.key}${p.path}: duplicate title`);
    seenTitles.add(p.title);
    const words = strip(p.body).split(" ").length;
    if (words < 250) problems.push(`${s.key}${p.path}: only ${words} words in the body (thin)`);
    const pdir = join(dir, p.path);
    mkdirSync(pdir, { recursive: true });
    writeFileSync(join(pdir, "index.html"), renderPage(s, p, pages));
  }
  writeFileSync(join(dir, "style.css"), CSS.replace("ACCENT", s.accent));
  writeFileSync(join(dir, "404.html"), render404(s, pages));
  writeFileSync(join(dir, "sitemap.xml"), sitemap(s, pages));
  writeFileSync(join(dir, "robots.txt"), robots(s));
  writeFileSync(join(dir, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
  copyFileSync(join(SRC, "assets", "logo.png"), join(dir, "logo.png"));
  copyFileSync(join(SRC, "assets", "favicon.png"), join(dir, "favicon.png"));
  console.log(`${s.host}: ${pages.length} pages -> sites/${s.key}/`);
}
if (problems.length) {
  console.log(`\nSEO warnings (${problems.length}):\n- ` + problems.join("\n- "));
  if (process.argv.includes("--strict")) process.exit(1);
}
