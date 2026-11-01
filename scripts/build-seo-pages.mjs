// Builds SparkPrep's "free resource" landing pages (2026-10-31, SEO push to 20,000 visitors/month):
//   /templates/                      free cover templates hub
//   /templates/<genre>-book-covers/  one page per Cover Studio genre (counts read from the real template list)
//   /free-book-formatting-guide/  /free-manuscript-checklist/  /free-indie-author-templates/
// and their URLs in public/sitemap.xml (between the SEO-PAGES markers). Output is committed, like the guides.
// Run:  npm run seo-pages   (the normal build runs it too; if it ever fails, the committed pages are kept).
// Template counts come from src/lib/coverStudio/templates.js, so they stay true when templates are added.
// Optional real thumbnails: public/templates/img/<template-key>.jpg (made with Cover Studio's own renderer).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const SITE = "https://sparkprep.legenddary.com";
const ROOT = new URL("../", import.meta.url);
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- Read the real template list (no bundler needed) ----------
const src = readFileSync(new URL("src/lib/coverStudio/templates.js", ROOT), "utf8");
const GENRES = [...src.match(/export const GENRES = \[([\s\S]*?)\n\];/)[1].matchAll(/\["(\w+)", "([^"]+)"\]/g)].map((m) => [m[1], m[2]]);
const PALETTES = Object.fromEntries([...src.match(/export const PALETTES = \{([\s\S]*?)\n\};/)[1]
  .matchAll(/(\w+): \{ name: "([^"]+)", bg: "([^"]+)", bg2: "([^"]+)", ink: "([^"]+)", sub: "([^"]+)", accent: "([^"]+)" \}/g)]
  .map((m) => [m[1], { name: m[2], bg: m[3], bg2: m[4], ink: m[5], sub: m[6], accent: m[7] }]));
const STYLES = [...src.match(/const STYLES = \[([\s\S]*?)\n\];/)[1]
  .matchAll(/\{ key: "(\w+)", palette: "(\w+)", title: "([^"]+)", body: "([^"]+)", genres: \[([^\]]*)\] \}/g)]
  .map((m) => ({ key: m[1], palette: m[2], title: m[3], body: m[4], genres: [...m[5].matchAll(/"(\w+)"/g)].map((x) => x[1]) }));
const LAYOUTS = [...src.match(/const LAYOUTS = \{([\s\S]*?)\n\};/)[1].matchAll(/^  (\w+): \{ name: "([^"]+)", build:/gm)].map((m) => [m[1], m[2]]);
if (!GENRES.length || STYLES.length < 5 || LAYOUTS.length < 5 || Object.keys(PALETTES).length < 5) throw new Error("seo-pages: could not read templates.js");
const TOTAL = STYLES.length * LAYOUTS.length;
// Font count: the unique names in fonts.js's RAW lists (a plain object of string arrays).
const FONT_COUNT = (() => {
  const raw = readFileSync(new URL("src/lib/coverStudio/fonts.js", ROOT), "utf8").match(/const RAW = (\{[\s\S]*?\n\});/);
  if (!raw) return 0;
  try { return new Set(Object.values(new Function(`return ${raw[1]}`)()).flat()).size; } catch { return 0; }
})();

// ---------- What each genre page says (plain English, one page per Cover Studio genre) ----------
const COPY = {
  thriller: {
    slug: "thriller-book-covers", noun: "thriller and mystery",
    intro: "Thriller and mystery readers decide fast. They look for dark backgrounds, one strong color, and a big, tight title they can read from across the room. Your cover has to say \"danger\" in under a second.",
    tips: ["Use a heavy, condensed title font in all caps.", "Keep to two or three colors: black or deep blue, plus one alarm color like red or gold.", "One image (a figure, a door, a road) beats a busy collage.", "Make the author name big if this is a series."],
    faq: [["What colors work best on a thriller cover?", "Dark backgrounds with one bright accent, like black with red, or navy with gold. High contrast makes the title readable as a small thumbnail."], ["What font should I use for a thriller book cover?", "A bold, condensed sans-serif in capitals, like Bebas Neue or Oswald. Both are free and come with SparkPrep's Cover Studio."]],
  },
  romance: {
    slug: "romance-book-covers", noun: "romance", phrase: "romance novel",
    intro: "Romance readers know what they want, and the cover tells them in a glance. Soft or rich colors, a flowing script title, and a clear feeling (sweet, steamy or funny) help your book find the right reader.",
    tips: ["Script or elegant serif fonts signal romance right away.", "Blush, plum and warm tones read sweet; deep reds and black read steamy.", "Match the mood of your subgenre: rom-com covers are bright and playful.", "Leave room for a tagline or series name."],
    faq: [["What makes a good romance book cover?", "A clear mood, a readable title and the colors your subgenre uses. Readers should know if it's sweet, steamy or funny before they read a word."], ["What font is best for a romance cover?", "A flowing script like Great Vibes for the title, paired with a simple serif like Lora for the author name."]],
  },
  fantasy: {
    slug: "fantasy-book-covers", noun: "fantasy",
    intro: "Fantasy covers promise a world. Rich colors, ornate serif titles and a sense of scale tell readers this is an adventure worth hundreds of pages.",
    tips: ["Classic, carved-looking serif fonts like Cinzel feel epic.", "Deep purples, golds and fire colors feel magical.", "Emblems and symbols work well for series.", "Keep the title clear even when the art is detailed."],
    faq: [["What font do fantasy book covers use?", "Ornate serif fonts like Cinzel or Cinzel Decorative are common. They look carved in stone, which suits epic fantasy."], ["Can I make a fantasy cover without custom art?", "Yes. Strong color, a good title font and a simple emblem can look professional. You can add your own art or AI art in Cover Studio too."]],
  },
  scifi: {
    slug: "sci-fi-book-covers", noun: "science fiction",
    intro: "Sci-fi covers look clean, bright and futuristic. Glowing colors on dark space, or cool blues and whites, tell readers to expect technology, space or the future.",
    tips: ["Geometric fonts like Orbitron or Space Grotesk feel futuristic.", "Neon pinks and cyans on near-black feel like space or cyberpunk.", "Cool icy blues feel like hard sci-fi or near-future.", "Simple shapes and glows beat busy detail at thumbnail size."],
    faq: [["What colors work for a sci-fi cover?", "Dark space backgrounds with neon accents, or clean icy blues and whites. Both read as science fiction at a glance."], ["Are these sci-fi templates free?", "Yes. Every template, font and tool in SparkPrep's Cover Studio is free to use."]],
  },
  horror: {
    slug: "horror-book-covers", noun: "horror",
    intro: "Horror covers need to unsettle. Blood reds, deep shadows and a title font with an edge tell readers to brace themselves.",
    tips: ["A distressed or dripping title font says horror right away.", "Deep red and black are the classic pair.", "Less is more: one creepy detail beats a crowded scene.", "Keep the author name clean so it's still easy to read."],
    faq: [["What font is used on horror book covers?", "Distressed or dripping display fonts like Creepster for the title, with a plain bold font like Oswald for the author."], ["What colors are best for horror?", "Black, deep red and off-white. They create tension and stay readable as small thumbnails."]],
  },
  literary: {
    slug: "literary-fiction-book-covers", noun: "literary fiction",
    intro: "Literary fiction covers are calm and confident. Quiet colors, elegant serif type and lots of open space tell readers this book is about ideas and people.",
    tips: ["Elegant serifs like DM Serif Display or Cormorant feel literary.", "Muted earth tones and deep blues or greens work well.", "White space is your friend.", "A small, simple image can carry a lot of meaning."],
    faq: [["What does a literary fiction cover look like?", "Usually simple and elegant: muted colors, a refined serif title and plenty of space."], ["Can I use these templates for book club fiction?", "Yes. Pick any template and change the colors, fonts and words to fit your book."]],
  },
  memoir: {
    slug: "memoir-book-covers", noun: "memoir and biography",
    intro: "A memoir cover is personal. Warm colors, honest type and often a photo of you or a meaningful place help readers trust the story before they open it.",
    tips: ["Add your own photo: a memoir with a real face sells the story.", "Warm, natural colors feel honest and personal.", "Classic serif fonts give a timeless feel.", "Keep the subtitle short and clear about what the story is."],
    faq: [["Should I put my photo on my memoir cover?", "Often yes. A real photo of you, or of a place that matters in the story, makes a memoir feel personal. You can add one to any template."], ["What size photo do I need for a book cover?", "Enough pixels for 300 DPI at print size. For a 6 by 9 inch front cover that's about 1,838 by 2,775 pixels. Our free DPI checker tells you."]],
  },
  nonfiction: {
    slug: "nonfiction-book-covers", noun: "nonfiction and business",
    intro: "Nonfiction and business covers sell a promise. A big, bold title, a clear subtitle that says what the reader gets, and clean colors look expert and trustworthy.",
    tips: ["Make the title as big as you can. Readers scan nonfiction covers for the promise.", "Bold sans-serif fonts like Archivo Black or Montserrat look modern and confident.", "A clear subtitle does a lot of the selling.", "Clean color blocks beat busy photos."],
    faq: [["How do I design a business book cover?", "Lead with a big, bold title and a clear subtitle that names the benefit. Use one or two strong colors and a clean font."], ["Do nonfiction covers need a subtitle?", "Usually, yes. The subtitle tells readers exactly what they'll learn, which helps both sales and search."]],
  },
  selfhelp: {
    slug: "self-help-book-covers", noun: "self-help and faith",
    intro: "Self-help and faith covers feel hopeful and clear. Warm sunrise colors, calm blues and strong, simple titles tell readers this book will help them.",
    tips: ["Warm gradients like sunset tones feel hopeful.", "Keep the title short, bold and easy to read.", "Use the subtitle to name the change the reader will make.", "Simple symbols (a sunrise, a path, a light) work well."],
    faq: [["What colors work for a self-help book cover?", "Warm, hopeful colors like orange and gold, or calm blues. Bright and clean usually beats dark."], ["Can I use these templates for a Christian or devotional book?", "Yes. The self-help and faith templates suit devotionals, and you can change every color, font and word."]],
  },
  children: {
    slug: "childrens-book-covers", noun: "children's",
    intro: "Children's book covers are bright, round and playful. Big friendly fonts and happy colors catch a child's eye, and a parent's too.",
    tips: ["Round, friendly fonts like Fredoka are easy for kids to read.", "Bright primary colors catch the eye.", "Leave room for your illustration. It's the star of a picture book.", "Keep the title short and large."],
    faq: [["What font is best for a children's book cover?", "Round, friendly fonts like Fredoka or Nunito. They're easy to read and feel playful."], ["Can I put my own illustration on the cover?", "Yes. Upload your art in Cover Studio and place it on any template. Make sure it's 300 DPI at print size."]],
  },
  poetry: {
    slug: "poetry-book-covers", noun: "poetry",
    intro: "Poetry covers are often quiet and beautiful. Soft colors, delicate type and lots of space let the title breathe, like a good poem.",
    tips: ["Delicate serif or script fonts suit poetry.", "Soft, muted colors feel thoughtful.", "Minimal designs with one small image work beautifully.", "Short collection titles look great set large."],
    faq: [["What should a poetry book cover look like?", "Usually simple and elegant, with soft colors and graceful type. It should match the feeling of your poems."], ["Are these poetry cover templates free?", "Yes. Every template is free to use and change in SparkPrep's Cover Studio."]],
  },
  western: {
    slug: "western-book-covers", noun: "western and historical",
    intro: "Western and historical covers feel weathered and timeless. Dusty earth tones and slab-serif \"wanted poster\" type put readers in another time and place right away.",
    tips: ["Slab-serif fonts like Rye feel like the old West.", "Dusty browns, tans and cream are the classic palette.", "A lone figure, a horizon or a landmark sets the scene.", "Historical fiction often uses period photos or paintings."],
    faq: [["What font do western book covers use?", "Slab-serif and \"wanted poster\" fonts like Rye, with a sturdy serif like Bitter for the author name."], ["Can I use these for historical fiction?", "Yes. Swap in a period photo or painting and the earth-tone palettes work well."]],
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const crumbs = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })) });
const faqLd = (faq) => ({ "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const faqHtml = (faq) => `  <h2>Quick answers</h2>\n${faq.map(([q, a]) => `  <h3>${esc(q)}</h3>\n  <p>${esc(a)}</p>`).join("\n")}`;

function page({ path, title, description, schema, body, fonts = [] }) {
  const url = `${SITE}${path}`;
  const fontLink = fonts.length
    ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${[...new Set(fonts)].map((f) => `family=${f.replace(/ /g, "+")}`).join("&")}&display=swap&text=${encodeURIComponent("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'&- ")}">`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SparkPrep">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/brand/sparkprep-logo.png">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/tools/tools.css">
${fontLink}
${ld({ "@context": "https://schema.org", "@graph": schema })}
</head>
<body>
<header class="site">
  <a class="brand" href="/"><img src="/brand/sparkprep-logo.png" alt="SparkPrep logo" width="120" height="34"></a>
  <nav><a href="/templates/">Templates</a><a class="hide-sm" href="/tools/">Free tools</a><a class="hide-sm" href="/guides/">Guides</a><a href="/">SparkPrep</a></nav>
</header>
<main>
${body}
  <p class="note">SparkPrep is an independent tool and is not affiliated with Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu.</p>
</main>
<footer class="site">© SparkPrep by Legenddary · <a href="/">Home</a><a href="/templates/">Templates</a><a href="/tools/">Free tools</a><a href="/guides/">Guides</a><a href="/pricing">Pricing</a></footer>
</body>
</html>
`;
}

// ---------- Template previews ----------
const IMG_DIR = new URL("public/templates/img/", ROOT);
const SAMPLE = { title: "The Last Light", author: "Your Name" };
function mock(style, layoutKey, layoutName, title) {
  const pal = PALETTES[style.palette];
  const key = `${layoutKey}-${style.key}`;
  const name = `${layoutName} · ${pal.name}`;
  for (const ext of ["webp", "jpg", "png"]) {
    if (existsSync(new URL(`${key}.${ext}`, IMG_DIR))) {
      return `<figure style="margin:0"><div class="mock"><img src="/templates/img/${key}.${ext}" alt="${esc(`${name} ${title} book cover template`)}" loading="lazy" width="150" height="225"></div><figcaption class="mock-cap">${esc(name)}</figcaption></figure>`;
    }
  }
  return `<figure style="margin:0"><div class="mock" role="img" aria-label="${esc(`${name} ${title} book cover template preview`)}" style="background:linear-gradient(160deg,${pal.bg},${pal.bg2});color:${pal.ink}">
      <div><div class="t" style="font-family:'${style.title}',serif">${esc(SAMPLE.title)}</div><div class="bar" style="background:${pal.accent}"></div></div>
      <div class="a" style="font-family:'${style.body}',sans-serif;color:${pal.sub}">${esc(SAMPLE.author)}</div></div><figcaption class="mock-cap">${esc(name)}</figcaption></figure>`;
}

const genreStyles = (g) => STYLES.filter((s) => s.genres.includes(g));
const genreCount = (g) => genreStyles(g).length * LAYOUTS.length;
const genreUrl = (g) => `/templates/${COPY[g].slug}/`;
const realGenres = GENRES.filter(([k]) => k !== "all" && COPY[k] && genreCount(k) > 0);

const STUDIO_FACTS = `<ul>
    <li>Every template is built on your book's real cover: back, spine and front, sized for your trim size, page count and paper.</li>
    <li>Works for Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu.</li>
    <li>Text stays inside the safe area, nothing sits in the barcode box, and spine text stays on the spine.</li>
    <li>${FONT_COUNT ? `${FONT_COUNT} free fonts` : "Hundreds of free fonts"}, your own photos, and an optional AI cover designer.</li>
    <li>Designing is free. A free preview download is included. The full-size print-ready file comes with a SparkPrep book.</li>
  </ul>`;

function genrePage(g, label) {
  const c = COPY[g];
  const styles = genreStyles(g);
  const n = genreCount(g);
  const path = genreUrl(g);
  const nice = label;
  const shown = [];
  // Up to 12 previews, mixing this genre's styles across different layouts.
  LAYOUTS.forEach(([lk, ln]) => styles.forEach((st) => shown.push(mock(st, lk, ln, c.noun))));
  // Targets searches like "free thriller book cover templates" and "romance novel cover layout examples".
  const title = `Free ${nice.replace(" & ", " and ")} Book Cover Templates: ${n} Print-Ready Layouts | SparkPrep`;
  const description = `Free ${c.noun} book cover templates and cover layout examples: ${n} print-ready designs sized for KDP, IngramSpark, Barnes & Noble Press and Lulu, with the right spine width.`;
  const faq = [...c.faq, ["Will these templates fit my book's spine?", "Yes. Each template is built on your book's real cover size, so the spine matches your page count and paper for KDP, IngramSpark, Barnes & Noble Press or Lulu."]];
  const others = realGenres.filter(([k]) => k !== g).map(([k, l]) => `<a href="${genreUrl(k)}">${esc(l)}</a>`).join("");
  const schema = [
    { "@type": "CollectionPage", name: `Free ${nice} book cover templates`, url: `${SITE}${path}`, description, numberOfItems: n,
      isPartOf: { "@type": "WebSite", name: "SparkPrep", url: `${SITE}/` } },
    crumbs([["SparkPrep", `${SITE}/`], ["Cover templates", `${SITE}/templates/`], [`${nice} covers`, `${SITE}${path}`]]),
    faqLd(faq),
  ];
  const body = `  <div class="eyebrow"><a href="/templates/" style="color:inherit">Cover templates</a> · ${esc(nice)}</div>
  <h1>Free ${esc(nice)} Book Cover Templates</h1>
  <p class="lead">${n} free ${esc(c.noun)} book cover templates, ready for print. Browse the ${esc(c.phrase || c.noun)} cover layout examples below, pick one, type your title, and SparkPrep sizes the whole cover (front, spine and back) to your book.</p>
  <a class="btn" href="/cover-studio?genre=${g}">Open the ${esc(nice)} templates</a>

  <h2>${esc((c.phrase || c.noun).charAt(0).toUpperCase() + (c.phrase || c.noun).slice(1))} cover layout examples</h2>
  <p class="note">Shown with a sample title. In Cover Studio every template shows your own title and author name.</p>
  <div class="mocks">
    ${shown.slice(0, 12).join("\n    ")}
  </div>

  <h2>What makes a great ${esc(c.noun)} cover</h2>
  <p>${esc(c.intro)}</p>
  <ul>${c.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>

  <h2>Fonts and colors in these templates</h2>
  <div class="table-wrap"><table>
    <tr><th>Style</th><th>Title font</th><th>Second font</th><th>Colors</th></tr>
${styles.map((st) => { const p = PALETTES[st.palette]; return `    <tr><td>${esc(p.name)}</td><td>${esc(st.title)}</td><td>${esc(st.body)}</td><td>${[p.bg, p.bg2, p.ink, p.accent].map((col) => `<span title="${col}" style="display:inline-block;width:16px;height:16px;border-radius:4px;border:1px solid #444;background:${col};margin-right:3px;vertical-align:middle"></span>`).join("")}</td></tr>`; }).join("\n")}
  </table></div>
  <p class="note">All fonts are free Google Fonts with open licenses, so you can use them on a book you sell.</p>

  <h2>Why these templates don't get rejected</h2>
  ${STUDIO_FACTS}

  <section class="cta">
    <h2>Make your ${esc(c.noun)} cover now</h2>
    <p>Open Cover Studio with the ${esc(nice)} templates ready. Enter your trim size and page count, pick a template, and change anything you like. When your book is ready, SparkPrep checks the cover and inside pages against your printer's rules.</p>
    <a class="btn" href="/cover-studio?genre=${g}">Design my cover free</a>
    <a class="btn ghost" href="/book-spine-width-calculator/">Check my spine width</a>
  </section>

${faqHtml(faq)}

  <h2>Other genres</h2>
  <p class="chips">${others}</p>
  <h2>Free tools for your cover</h2>
  <ul class="links">
    <li><a href="/kdp-cover-calculator/">KDP cover size calculator and template</a></li>
    <li><a href="/image-dpi-checker/">Image DPI checker (is your photo sharp enough?)</a></li>
    <li><a href="/book-cover-dimensions/">Book cover dimensions by trim size</a></li>
    <li><a href="/guides/">Print rejection fix guides</a></li>
  </ul>
`;
  return { path, html: page({ path, title, description, schema, body, fonts: styles.flatMap((s) => [s.title, s.body]) }) };
}

function templatesHub() {
  const path = "/templates/";
  const title = `${TOTAL} Free Book Cover Templates for KDP & IngramSpark | SparkPrep`;
  const description = `${TOTAL} free book cover templates in ${realGenres.length} genres, sized for your exact book: front, spine and back. For Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu.`;
  const faq = [
    ["Are SparkPrep's book cover templates really free?", "Yes. Every template, font and design tool in Cover Studio is free to use. A free preview download is included; the full-size print-ready file comes with a SparkPrep book."],
    ["Do the templates work for KDP and IngramSpark?", "Yes. Each template is built on your book's real cover size for Amazon KDP, IngramSpark, Barnes & Noble Press or Lulu, so the spine and bleed are right."],
    ["Can I change the fonts and colors?", "Yes. Click any word or shape to change it, swap fonts, add your own photo, or start from a blank cover."],
  ];
  const cards = realGenres.map(([k, l]) => {
    const st = genreStyles(k)[0];
    return `  <div class="card" style="display:flex;gap:16px;align-items:center">
    <div style="width:84px;flex:none">${mock(st, LAYOUTS[0][0], LAYOUTS[0][1], COPY[k].noun).replace(/<figcaption[\s\S]*?<\/figcaption>/, "")}</div>
    <div><h2 style="margin:0 0 4px;font-size:21px"><a href="${genreUrl(k)}">${esc(l)} book cover templates</a></h2>
    <p style="margin:0">${genreCount(k)} free templates. ${esc(COPY[k].intro.split(". ")[0])}.</p></div></div>`;
  }).join("\n");
  const schema = [
    { "@type": "CollectionPage", name: "Free book cover templates", url: `${SITE}${path}`, description, numberOfItems: TOTAL },
    { "@type": "ItemList", itemListElement: realGenres.map(([k, l], i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}${genreUrl(k)}`, name: `${l} book cover templates` })) },
    crumbs([["SparkPrep", `${SITE}/`], ["Cover templates", `${SITE}${path}`]]),
    faqLd(faq),
  ];
  const body = `  <div class="eyebrow">Free cover templates</div>
  <h1>${TOTAL} Free Book Cover Templates</h1>
  <p class="lead">Pick your genre, pick a template, type your title. SparkPrep's Cover Studio sizes the whole cover (front, spine and back) to your exact book, ready for KDP, IngramSpark, Barnes &amp; Noble Press or Lulu.</p>
  <a class="btn" href="/cover-studio">Open Cover Studio</a>

${cards}

  <h2>What every template does for you</h2>
  ${STUDIO_FACTS}

  <section class="cta">
    <h2>Already have a cover?</h2>
    <p>SparkPrep checks your cover and inside pages against your printer's own rules (size, bleed, spine, fonts, image quality and ink), explains any problem in plain English and fixes it.</p>
    <a class="btn" href="/audit">Check my book files</a>
  </section>

${faqHtml(faq)}

  <h2>More free resources</h2>
  <ul class="links">
    <li><a href="/free-indie-author-templates/">All free indie author templates</a></li>
    <li><a href="/free-book-formatting-guide/">Free book formatting guide</a></li>
    <li><a href="/free-manuscript-checklist/">Free manuscript checklist</a></li>
    <li><a href="/tools/">Free self-publishing tools</a></li>
  </ul>
`;
  return { path, html: page({ path, title, description, schema, body, fonts: realGenres.map(([k]) => genreStyles(k)[0].title) }) };
}

// ---------- Free book formatting guide ----------
function formattingGuide() {
  const path = "/free-book-formatting-guide/";
  const title = "Free Book Formatting Guide for KDP & IngramSpark (Step by Step) | SparkPrep";
  const description = "A free, plain-English guide to formatting your book for print: trim size, margins, fonts, page numbers, front matter and exporting a print-ready PDF for KDP and IngramSpark.";
  const steps = [
    ["Pick your trim size", "Trim size is your book's finished size. 6\" x 9\" is the most common for novels and nonfiction. 5.5\" x 8.5\" and 5\" x 8\" are popular for fiction. Pick it first, because everything else depends on it. In Word: Layout → Size → More Paper Sizes."],
    ["Set your margins", "Use mirror margins (Layout → Margins → Custom Margins → Multiple pages: Mirror margins). KDP's inside margin grows with your page count, from 0.375\" up to 0.875\". IngramSpark wants everything at least 0.5\" from every edge. Our free <a href=\"/book-margin-calculator/\">margin calculator</a> gives you the exact numbers."],
    ["Choose a readable font", "Most printed books use a serif font at 10.5 to 12 pt, like Garamond, Georgia or Palatino, with line spacing around 1.15 to 1.3. Use the same font for all body text. Make sure the font's license lets you embed it in a PDF."],
    ["Put the front matter in order", "A simple, standard order: title page, copyright page, dedication (optional), table of contents (common in nonfiction, optional in fiction), then Chapter 1. Chapter 1 usually starts on a right-hand (odd) page."],
    ["Start every chapter on a new page", "Use Insert → Page Break (or Layout → Breaks → Next Page) instead of pressing Enter many times. Hitting Enter to push text down breaks the moment anything changes."],
    ["Add headers and page numbers", "Use section breaks so the title page and chapter openers have no page number or header. Odd page numbers belong on right-hand pages. Turn on \"Different odd and even\" to put the book title on one side and the author on the other."],
    ["Check every picture", "Pictures must be at least 300 DPI at the size they print. In a black and white book, convert them to grayscale. Our free <a href=\"/image-dpi-checker/\">DPI checker</a> tells you if a picture is sharp enough."],
    ["Export a print-ready PDF", "Save as PDF with all fonts embedded. In Word: File → Save As → PDF → Options → tick \"PDF/A compliant\". If you use InDesign, export with the PDF/X-1a preset. Then open the PDF and check that the page size matches your trim size (or trim plus bleed)."],
    ["Check it before you upload", "Printers check page size, margins, fonts, image resolution and ink. A rejection costs you days. Run your files through a preflight check first, so you fix problems once instead of waiting on the printer again and again."],
  ];
  const faq = [
    ["How do I format a book for KDP for free?", "Set your trim size and mirror margins in Word, use one readable serif font, start chapters with page breaks, add page numbers with section breaks, and save a PDF with fonts embedded. SparkPrep's Interior Studio does this layout for you, free."],
    ["What font size should a printed book use?", "Most printed books use 10.5 to 12 point serif type. 11 point is a safe middle for a 6 by 9 inch book."],
    ["Do I need special software to format a book?", "No. Word can do it with the steps above. SparkPrep's free Interior Studio lets you import a Word file and see real printed pages as you go."],
  ];
  const schema = [
    { "@type": "HowTo", name: "How to format a book for print (KDP and IngramSpark)", description, totalTime: "PT3H",
      step: steps.map(([n, t], i) => ({ "@type": "HowToStep", position: i + 1, name: n, text: t.replace(/<[^>]+>/g, "") })) },
    crumbs([["SparkPrep", `${SITE}/`], ["Free book formatting guide", `${SITE}${path}`]]),
    faqLd(faq),
  ];
  const body = `  <div class="eyebrow">Free guide · Print book formatting</div>
  <h1>Free Book Formatting Guide: Get Your Book Ready to Print</h1>
  <p class="lead">Formatting turns your manuscript into real book pages: the right size, margins, fonts and page numbers, saved as a PDF your printer accepts. Here's how to do it yourself, step by step, for free.</p>
  <div class="card"><p style="margin:0"><strong>Short on time?</strong> SparkPrep's free <a href="/interior-studio">Interior Studio</a> imports your Word file and lays out real printed pages for you, with margins set to your printer's own rules.</p></div>

${steps.map(([n, t], i) => `  <h2>Step ${i + 1}: ${esc(n)}</h2>\n  <p>${t}</p>`).join("\n\n")}

  <div class="card"><p style="margin:0">You can do every step above by hand in Word. Or import your manuscript into SparkPrep, and let it lay out the pages and check them against your printer's rules in minutes. <a href="/interior-studio">Try it free</a>.</p></div>

  <h2>The formatting mistakes printers reject most</h2>
  <ul>
    <li><a href="/guides/fix-kdp-margin-error/">Text outside the margins</a></li>
    <li><a href="/guides/fix-pdf-page-size-mismatch/">PDF page size doesn't match the trim size</a></li>
    <li><a href="/guides/fix-font-not-embedded/">Fonts not embedded</a></li>
    <li><a href="/guides/fix-low-resolution-images/">Pictures below 300 DPI</a></li>
    <li><a href="/guides/fix-rgb-in-black-and-white-interior/">Color in a black and white interior</a></li>
  </ul>

  <section class="cta">
    <h2>Formatted? Check it before the printer does.</h2>
    <p>SparkPrep checks your interior and cover against Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu rules, explains every problem in plain English, and fixes what it can for you. It was built by an author whose own book was rejected 18 times.</p>
    <a class="btn" href="/audit">Check my book files</a>
    <a class="btn ghost" href="/free-manuscript-checklist/">Get the free checklist</a>
  </section>

${faqHtml(faq)}

  <h2>More free resources</h2>
  <ul class="links">
    <li><a href="/free-manuscript-checklist/">Free manuscript checklist</a></li>
    <li><a href="/free-indie-author-templates/">Free indie author templates</a></li>
    <li><a href="/book-page-count-calculator/">Word count to page count calculator</a></li>
    <li><a href="/guides/what-is-preflight-first-time-authors/">What is preflight? (for first-time authors)</a></li>
  </ul>
`;
  return { path, html: page({ path, title, description, schema, body }) };
}

// ---------- Free manuscript checklist ----------
function checklist() {
  const path = "/free-manuscript-checklist/";
  const title = "Free Manuscript Checklist: Grammar, Formatting & Print-Ready | SparkPrep";
  const description = "A free, printable manuscript checklist for self-published authors: grammar and proofreading, front matter, interior formatting, cover file and the final checks before you upload to KDP or IngramSpark.";
  const groups = [
    ["Writing, grammar and proofreading", [
      "Run a spell check on the whole manuscript (and add character names to the dictionary).",
      "Check names, places and dates are spelled the same way every time.",
      "Check its / it's, your / you're, their / there / they're and then / than.",
      "Dialogue: punctuation goes inside the quote marks, and a new speaker gets a new paragraph.",
      "Search for doubled words (\"the the\") and double spaces.",
      "Read the first and last page of every chapter out loud.",
      "Get at least one other person to read it.",
    ]],
    ["Front and back matter", [
      "Title page with title, subtitle and author name.",
      "Copyright page with the year, your name and your ISBN for this format.",
      "Table of contents (if your book needs one) with the right page numbers.",
      "About the author, and a short note on where readers can find you.",
    ]],
    ["Interior file", [
      "Page size matches your trim size (or trim plus bleed).",
      "Margins meet your printer's minimum (use the free margin calculator).",
      "Every chapter starts with a page break, not lots of Enter presses.",
      "No page numbers or headers on the title page or chapter openers.",
      "All pictures are 300 DPI at print size, and grayscale in a black and white book.",
      "Saved as a PDF with every font embedded.",
    ]],
    ["Cover file", [
      "Cover sized from your final interior page count (spine width depends on it).",
      "Background runs into the bleed on every edge.",
      "Title, author and back text are inside the safe area.",
      "Barcode area on the back is left clear.",
      "The ISBN on the cover matches the ISBN for this exact format.",
      "Spine text only if your book is thick enough (KDP: more than 79 pages).",
    ]],
    ["Before you upload", [
      "Same title, subtitle and author name on the cover, the title page and the printer's form.",
      "Interior and cover checked against your printer's rules (preflight).",
      "Order a printed proof copy and read it.",
    ]],
  ];
  const total = groups.reduce((n, [, items]) => n + items.length, 0);
  let id = 0;
  const faq = [
    ["What should I check before self-publishing my manuscript?", "Spelling and grammar, consistent names, front matter, page size and margins, embedded fonts, 300 DPI pictures, a cover sized from your final page count, and a matching ISBN. This free checklist covers all of it."],
    ["Is there a free grammar checker for my book?", "SparkPrep's free Interior Studio has a built-in spell check with red underlines. Its AI grammar and wording help comes with a SparkPrep book."],
    ["Can I print this checklist?", "Yes. Use the Print button on this page; your ticks are saved in your browser so you can come back."],
  ];
  const schema = [
    { "@type": "HowTo", name: "Manuscript checklist before self-publishing", description,
      step: groups.map(([n, items], i) => ({ "@type": "HowToStep", position: i + 1, name: n, text: items.join(" ") })) },
    crumbs([["SparkPrep", `${SITE}/`], ["Free manuscript checklist", `${SITE}${path}`]]),
    faqLd(faq),
  ];
  const body = `  <div class="eyebrow">Free checklist · Printable</div>
  <h1>Free Manuscript Checklist for Self-Published Authors</h1>
  <p class="lead">${total} checks that catch the mistakes readers notice and the problems printers reject. Tick them off as you go. Your ticks are saved on this device, and you can print the list.</p>
  <div class="progress no-print" aria-hidden="true"><div id="cl-bar"></div></div>
  <p class="note no-print"><span id="cl-done">0</span> of ${total} done · <a href="#" id="cl-print">Print this checklist</a> · <a href="#" id="cl-reset">Clear my ticks</a></p>

${groups.map(([n, items]) => `  <section class="card">
    <h2 style="margin-top:0">${esc(n)}</h2>
    <ul class="checklist">
${items.map((t) => { id += 1; return `      <li><input type="checkbox" id="c${id}"><label for="c${id}">${esc(t)}</label></li>`; }).join("\n")}
    </ul>
  </section>`).join("\n")}

  <div class="card no-print"><p style="margin:0">You can work through this list by hand. Or upload your files to SparkPrep and it checks the interior and cover items for you against your printer's own rules, in minutes. <a href="/audit">Check my files</a>.</p></div>

  <section class="cta">
    <h2>Let SparkPrep check the print side for you</h2>
    <p>The interior and cover checks above are exactly what SparkPrep tests: page size, margins, bleed, spine, safe area, fonts, image resolution, color and ink. It explains every problem in plain English and fixes what it can.</p>
    <a class="btn" href="/audit">Check my book files</a>
    <a class="btn ghost" href="/interior-studio">Free spell check in Interior Studio</a>
  </section>

${faqHtml(faq)}

  <h2>More free resources</h2>
  <ul class="links">
    <li><a href="/free-book-formatting-guide/">Free book formatting guide</a></li>
    <li><a href="/book-margin-calculator/">Book margin and bleed calculator</a></li>
    <li><a href="/book-spine-width-calculator/">Book spine width calculator</a></li>
    <li><a href="/free-indie-author-templates/">Free indie author templates</a></li>
  </ul>
<script>
(function(){var K="sp_checklist_v1",s={};try{s=JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){}
var boxes=[].slice.call(document.querySelectorAll(".checklist input"));
function save(){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}
function count(){var n=boxes.filter(function(b){return b.checked}).length;document.getElementById("cl-done").textContent=n;document.getElementById("cl-bar").style.width=(100*n/boxes.length)+"%"}
boxes.forEach(function(b){b.checked=!!s[b.id];b.addEventListener("change",function(){s[b.id]=b.checked;save();count()})});
document.getElementById("cl-print").addEventListener("click",function(e){e.preventDefault();window.print()});
document.getElementById("cl-reset").addEventListener("click",function(e){e.preventDefault();s={};save();boxes.forEach(function(b){b.checked=false});count()});
count()})();
</script>
`;
  return { path, html: page({ path, title, description, schema, body }) };
}

// ---------- Free indie author templates ----------
function authorTemplates() {
  const path = "/free-indie-author-templates/";
  const title = "Free Indie Author Templates: Book Covers, Interiors & Checklists | SparkPrep";
  const description = `Free templates for indie authors: ${TOTAL} book cover templates in ${realGenres.length} genres, book interior styles, a printable KDP cover template, a manuscript checklist and a formatting guide.`;
  const items = [
    ["Book cover templates", `${TOTAL} free full-wrap cover templates (front, spine and back) in ${realGenres.length} genres, sized to your exact book.`, "/templates/", "Browse cover templates"],
    ["Printable KDP cover template", "Enter your trim size, page count and paper to download a 300 DPI cover template showing the bleed, spine, safe area and barcode box.", "/kdp-cover-calculator/", "Make my cover template"],
    ["Book interior styles", "Import your Word file into Interior Studio and pick a book style. Margins are set to your printer's own rules, and you see real printed pages as you go.", "/interior-studio", "Open Interior Studio"],
    ["Manuscript checklist", "A printable checklist for grammar, front matter, interior, cover and the final checks before upload.", "/free-manuscript-checklist/", "Get the checklist"],
    ["Book formatting guide", "Step-by-step formatting for print, in plain English.", "/free-book-formatting-guide/", "Read the guide"],
    ["Free calculators", "Spine width, cover size, margins and bleed, image DPI, and word count to page count.", "/tools/", "See all free tools"],
  ];
  const faq = [
    ["Where can I get free book templates for KDP?", "SparkPrep has free cover templates sized for KDP, a printable KDP cover template generator, and a free interior layout tool. All are free to use."],
    ["Are these templates really free?", "Yes. Designing with the templates, fonts and tools is free. A free preview download is included; the print-ready files come with a SparkPrep book."],
    ["Do the templates work for IngramSpark too?", "Yes. Cover Studio and Interior Studio work for Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu, using each printer's own numbers."],
  ];
  const schema = [
    { "@type": "CollectionPage", name: "Free indie author templates", url: `${SITE}${path}`, description },
    { "@type": "ItemList", itemListElement: items.map(([n, , h], i) => ({ "@type": "ListItem", position: i + 1, name: n, url: `${SITE}${h}` })) },
    crumbs([["SparkPrep", `${SITE}/`], ["Free indie author templates", `${SITE}${path}`]]),
    faqLd(faq),
  ];
  const body = `  <div class="eyebrow">Free for indie authors</div>
  <h1>Free Indie Author Templates</h1>
  <p class="lead">Everything you need to turn a manuscript into a print book, free: cover templates, interior layouts, a printable cover template, a checklist and a formatting guide.</p>

${items.map(([n, d, h, b]) => `  <div class="card"><h2 style="margin-top:0"><a href="${h}">${esc(n)}</a></h2>
    <p>${esc(d)}</p><a class="btn ghost" href="${h}">${esc(b)}</a></div>`).join("\n")}

  <h2>Cover templates by genre</h2>
  <p class="chips">${realGenres.map(([k, l]) => `<a href="${genreUrl(k)}">${esc(l)} (${genreCount(k)})</a>`).join("")}</p>

  <section class="cta">
    <h2>Templates done? Make sure the printer says yes.</h2>
    <p>SparkPrep checks your cover and interior against Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu rules, explains every problem in plain English and fixes what it can. Built by an author whose own book was rejected 18 times.</p>
    <a class="btn" href="/audit">Check my book files</a>
  </section>

${faqHtml(faq)}
`;
  return { path, html: page({ path, title, description, schema, body }) };
}

// ---------- Write everything ----------
const pages = [templatesHub(), ...realGenres.map(([k, l]) => genrePage(k, l)), formattingGuide(), checklist(), authorTemplates()];
for (const p of pages) {
  const dir = new URL(`public${p.path}`, ROOT);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL("index.html", dir), p.html);
}
const sitemapUrl = new URL("public/sitemap.xml", ROOT);
let sitemap = readFileSync(sitemapUrl, "utf8");
const entry = (loc, pri) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${pri}</priority>\n  </url>\n`;
// Keep each page's lastmod unless its content changed: reuse the old date when the page was already listed.
const oldDates = Object.fromEntries([...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
const block = "  <!-- SEO-PAGES START (written by scripts/build-seo-pages.mjs) -->\n"
  + pages.map((p) => entry(p.path, p.path === "/templates/" || p.path.startsWith("/free-") ? "0.8" : "0.7")
    .replace(`<lastmod>${TODAY}</lastmod>`, `<lastmod>${oldDates[SITE + p.path] || TODAY}</lastmod>`)).join("")
  + "  <!-- SEO-PAGES END -->\n";
if (sitemap.includes("<!-- SEO-PAGES START")) sitemap = sitemap.replace(/  <!-- SEO-PAGES START[\s\S]*?<!-- SEO-PAGES END -->\n/, block);
else sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
writeFileSync(sitemapUrl, sitemap);
console.log(`seo-pages: ${pages.length} pages (${TOTAL} templates, ${realGenres.length} genres, ${FONT_COUNT} fonts)`);
