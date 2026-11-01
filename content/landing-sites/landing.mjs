// sparkpreplanding.legenddary.com — the general site: what book preflight is, who needs it, what gets checked.
import { MAIN_LINKS as L, PRICES, site } from "./shared.mjs";

export const pages = [
  {
    path: "/",
    nav: "What is preflight?",
    crumb: "What is book preflight?",
    title: "What Is Book Preflight? Check Files Before KDP Prints",
    description: "Book preflight means checking your cover and interior files against your printer's rules before you upload, so KDP or IngramSpark doesn't send them back.",
    eyebrow: "Book preflight, explained simply",
    h1: "What is book preflight?",
    lead: "You wrote the book. Before Amazon KDP or IngramSpark will print it, a machine checks your two files: the cover and the inside pages. Preflight is you checking them first, so nothing gets sent back.",
    answer: "<p><strong>Book preflight</strong> is checking a book's cover and interior PDF files against the printer's rules (size, bleed, margins, colors, picture sharpness, fonts and spine width) before uploading, so the printer accepts them the first time.</p>",
    body: `
<h2>Why printers send files back</h2>
<p>A printed book is not a big printout of your Word file. The printer prints your cover on a larger sheet, trims it, folds it around a spine that is exactly as thick as your pages, and glues it on. The inside pages are printed with ink, not light, and are bound so part of every page disappears into the fold.</p>
<p>Each of those steps has a rule. If your file breaks one, the printer either rejects it or prints something you won't like: a white line on the edge, words cut off near the spine, a muddy photo or a title sliding off the side of the spine.</p>

<h2>The six things every preflight checks</h2>
<div class="cards">
  <a class="card" href="${site("fix", "/bleed/")}"><b>1. Bleed</b><span>Background art has to run 0.125" past every edge of the cover, because that edge is cut off.</span></a>
  <a class="card" href="${site("fix", "/margins/")}"><b>2. Margins</b><span>Text must stay far enough from the edges and the spine fold. IngramSpark wants 0.5" all around.</span></a>
  <a class="card" href="${site("fix", "/color-and-ink/")}"><b>3. Color and ink</b><span>Printers use ink (CMYK), not screen light (RGB). IngramSpark rejects more than 240% total ink.</span></a>
  <a class="card" href="${site("fix", "/image-resolution/")}"><b>4. Picture sharpness</b><span>Pictures need about 300 DPI at the size they print, or they come out soft.</span></a>
  <a class="card" href="${site("fix", "/fonts/")}"><b>5. Fonts</b><span>Every font must be built into the PDF, or the printer can't print your words the way you set them.</span></a>
  <a class="card" href="${site("covers", "/spine-width/")}"><b>6. Spine and size</b><span>The cover must be the exact size for your page count and paper. Every printer measures this differently.</span></a>
</div>

<h2>How preflight fits into publishing</h2>
<ol class="steps">
  <li><strong>Finish your files.</strong> A cover PDF and an interior PDF, made at your book's trim size (for example 6" x 9").</li>
  <li><strong>Preflight them.</strong> Check every rule above, for your printer, for this exact page count and paper.</li>
  <li><strong>Fix what failed.</strong> Then check again. A fix to one thing (like the page count) can break another (like the spine width).</li>
  <li><strong>Upload.</strong> The printer runs its own check. If you preflighted well, this is where your book is accepted.</li>
  <li><strong>Order a proof copy.</strong> Hold the real book in your hands before you hit publish.</li>
</ol>
<p>Preflight doesn't replace the proof copy. It makes sure you get to the proof copy without a rejection email first. See <a href="/preflight-vs-proof-copy/">preflight vs. a proof copy</a> for the difference.</p>

<h2>Who needs it</h2>
<p>Anyone sending a print book to <strong>Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu</strong>. First-time authors need it most, because nobody tells you these rules until a file comes back. Seasoned authors need it when they switch printers, change paper, add pages or go from paperback to hardcover. <a href="/who-needs-preflight/">Here's who needs what.</a></p>

<h2>Three ways to preflight</h2>
<div class="table-wrap"><table>
<tr><th>Way</th><th>Cost</th><th>Time</th><th>Catch</th></tr>
<tr><td>Check it yourself with a checklist</td><td>Free</td><td>An evening or two</td><td>You need Adobe Acrobat Pro for some checks, and you have to know what you're looking at. <a href="/preflight-checklist/">Use our checklist.</a></td></tr>
<tr><td>Pay a designer or formatter</td><td>Reedsy's pros: median ~$930 for a cover, ~$800 average for formatting</td><td>Days to weeks</td><td>Not every freelancer checks your printer's exact rules. A pretty file can still be rejected.</td></tr>
<tr><td>Use a preflight tool like SparkPrep</td><td>Free scan, ${PRICES.audit} audit</td><td>Minutes</td><td>You upload your PDF. SparkPrep checks it against your printer's own numbers and can fix what it finds.</td></tr>
</table></div>
<p>For the full story on costs and timing, read <a href="${site("newauthor", "/costs/")}">what it really costs to get a print book ready</a>.</p>
`,
    faq: [
      { q: "What does preflight mean in self-publishing?", a: "It means checking your cover and interior files against the printer's technical rules before you upload them, so KDP, IngramSpark, Barnes & Noble Press or Lulu accepts them the first time." },
      { q: "Does Amazon KDP check my files for me?", a: "KDP checks them when you upload and shows problems in its previewer. Preflight means you find and fix those problems before that point, and catch things the previewer only warns about." },
      { q: "Is preflight the same as proofreading?", a: "No. Proofreading checks your words. Preflight checks your files: size, bleed, margins, colors, pictures and fonts." },
      { q: "How long does preflight take?", a: "By hand with a checklist, an evening or two. With SparkPrep, a few minutes for the scan." },
    ],
  },
  {
    path: "/preflight-checklist/",
    nav: "Checklist",
    crumb: "Book preflight checklist",
    title: "Book Preflight Checklist: 24 Checks Before You Upload",
    description: "A plain-English preflight checklist for your book cover and interior: 24 checks to run before you upload to Amazon KDP, IngramSpark, Barnes & Noble or Lulu.",
    eyebrow: "Print it, tick it off",
    h1: "The book preflight checklist (24 checks)",
    lead: "Run through this list before you upload. Every item is something a printer really checks. If you can tick all 24, your files are in very good shape.",
    answer: "<p>Check the <strong>interior</strong> (page size, margins, fonts, pictures, color, blank pages) and the <strong>cover</strong> (full size with spine, 0.125\" bleed, safe zone, barcode space, spine text, color and ink) against your printer's own numbers, then save both as print PDFs.</p>",
    cardText: "24 plain-English checks for your cover and pages, in the order to do them.",
    body: `
<p>Tip: decide your <strong>printer, trim size, paper and page count</strong> before you start. Half of these checks depend on them, and changing any one later means checking again.</p>

<h2>Before you start</h2>
<ul class="checks">
  <li>☐ <strong>1. Printer chosen.</strong> KDP, IngramSpark, Barnes &amp; Noble Press or Lulu. Their rules differ.</li>
  <li>☐ <strong>2. Trim size chosen.</strong> For example 5.5" x 8.5" or 6" x 9". Your printer must offer it for your paper and binding.</li>
  <li>☐ <strong>3. Paper chosen.</strong> White or cream, black and white or color. Cream is thicker, so it makes a wider spine.</li>
  <li>☐ <strong>4. Final page count known.</strong> Count the PDF pages, not Word's page count. They often differ.</li>
</ul>

<h2>Interior (the inside pages)</h2>
<ul class="checks">
  <li>☐ <strong>5. PDF page size = trim size.</strong> A 6" x 9" book needs a 6" x 9" PDF, not letter size. (If pictures run off the edge, add 0.125" to the width and 0.25" to the height.)</li>
  <li>☐ <strong>6. Inside margin fits your page count.</strong> Thicker books need a bigger margin by the spine. <a href="${site("fix", "/margins/")}">See the table.</a></li>
  <li>☐ <strong>7. Outside, top and bottom margins.</strong> At least 0.25" for KDP (0.375" with bleed), 0.5" for IngramSpark.</li>
  <li>☐ <strong>8. Page numbers and headers inside the margins.</strong> They count as content.</li>
  <li>☐ <strong>9. All fonts embedded.</strong> Check in Acrobat: File → Properties → Fonts. Every font says "Embedded".</li>
  <li>☐ <strong>10. Pictures are 300 DPI</strong> at the size they print.</li>
  <li>☐ <strong>11. Black and white book has no color.</strong> Blue links, colored logos and "black" text saved as RGB all count as color.</li>
  <li>☐ <strong>12. No blank pages in a row</strong> beyond what your printer allows (KDP flags long runs of blank pages).</li>
  <li>☐ <strong>13. Odd pages on the right.</strong> Page 1 and every new chapter you want on a right-hand page should be odd-numbered.</li>
  <li>☐ <strong>14. Saved as a print PDF</strong> (PDF/X-1a is safest, especially for IngramSpark).</li>
</ul>

<h2>Cover</h2>
<ul class="checks">
  <li>☐ <strong>15. Full cover size is right.</strong> Width = bleed + back + spine + front + bleed. Height = bleed + book height + bleed. <a href="${site("covers", "/")}">How it's built.</a></li>
  <li>☐ <strong>16. Spine width matches</strong> your page count and paper, from this printer's own numbers.</li>
  <li>☐ <strong>17. 0.125" bleed on every outer edge.</strong> The background runs past the trim line.</li>
  <li>☐ <strong>18. Words and faces inside the safe zone</strong>, well away from the trim and the spine folds.</li>
  <li>☐ <strong>19. Barcode space left clear</strong> on the back: 2" x 1.2" for KDP, 1.75" x 1" for IngramSpark.</li>
  <li>☐ <strong>20. Spine text allowed?</strong> KDP needs more than 79 pages; IngramSpark paperbacks need at least 48.</li>
  <li>☐ <strong>21. Template guides deleted.</strong> Printer templates have colored guide lines that must not print.</li>
  <li>☐ <strong>22. Cover art is 300 DPI</strong> at full cover size.</li>
  <li>☐ <strong>23. CMYK, and under 240% total ink</strong> if you print with IngramSpark.</li>
  <li>☐ <strong>24. ISBN on the cover matches</strong> the ISBN for this exact edition.</li>
</ul>

<h2>The checks that need special software</h2>
<p>Items 9, 11, 22 and 23 are hard to see with your eyes. You need Adobe Acrobat Pro (Output Preview and Preflight) or a tool that reads the PDF for you. That's exactly the part SparkPrep automates: it reads every page and the whole cover, runs all 24 checks for your printer, and shows you each failure in plain English.</p>
<p>Something failed? Each item above links to a fix on our <a href="${site("fix", "/")}">print file fixes</a> site.</p>
`,
    faq: [
      { q: "What should I check before uploading to KDP?", a: "Page size, margins for your page count, embedded fonts, 300 DPI pictures, full cover size with the right spine width, 0.125 inch bleed, barcode space and spine text rules." },
      { q: "Do I need Adobe Acrobat to preflight a book?", a: "For a few checks (embedded fonts, ink coverage and true color), Acrobat Pro or a preflight tool such as SparkPrep is the reliable way. The rest you can check by eye with the right numbers." },
    ],
  },
  {
    path: "/who-needs-preflight/",
    nav: "Who needs it",
    crumb: "Who needs book preflight?",
    title: "Who Needs Book Preflight? First Book, Hardcover & More",
    description: "First book on KDP, going wide with IngramSpark, hardcover, color or picture books: what each kind of author needs to check before uploading print files.",
    eyebrow: "Find yourself on this page",
    h1: "Who needs book preflight (and what each person should check)",
    lead: "Every print book gets checked by the printer. What changes is which rules are most likely to catch you. Find the line that sounds like you.",
    answer: "<p>Anyone uploading a print book to KDP, IngramSpark, Barnes &amp; Noble Press or Lulu needs preflight. The highest risk is for <strong>first-time authors</strong>, authors <strong>switching printers or paper</strong>, and <strong>hardcover, color and picture books</strong>.</p>",
    cardText: "First book, going wide, hardcover, color or picture book: what to check for each.",
    body: `
<h2>"This is my first book, and I'm using KDP"</h2>
<p>Your biggest risks are the ones nobody warned you about: a cover without bleed, a PDF made at letter size, margins that are too small by the spine, and a spine width you guessed. KDP's previewer will catch some of these, but it won't tell you how to fix them. Start with the <a href="/preflight-checklist/">checklist</a>, then read our <a href="${site("newauthor", "/")}">first book guide</a>.</p>

<h2>"My book is on KDP and now I want IngramSpark too"</h2>
<p>This is where good books get rejected. IngramSpark's rules are stricter: <strong>0.5" safety margins on every page</strong> (KDP allows less on the outside), a <strong>240% total ink limit</strong>, its own spine width (its paper is different) and a different barcode box. A file that passed KDP can fail IngramSpark on day one. Read <a href="${site("errors", "/passed-kdp-failed-ingramspark/")}">why it passed KDP but failed IngramSpark</a>.</p>

<h2>"I'm changing paper, page count or trim size"</h2>
<p>Every one of these changes your cover size. Going from white to cream paper makes a 300-page KDP spine about 0.074" wider. Adding a chapter changes the spine. A new trim size changes everything. Re-check the cover and margins each time. See the <a href="${site("covers", "/cover-size-chart/")}">cover size chart</a>.</p>

<h2>"I'm making a hardcover"</h2>
<p>Hardcovers have extra pieces: a case wrap that folds over boards, and maybe a dust jacket with flaps. Each piece has its own size, its own hinge or fold areas and its own "no text here" zones. A dust jacket book can need <strong>three files</strong>: case, jacket and interior. <a href="${site("covers", "/hardcover-and-dust-jacket/")}">Hardcover rules, explained.</a></p>

<h2>"My book has color pictures, or it's a children's book"</h2>
<p>Color and full-page pictures bring the most rules: pictures must be 300 DPI, art that touches the page edge needs interior bleed, and dark pictures can go over the ink limit. Picture books also tend to use fonts and effects (shadows, see-through shapes) that need flattening. Check <a href="${site("fix", "/image-resolution/")}">picture sharpness</a> and <a href="${site("fix", "/transparency/")}">transparency</a> first.</p>

<h2>"I'm a black and white novel or non-fiction book"</h2>
<p>Your risks are fewer, but sneaky: "black" text saved as RGB color, a blue link left in the text, a colored logo on the copyright page. Black and white printers treat all of these as color. <a href="${site("fix", "/color-and-ink/")}">How to make it truly black and white.</a></p>

<h2>"I help other authors" (formatters, small presses, coaches)</h2>
<p>If you send files for clients, one rejection costs you time and trust. Run every client book through the same checks, every time, and keep a record of what passed. SparkPrep's report lists every check, for the printer you chose, so you can hand the client proof that the files were checked.</p>
`,
    faq: [
      { q: "Do experienced authors need preflight?", a: "Yes, mainly when something changes: a new printer, new paper, a new page count, a new trim size or a hardcover. Each change can break a file that passed before." },
      { q: "Is preflight harder for children's books?", a: "Usually yes. Full-page color pictures need 300 DPI, interior bleed and an ink limit check, and effects like shadows often need flattening." },
    ],
  },
  {
    path: "/preflight-vs-proof-copy/",
    nav: "Preflight vs proof",
    crumb: "Preflight vs. a proof copy",
    title: "Preflight vs Proof Copy vs Printer Review: What's What",
    description: "Preflight, the printer's file review and a printed proof copy each catch different problems. Here's what each one does and why you want all three.",
    eyebrow: "Three checks, three jobs",
    h1: "Preflight vs. the printer's review vs. a proof copy",
    lead: "Authors often think, \"I'll just order a proof.\" A proof copy is great, but it can only show you a book that the printer already accepted. Here's how the three checks fit together.",
    answer: "<p><strong>Preflight</strong> is your own check of the files before upload. The <strong>printer's review</strong> is their automatic check after upload, which can reject the files. A <strong>proof copy</strong> is a printed book you order to see how it really looks. Preflight gets you through the review; the proof shows the final look.</p>",
    cardText: "What each check catches, and why skipping preflight costs time.",
    body: `
<h2>Side by side</h2>
<div class="table-wrap"><table>
<tr><th></th><th>Preflight</th><th>Printer's file review</th><th>Proof copy</th></tr>
<tr><td>When</td><td>Before you upload</td><td>Right after you upload</td><td>After the files are accepted</td></tr>
<tr><td>Who does it</td><td>You, or a tool like SparkPrep</td><td>KDP, IngramSpark, B&amp;N Press or Lulu</td><td>You, holding the book</td></tr>
<tr><td>Catches</td><td>Size, bleed, margins, fonts, pictures, color, ink, spine</td><td>Mostly the same things, as pass or fail</td><td>How it looks and feels: color shifts, readability, spine centering, typos</td></tr>
<tr><td>Tells you how to fix it?</td><td>A good one does</td><td>Rarely. Usually a short error message</td><td>No</td></tr>
<tr><td>Cost of a miss</td><td>Nothing yet</td><td>A rejection, a new upload and another wait</td><td>A new proof, more shipping and more waiting</td></tr>
</table></div>

<h2>Why the printer's review isn't enough</h2>
<p>The printer's review is pass or fail. When it fails, you get a message like "insufficient bleed" or "content outside the safety area", often with no picture of where. You fix what you think is wrong, upload again and wait again. Authors commonly go around this loop several times. SparkPrep's founder went around it <strong>18 times</strong> with his own book, which is why SparkPrep exists. Our <a href="${site("errors", "/")}">rejection messages site</a> explains what those short messages really mean.</p>

<h2>Why a proof copy isn't enough</h2>
<p>You can only order a proof once your files are accepted, so a proof can't save you from a rejection. And some problems don't show in one copy: a spine that's slightly off-center may look fine in your proof and wander in the next print run, because the printer's fold can move a little each time. Preflight makes sure there's enough room for that movement.</p>

<h2>The order that saves the most time</h2>
<ol class="steps">
  <li>Preflight both files and fix everything it finds.</li>
  <li>Upload. The printer's review should pass the first time.</li>
  <li>Check the printer's online preview page by page.</li>
  <li>Order one printed proof. Read it with a pen in hand.</li>
  <li>If you change anything after the proof (even one word that moves a page), preflight again before re-uploading.</li>
</ol>
<p>KDP lets you order printed proof copies for the printing cost plus shipping, and they are marked as proofs. It's money well spent, after preflight, not instead of it.</p>
`,
    faq: [
      { q: "Should I order a proof copy if I preflighted?", a: "Yes. Preflight gets your files accepted. A proof copy lets you see color, readability and feel on real paper. You want both." },
      { q: "Why was my file rejected after it looked fine on screen?", a: "Screens don't show bleed, ink coverage, embedded fonts or true picture resolution. The printer's review checks those, which is why preflight checks them first." },
    ],
  },
  {
    path: "/what-sparkprep-checks/",
    nav: "What SparkPrep checks",
    crumb: "What SparkPrep checks",
    title: "What SparkPrep Checks in Your Book Cover and Interior",
    description: "Every check SparkPrep runs on your book cover and interior for KDP, IngramSpark, Barnes & Noble Press and Lulu, in plain English, and what it can fix for you.",
    eyebrow: "No jargon, no guessing",
    h1: "What SparkPrep checks (and what it fixes)",
    lead: "Here is every check SparkPrep runs, in plain words, using the numbers from your printer's own guide. Nothing here is borrowed from another printer.",
    answer: "<p>SparkPrep checks trim size, bleed, spine width, safety margins, total ink (240% for IngramSpark), CMYK color, picture resolution, fonts, transparency, barcode space, spine text, leftover template guides and ISBN match. It explains each problem and can fix most of them, then export a print-ready PDF/X-1a file.</p>",
    cardText: "Every check, in plain English, and which ones SparkPrep fixes for you.",
    body: `
<h2>Cover checks</h2>
<div class="table-wrap"><table>
<tr><th>Check</th><th>What it means</th><th>SparkPrep can fix it?</th></tr>
<tr><td>Full cover size</td><td>Is the file the exact size for your trim, page count and paper?</td><td>Yes, it re-fits the cover</td></tr>
<tr><td>Bleed</td><td>Does the background run 0.125" past every edge?</td><td>Yes, in most cases</td></tr>
<tr><td>Spine width</td><td>Does the spine match your printer's paper and page count?</td><td>Yes, it re-fits the spine</td></tr>
<tr><td>Spine text</td><td>Is the book thick enough for spine text, and does the text fit?</td><td>Flags it and shows you where</td></tr>
<tr><td>Safe zone</td><td>Are words and faces away from the trim and fold lines?</td><td>Flags it and shows you where</td></tr>
<tr><td>Barcode space</td><td>Is the barcode box on the back clear?</td><td>Flags it</td></tr>
<tr><td>Template leftovers</td><td>Did the printer's guide lines get left in the art?</td><td>Flags it</td></tr>
<tr><td>ISBN match</td><td>Does the ISBN on the cover match the one for this edition?</td><td>Flags it</td></tr>
<tr><td>Color and ink</td><td>Is it CMYK, and under 240% total ink for IngramSpark?</td><td>Yes</td></tr>
<tr><td>Resolution</td><td>Is the art at least 300 DPI at full size?</td><td>Can upscale with SparkPrep's own non-AI method; tells you if a new file is better</td></tr>
</table></div>

<h2>Interior checks (every page)</h2>
<div class="table-wrap"><table>
<tr><th>Check</th><th>What it means</th><th>SparkPrep can fix it?</th></tr>
<tr><td>Page size</td><td>Is every page your trim size (for example not letter size)?</td><td>Yes, it re-fits and re-centers</td></tr>
<tr><td>Margins</td><td>Is everything, including page numbers, inside your printer's safety area for your page count?</td><td>Yes</td></tr>
<tr><td>Fonts</td><td>Is every font built into the PDF?</td><td>Yes, when the font allows it</td></tr>
<tr><td>Color in a black and white book</td><td>Is there any RGB or rich black hiding in the pages?</td><td>Yes, exports true black and white</td></tr>
<tr><td>Ink limit</td><td>Is any spot over 240% total ink?</td><td>Yes</td></tr>
<tr><td>Pictures</td><td>Are pictures sharp enough to print?</td><td>Flags each one by page</td></tr>
<tr><td>Transparency and layers</td><td>Are there live effects that can print as boxes?</td><td>Yes, flattens them</td></tr>
</table></div>

<h2>What you get</h2>
<ul class="checks">
  <li><strong>A plain-English list</strong> of every problem and where it is.</li>
  <li><strong>Fixes</strong> for the problems SparkPrep can repair itself. It only asks you for a new file when fixing would damage your art (for example, stretching a picture that's the wrong shape).</li>
  <li><strong>Print-ready files</strong> in PDF/X-1a, the format printers trust most.</li>
  <li><strong>A report.</strong> Books whose final files pass every check get <em>The SparkPrep Certified Complete Publisher Preflight Report</em>.</li>
</ul>

<h2>What it costs</h2>
<p>The scan is free and tells you how many problems there are. The audit shows every problem and where it is for ${PRICES.audit} (${PRICES.auditLater} after ${PRICES.auditChangeDate}). The Advanced Audit checks every interior page, up to 300, for ${PRICES.advanced}. Fixing and exporting a book is ${PRICES.book} per book, and audit fees count toward it. Designing your cover in <a href="${L.coverStudio}">Cover Studio</a> (224 free templates, 333 free fonts) is free.</p>
<p>Prefer to fix things yourself? Every check above has a do-it-yourself guide on our <a href="${site("fix", "/")}">print file fixes</a> site.</p>
`,
    faq: [
      { q: "Which printers does SparkPrep check for?", a: "Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu, each with its own numbers." },
      { q: "Does the audit fix my files?", a: "No. The audit finds and shows every problem. Fixing and exporting print-ready files is part of the book price, and the audit fee counts toward it." },
    ],
  },
  {
    path: "/kdp-vs-ingramspark-rules/",
    nav: "KDP vs IngramSpark",
    crumb: "KDP vs. IngramSpark file rules",
    title: "KDP vs IngramSpark File Rules: Side-by-Side Numbers",
    description: "KDP vs IngramSpark print file rules side by side: margins, bleed, ink limit, barcode box, spine text and page counts, from each printer's own guide.",
    eyebrow: "Same book, two printers",
    h1: "KDP vs. IngramSpark: the file rules side by side",
    lead: "Most authors print with KDP, IngramSpark, or both. Their rules look alike but differ in the places that cause rejections. Here are the numbers that matter.",
    answer: "<p>Both need 0.125\" bleed and 300 DPI pictures. <strong>IngramSpark is stricter</strong>: 0.5\" safety margins on every page, a 240% total ink limit and a 1.75\" x 1\" barcode area. <strong>KDP</strong> allows 0.25\" outside margins (0.375\" with bleed), grows the inside margin with page count and uses a 2\" x 1.2\" barcode area.</p>",
    cardText: "The numbers that differ between KDP and IngramSpark, in one table.",
    body: `
<div class="table-wrap"><table>
<tr><th>Rule</th><th>Amazon KDP</th><th>IngramSpark</th></tr>
<tr><td>Cover bleed</td><td>0.125" on outer edges</td><td>0.125" on outer edges</td></tr>
<tr><td>Interior outside margin</td><td>At least 0.25" (0.375" with bleed)</td><td>At least 0.5" on every edge</td></tr>
<tr><td>Interior inside margin</td><td>0.375" up to 150 pages, rising to 0.875" for 701 to 828 pages</td><td>At least 0.5"; more is wise for thick books</td></tr>
<tr><td>Total ink limit</td><td>Not published as a number</td><td>240%</td></tr>
<tr><td>Barcode area (back cover)</td><td>2" wide x 1.2" tall, lower right</td><td>1.75" wide x 1" tall</td></tr>
<tr><td>Spine text allowed</td><td>More than 79 pages</td><td>48 pages or more (paperback)</td></tr>
<tr><td>Spine per page, white paper</td><td>0.002252"</td><td>About 512 pages per inch (50# white)</td></tr>
<tr><td>Spine per page, cream paper</td><td>0.0025"</td><td>About 444 pages per inch (50# creme)</td></tr>
<tr><td>Page count range</td><td>24 to 828</td><td>18 to 1,200 (depends on size and paper)</td></tr>
<tr><td>Preferred file</td><td>Print PDF</td><td>PDF/X-1a</td></tr>
</table></div>
<p class="note">Numbers from each printer's own help pages and templates. They change from time to time, so check before you upload.</p>

<h2>What this means for you</h2>
<h3>If you build for IngramSpark, KDP usually accepts it too</h3>
<p>Use 0.5" margins on every side (plus the bigger inside margin your page count needs), keep total ink under 240%, and save as PDF/X-1a. That interior will usually pass both. The cover is the exception: it needs its own size for each printer.</p>
<h3>Never reuse one cover for both</h3>
<p>Because the paper differs, the spine differs. A 300-page book on white paper has a KDP spine of about 0.676" and an IngramSpark spine of about 0.586". That's almost a tenth of an inch, enough to push your spine text onto the front cover. Build two covers from two templates. Our <a href="${site("covers", "/ingramspark-cover-size/")}">IngramSpark cover size</a> and <a href="${site("covers", "/cover-size-chart/")}">KDP cover size chart</a> pages show the numbers.</p>
<h3>The ink limit trips up dark covers</h3>
<p>A black or deep navy cover made in Canva or Photoshop is often 300% ink or more. KDP may print it; IngramSpark will reject it. <a href="${site("fix", "/color-and-ink/")}">How to bring ink under 240%.</a></p>
`,
    faq: [
      { q: "Can I use the same files for KDP and IngramSpark?", a: "The interior often works for both if it's built to IngramSpark's stricter rules. The cover almost never does, because the spine width differs." },
      { q: "Which is stricter, KDP or IngramSpark?", a: "IngramSpark, mainly because of its 0.5 inch safety margin on every page and its 240% total ink limit." },
    ],
  },
];
