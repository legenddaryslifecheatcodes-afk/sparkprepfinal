# Builds the A.P.P.S. category pages (Trey, 2026-11-18):
#   /automated-publishing-production-system/          official definition (DefinedTerm + DefinedTermSet)
#   /apps-vs-traditional-publishing-software/          article: why an A.P.P.S. is different
# Run: python3 scripts/build-apps-pages.py .
# The OFFICIAL DEFINITION below is Trey's own wording. Keep it word for word; the plain-English
# explanation around it is ours. Keep the first-published date (2026-11-18) forever, it is the
# dated record that Legenddary SparkPrep introduced the category. Bump MODIFIED when you edit.
import json, html, os, sys

ROOT = sys.argv[1]
B = "https://sparkprep.legenddary.com"
BRAND = "Legenddary's SparkPrep"
PUBLISHED = "2026-11-18"
MODIFIED = "2026-11-18"
DEF_URL = B + "/automated-publishing-production-system/"
ART_URL = B + "/apps-vs-traditional-publishing-software/"
TERM_ID = DEF_URL + "#term"
SET_ID = DEF_URL + "#termset"

OFFICIAL = [
    "An Automated Publishing Production System (A.P.P.S.) is an integrated publishing technology platform that combines automated file analysis, intelligent error detection, corrective processing, independent verification, and creative production tools into a unified system designed to streamline the creation and technical preparation of books for publication.",
    "Unlike conventional publishing software that focuses on individual functions such as formatting, preflight inspection, prepress preparation, or cover design, an A.P.P.S. integrates multiple production capabilities into one coordinated environment.",
    "Its defining characteristic is the integration of intelligent automation and creative production capabilities across multiple stages of the publishing process.",
]
PIONEER = "Category Pioneer: Legenddary SparkPrep."

# 40-60 word answer-first version (featured-snippet / AI-answer target).
SHORT = ("An Automated Publishing Production System (A.P.P.S.) is one system that helps you make your book, "
         "checks its files against the printer's rules, fixes the problems and double-checks the fixes. "
         "Instead of separate tools for formatting, preflight, prepress and cover design, an A.P.P.S. does all of it "
         "in one place. Legenddary SparkPrep is the category pioneer.")

PARTS = [
    ("Automated file analysis", "It reads your whole cover and every inside page for you: size, spine, margins, colors, pictures and fonts."),
    ("Intelligent error detection", "It finds what would get your book rejected, like missing bleed, text too close to the edge, blurry pictures or too much ink, and shows you where."),
    ("Corrective processing", "It fixes what it safely can by itself, instead of only handing you a list of problems."),
    ("Independent verification", "A separate check looks at the fixed file again to confirm each fix really worked, before you upload."),
    ("Creative production tools", "It also helps you make the book: a cover designer, a page formatter and writing help, built into the same system."),
]

FAQ = [
    ("What is an Automated Publishing Production System (A.P.P.S.)?", SHORT),
    ("What does A.P.P.S. stand for?",
     "A.P.P.S. stands for Automated Publishing Production System. It is a kind of publishing software that brings making, checking, fixing and double-checking a book's files into one system, instead of using a separate tool for each job."),
    ("Is SparkPrep a formatter or a preflight checker?",
     "Neither, on its own. Formatting and preflight are two of the jobs SparkPrep does. Legenddary's SparkPrep is an Automated Publishing Production System: it also designs covers, fixes problems, double-checks its fixes and exports print-ready files for Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu."),
    ("Who created the A.P.P.S. category?",
     "Legenddary SparkPrep defined the Automated Publishing Production System (A.P.P.S.) as a product category and first published this definition on November 18, 2026. It was written by founder Joshua Davis. SparkPrep is the category pioneer."),
    ("Do I need an A.P.P.S. for my first book?",
     "You don't need one, but it saves time and money. Without one, a first-time author often juggles a cover designer, a formatter, a file checker and a freelancer. An A.P.P.S. does those jobs in one place and checks your files before KDP or IngramSpark ever sees them."),
]

def e(s): return html.escape(s, quote=True)

ORG = {"@id": B + "/#org"}
AUTHOR = {"@type": "Person", "name": "Joshua Davis", "jobTitle": "Founder", "worksFor": ORG}

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="author" content="Joshua Davis">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Legenddary's SparkPrep">
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{B}/brand/sparkprep-og.jpg">
<meta property="article:published_time" content="{pub}">
<meta property="article:modified_time" content="{mod}">
<meta property="article:author" content="Joshua Davis">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/tools/tools.css">
<style>
  .def {{ border-left: 3px solid #d4af37; background: rgba(212,175,55,.07); padding: 18px 20px; margin: 18px 0; }}
  .def p {{ margin: 0 0 12px; }}
  .def p:last-child {{ margin: 0; }}
  .pos {{ text-align: center; padding: 26px 16px; margin: 26px 0; border: 1px solid rgba(212,175,55,.35); }}
  .pos .k {{ letter-spacing: .22em; font-size: 13px; color: #d4af37; text-transform: uppercase; }}
  .pos .h {{ font-size: 26px; font-weight: 800; margin: 8px 0; }}
  .pos p {{ margin: 6px 0; }}
  .byline {{ font-size: 14px; opacity: .8; margin: -6px 0 18px; }}
</style>
<script type="application/ld+json">{schema}</script>
</head>
<body>
<header class="site">
  <a class="brand" href="/"><img src="/brand/sparkprep-logo-480.png" alt="Legenddary's SparkPrep logo" width="84" height="56"></a>
  <nav><a href="/templates/">Templates</a><a class="hide-sm" href="/tools/">Free tools</a><a class="hide-sm" href="/guides/">Guides</a><a href="/">SparkPrep</a></nav>
</header>
<main>
'''

FOOT = '''  <p class="note">SparkPrep is an independent tool and is not affiliated with Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu. Each printer makes the final call on every file.</p>
</main>
<footer class="site">© Legenddary's SparkPrep, a <a href="https://legenddary.com/">Legenddary</a> product · <a href="/">Home</a><a href="/automated-publishing-production-system/">What is an A.P.P.S.?</a><a href="/answers/">Answers</a><a href="/about/">About</a><a href="/tools/">Free tools</a><a href="/guides/">Guides</a><a href="/pricing">Pricing</a></footer>
</body>
</html>
'''

POSITIONING = '''  <div class="pos">
    <div class="k">Legenddary SparkPrep</div>
    <div class="h">The Automated Publishing Production System.</div>
    <p><strong>Beyond formatting. Beyond preflight. Beyond prepress.</strong></p>
    <p>One integrated system. Multiple production capabilities. A smarter way to publish.</p>
    <p class="note" style="margin-top:10px">The Evolution of Self-Publishing · Power without complexity</p>
  </div>
'''

def crumbs(name, url):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "SparkPrep", "item": B + "/"},
        {"@type": "ListItem", "position": 2, "name": name, "item": url}]}

def faq_ld(url, items):
    return {"@type": "FAQPage", "@id": url + "#faq", "url": url,
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(text)

# ---------------- 1. Definition page ----------------
d_title = "What Is an Automated Publishing Production System (A.P.P.S.)? | Legenddary's SparkPrep"
d_desc = ("The official definition of an Automated Publishing Production System (A.P.P.S.): one system that makes, checks, "
          "fixes and double-checks book files. Category pioneer: Legenddary SparkPrep.")
term = {
    "@type": "DefinedTerm", "@id": TERM_ID,
    "name": "Automated Publishing Production System",
    "alternateName": ["A.P.P.S.", "Automated Publishing Production System (A.P.P.S.)"],
    "termCode": "A.P.P.S.",
    "description": " ".join(OFFICIAL),
    "url": DEF_URL,
    "inDefinedTermSet": {"@id": SET_ID},
    "subjectOf": {"@id": ART_URL + "#article"},
}
d_schema = {"@context": "https://schema.org", "@graph": [
    {"@type": "DefinedTermSet", "@id": SET_ID, "name": "Legenddary SparkPrep publishing terms",
     "url": DEF_URL, "publisher": ORG, "creator": ORG, "hasDefinedTerm": {"@id": TERM_ID}},
    term,
    {"@type": ["WebPage", "Article"], "@id": DEF_URL + "#page", "url": DEF_URL,
     "headline": "What is an Automated Publishing Production System (A.P.P.S.)?",
     "name": "Automated Publishing Production System (A.P.P.S.): official definition",
     "description": d_desc, "inLanguage": "en",
     "datePublished": PUBLISHED, "dateModified": MODIFIED,
     "author": AUTHOR, "publisher": ORG, "copyrightHolder": ORG,
     "about": {"@id": TERM_ID}, "mainEntity": {"@id": TERM_ID},
     "image": B + "/brand/sparkprep-og.jpg", "isPartOf": {"@id": B + "/#website"}},
    {"@type": "SoftwareApplication", "@id": B + "/#app", "name": BRAND,
     "applicationCategory": "BusinessApplication",
     "applicationSubCategory": "Automated Publishing Production System (A.P.P.S.)",
     "operatingSystem": "Web", "url": B + "/", "publisher": ORG, "about": {"@id": TERM_ID}},
    faq_ld(DEF_URL, FAQ),
    crumbs("What is an A.P.P.S.?", DEF_URL),
]}

parts_rows = "\n".join(f"      <tr><td><strong>{e(n)}</strong></td><td>{e(t)}</td></tr>" for n, t in PARTS)
faq_html = "\n".join(f'  <h3>{e(q)}</h3>\n  <p>{e(a)}</p>' for q, a in FAQ)
d_body = f'''  <div class="eyebrow">Official definition · First published November 18, 2026</div>
  <h1>What is an Automated Publishing Production System (A.P.P.S.)?</h1>
  <p class="byline">By <a href="/about/">Joshua Davis</a>, founder of Legenddary SparkPrep · Published <time datetime="{PUBLISHED}">November 18, 2026</time></p>

  <div class="card" id="answer"><p style="margin:0"><strong>Short answer:</strong> {e(SHORT)}</p></div>

  <h2>The official definition</h2>
  <div class="def" id="definition">
    <p><strong>A.P.P.S.</strong> &mdash; Automated Publishing Production System</p>
{chr(10).join(f"    <p>{e(p)}</p>" for p in OFFICIAL)}
    <p><strong>{e(PIONEER)}</strong></p>
  </div>

  <h2>What that means in plain English</h2>
  <p>Most publishing software does one job. One app formats your pages. Another makes covers. Another checks your file. You move your book from tool to tool and hope nothing breaks along the way. An A.P.P.S. puts those jobs in one system that works together, and it does five things:</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Part</th><th>What it does for you</th></tr></thead>
    <tbody>
{parts_rows}
    </tbody>
  </table></div>
  <p>If a tool only does one or two of these, it is a formatter, a checker or a design app. An A.P.P.S. does all five, in one place.</p>

{POSITIONING}
  <h2>How Legenddary SparkPrep works as an A.P.P.S.</h2>
  <ul>
    <li><strong>Make it:</strong> Cover Studio (free cover designer, 224 templates) and Interior Studio (free page formatter with Word import), plus AI writing help.</li>
    <li><strong>Check it:</strong> the whole cover and every inside page against the rules of Amazon KDP, IngramSpark, Barnes &amp; Noble Press and Lulu: trim size, bleed, margins, spine width, colors, the 240% ink limit, picture sharpness and fonts.</li>
    <li><strong>Fix it:</strong> SparkPrep fixes what it safely can, and tells you plainly when something needs new art.</li>
    <li><strong>Double-check it:</strong> each repair is checked again by a separate step before it is accepted.</li>
    <li><strong>Export it:</strong> print-ready PDF/X-1a files, and the SparkPrep Certified report when every check passes.</li>
  </ul>

  <h2>Where this term comes from</h2>
  <p>Legenddary SparkPrep defined the Automated Publishing Production System (A.P.P.S.) as a product category and first published this definition here on <time datetime="{PUBLISHED}">November 18, 2026</time>. The definition was written by founder Joshua Davis. Other companies use words like "automated publishing" for their own software; this page is the definition of A.P.P.S. as a category, and the version to cite.</p>
  <div class="card"><p style="margin:0"><strong>How to cite:</strong> "Automated Publishing Production System (A.P.P.S.)." Legenddary SparkPrep, November 18, 2026. {DEF_URL}</p></div>

  <h2>Common questions</h2>
{faq_html}

  <h2>Read next</h2>
  <ul class="links">
    <li><a href="/apps-vs-traditional-publishing-software/">Why an A.P.P.S. is different from traditional publishing software</a></li>
    <li><a href="/how-to-self-publish-a-book/">How to self publish a book: 7 simple steps</a></li>
    <li><a href="/book-formatting/">Book formatting for KDP and IngramSpark</a></li>
    <li><a href="/guides/what-is-preflight-first-time-authors/">What is preflight? A first-time author's guide</a></li>
    <li><a href="/about/">About Legenddary's SparkPrep</a></li>
  </ul>

  <section class="cta">
    <h2>See an A.P.P.S. check your book, free</h2>
    <p>Upload your cover or inside pages. SparkPrep shows every problem, where it is and the printer rule it breaks. Free through December 31, 2026. No sign-up.</p>
    <a class="btn" href="/audit" data-next-step="Start here">Check my book for free</a>
    <a class="btn ghost" href="/apps-vs-traditional-publishing-software/">Why it's different</a>
  </section>
'''
write(ROOT + "/public/automated-publishing-production-system/index.html",
      HEAD.format(title=e(d_title), desc=e(d_desc), url=DEF_URL, B=B, pub=PUBLISHED, mod=MODIFIED,
                  ogtitle=e("What is an Automated Publishing Production System (A.P.P.S.)?"),
                  schema=json.dumps(d_schema, ensure_ascii=False)) + d_body + FOOT)

# ---------------- 2. Article ----------------
a_title = "A.P.P.S. vs Traditional Publishing Software: What's Different | Legenddary's SparkPrep"
a_desc = ("Formatters, preflight checkers and cover apps each do one job. An Automated Publishing Production System (A.P.P.S.) "
          "makes, checks, fixes and double-checks your book in one place. Here's why that matters.")
A_FAQ = [
    ("How is an A.P.P.S. different from a book formatter?",
     "A book formatter lays out your pages. An Automated Publishing Production System (A.P.P.S.) also designs the cover, checks both files against the printer's rules, fixes the problems it finds and double-checks every fix, all in one system."),
    ("Is an A.P.P.S. the same as a preflight checker?",
     "No. A preflight checker only tells you what is wrong. An A.P.P.S. includes a preflight check, then fixes what it safely can, checks the fixed file again and gives you print-ready files."),
]
a_schema = {"@context": "https://schema.org", "@graph": [
    {"@type": "Article", "@id": ART_URL + "#article", "url": ART_URL, "mainEntityOfPage": ART_URL,
     "headline": "Why an A.P.P.S. is different from traditional publishing software",
     "description": a_desc, "inLanguage": "en",
     "datePublished": PUBLISHED, "dateModified": MODIFIED,
     "author": AUTHOR, "publisher": ORG, "image": B + "/brand/sparkprep-og.jpg",
     "about": {"@id": TERM_ID},
     "mentions": [{"@id": TERM_ID}, {"@id": B + "/#org"}],
     "isPartOf": {"@id": B + "/#website"}},
    faq_ld(ART_URL, A_FAQ),
    crumbs("A.P.P.S. vs traditional publishing software", ART_URL),
]}
cmp_rows = [
    ("Making the cover", "A design app, or a freelancer", "Built in (Cover Studio)"),
    ("Laying out the pages", "A formatter or Word", "Built in (Interior Studio)"),
    ("Checking printer rules", "A separate checker, if you know you need one", "Built in, cover and every page"),
    ("Fixing what's wrong", "You, by hand, or back to the freelancer", "Fixed for you where it's safe"),
    ("Making sure the fix worked", "Upload again and wait for the printer", "Checked again before you upload"),
    ("Who keeps it all lined up", "You", "The system"),
]
cmp_html = "\n".join(f"      <tr><td><strong>{e(a)}</strong></td><td>{e(b)}</td><td>{e(c)}</td></tr>" for a, b, c in cmp_rows)
a_faq_html = "\n".join(f'  <h3>{e(q)}</h3>\n  <p>{e(a)}</p>' for q, a in A_FAQ)
a_body = f'''  <div class="eyebrow">Article · The A.P.P.S. category</div>
  <h1>Why an A.P.P.S. is different from traditional publishing software</h1>
  <p class="byline">By <a href="/about/">Joshua Davis</a>, founder of Legenddary SparkPrep · Published <time datetime="{PUBLISHED}">November 18, 2026</time></p>

  <div class="card" id="answer"><p style="margin:0"><strong>Short answer:</strong> Traditional publishing software does one job at a time: format, check, prepare for print or design a cover. An Automated Publishing Production System (A.P.P.S.) does all of those jobs in one system, fixes problems for you and double-checks every fix, so your book files are ready before the printer sees them.</p></div>

  <h2>The old way: one tool for every job</h2>
  <p>If you are publishing your first book, here is what usually happens. You write in Word. You make a cover in a design app or pay a designer. You format the pages in another program or pay a formatter. Then you upload to Amazon KDP or IngramSpark and wait.</p>
  <p>If something is wrong, the printer sends your book back with words you may never have heard: bleed, safety area, ink coverage, PDF/X-1a. Now you have to work out which tool caused it, fix it there and try again. Each tool only knows its own job. None of them looks at the whole book the way the printer does. <strong>You</strong> end up being the person who holds it all together.</p>
  <p>That is how SparkPrep started. Founder Joshua Davis's own book, <em>Legenddary Mindset: The Awakening</em>, was sent back 18 times.</p>

  <h2>What traditional tools are good at, and where they stop</h2>
  <ul>
    <li><strong>Formatters</strong> lay out your pages. Most don't check your cover or your printer's ink rules.</li>
    <li><strong>Preflight checkers</strong> tell you what is wrong. They usually don't fix it.</li>
    <li><strong>Prepress tools</strong> (like Adobe Acrobat Pro) can fix print problems, but they are made for professionals and take skill to use safely.</li>
    <li><strong>Cover design apps</strong> make beautiful covers, but a cover can look perfect on screen and still have no bleed or the wrong spine width.</li>
    <li><strong>Freelancers</strong> can do it all for you, at a price. Reedsy reports a median of about $930 for a professional cover and an average of about $800 for interior formatting, and it often takes several weeks.</li>
  </ul>
  <p>None of these are bad. They just each do one piece, and the gaps between them are where books get rejected.</p>

  <h2>The A.P.P.S. way: one system that works together</h2>
  <p>An <a href="/automated-publishing-production-system/">Automated Publishing Production System (A.P.P.S.)</a> brings the pieces together. It helps you make the book, checks it, fixes it and checks the fix, in one place, so nothing gets lost between tools.</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Job</th><th>Traditional software</th><th>An A.P.P.S.</th></tr></thead>
    <tbody>
{cmp_html}
    </tbody>
  </table></div>

  <h2>Why it matters for a first-time author</h2>
  <ul>
    <li><strong>You don't have to learn printer language first.</strong> The system knows KDP's and IngramSpark's rules and explains each problem in plain English.</li>
    <li><strong>Fewer rejections.</strong> Problems are caught before upload, not after. KDP says a book, or each fix, takes about 3 business days to go live, so every rejection costs you days.</li>
    <li><strong>One place to go back to.</strong> Change your page count and the spine changes too. In an A.P.P.S. the cover and pages live together, so it can tell you.</li>
    <li><strong>Less money spent on rounds of changes.</strong> You fix your own book, on your own schedule.</li>
  </ul>

  <h2>What an A.P.P.S. doesn't do</h2>
  <p>It won't write your book for you, and it can't promise the printer will accept it: KDP and IngramSpark always make the final call. What it does is make sure your files follow their published rules before you upload, and tell you honestly when something, like a picture that's too small, needs new art from you.</p>

{POSITIONING}
  <h2>Common questions</h2>
{a_faq_html}

  <h2>Read next</h2>
  <ul class="links">
    <li><a href="/automated-publishing-production-system/">The official A.P.P.S. definition</a></li>
    <li><a href="/guides/sparkprep-vs-hiring-a-freelancer/">SparkPrep vs hiring a freelancer</a></li>
    <li><a href="/guides/sparkprep-vs-vellum-atticus/">SparkPrep vs Vellum and Atticus</a></li>
    <li><a href="/how-to-self-publish-a-book/">How to self publish a book: 7 simple steps</a></li>
  </ul>

  <section class="cta">
    <h2>Try it on your own book, free</h2>
    <p>Upload your cover or inside pages and see every problem, where it is and the printer rule it breaks. Free through December 31, 2026. No sign-up.</p>
    <a class="btn" href="/audit" data-next-step="Start here">Check my book for free</a>
    <a class="btn ghost" href="/automated-publishing-production-system/">Read the definition</a>
  </section>
'''
write(ROOT + "/public/apps-vs-traditional-publishing-software/index.html",
      HEAD.format(title=e(a_title), desc=e(a_desc), url=ART_URL, B=B, pub=PUBLISHED, mod=MODIFIED,
                  ogtitle=e("Why an A.P.P.S. is different from traditional publishing software"),
                  schema=json.dumps(a_schema, ensure_ascii=False)) + a_body + FOOT)
print("built 2 A.P.P.S. pages")
