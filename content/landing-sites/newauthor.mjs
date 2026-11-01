// sparkpreplandingnewauthor.legenddary.com — first-time self-publishers: steps, costs, timeline, words, mistakes.
import { MAIN_LINKS as L, PRICES, site } from "./shared.mjs";

const TERMS = [
  ["Trim size", "The finished size of your book after it's cut, for example 6\" x 9\"."],
  ["Bleed", "Extra background (0.125\") that runs past the edge of the cover or page so the printer can trim it off cleanly."],
  ["Safe zone (safety margin)", "The area inside the trim where words and faces are safe from being cut. IngramSpark wants 0.5\" from every edge."],
  ["Gutter", "The inside margin, next to the spine. Thicker books need a bigger gutter."],
  ["Spine width", "How thick the book is: page count times the thickness of one page. It changes with paper and printer."],
  ["Full cover (wrap)", "The single cover file for a print book: back cover, spine and front cover side by side, plus bleed."],
  ["Interior (bookblock)", "The inside pages of your book, uploaded as one PDF."],
  ["DPI", "Dots per inch: how much detail a picture has at its printed size. Print needs 300."],
  ["RGB", "Screen color, made with red, green and blue light. Printers convert it to ink."],
  ["CMYK", "Print color, made with cyan, magenta, yellow and black ink."],
  ["Total ink (TAC)", "All four inks added together at one spot. IngramSpark's limit is 240%."],
  ["Rich black", "Black made with all four inks instead of black ink alone. Looks deep, but can break ink limits."],
  ["Grayscale", "Black ink only, in shades of gray. The safe way to save a black and white interior."],
  ["Embedded font", "A font carried inside the PDF, so the printer prints your words exactly as you set them."],
  ["Flattening", "Merging layers, shadows and see-through effects into one finished image so they print correctly."],
  ["PDF/X-1a", "A print-standard type of PDF: fonts embedded, CMYK or gray color, no live transparency. IngramSpark prefers it."],
  ["Preflight", "Checking your files against the printer's rules before you upload, so they're accepted the first time."],
  ["Proof copy", "A printed copy you order before publishing, to check how the book really looks."],
  ["ISBN", "The 13-digit number that identifies one edition of your book. Paperback, hardcover and ebook each need their own."],
  ["Imprint", "The publisher name printed on your book. It can be your own name or a small business name you choose."],
  ["Print on demand (POD)", "Each copy is printed when someone orders it, so you never buy stock up front. KDP and IngramSpark both work this way."],
  ["Going wide", "Selling through more than Amazon, usually by adding IngramSpark to reach other stores and libraries."],
];

export const pages = [
  {
    path: "/",
    nav: "Start here",
    crumb: "Your first print book, step by step",
    title: "How to Self-Publish Your First Print Book, Step by Step",
    description: "A plain-English roadmap for first-time self-publishers: from finished manuscript to a printed book on Amazon KDP or IngramSpark in 10 steps.",
    eyebrow: "For first-time authors",
    h1: "How to self-publish your first print book, step by step",
    lead: "You finished writing. Congratulations: that's the hard part. Turning it into a printed book is a series of small, learnable steps. Here they are in order, in plain English.",
    answer: "<p>To self-publish a print book: <strong>1)</strong> finish and edit the manuscript, <strong>2)</strong> choose KDP, IngramSpark or both, <strong>3)</strong> get an ISBN, <strong>4)</strong> pick trim size and paper, <strong>5)</strong> format the interior, <strong>6)</strong> design the full cover, <strong>7)</strong> preflight both files, <strong>8)</strong> upload, <strong>9)</strong> order a proof, <strong>10)</strong> publish.</p>",
    body: `
<h2>The 10 steps</h2>
<ol class="steps">
  <li><strong>Finish and edit the manuscript.</strong> Every change after formatting can move pages, and moving pages changes your cover. Lock the words first.</li>
  <li><strong>Choose where to print.</strong> Amazon KDP is the easiest start and sells on Amazon. IngramSpark reaches other bookstores and libraries. Many authors use both. <a href="/kdp-or-ingramspark/">How to choose.</a></li>
  <li><strong>Get an ISBN.</strong> KDP offers a free one (usable on KDP only). For IngramSpark or your own imprint, buy your own. Each format needs its own.</li>
  <li><strong>Pick your trim size and paper.</strong> 5.5" x 8.5" and 6" x 9" are the most common. White or cream paper; black and white or color.</li>
  <li><strong>Format the interior.</strong> Set the page size to your trim size, set margins for your page count, choose a readable font (11 to 12 point), and export a print PDF.</li>
  <li><strong>Design the full cover.</strong> Back, spine and front in one file, with bleed, sized for your final page count. <a href="${site("covers", "/")}">How cover size works.</a></li>
  <li><strong>Preflight both files.</strong> Check bleed, margins, fonts, pictures, color and spine against your printer's rules. <a href="${site("landing", "/")}">What preflight is.</a></li>
  <li><strong>Upload.</strong> Fill in title, description, keywords and price, then upload both PDFs. Fix anything the previewer flags.</li>
  <li><strong>Order a proof copy.</strong> Read it on paper. You will find something. Fix it and re-check.</li>
  <li><strong>Publish.</strong> KDP says books are usually live within about 3 business days.</li>
</ol>

<h2>The steps that trip up first-timers</h2>
<p>Steps 5, 6 and 7. Not because they're hard, but because nobody explains the printer's rules until a file comes back. The most common surprises:</p>
<ul class="checks">
  <li>The Word file is letter size, not book size.</li>
  <li>The cover has no bleed, or the spine was guessed.</li>
  <li>Text sits too close to the spine fold.</li>
  <li>Pictures look sharp on screen but are too small for print.</li>
</ul>
<p>Read <a href="/first-book-mistakes/">the 10 first-book mistakes</a> before you start, and keep the <a href="/words-to-know/">words to know</a> page open while you work.</p>

<h2>How much and how long?</h2>
<p>Doing it all yourself can cost almost nothing but takes time to learn. Hiring professionals for the cover and formatting typically costs well over a thousand dollars and takes weeks. There's a middle path. Read <a href="/costs/">what it really costs</a> and <a href="/timeline/">how long it takes</a>.</p>

<h2>Where SparkPrep fits</h2>
<p>SparkPrep covers steps 5, 6 and 7. <a href="${L.interiorStudio}">Interior Studio</a> turns your Word file into book pages at your trim size. <a href="${L.coverStudio}">Cover Studio</a> builds the full cover at the right size with 224 free templates. Then SparkPrep checks both files against your printer's own rules and fixes what it finds, so step 8 goes through the first time.</p>
`,
    faq: [
      { q: "How do I self-publish a book for the first time?", a: "Finish and edit the manuscript, choose KDP or IngramSpark, get an ISBN, choose trim size and paper, format the interior, design the full cover, preflight both files, upload, order a proof and publish." },
      { q: "Is it free to self-publish on Amazon KDP?", a: "Uploading and publishing on KDP is free. You may pay for editing, design, an ISBN of your own, proof copies and tools." },
    ],
  },
  {
    path: "/costs/",
    nav: "What it costs",
    crumb: "What it costs to make a book print-ready",
    title: "Cost to Self-Publish a Print Book: Cover, Formatting, ISBN",
    description: "Honest numbers for first-time authors: what a cover designer, formatter, ISBN and proof copies cost, what publishing packages charge, and a cheaper path.",
    eyebrow: "Real numbers",
    h1: "What it costs to get your first print book ready",
    lead: "Here are the real numbers, with where they come from, so you can choose with your eyes open. No option is wrong; each trades money for time and risk differently.",
    answer: "<p>Hiring professionals typically costs about <strong>$1,730</strong> for a cover and interior formatting (Reedsy's figures: median ~$930 cover, ~$800 average formatting). Publishing packages run about <strong>$2,000 to $7,000</strong>. Doing it yourself is nearly free but risky. SparkPrep's middle path starts with a free scan and a <strong>" + PRICES.audit + "</strong> audit.</p>",
    cardText: "Freelancer, package, DIY and SparkPrep costs, with sources.",
    body: `
<h2>Option 1: Hire freelancers</h2>
<div class="table-wrap"><table>
<tr><th>Item</th><th>Typical cost</th><th>Source</th></tr>
<tr><td>Cover design</td><td>Median about $930</td><td>Reedsy's published figures for its vetted designers</td></tr>
<tr><td>Interior formatting</td><td>About $800 on average</td><td>Reedsy's published figures</td></tr>
<tr><td><strong>Both</strong></td><td><strong>About $1,730</strong></td><td></td></tr>
</table></div>
<p>Cheaper gigs exist on marketplaces, sometimes under $100, but quality and printer know-how vary a lot. Ask any freelancer: "Will you build this to IngramSpark's (or KDP's) exact rules for my page count and paper, and fix it free if it's rejected?"</p>
<p><strong>The risk:</strong> a beautiful file can still be rejected. If it is, you wait for the freelancer again, and may pay again. Changing anything later (a typo, a new price on the back, a new page count) is another request.</p>

<h2>Option 2: A publishing package</h2>
<p>Companies like BookBaby sell all-in packages, roughly <strong>$2,000 to $7,000</strong>, with covers alone from about $399, and say to allow <strong>several weeks</strong>. You get hand-holding. You pay for it, and you'll still want to check who owns the files and the ISBN.</p>

<h2>Option 3: Do it yourself with free tools</h2>
<p>Word, Canva and KDP's templates cost little or nothing. The catch is that none of them check the printer's rules for you. Word can't make a true black and white PDF or a PDF/X-1a file; Canva can't measure the 240% ink limit. You learn by rejection. Expect several evenings of learning and at least one round trip.</p>

<h2>Option 4: The middle path (SparkPrep)</h2>
<div class="table-wrap"><table>
<tr><th>Step</th><th>Cost</th></tr>
<tr><td>Design your cover in Cover Studio (224 templates, 333 fonts)</td><td>Free</td></tr>
<tr><td>Lay out your pages in Interior Studio</td><td>Free to design</td></tr>
<tr><td>Scan your files: how many problems?</td><td>Free</td></tr>
<tr><td>Audit: every problem and where it is</td><td>${PRICES.audit} (${PRICES.auditLater} after ${PRICES.auditChangeDate})</td></tr>
<tr><td>Advanced Audit: every interior page, up to 300</td><td>${PRICES.advanced}</td></tr>
<tr><td>Fix everything and export print-ready files</td><td>${PRICES.book} per book (audit fees count toward it)</td></tr>
</table></div>

<h2>Costs everyone has</h2>
<ul class="checks">
  <li><strong>ISBN:</strong> free from KDP (KDP-only). In the US, Bowker sells one for $125 or ten for $295 (check Bowker's current prices). Buy ten if you'll publish more than one format.</li>
  <li><strong>Proof copies:</strong> KDP charges printing cost plus shipping, usually a few dollars plus postage.</li>
  <li><strong>Editing:</strong> often the biggest cost of all, and worth it. Preflight doesn't check your words.</li>
</ul>
`,
    faq: [
      { q: "How much does it cost to self-publish a book?", a: "Publishing on KDP is free. Getting it ready ranges from nearly free (doing it yourself) to about $1,730 for a professional cover and formatting (Reedsy's figures), or $2,000 to $7,000 for a package." },
      { q: "Do I need to buy an ISBN?", a: "Not for KDP alone, which offers a free one. For IngramSpark or your own imprint, buy your own: in the US, from Bowker." },
    ],
  },
  {
    path: "/timeline/",
    nav: "How long it takes",
    crumb: "How long it takes to self-publish",
    title: "How Long Does It Take to Self-Publish a Print Book?",
    description: "A realistic timeline for a first print book: formatting, cover, printer review, proof copy and going live on KDP, plus where the time really goes.",
    eyebrow: "Plan your launch",
    h1: "How long does it take to self-publish a print book?",
    lead: "Writing takes as long as it takes. From finished manuscript to a book for sale, here's a realistic timeline, and where most first-timers lose weeks without expecting it.",
    answer: "<p>From finished, edited manuscript to a print book for sale usually takes <strong>2 to 6 weeks</strong>: about a week or more for formatting and cover (several weeks with freelancers), a few days per printer review, about a week for a printed proof to arrive, then about <strong>3 business days</strong> for KDP to go live. Each rejection adds days.</p>",
    cardText: "A realistic week-by-week timeline, and where the time really goes.",
    body: `
<h2>A realistic timeline</h2>
<div class="table-wrap"><table>
<tr><th>Stage</th><th>Doing it yourself</th><th>With freelancers</th><th>With SparkPrep</th></tr>
<tr><td>Interior formatting</td><td>Several evenings</td><td>1 to 3 weeks, with revisions</td><td>An evening in Interior Studio</td></tr>
<tr><td>Cover design</td><td>Several evenings</td><td>1 to 4 weeks, with revisions</td><td>An evening in Cover Studio</td></tr>
<tr><td>Preflight and fixes</td><td>Learn as you go</td><td>Depends on the freelancer</td><td>Minutes</td></tr>
<tr><td>Printer review</td><td>A few days per upload</td><td>A few days per upload</td><td>A few days, ideally once</td></tr>
<tr><td>Printed proof</td><td>About a week with shipping</td><td>About a week</td><td>About a week</td></tr>
<tr><td>Going live on KDP</td><td>About 3 business days</td><td>About 3 business days</td><td>About 3 business days</td></tr>
</table></div>
<p class="note">Rough guides from common author experience; KDP's own help says books are usually live within about 3 business days. Freelancer and package timings vary; BookBaby, for example, says to allow several weeks.</p>

<h2>Where the time really goes</h2>
<h3>Waiting on other people</h3>
<p>With freelancers, most of the time isn't work, it's waiting: for a reply, for a draft, for a revision. Each round trip is often days.</p>
<h3>Rejections</h3>
<p>Every rejected upload means fixing, re-uploading and a new review. Two or three rounds can add weeks. SparkPrep's founder went through 18 with his own book.</p>
<h3>Late changes</h3>
<p>A change after the cover is done (new chapter, bigger font, different paper) changes the page count, which changes the spine, which means rebuilding the cover. Lock the manuscript before formatting.</p>

<h2>How to save weeks</h2>
<ol class="steps">
  <li>Finish editing before formatting.</li>
  <li>Decide printer, trim and paper on day one.</li>
  <li>Format the interior before the cover, so the page count is final.</li>
  <li>Preflight before every upload, so the first review passes.</li>
  <li>Order the proof as soon as the files are accepted, and plan your launch date after it arrives.</li>
</ol>
<p>Planning a launch date? Count back: proof arrival plus a week of buffer, then 3 business days for KDP. Put the first upload at least 3 weeks before launch.</p>
`,
    faq: [
      { q: "How long does KDP take to publish a paperback?", a: "KDP says books are usually live within about 3 business days once the files pass review." },
      { q: "How long does a KDP proof copy take?", a: "Printing plus shipping, often around a week in the US, longer for other countries." },
    ],
  },
  {
    path: "/kdp-or-ingramspark/",
    nav: "KDP or IngramSpark?",
    crumb: "KDP or IngramSpark for a first book",
    title: "KDP or IngramSpark for Your First Book? (Plain-English Guide)",
    description: "Should a first-time author print with Amazon KDP, IngramSpark or both? What each does well, who each is for, ISBNs, and how to use both without file problems.",
    eyebrow: "Choosing a printer",
    h1: "KDP or IngramSpark for your first book?",
    lead: "Both print your book one copy at a time when someone orders it, so neither needs you to buy stock. The difference is where your book is sold and how strict the file rules are.",
    answer: "<p>Start with <strong>Amazon KDP</strong> if you mainly want to sell on Amazon: it's free and simpler. Add <strong>IngramSpark</strong> if you want bookstores and libraries to order your book, or want a dust jacket hardcover. Many authors use both, with their own ISBN, and build files to IngramSpark's stricter rules.</p>",
    cardText: "Which printer suits a first book, and how to use both safely.",
    body: `
<h2>Side by side for a first-time author</h2>
<div class="table-wrap"><table>
<tr><th></th><th>Amazon KDP</th><th>IngramSpark</th></tr>
<tr><td>Sells on</td><td>Amazon</td><td>Thousands of stores and libraries through Ingram's catalog (and Amazon)</td></tr>
<tr><td>Ease for beginners</td><td>Easier</td><td>More options, more rules</td></tr>
<tr><td>File rules</td><td>Looser margins, no published ink number</td><td>0.5" margins, 240% ink limit, PDF/X-1a preferred</td></tr>
<tr><td>Hardcover</td><td>Printed case only</td><td>Printed case or cloth with dust jacket</td></tr>
<tr><td>Free ISBN</td><td>Yes, KDP-only</td><td>No: use your own ISBN</td></tr>
</table></div>

<h2>Our honest advice</h2>
<ul class="checks">
  <li><strong>Just want your book on Amazon, fast?</strong> KDP.</li>
  <li><strong>Want local bookstores, libraries or events to stock it?</strong> Add IngramSpark. Stores order through Ingram.</li>
  <li><strong>Planning both?</strong> Buy your own ISBNs so the same edition has the same number everywhere, and build the interior to IngramSpark's rules from the start. <a href="${site("errors", "/passed-kdp-failed-ingramspark/")}">Here's why.</a></li>
</ul>

<h2>Three questions to decide</h2>
<h3>Where will your readers buy it?</h3>
<p>If your readers find books on Amazon (most genre fiction, most self-help), KDP alone may be all you need. If you're planning readings, local bookstores, school visits or library copies, those buyers order through Ingram, so you'll want IngramSpark.</p>
<h3>How much setup are you ready for?</h3>
<p>KDP walks you through one book at a time with fewer choices. IngramSpark asks more questions (discounts, returns, paper types) and checks files harder. If this is your very first book and you're nervous, start with KDP and add IngramSpark once it's live.</p>
<h3>What kind of book is it?</h3>
<p>A paperback novel works anywhere. A hardcover with a dust jacket needs IngramSpark. A full-color picture book works on both, but check each printer's color paper and ink rules before you design.</p>

<h2>Using both without trouble</h2>
<ol class="steps">
  <li>Format the interior with at least 0.5" margins on every side (bigger inside for thick books).</li>
  <li>Keep color under 240% total ink; save black and white as grayscale.</li>
  <li>Make two covers, one from each printer's template, because the spine width differs.</li>
  <li>Use the same ISBN for the same format on both, if it's your own ISBN.</li>
  <li>Preflight each set of files for its printer before uploading.</li>
</ol>
<p>SparkPrep checks your files against KDP, IngramSpark, Barnes &amp; Noble Press or Lulu, each with that printer's own numbers, and re-fits your cover from one printer to another. See the full <a href="${site("landing", "/kdp-vs-ingramspark-rules/")}">KDP vs IngramSpark rules table</a>.</p>
`,
    faq: [
      { q: "Should I use KDP or IngramSpark for my first book?", a: "KDP is the simpler start if you mainly sell on Amazon. Add IngramSpark if you want bookstores and libraries to be able to order it." },
      { q: "Can I use both KDP and IngramSpark?", a: "Yes. Many authors do. Build the interior to IngramSpark's stricter rules and make a separate cover for each printer." },
    ],
  },
  {
    path: "/words-to-know/",
    nav: "Words to know",
    crumb: "Self-publishing words to know",
    title: "Self-Publishing Glossary: 22 Print Words Explained Simply",
    description: "Bleed, trim, gutter, DPI, CMYK, PDF/X-1a, ISBN and more: 22 self-publishing print words every first-time author meets, each explained in one plain sentence.",
    eyebrow: "Glossary",
    h1: "Self-publishing words to know (22 terms, one line each)",
    lead: "Printers speak their own language. Here are the words you'll meet on KDP, IngramSpark and in rejection emails, each in one plain sentence.",
    answer: "<p><strong>Bleed</strong> is extra background past the edge that gets trimmed off. <strong>Trim size</strong> is the finished book size. The <strong>gutter</strong> is the inside margin by the spine. <strong>DPI</strong> is picture detail (print needs 300). <strong>CMYK</strong> is print color. <strong>PDF/X-1a</strong> is the print-standard PDF.</p>",
    cardText: "Bleed, gutter, DPI, CMYK, PDF/X-1a and 17 more, one line each.",
    extraLd: {
      "@type": "DefinedTermSet",
      name: "Self-publishing print terms",
      hasDefinedTerm: TERMS.map(([t, d]) => ({ "@type": "DefinedTerm", name: t, description: d })),
    },
    body: `
<dl>
${TERMS.map(([t, d]) => `<div class="box"><dt><h3 style="margin:0" id="${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}">${t}</h3></dt><dd style="margin:6px 0 0">${d}</dd></div>`).join("\n")}
</dl>
<h2>Where you'll meet these words</h2>
<ul class="checks">
  <li><strong>Setting up your book on KDP or IngramSpark:</strong> trim size, paper, bleed, ISBN, imprint.</li>
  <li><strong>Formatting the interior:</strong> gutter, safe zone, embedded font, grayscale.</li>
  <li><strong>Making the cover:</strong> full cover, spine width, bleed, CMYK, DPI.</li>
  <li><strong>In a rejection email:</strong> bookblock, total ink, PDF/X-1a, flattening. <a href="${site("errors", "/")}">Decode a rejection.</a></li>
</ul>
`,
    faq: [
      { q: "What does bleed mean in a book?", a: "Extra background, usually 0.125 inch, that runs past the edge of the cover or page so the printer can trim it off cleanly without leaving a white line." },
      { q: "What is trim size?", a: "The finished size of the book after it's cut, such as 6 by 9 inches." },
    ],
  },
  {
    path: "/first-book-mistakes/",
    nav: "10 mistakes",
    crumb: "10 first-book mistakes",
    title: "10 Mistakes First-Time Self-Publishers Make (and Fixes)",
    description: "The 10 most common mistakes first-time authors make getting a print book ready for KDP or IngramSpark, why each one happens, and the simple way to avoid it.",
    eyebrow: "Learn from others",
    h1: "10 mistakes first-time self-publishers make",
    lead: "Every one of these is common, every one is fixable, and every one is easier to avoid than to fix. Read them once before you format a single page.",
    answer: "<p>The most common first-book mistakes: <strong>formatting before editing is done, using a letter-size Word file, guessing the spine width, forgetting bleed, margins too small by the spine, low-resolution pictures, unembedded fonts, color in a black and white book, reusing one cover for two printers</strong>, and <strong>skipping the proof copy</strong>.</p>",
    cardText: "The ten traps, why they happen and how to sidestep each one.",
    body: `
<ol class="steps">
  <li><strong>Formatting before the words are final.</strong> Every late edit moves pages and changes the spine. <em>Avoid it:</em> finish editing first.</li>
  <li><strong>Uploading a letter-size Word file.</strong> Your 6" x 9" book gets shrunk and off-center. <em>Avoid it:</em> set the page size to your trim size. <a href="${site("fix", "/page-size/")}">How.</a></li>
  <li><strong>Guessing the spine width.</strong> The spine is page count times paper thickness, and every printer's paper differs. <em>Avoid it:</em> use your printer's numbers. <a href="${site("covers", "/spine-width/")}">Spine chart.</a></li>
  <li><strong>Forgetting bleed.</strong> Art that stops at the edge leaves a white line after trimming. <em>Avoid it:</em> add 0.125" around the cover. <a href="${site("fix", "/bleed/")}">How.</a></li>
  <li><strong>Margins too small by the spine.</strong> Words disappear into the fold of thick books. <em>Avoid it:</em> use a bigger inside margin as pages grow. <a href="${site("fix", "/margins/")}">Table.</a></li>
  <li><strong>Pictures too small.</strong> Sharp on screen, blurry in print. <em>Avoid it:</em> 300 pixels per printed inch. <a href="${site("fix", "/image-resolution/")}">Pixel chart.</a></li>
  <li><strong>Fonts not embedded.</strong> The printer can't print a font the PDF doesn't carry. <em>Avoid it:</em> turn on font embedding. <a href="${site("fix", "/fonts/")}">How.</a></li>
  <li><strong>Hidden color in a black and white book.</strong> Blue links and RGB "black" count as color. <em>Avoid it:</em> save the interior as grayscale. <a href="${site("fix", "/color-and-ink/")}">How.</a></li>
  <li><strong>One cover for two printers.</strong> KDP and IngramSpark spines differ. <em>Avoid it:</em> a cover per printer. <a href="${site("errors", "/passed-kdp-failed-ingramspark/")}">Why.</a></li>
  <li><strong>Skipping the proof copy.</strong> Screens hide color shifts, tiny type and typos. <em>Avoid it:</em> always order one proof before you publish.</li>
</ol>

<h2>The mistake behind the mistakes</h2>
<p>Most of these happen because nobody tells new authors the rules until a file comes back. That's not a talent problem; it's an information problem. The fix is checking your files against the printer's rules <em>before</em> you upload. That's called preflight, and it's what SparkPrep does: it checks your cover and every page against your printer's own numbers and tells you, in plain English, what to change.</p>

<h2>A simple order that avoids all ten</h2>
<ol class="steps">
  <li>Edit until the words are final.</li>
  <li>Choose printer, trim size and paper.</li>
  <li>Format the interior at trim size, with the right margins, fonts embedded and pictures at 300 DPI.</li>
  <li>Get the final page count, then build the cover from that printer's numbers.</li>
  <li>Preflight both files. Fix. Preflight again.</li>
  <li>Upload, order a proof, publish.</li>
</ol>
`,
    faq: [
      { q: "What is the biggest mistake new self-publishers make?", a: "Uploading files without checking them against the printer's rules first, which leads to rejections for bleed, margins, page size or spine width." },
      { q: "Do I really need a proof copy?", a: "Yes. A printed proof shows color, type size and layout problems a screen hides. It costs a few dollars plus shipping on KDP." },
    ],
  },
];
