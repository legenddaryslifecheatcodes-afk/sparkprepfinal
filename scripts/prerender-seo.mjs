// Runs right after `craco build`. The site is a single-page app, so every route used to be served the
// homepage's index.html: crawlers that don't run JavaScript (Bing, social previews, AI search) saw the
// homepage title, description and canonical on /cover-studio and /interior-studio. This writes one
// HTML file per public route (build/cover-studio.html etc.) with that page's own title, description,
// canonical, structured data and a short readable summary. Cloudflare Pages serves /cover-studio from
// cover-studio.html, and React replaces the summary as soon as the app loads, so visitors see no change.
import { readFileSync, writeFileSync } from "node:fs";

const SITE = "https://sparkprep.legenddary.com";
const BUILD = new URL("../build/", import.meta.url);
const PAGES = JSON.parse(readFileSync(new URL("../src/lib/seoPages.json", import.meta.url), "utf8"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const link = (href, text) => `<li><a style="color:#f1d27a" href="${href}">${esc(text)}</a></li>`;

const studioApp = (name, category, description, features) => ({
  "@type": "SoftwareApplication",
  name,
  applicationCategory: category,
  operatingSystem: "Web browser",
  description,
  featureList: features,
  isPartOf: { "@type": "WebSite", name: "SparkPrep", url: `${SITE}/` },
  publisher: { "@type": "Organization", name: "SparkPrep", url: `${SITE}/` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Designing is free. The print-ready file comes with the book." },
});

const breadcrumb = (name, path) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "SparkPrep", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name, item: SITE + path },
  ],
});

const COVER_FEATURES = [
  "Full-wrap cover: front, spine and back on one canvas",
  "Sized to the exact rules of Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu",
  "Spine width worked out from page count and paper",
  "224 free cover templates",
  "333 free open-license fonts",
  "Bleed, trim, spine and safe-area guides",
  "AI cover designer for front, spine and back",
  "3D book preview",
  "300 DPI print export",
];
const INTERIOR_FEATURES = [
  "Write in the editor or import a Word (.docx) file",
  "Live preview of the real printed pages",
  "11 book styles with embedded fonts",
  "Margins set to Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu's own tables",
  "Chapters, scene breaks, title page and table of contents",
  "Free spell check",
  "AI spelling, grammar and wording suggestions you accept or skip one by one",
  "Send the pages straight into your SparkPrep book for checking and export",
];

// Extra content per route: readable summary for the <div id="root"> placeholder and structured data.
const EXTRA = {
  "/cover-studio": {
    h1: "Free book cover maker for KDP, IngramSpark, Barnes & Noble and Lulu",
    features: COVER_FEATURES,
    schema: [
      studioApp("SparkPrep Cover Studio", "DesignApplication", PAGES["/cover-studio"].description, COVER_FEATURES),
      breadcrumb("Cover Studio", "/cover-studio"),
    ],
  },
  "/interior-studio": {
    h1: "Free book formatting tool: write or import Word, get print-ready pages",
    features: INTERIOR_FEATURES,
    schema: [
      studioApp("SparkPrep Interior Studio", "DesignApplication", PAGES["/interior-studio"].description, INTERIOR_FEATURES),
      breadcrumb("Interior Studio", "/interior-studio"),
    ],
  },
  "/specs": { h1: "Print specs library: KDP, IngramSpark, Barnes & Noble and Lulu", schema: [breadcrumb("Print Specs Library", "/specs")] },
  "/audit": { h1: "Print Failure Audit: find why your book file will be rejected", schema: [breadcrumb("Print Failure Audit", "/audit")] },
  "/pricing": { h1: "SparkPrep pricing", schema: [breadcrumb("Pricing", "/pricing")] },
};

const NAV = [
  link("/cover-studio", "Cover Studio: free book cover maker"),
  link("/interior-studio", "Interior Studio: free book formatting tool"),
  link("/audit", "Print Failure Audit"),
  link("/kdp-cover-calculator/", "KDP cover size calculator"),
  link("/book-spine-width-calculator/", "Book spine width calculator"),
  link("/specs", "Print specs library"),
].join("\n            ");

const template = readFileSync(new URL("index.html", BUILD), "utf8");

function setHead(html, path, page) {
  const url = SITE + path;
  const t = esc(page.title);
  const d = esc(page.description);
  const swaps = [
    [/<title>[^<]*<\/title>/, `<title>${t}</title>`],
    [/(<meta name="description" content=")[^"]*"/, `$1${d}"`],
    [/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`],
    [/(<meta property="og:title" content=")[^"]*"/, `$1${t}"`],
    [/(<meta property="og:description" content=")[^"]*"/, `$1${d}"`],
    [/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`],
    [/(<meta name="twitter:title" content=")[^"]*"/, `$1${t}"`],
    [/(<meta name="twitter:description" content=")[^"]*"/, `$1${d}"`],
  ];
  for (const [re, to] of swaps) {
    if (!re.test(html)) throw new Error(`prerender-seo: ${re} not found in build/index.html`);
    html = html.replace(re, to);
  }
  return html;
}

let written = 0;
for (const [path, page] of Object.entries(PAGES)) {
  const extra = EXTRA[path];
  if (path === "/" || !extra) continue;
  let html = setHead(template, path, page);
  // The homepage FAQ / commercial structured data only describes the homepage.
  html = html.replace(/\s*<!-- Homepage-only structured data[\s\S]*?-->/, "").replace(/\s*<script type="application\/ld\+json" data-home-only>[\s\S]*?<\/script>/g, "");
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": extra.schema })}</script>`;
  html = html.replace("</head>", `${ld}</head>`);
  const features = extra.features ? `<ul>${extra.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : "";
  const body = `<div id="root"><main style="max-width:760px;margin:0 auto;padding:40px 20px;color:#f2efe6;background:#0a0a0a;font-family:Segoe UI,system-ui,Arial,sans-serif;line-height:1.6">
          <h1>${esc(extra.h1)}</h1>
          <p>${esc(page.description)}</p>
          ${features}
          <h2>More from SparkPrep</h2>
          <ul>
            ${NAV}
          </ul>
        </main></div>`;
  const rootRe = /<div id="root">[\s\S]*?<\/main>\s*<\/div>/;
  if (!rootRe.test(html)) throw new Error("prerender-seo: readable #root block not found in build/index.html");
  html = html.replace(rootRe, body);
  writeFileSync(new URL(`${path.slice(1)}.html`, BUILD), html);
  written += 1;
}
console.log(`prerender-seo: wrote ${written} page(s)`);
