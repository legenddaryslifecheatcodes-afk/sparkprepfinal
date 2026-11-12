import json, html, sys
ROOT = sys.argv[1]
B = "https://sparkprep.legenddary.com"
QA = [
 ("check-before-kdp","How do I check my book file before I upload it to KDP?",
  "Check five things before you upload: the page size matches your trim size, the cover art runs 0.125 inch past every edge (bleed), text stays inside the margins, every picture is 300 DPI, and every font is built into the PDF. SparkPrep's free audit checks all of this for you in minutes.",
  [("/audit","Free book file audit"),("/free-manuscript-checklist/","Free manuscript checklist")]),
 ("free-kdp-checker","Is there a free KDP file checker?",
  "Yes. Through December 31, 2026, SparkPrep's book file audit is free with no sign-up. Upload your cover or inside pages and it shows every problem that could get your book rejected by Amazon KDP or IngramSpark, where it is, and the rule it breaks.",
  [("/audit","Start the free audit")]),
 ("kdp-rejected","Why did KDP reject my book?",
  "Most KDP rejections come from a few file problems: art that doesn't reach into the bleed, text too close to the edge, a cover that's the wrong size for your page count, blurry pictures under 300 DPI, or fonts that aren't embedded. The rejection email names the problem; each one has a short fix.",
  [("/guides/fix-cover-bleed-error/","Fix a bleed error"),("/guides/fix-kdp-margin-error/","Fix a KDP margin error"),("/guides/fix-cover-wrong-size/","Fix a wrong cover size")]),
 ("ingramspark-rejected","Why did IngramSpark reject my file?",
  "IngramSpark is stricter than KDP. The most common reasons are text outside its 0.5 inch safety area, dark areas with more than 240% total ink, screen colors (RGB) in a black and white interior, a file that isn't PDF/X-1a, and an ISBN on the cover that doesn't match the title.",
  [("/ingramspark-rejection-fixes/","IngramSpark rejection fixes"),("/guides/fix-ink-coverage-240/","Fix the 240% ink limit"),("/guides/fix-ingramspark-interior-safety-area/","Fix the safety area error")]),
 ("what-is-preflight","What is a book preflight check?",
  "A preflight check looks at your cover and inside pages the same way the printer will, before you upload them. It checks page size, bleed, margins, spine width, colors, ink, picture sharpness and fonts, so you fix problems first instead of waiting for a rejection email.",
  [("/guides/what-is-preflight-first-time-authors/","What is preflight? A first-time author's guide")]),
 ("what-is-bleed","What is bleed on a book cover?",
  "Bleed is extra art that runs past the edge of your cover, because the printer trims the edge off. For KDP and IngramSpark paperbacks the bleed is 0.125 inch on every outside edge. Without it, a thin white line can show on the printed book.",
  [("/guides/fix-cover-bleed-error/","Fix a bleed error"),("/kdp-cover-calculator/","KDP cover size calculator")]),
 ("spine-width","How wide should my book spine be?",
  "Spine width depends on your page count and paper. On KDP, white paper is page count times 0.002252 inch and cream paper is page count times 0.0025 inch, so a 300-page book on white paper has a 0.676 inch spine. KDP only allows spine text on books with more than 79 pages.",
  [("/book-spine-width-calculator/","Free spine width calculator")]),
 ("kdp-margins","What margins does KDP require?",
  "KDP's inside (gutter) margin grows with page count: 0.375 inch for 24 to 150 pages, 0.5 inch for 151 to 300, 0.625 inch for 301 to 500, 0.75 inch for 501 to 700 and 0.875 inch above that. Outside margins must be at least 0.25 inch, or 0.375 inch with bleed.",
  [("/book-margin-calculator/","Free book margin calculator"),("/guides/fix-kdp-margin-error/","Fix a KDP margin error")]),
 ("dpi","What resolution do pictures in a printed book need?",
  "Pictures in a printed book need 300 DPI at the size they are printed. Anything lower can print soft or blocky. A picture that looks sharp on your screen can still be too small for print, so check it before you upload.",
  [("/image-dpi-checker/","Free image DPI checker"),("/guides/fix-low-resolution-images/","Fix low resolution images")]),
 ("cmyk","Do I need CMYK colors for KDP or IngramSpark?",
  "KDP accepts RGB covers and converts them itself, but colors can shift. IngramSpark wants CMYK, and black and white interiors should be grayscale only. Converting to CMYK yourself first lets you see the real printed colors before you pay for a proof.",
  [("/guides/rgb-vs-cmyk-book-cover/","RGB vs CMYK for book covers")]),
 ("ink-limit","What is the 240% ink limit?",
  "IngramSpark's 240% ink limit means cyan, magenta, yellow and black added together can't go over 240% in any one spot. Very dark or rich black areas often break it. Files over the limit get rejected, because too much ink smears on the press.",
  [("/guides/fix-ink-coverage-240/","Fix the 240% ink limit")]),
 ("pdf-x1a","What is PDF/X-1a and do I need it?",
  "PDF/X-1a is a print-safe kind of PDF: every font is embedded, colors are CMYK and see-through layers are flattened. IngramSpark asks for it. Word can't save it directly, so you convert a normal PDF with a tool like Adobe Acrobat Pro or SparkPrep.",
  [("/guides/what-is-pdf-x-1a/","What is PDF/X-1a?"),("/guides/fix-pdf-not-pdf-x1a/","Fix a \"not PDF/X-1a\" error")]),
 ("word-print-ready","How do I make my Word file print-ready?",
  "Set Word's paper size to your trim size, use mirror margins with the right inside margin for your page count, turn off picture compression, and save as a PDF with fonts embedded. Then check the PDF against your printer's rules before you upload it.",
  [("/guides/export-print-ready-pdf-from-word/","Export a print-ready PDF from Word"),("/free-book-formatting-guide/","Free book formatting guide")]),
 ("cost","How much does it cost to get a book print-ready?",
  "Hiring freelancers usually costs the most: Reedsy's figures put a professional cover at a median of about $930 and interior formatting at about $800, roughly $1,730 for both. Doing it yourself is free but risky. SparkPrep's audit is free through December 31, 2026, and a full book with fixes and print-ready files costs far less than freelancers.",
  [("/pricing","SparkPrep prices"),("/guides/sparkprep-vs-hiring-a-freelancer/","SparkPrep vs hiring a freelancer")]),
 ("free-cover","Can I make a book cover for free?",
  "Yes. SparkPrep's Cover Studio is a free cover maker with 224 templates and 333 fonts, sized to your printer's real cover rules, including the spine. Designing is free. The print-ready cover file comes with a SparkPrep book.",
  [("/cover-studio","Open Cover Studio"),("/templates/","Free book cover templates")]),
 ("kdp-vs-ingramspark","Can I use the same files for KDP and IngramSpark?",
  "Often not without changes. IngramSpark needs a 0.5 inch safety margin inside the pages, keeps total ink under 240%, and uses its own spine width, so the cover usually needs its own template. Check each file against each printer's own rules.",
  [("/guides/kdp-vs-ingramspark-vs-lulu-file-rules/","KDP vs IngramSpark vs Lulu file rules")]),
 ("all-in-one","What is an all-in-one self-publishing suite?",
  "An all-in-one self-publishing suite lets you design your cover, format your inside pages, check both against printer rules, fix the problems and download print-ready files in one place. SparkPrep is one: it works with Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu.",
  [("/","What SparkPrep does"),("/about/","About SparkPrep")]),
 ("what-is-sparkprep","What is SparkPrep?",
  "SparkPrep is an all-in-one self-publishing suite made by Legenddary. It has a free cover designer, a free page formatter, AI writing help, a print check against KDP, IngramSpark, Barnes & Noble and Lulu rules, automatic fixes and print-ready PDF/X-1a export. Its motto is \"Power without complexity.\"",
  [("/about/","About SparkPrep"),("/audit","Try the free audit")]),
]
def e(s): return html.escape(s, quote=True)
title = "Self-Publishing File Questions, Answered in Plain English | SparkPrep"
desc = "Short, plain-English answers to the questions first-time authors ask about KDP and IngramSpark files: bleed, spine width, margins, DPI, CMYK, ink limits, PDF/X-1a and rejections."
url = B + "/answers/"
schema = {"@context":"https://schema.org","@graph":[
 {"@type":"FAQPage","@id":url+"#faq","url":url,"name":"Self-publishing file questions, answered","dateModified":"2026-11-12",
  "publisher":{"@type":"Organization","name":"SparkPrep","url":B+"/"},
  "mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a,"url":url+"#"+i}} for i,q,a,_ in QA]},
 {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"SparkPrep","item":B+"/"},{"@type":"ListItem","position":2,"name":"Answers","item":url}]}]}
toc = "\n".join(f'    <li><a href="#{i}">{e(q)}</a></li>' for i,q,_,_ in QA)
body = []
for i,q,a,links in QA:
    l = " · ".join(f'<a href="{h}">{e(t)}</a>' for h,t in links)
    body.append(f'''  <section class="card" id="{i}">
    <h2 style="margin-top:0">{e(q)}</h2>
    <p>{e(a)}</p>
    <p class="note" style="margin-bottom:0">Read more: {l}</p>
  </section>''')
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SparkPrep">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{B}/brand/sparkprep-logo.png">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/tools/tools.css">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body>
<header class="site">
  <a class="brand" href="/"><img src="/brand/sparkprep-logo.png" alt="SparkPrep logo" width="120" height="34"></a>
  <nav><a href="/templates/">Templates</a><a class="hide-sm" href="/tools/">Free tools</a><a class="hide-sm" href="/guides/">Guides</a><a href="/">SparkPrep</a></nav>
</header>
<main>
  <div class="eyebrow">Quick answers · Updated November 12, 2026</div>
  <h1>Self-publishing file questions, answered in plain English</h1>
  <p class="lead">Getting your first book ready for Amazon KDP or IngramSpark? Here are short, straight answers to the questions new authors ask most. Each one links to a full step-by-step guide or a free tool.</p>
  <div class="card"><p style="margin:0"><strong>The short version:</strong> printers reject books for a handful of file problems: missing bleed, text too close to the edge, the wrong spine width, blurry pictures, screen colors, too much ink and fonts that aren't embedded. Check for them before you upload and you skip the rejection emails.</p></div>
  <h2>Questions on this page</h2>
  <ul class="links">
{toc}
  </ul>
{chr(10).join(body)}
  <section class="cta">
    <h2>Not sure if your book is ready?</h2>
    <p>Upload your cover or pages and SparkPrep checks them against your printer's own rules, explains every problem in plain English and shows you where it is. Free through December 31, 2026. No sign-up.</p>
    <a class="btn" href="/audit">Check my book for free</a>
    <a class="btn ghost" href="/guides/">Read the fix guides</a>
  </section>
  <p class="note">SparkPrep is an independent tool and is not affiliated with Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu. Printer numbers on this page come from each printer's own published rules; check their help pages if they change.</p>
</main>
<footer class="site">© SparkPrep by Legenddary · <a href="/">Home</a><a href="/answers/">Answers</a><a href="/about/">About</a><a href="/tools/">Free tools</a><a href="/guides/">Guides</a><a href="/pricing">Pricing</a></footer>
</body>
</html>
'''
import os
os.makedirs(ROOT+"/public/answers", exist_ok=True)
open(ROOT+"/public/answers/index.html","w").write(page)
print(len(QA), "answers")
