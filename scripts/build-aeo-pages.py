# Builds the question-first AEO pages: /how-to-self-publish-a-book/ and /book-formatting/.
# Run: python3 scripts/build-aeo-pages.py .   Edit the PAGES data below, not the HTML.
import json, html, os, sys
ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
B = "https://sparkprep.legenddary.com"
BRAND = "Legenddary's SparkPrep"
TODAY = "2026-11-15"
def e(s): return html.escape(s, quote=True)

PAGES = [
{
 "slug": "how-to-self-publish-a-book",
 "title": "How to Self Publish a Book in 2026: 7 Simple Steps for Beginners | " + BRAND,
 "desc": "Self publish your first book on Amazon KDP and IngramSpark in 7 plain-English steps: what it costs, how long it takes and how to avoid a rejection.",
 "eyebrow": "Step-by-step guide · Updated November 15, 2026",
 "h1": "How to self publish a book: 7 simple steps",
 "lead": "Never published before? Here is the whole process in plain words, from finished manuscript to a book for sale on Amazon and in bookstores.",
 "answer_q": "How do I self publish a book?",
 "answer": "Finish and edit your book, pick your trim size, format the inside pages as a PDF, make a full wrap cover sized to your page count, check both files against your printer's rules, then upload them free to Amazon KDP or IngramSpark. Order a proof copy, then publish.",
 "steps": [
  ("Finish your book and get it edited", "Write it all the way through, then fix it up. Have at least one other person read it. Run a spell check and use our free <a href=\"/free-manuscript-checklist/\">manuscript checklist</a>."),
  ("Pick your book size (trim size)", "Trim size is how big your printed book will be. Many novels are 6 x 9 inches or 5.5 x 8.5 inches. Pick it before you set up your pages, because changing it later means redoing everything."),
  ("Format the inside of your book", "Formatting means getting your pages ready to print: page size, margins (including the inside margin, called the gutter), page numbers, chapter starts and fonts. You can do it in Word, Google Docs, Kindle Create or our free <a href=\"/interior-studio\">Interior Studio</a>. Save it as a PDF with every font embedded. See <a href=\"/book-formatting/\">book formatting</a>."),
  ("Make your cover", "A print cover is one file: back cover, spine and front cover together, called a full wrap cover. The spine width depends on your page count and paper, so finish your pages first. Use the free <a href=\"/book-spine-width-calculator/\">spine width calculator</a> or <a href=\"/cover-studio\">Cover Studio</a>."),
  ("Check your whole book before you upload", "This is the step most first-time authors skip, and it is why so many books get sent back. Printers check things you can't see on screen: bleed, the safe zone, embedded fonts, 300 DPI pictures, CMYK color and the cover size. A <a href=\"/guides/what-is-preflight-first-time-authors/\">preflight check</a> catches them first."),
  ("Upload to Amazon KDP and IngramSpark", "Amazon KDP (kdp.amazon.com) is free to upload and sells on Amazon. It can give you a free ISBN. IngramSpark (ingramspark.com) gets your book into bookstores and libraries and works best with your own ISBN. Many authors use both."),
  ("Order a proof copy, then publish", "Order one printed copy and look it over before you go live. KDP says it takes about 3 business days for a book to go live after you submit it."),
 ],
 "sections": [
  ("How much does it cost to self publish a book?",
   "<p>Uploading to Amazon KDP is free. Amazon takes its share and the printing cost when a copy sells. Where the money goes is getting your files ready:</p><ul><li><strong>Do it yourself:</strong> free, but you risk rejections and weeks of trial and error.</li><li><strong>Hire freelancers:</strong> Reedsy's figures put a professional cover at a median of about $930 and interior formatting at about $800, roughly $1,730 for both.</li><li><strong>Legenddary's SparkPrep:</strong> the book file audit is free through December 31, 2026. Fixing and print-ready files cost far less than freelancers. See <a href=\"/pricing\">current prices</a>.</li></ul>"),
  ("Why do self-published books get rejected?",
   "<p>Almost always for one of these file problems:</p><ol><li>The cover is the wrong size, usually because the spine doesn't match the page count.</li><li>Text sits outside the safe zone, too close to the edge.</li><li>Fonts aren't embedded in the PDF.</li><li>Pictures are under 300 DPI.</li><li>The page size doesn't match the trim size you picked.</li></ol><p>Each one has a <a href=\"/guides/\">step-by-step fix guide</a>.</p>"),
 ],
 "faq": [
  ("Is it free to self publish a book on Amazon?", "Yes. Uploading to Amazon KDP is free. Amazon takes its share and the printing cost for paperbacks when a copy sells."),
  ("Do I need an ISBN to self publish?", "Not for Amazon. KDP can give you a free ISBN. For IngramSpark and bookstores it is best to buy your own, which in the US comes from Bowker."),
  ("How long does it take to self publish a book?", "Once your book is written and edited, you can be ready to upload in a day or two if your files pass the printer's checks. KDP says about 3 business days to go live. Rejections and fixes are what stretch it into weeks."),
  ("What is the easiest way to self publish a book?", "Upload to Amazon KDP, and check your cover and pages against KDP's rules before you upload so they don't get sent back. Legenddary's SparkPrep, an Automated Publishing Production System (A.P.P.S.), was built to make that part simple."),
 ],
 "cta": ("Check your book before you upload", "Upload your cover or pages. SparkPrep checks them against KDP and IngramSpark rules and explains every problem in plain English. Free through December 31, 2026. No sign-up.", "/audit", "Check my book for free"),
},
{
 "slug": "book-formatting",
 "title": "Book Formatting for KDP & IngramSpark | " + BRAND,
 "desc": "What book formatting covers inside and on the cover, what a formatter costs, and how to check your formatting against KDP and IngramSpark rules for free.",
 "eyebrow": "Book formatting · Updated November 15, 2026",
 "h1": "Book formatting for KDP and IngramSpark, in plain English",
 "lead": "Formatting is what turns your manuscript into a file a printer will accept. Here is what it covers, what it costs, and how to know if yours is right.",
 "answer_q": "What is book formatting?",
 "answer": "Book formatting means setting up your book file so a printer can print it: the right trim size, margins and gutter, embedded fonts, 300 DPI pictures, page numbers and chapter starts, plus a cover with the right spine width and bleed. If any of it is off, Amazon KDP or IngramSpark sends your book back.",
 "steps": None,
 "sections": [
  ("Is something wrong with your book's formatting?",
   "<p>If you've seen any of these, it's a formatting problem, and it can be fixed:</p><ul><li>KDP or IngramSpark rejected your book or sent it back</li><li>KDP says your cover is the wrong size (<a href=\"/guides/fix-cover-wrong-size/\">fix</a>)</li><li>Your text is too close to the edge (<a href=\"/guides/fix-kdp-margin-error/\">fix</a>)</li><li>A message says a font isn't embedded (<a href=\"/guides/fix-font-not-embedded/\">fix</a>)</li><li>Your pictures look blurry (<a href=\"/guides/fix-low-resolution-images/\">fix</a>)</li><li>Your page count in Word doesn't match your PDF (<a href=\"/guides/word-page-count-vs-pdf-page-count/\">why</a>)</li></ul>"),
  ("What book formatting covers",
   "<p><strong>Inside your book (interior)</strong></p><ul><li>Page size that matches your trim size, like 6 x 9 inches</li><li>Margins, including the inside margin near the spine (the gutter), which grows with page count on KDP</li><li>Fonts embedded in the PDF</li><li>Pictures at 300 DPI, grayscale in a black and white book</li><li>Page numbers, chapter starts and front matter</li></ul><p><strong>Your cover (exterior)</strong></p><ul><li>The full wrap: back cover, spine and front cover as one file</li><li>Spine width that matches your page count and paper</li><li>Bleed: 0.125 inch of extra art past each trimmed edge</li><li>Text inside the safe zone so nothing gets cut off</li><li>A clear area for the barcode and ISBN</li></ul>"),
  ("Your options, and what they really cost",
   "<ul><li><strong>Do it yourself</strong> in Word, Google Docs or Kindle Create: free, but it's easy to miss the problems that get books rejected.</li><li><strong>Hire a book formatter:</strong> Reedsy reports an average of about $800 for interior formatting, plus about $930 (median) for a cover. Expect to wait on someone else's schedule.</li><li><strong>Formatting software</strong> like Vellum or Atticus: a one-time purchase, but you still have to learn it, and it doesn't check your cover against the printer's rules.</li><li><strong>Legenddary's SparkPrep:</strong> an <a href=\"/automated-publishing-production-system/\">Automated Publishing Production System</a> (A.P.P.S.) with a free <a href=\"/interior-studio\">Interior Studio</a> and <a href=\"/cover-studio\">Cover Studio</a>, a free audit through December 31, 2026, and <a href=\"/fix-my-file/\">fix my file</a> for $29 for one file or $49 for both, paid after you see the preview.</li></ul>"),
 ],
 "faq": [
  ("How much does book formatting cost?", "Reedsy reports an average of about $800 for professional interior formatting. Doing it yourself is free. Legenddary's SparkPrep's audit is free through December 31, 2026, and its fix-my-file service is $29 for one file or $49 for both."),
  ("Can I format my book for free?", "Yes, with Word, Google Docs, Amazon's free Kindle Create or SparkPrep's free Interior Studio. The hard part is knowing if it will pass the printer's checks, which is what a free audit tells you."),
  ("Do I need a book formatter?", "Not always. A mostly-text book can often be formatted yourself and then checked. If you want it handled for you, a formatter or SparkPrep's fix service can do it."),
  ("Does book formatting work the same for KDP and IngramSpark?", "Mostly, but not exactly. IngramSpark asks for a 0.5 inch safety margin, a 240% ink limit and PDF/X-1a files, and its spine width differs from KDP's. Check each file against each printer's own rules."),
 ],
 "cta": ("See if your formatting will pass", "Upload your pages or cover and SparkPrep checks them against KDP and IngramSpark rules, then shows you exactly what to fix. Free through December 31, 2026. No sign-up.", "/audit", "Check my formatting for free"),
},
]

# "Keep going" links. A page never links to itself; the beginner guides go first (2026-11-20).
def keep_going(slug):
    links = [
        ("how-to-self-publish-a-book", "/how-to-self-publish-a-book/", "How to self publish a book: 7 steps"),
        ("book-formatting", "/book-formatting/", "Book formatting for KDP and IngramSpark"),
        ("", "/guides/what-is-preflight-first-time-authors/", "New to this? Why your book needs a check before you upload"),
        ("", "/guides/do-i-need-an-isbn-to-self-publish/", "Do you need an ISBN to self-publish?"),
        ("", "/guides/what-is-bleed-in-book-printing/", "What is bleed in printing?"),
    ]
    return "\n".join(f'    <li><a href="{h}">{e(t)}</a></li>' for s, h, t in links if s != slug)

def build(p):
    url = f"{B}/{p['slug']}/"
    graph = [
     {"@type":"WebPage","@id":url+"#page","url":url,"name":p["h1"],"description":p["desc"],"dateModified":TODAY,
      "isPartOf":{"@id":B+"/#website"},"publisher":{"@id":B+"/#org"},"inLanguage":"en-US"},
     {"@type":"FAQPage","@id":url+"#faq","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in [(p["answer_q"],p["answer"])]+p["faq"]]},
     {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":BRAND,"item":B+"/"},{"@type":"ListItem","position":2,"name":p["h1"],"item":url}]},
    ]
    import re
    strip = lambda s: re.sub(r"<[^>]+>","",s)
    if p["steps"]:
        graph.append({"@type":"HowTo","name":p["h1"],"description":p["answer"],
          "step":[{"@type":"HowToStep","position":i+1,"name":n,"text":strip(t),"url":f"{url}#step-{i+1}"} for i,(n,t) in enumerate(p["steps"])]})
    out = [f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(p["title"])}</title>
<meta name="description" content="{e(p["desc"])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="{e(BRAND)}">
<meta property="og:title" content="{e(p["title"])}">
<meta property="og:description" content="{e(p["desc"])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{B}/brand/sparkprep-og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/tools/tools.css">
<script type="application/ld+json">{json.dumps({"@context":"https://schema.org","@graph":graph}, ensure_ascii=False)}</script>
</head>
<body>
<header class="site">
  <a class="brand" href="/"><img src="/brand/sparkprep-logo-480.png" alt="{e(BRAND)} logo" width="84" height="56"></a>
  <nav><a href="/templates/">Templates</a><a class="hide-sm" href="/tools/">Free tools</a><a class="hide-sm" href="/guides/">Guides</a><a href="/">SparkPrep</a></nav>
</header>
<main>
  <div class="eyebrow">{e(p["eyebrow"])}</div>
  <h1>{e(p["h1"])}</h1>
  <p class="lead">{e(p["lead"])}</p>
  <div class="card" id="answer"><p style="margin:0"><strong>{e(p["answer_q"])}</strong> {e(p["answer"])}</p></div>
''']
    if p["steps"]:
        out.append('  <h2>The 7 steps</h2>\n')
        for i,(n,t) in enumerate(p["steps"]):
            out.append(f'  <section class="card" id="step-{i+1}"><h3 style="margin-top:0">Step {i+1}: {e(n)}</h3><p style="margin-bottom:0">{t}</p></section>\n')
    for h,body in p["sections"]:
        out.append(f'  <h2>{e(h)}</h2>\n  {body}\n')
    c = p["cta"]
    out.append(f'''  <section class="cta">
    <h2>{e(c[0])}</h2>
    <p>{e(c[1])}</p>
    <a class="btn" href="{c[2]}">{e(c[3])}</a>
    <a class="btn ghost" href="/answers/">More quick answers</a>
  </section>
  <h2>Common questions</h2>
''')
    for q,a in p["faq"]:
        out.append(f'  <h3>{e(q)}</h3>\n  <p>{e(a)}</p>\n')
    out.append(f'''  <h2>Keep going</h2>
  <ul class="links">
{keep_going(p["slug"])}
    <li><a href="/guides/self-publishing-on-amazon-pros-and-cons/">Self-publishing on Amazon: pros and cons</a></li>
    <li><a href="/guides/ingramspark-promo-code-and-fees/">What IngramSpark costs in 2026 (and promo codes)</a></li>
    <li><a href="/guides/barnes-and-noble-self-publishing/">Barnes and Noble self-publishing, explained</a></li>
    <li><a href="/answers/">Self-publishing questions, answered in plain English</a></li>
    <li><a href="/free-manuscript-checklist/">Free manuscript checklist</a></li>
    <li><a href="/book-spine-width-calculator/">Book spine width calculator</a></li>
    <li><a href="/guides/">Fix guides for KDP and IngramSpark rejections</a></li>
  </ul>
  <p class="note">{e(BRAND)}: the evolution of self-publishing. Power without complexity. SparkPrep is an independent tool and is not affiliated with Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu.</p>
</main>
<footer class="site">© {e(BRAND)}, a <a href="https://legenddary.com/">Legenddary</a> product · <a href="/">Home</a><a href="/answers/">Answers</a><a href="/about/">About</a><a href="/tools/">Free tools</a><a href="/guides/">Guides</a><a href="/pricing">Pricing</a></footer>
</body>
</html>
''')
    d = os.path.join(ROOT, "public", p["slug"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write("".join(out))
    print("wrote", p["slug"], "answer words:", len(p["answer"].split()))

for p in PAGES: build(p)
