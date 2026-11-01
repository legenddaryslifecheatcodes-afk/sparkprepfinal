// sparkpreplandingfix.legenddary.com — ONLY how to fix print file problems (bleed, margins, fonts, transparency...).
import { MAIN_LINKS as L, site } from "./shared.mjs";

const fullGuide = (slug, label) => `<p class="note">Want every click spelled out? Read the full walkthrough: <a href="${L.guide(slug)}">${label}</a> on sparkprep.legenddary.com.</p>`;

export const pages = [
  {
    path: "/",
    nav: "All fixes",
    crumb: "Fix your book's print files",
    title: "Fix Book Print File Problems: Bleed, Margins, Fonts & More",
    description: "Plain-English fixes for the book file problems printers reject: bleed, margins, fonts, transparency, low-resolution pictures, color, ink, page size and spine.",
    eyebrow: "Fixes only. No fluff.",
    h1: "Fix your book's print files",
    lead: "Something's wrong with your cover or interior file. Find the problem below, see what causes it, and fix it in the app you used. Every fix is written for people who are not designers.",
    answer: "<p>Most print file problems come from eight causes: <strong>missing bleed, small margins, fonts not embedded, live transparency, low-resolution pictures, RGB color or too much ink, the wrong PDF page size, and a wrong spine width</strong>. Each has a fix in Word, Canva, InDesign, Affinity or Acrobat.</p>",
    body: `
<h2>Find your problem</h2>
<div class="table-wrap"><table>
<tr><th>What you see</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>Thin white line at the cover edge, or "insufficient bleed"</td><td>Art stops at the trim line</td><td><a href="/bleed/">Add bleed</a></td></tr>
<tr><td>"Text outside margins" or "outside the safety area"</td><td>Margins too small, or page numbers too low</td><td><a href="/margins/">Fix margins</a></td></tr>
<tr><td>Content off-center, shrunk or cropped in the preview</td><td>PDF made at letter size, not trim size</td><td><a href="/page-size/">Fix page size</a></td></tr>
<tr><td>"Font not embedded"</td><td>PDF names a font but doesn't carry it</td><td><a href="/fonts/">Embed fonts</a></td></tr>
<tr><td>Shadows print as boxes, or "transparency" warning</td><td>Live see-through effects or layers</td><td><a href="/transparency/">Flatten it</a></td></tr>
<tr><td>Blurry pictures, or "below 300 DPI"</td><td>Picture too small for its printed size, or compressed</td><td><a href="/image-resolution/">Fix pictures</a></td></tr>
<tr><td>"Ink coverage exceeds 240%" or "RGB found"</td><td>Rich black, RGB color or dark photos</td><td><a href="/color-and-ink/">Fix color and ink</a></td></tr>
<tr><td>Spine text wraps to the front, or "spine width" error</td><td>Spine built for the wrong page count or paper</td><td><a href="/spine/">Fix the spine</a></td></tr>
</table></div>
<p>Got a rejection email with exact wording? Look it up on <a href="${site("errors", "/")}">Rejection Messages Decoded</a> to see which fix it points to.</p>

<h2>Three rules before you fix anything</h2>
<ol class="steps">
  <li><strong>Fix the original, not the PDF.</strong> Open the Word, Canva, InDesign or Affinity file you made the PDF from. Editing the PDF itself usually makes new problems.</li>
  <li><strong>Fix the size first.</strong> Page size and cover size come before everything else. If the size changes, margins and spine move too.</li>
  <li><strong>Check again after every fix.</strong> One fix can break another. Adding pages to fix margins changes your spine width, for example.</li>
</ol>

<h2>Which app do you have?</h2>
<p>Each fix page has steps for the common apps. A quick guide to what each can do:</p>
<div class="table-wrap"><table>
<tr><th>App</th><th>Good at</th><th>Can't do on its own</th></tr>
<tr><td>Microsoft Word</td><td>Page size, margins, fonts</td><td>True black-and-white (grayscale) PDF, ink limits, PDF/X-1a</td></tr>
<tr><td>Canva</td><td>Covers, bleed, flattening</td><td>Checking total ink, exact print profiles</td></tr>
<tr><td>Adobe InDesign</td><td>Everything, with the PDF/X-1a preset</td><td>Nothing major, but it has a learning curve and a monthly fee</td></tr>
<tr><td>Affinity Publisher</td><td>Bleed, margins, PDF/X-1a export</td><td>Some ink checks</td></tr>
<tr><td>Adobe Acrobat Pro</td><td>Finding problems (Preflight, Output Preview), converting color, embedding fonts</td><td>Changing your layout</td></tr>
</table></div>
<p>Don't have InDesign or Acrobat Pro? That's the gap SparkPrep fills: it reads your PDF, finds every problem for your printer, and repairs most of them for you.</p>
`,
    faq: [
      { q: "Can I fix a print problem by editing the PDF?", a: "Sometimes, with Acrobat Pro, for things like color conversion or embedding fonts. For size, bleed and margins, fix the original file and export a new PDF." },
      { q: "What is the most common book file problem?", a: "Missing cover bleed, followed by interior margins and PDFs made at the wrong page size." },
    ],
  },
  {
    path: "/bleed/",
    nav: "Bleed",
    crumb: "How to add bleed",
    title: "How to Add Bleed to a Book Cover (Canva, Word, InDesign)",
    description: "How to add 0.125 inch bleed to a book cover or interior in Canva, InDesign, Affinity or Word, how to check it, and why bleed errors come back.",
    eyebrow: "Fix: bleed",
    h1: "How to add bleed to your book cover (and pages)",
    lead: "Bleed is extra background that runs past the edge so the printer can trim it off cleanly. Almost every printer wants 0.125\" (3.2 mm) on every outside edge.",
    answer: "<p>To add bleed, make the file 0.125\" bigger on every outer edge (0.25\" wider and 0.25\" taller for a cover), then stretch the background art all the way to the new outer edge. Keep words and faces well inside the trim line.</p>",
    body: `
<h2>Check it in 30 seconds</h2>
<p>Open your cover PDF in any PDF reader and look at the page size (File → Properties, or Document Properties). For a paperback cover, the height should be your book's height <strong>plus 0.25"</strong>. A 6" x 9" book's cover is <strong>9.25" tall</strong>. If it's exactly 9", there's no bleed.</p>

<h2>The numbers</h2>
<ul class="checks">
  <li><strong>Cover width</strong> = 0.125 + back cover + spine + front cover + 0.125</li>
  <li><strong>Cover height</strong> = 0.125 + book height + 0.125</li>
  <li><strong>Interior with art to the edge</strong> = book width + 0.125 (outside edge only) by book height + 0.25</li>
</ul>
<p>Don't know your spine width? Use the <a href="${site("covers", "/cover-size-chart/")}">cover size chart</a> or SparkPrep's free <a href="${L.kdpCalc}">KDP cover calculator</a>.</p>

<h2>Fix it in Canva</h2>
<ol class="steps">
  <li>Turn on <strong>File → Settings → Show print bleed</strong>. A dashed line appears inside the edge: that's roughly where the cut goes.</li>
  <li>Drag every background photo and color block out past the outer edge of the design, not just to the dashed line.</li>
  <li>Move titles, author name and faces inward, well clear of the dashed line.</li>
  <li><strong>Share → Download → PDF Print</strong>, and tick <strong>Crop marks and bleed</strong>. (Then check your printer's rules: most want the bleed but not the crop marks.)</li>
</ol>
<p class="note">Canva adds bleed around your design size. If you started from your printer's full cover size (which already includes bleed), you may end up with double bleed. Measure the downloaded PDF and compare it to the numbers above.</p>

<h2>Fix it in InDesign or Affinity Publisher</h2>
<ol class="steps">
  <li><strong>InDesign:</strong> File → Document Setup → Bleed and Slug → 0.125 in on all sides. <strong>Affinity:</strong> File → Document Setup → Bleed → 0.125 in.</li>
  <li>Pull background frames to the red bleed line on every outer edge.</li>
  <li>Export with "Use document bleed settings" ticked (InDesign) or "Include bleed" (Affinity), as PDF/X-1a.</li>
</ol>

<h2>Fix it in Word (interior pages with pictures to the edge)</h2>
<ol class="steps">
  <li>Layout → Size → More Paper Sizes. Add 0.125" to the width and 0.25" to the height (a 6" x 9" book becomes 6.125" x 9.25").</li>
  <li>Make edge-to-edge pictures overlap the paper edge slightly.</li>
  <li>Add 0.125" to your outside, top and bottom margins so the text doesn't move closer to the trim.</li>
</ol>
<p>Word can't make a cover with proper bleed easily. Use Canva, Cover Studio or a printer template for the cover.</p>

<h2>Why bleed errors come back</h2>
<ul class="checks">
  <li>You made the file bigger but didn't stretch the background, so the extra space is white.</li>
  <li>You stretched the background, but the PDF export cropped to the trim size.</li>
  <li>Your spine changed (new page count or paper), so the whole cover is now the wrong width.</li>
  <li>You added bleed to an interior that has no art to the edge. If nothing touches the edge, you don't need interior bleed, and adding it changes your page size.</li>
</ul>
${fullGuide("fix-cover-bleed-error", "How to fix the \"insufficient or no bleed\" error")}
`,
    faq: [
      { q: "How much bleed does KDP need?", a: "0.125 inch (3.2 mm) on every outer edge of the cover, and on the outer edges of interior pages that have art running to the edge." },
      { q: "Does every book need interior bleed?", a: "No. Only books with pictures or color that touch the page edge. A normal novel doesn't need interior bleed." },
      { q: "Should I include crop marks?", a: "Usually no. KDP and IngramSpark want the bleed area but not printer's marks in the uploaded file." },
    ],
  },
  {
    path: "/margins/",
    nav: "Margins",
    crumb: "How to fix book margins",
    title: "How to Fix Book Margins for KDP & IngramSpark (Gutter Table)",
    description: "Fix interior margin errors: KDP's inside gutter by page count, IngramSpark's 0.5 inch safety area, and margin settings in Word, InDesign and Affinity.",
    eyebrow: "Fix: margins",
    h1: "How to fix your book's margins",
    lead: "Margin errors mean something on your pages sits too close to an edge or to the spine fold. The fix is the right numbers for your printer and page count, set once in your master layout.",
    answer: "<p>For <strong>KDP</strong>, use at least 0.25\" outside, top and bottom (0.375\" with bleed) and an inside margin from 0.375\" (up to 150 pages) to 0.875\" (701+ pages). For <strong>IngramSpark</strong>, keep everything at least 0.5\" from every edge. Page numbers and headers count.</p>",
    body: `
<h2>KDP inside margin (gutter) by page count</h2>
<div class="table-wrap"><table>
<tr><th>Pages</th><th>Inside margin (minimum)</th><th>Outside, top, bottom (minimum)</th></tr>
<tr><td>24 to 150</td><td>0.375"</td><td>0.25" (0.375" with bleed)</td></tr>
<tr><td>151 to 300</td><td>0.5"</td><td>0.25" (0.375" with bleed)</td></tr>
<tr><td>301 to 500</td><td>0.625"</td><td>0.25" (0.375" with bleed)</td></tr>
<tr><td>501 to 700</td><td>0.75"</td><td>0.25" (0.375" with bleed)</td></tr>
<tr><td>701 to 828</td><td>0.875"</td><td>0.25" (0.375" with bleed)</td></tr>
</table></div>
<p><strong>IngramSpark:</strong> 0.5" (13 mm) from every trim edge for all text, page numbers, borders and anything important. For thick books, add more on the inside so words don't vanish into the fold.</p>
<p><strong>Our advice:</strong> minimums are minimums. 0.75" outside and 0.75" to 1" inside looks better and passes every printer. Use the free <a href="${L.marginCalc}">margin calculator</a> to get your numbers.</p>

<h2>Fix it in Word</h2>
<ol class="steps">
  <li>Layout → Margins → <strong>Custom Margins</strong>.</li>
  <li>Under Pages, set Multiple pages to <strong>Mirror margins</strong>. Now "Left/Right" become "Inside/Outside".</li>
  <li>Type your Inside, Outside, Top and Bottom numbers. Leave Gutter at 0 (you already put the extra on the Inside).</li>
  <li>Set Apply to: <strong>Whole document</strong>. Section breaks can hide old margins in later chapters otherwise.</li>
  <li>Layout tab of the same box: set Header and Footer "From edge" to at least your printer's minimum (0.5" for IngramSpark), so page numbers sit inside the safe area.</li>
</ol>

<h2>Fix it in InDesign or Affinity</h2>
<ol class="steps">
  <li>Go to your <strong>master / parent pages</strong> (not individual pages).</li>
  <li>InDesign: Layout → Margins and Columns. Affinity: Document → Margins. Set Inside and Outside.</li>
  <li>Check that page number and running header frames sit inside the new margins on the master.</li>
  <li>Check any page that has its own override (chapter openers, full-page images).</li>
</ol>

<h2>Why margin errors come back</h2>
<ul class="checks">
  <li><strong>Your page count grew</strong> past a KDP step (for example from 148 to 156 pages), so the inside margin needs to grow too.</li>
  <li><strong>The PDF isn't your trim size.</strong> If it's letter size, the printer shrinks it and your margins move. <a href="/page-size/">Fix page size first.</a></li>
  <li><strong>Page numbers in the footer</strong> sit below the safe line even though the body text is fine.</li>
  <li><strong>A wide table or picture</strong> pokes past the margin on one page.</li>
</ul>
${fullGuide("fix-kdp-margin-error", "KDP margin error and the gutter table")}
${fullGuide("fix-ingramspark-interior-safety-area", "IngramSpark \"outside the safety area\" error")}
`,
    faq: [
      { q: "What is the gutter in a book?", a: "The inside margin by the spine. Thicker books curve more there, so they need a bigger gutter." },
      { q: "Do page numbers have to be inside the margins?", a: "Yes. KDP and IngramSpark treat page numbers and headers like any other content." },
    ],
  },
  {
    path: "/page-size/",
    nav: "Page size",
    crumb: "Fix PDF page size",
    title: "Fix the Wrong PDF Page Size for Your Book (Letter vs 6x9)",
    description: "If your interior PDF is letter size but your book is 6x9, the printer shrinks or crops it. How to set the right trim size in Word and InDesign.",
    eyebrow: "Fix: page size",
    h1: "How to fix the wrong PDF page size",
    lead: "If your book is 6\" x 9\" but your PDF pages are 8.5\" x 11\" (letter), the printer has to shrink or crop every page. Your text ends up off-center, too small, or too close to the edge.",
    answer: "<p>Your PDF page size must equal your book's trim size (for example 6\" x 9\"), or trim size plus bleed if art touches the edge. Set the paper size in your original file to the trim size, re-flow the text, then export a new PDF.</p>",
    body: `
<h2>Check it in 10 seconds</h2>
<p>Open the PDF and look at Document Properties (Acrobat: File → Properties → Description → Page Size). It must match your trim size exactly. Every page, not just the first: a pasted-in section can carry its own size.</p>

<h2>Fix it in Word</h2>
<ol class="steps">
  <li><strong>Save a copy first.</strong> Changing page size re-flows every page.</li>
  <li>Layout → Size → <strong>More Paper Sizes</strong>. Type your trim width and height. Apply to: Whole document.</li>
  <li>Reset margins for the new size (see <a href="/margins/">margins</a>). Letter-size margins are far too big for a 5" x 8" book.</li>
  <li>Check every chapter: pictures, tables and page breaks will have moved. Fix any orphaned lines and empty pages.</li>
  <li>Your page count probably changed. Note the new count; your cover's spine depends on it.</li>
  <li>File → Save As → PDF. In Options, choose "Standard (publishing online and printing)".</li>
</ol>

<h2>Fix it in InDesign or Affinity</h2>
<ol class="steps">
  <li>File → Document Setup. Change width and height to your trim size.</li>
  <li>Use "Adjust layout" (InDesign) or let Affinity rescale content, then check each spread.</li>
  <li>Export again as PDF/X-1a.</li>
</ol>

<h2>Common trim sizes</h2>
<div class="table-wrap"><table>
<tr><th>Book type</th><th>Common trim sizes</th></tr>
<tr><td>Novels</td><td>5" x 8", 5.25" x 8", 5.5" x 8.5", 6" x 9"</td></tr>
<tr><td>Non-fiction, memoir</td><td>5.5" x 8.5", 6" x 9"</td></tr>
<tr><td>Workbooks, journals</td><td>7" x 10", 8" x 10", 8.5" x 11"</td></tr>
<tr><td>Children's picture books</td><td>8" x 8", 8.5" x 8.5", 8.5" x 11"</td></tr>
</table></div>
<p>Pick a size your printer offers for your paper and binding. Not every size is available in hardcover or color.</p>

<h2>Shortcut: format it fresh</h2>
<p>If your Word file is a mess of sections and old settings, it can be faster to start clean. SparkPrep's free <a href="${L.interiorStudio}">Interior Studio</a> imports your Word file and lays it out at your exact trim size, with margins set to your printer's own table for your page count.</p>
${fullGuide("fix-pdf-page-size-mismatch", "PDF page size doesn't match trim size")}
`,
    faq: [
      { q: "Can I upload a letter-size PDF for a 6x9 book?", a: "You shouldn't. The printer will shrink or reject it, and the result is usually off-center text and margin errors." },
      { q: "Why did my page count change when I changed the page size?", a: "Smaller pages hold fewer words, so the text re-flows onto more pages. Update your cover's spine width to match." },
    ],
  },
  {
    path: "/fonts/",
    nav: "Fonts",
    crumb: "How to embed fonts",
    title: "How to Embed Fonts in a Book PDF (Word, Canva, InDesign)",
    description: "Fix 'font not embedded' and font license errors in your book PDF: how to embed every font in Word, InDesign, Affinity and Canva, and how to check in Acrobat.",
    eyebrow: "Fix: fonts",
    h1: "How to embed fonts in your book PDF",
    lead: "A PDF can carry its fonts inside it, or just name them and hope the next computer has them. Printers need every font carried inside, even Arial and Times New Roman.",
    answer: "<p>To fix \"font not embedded\", re-export the PDF with font embedding on: in Word, tick <strong>Embed fonts in the file</strong> (File → Options → Save) and export as PDF; in InDesign or Affinity, export with the <strong>PDF/X-1a</strong> preset. Check in Acrobat under File → Properties → Fonts.</p>",
    body: `
<h2>Check it in 30 seconds</h2>
<p>Open the PDF in Adobe Acrobat (Reader works too): <strong>File → Properties → Fonts</strong>. Every font should end with "(Embedded)" or "(Embedded Subset)". If any font doesn't, that's your problem.</p>

<h2>Fix it in Word</h2>
<ol class="steps">
  <li>File → Options → Save. Tick <strong>Embed fonts in the file</strong> and untick <strong>Do not embed common system fonts</strong>.</li>
  <li>File → Save As → PDF → Options. Tick <strong>ISO 19005-1 compliant (PDF/A)</strong>. This forces every font in.</li>
  <li>Save, then check in Acrobat again.</li>
</ol>

<h2>Fix it in InDesign or Affinity</h2>
<ol class="steps">
  <li>Export with the <strong>PDF/X-1a</strong> preset. It refuses to export with missing fonts, so it also tells you which ones are a problem.</li>
  <li>If InDesign shows a font as missing (pink highlight), install it or swap it before exporting.</li>
</ol>

<h2>Fix it in Canva</h2>
<p>Canva's PDF Print download embeds fonts in almost every case. If a printer still flags a font, download again with <strong>Flatten PDF</strong> ticked: that turns text into artwork, so there's no font to embed. (Use this for covers. Don't flatten a whole interior, because the text gets heavier and less sharp.)</p>

<h2>When a font won't embed</h2>
<p>Some fonts have a license that forbids embedding. Your app will skip them quietly. You have two choices:</p>
<ul class="checks">
  <li><strong>Swap the font</strong> for one with an open license (for example from Google Fonts, all of which may be embedded). SparkPrep's <a href="${L.coverStudio}">Cover Studio</a> has 333 such fonts.</li>
  <li><strong>Turn that text into outlines</strong> (InDesign: Type → Create Outlines; Affinity: Layer → Convert to Curves). Only do this for a few words, like a cover title.</li>
</ul>

<h2>Free fonts aren't always free for books</h2>
<p>A font from a "free fonts" website may be free for personal use only. A book you sell is commercial use. Check the license before you build your cover around it. If it says "personal use only", buy the commercial license or pick another font.</p>
${fullGuide("fix-font-not-embedded", "\"Font not embedded\" error")}
${fullGuide("fix-font-licensing-error", "font licensing problems")}
`,
    faq: [
      { q: "Do I need to embed Arial or Times New Roman?", a: "Yes. Printers want every font embedded, and some apps skip common fonts by default." },
      { q: "Are Google Fonts OK for a printed book?", a: "Yes. Google Fonts use open licenses that allow commercial use and embedding in PDFs." },
    ],
  },
  {
    path: "/transparency/",
    nav: "Transparency",
    crumb: "How to flatten transparency",
    title: "How to Flatten Transparency & Layers in a Book PDF",
    description: "Shadows and see-through shapes can print as boxes. How to flatten transparency and layers for KDP and IngramSpark in Canva, InDesign, Affinity and Acrobat.",
    eyebrow: "Fix: transparency",
    h1: "How to flatten transparency and layers",
    lead: "Drop shadows, soft glows, faded pictures and see-through shapes are all \"transparency\". On screen they look great. On a printing press they can turn into white boxes, hard edges or missing art.",
    answer: "<p>To flatten a book PDF, export it as <strong>PDF/X-1a</strong> (which doesn't allow live transparency or layers), or use your app's flatten option: Canva's <strong>Flatten PDF</strong> box, InDesign's Flattener Preview set to High Resolution, or Acrobat Pro's Print Production → Flattener Preview.</p>",
    body: `
<h2>Where transparency hides</h2>
<ul class="checks">
  <li>Drop shadows behind titles and author names.</li>
  <li>Glows and soft edges on pictures.</li>
  <li>Shapes or text with opacity under 100%.</li>
  <li>PNG pictures with see-through backgrounds (logos, mascots, cut-out photos).</li>
  <li>Blend modes (multiply, screen, overlay) in Photoshop, Canva or Affinity.</li>
</ul>

<h2>Fix it in Canva</h2>
<ol class="steps">
  <li>Share → Download → <strong>PDF Print</strong>.</li>
  <li>Tick <strong>Flatten PDF</strong>.</li>
  <li>Download, then zoom in to 400% on every shadow and faded area to check nothing changed.</li>
</ol>

<h2>Fix it in InDesign</h2>
<ol class="steps">
  <li>Export → Adobe PDF (Print) → preset <strong>PDF/X-1a:2001</strong>. This flattens automatically.</li>
  <li>Under Advanced, set Transparency Flattener to <strong>High Resolution</strong>.</li>
  <li>Before exporting, Window → Output → Flattener Preview shows what will change.</li>
</ol>

<h2>Fix it in Affinity Publisher or Photo</h2>
<ol class="steps">
  <li>File → Export → PDF → Preset <strong>PDF/X-1a:2003</strong>.</li>
  <li>For a single cover image, Document → Flatten (Affinity Photo) before export also works.</li>
</ol>

<h2>Fix a finished PDF in Acrobat Pro</h2>
<ol class="steps">
  <li>Tools → Print Production → <strong>Flattener Preview</strong>.</li>
  <li>Choose "High Resolution", tick "Apply to all pages", then Apply.</li>
  <li>Save as a new file, then Print Production → Preflight to confirm "no transparency".</li>
</ol>

<h2>After flattening, check these</h2>
<ul class="checks">
  <li><strong>Thin white lines</strong> ("stitching") across pictures. They often only show on screen, but check at high zoom.</li>
  <li><strong>Text that got heavier or blurry.</strong> If text was turned into a picture, flatten again with text kept as text (InDesign: tick "Convert all text to outlines" off).</li>
  <li><strong>Color shifts</strong> where a shadow overlapped a photo.</li>
</ul>
<p>SparkPrep finds live transparency and layers on every page and flattens them for you as part of the print-ready export.</p>
${fullGuide("fix-transparency-and-layers-in-pdf", "\"PDF contains transparency or layers\"")}
`,
    faq: [
      { q: "Does KDP accept transparency?", a: "KDP recommends flattening. IngramSpark's preferred format, PDF/X-1a, doesn't allow live transparency at all." },
      { q: "Will flattening make my cover blurry?", a: "Not if you flatten at high resolution (300 DPI or more). Check text and edges at high zoom afterwards." },
    ],
  },
  {
    path: "/image-resolution/",
    nav: "Pictures (DPI)",
    crumb: "Fix low-resolution pictures",
    title: "Fix Blurry Book Pictures: 300 DPI Pixel Sizes for Print",
    description: "How to fix low-resolution (under 300 DPI) pictures in a book: pixel sizes for common covers and pages, how to stop Word compressing images, and what not to do.",
    eyebrow: "Fix: picture quality",
    h1: "How to fix low-resolution pictures",
    lead: "A picture that looks sharp on your screen can print soft or blocky. Printers want 300 DPI at the size the picture prints, and some apps quietly lower it when you save.",
    answer: "<p>A picture needs <strong>300 pixels for every inch</strong> it prints. Multiply the printed width and height in inches by 300 to get the pixels you need. If the picture is smaller, use a bigger original, print it smaller, or turn off image compression before exporting.</p>",
    body: `
<h2>Pixels you need (at 300 DPI)</h2>
<div class="table-wrap"><table>
<tr><th>What</th><th>Printed size</th><th>Pixels needed</th></tr>
<tr><td>Front cover, 5" x 8" book, with bleed</td><td>5.125" x 8.25"</td><td>1538 x 2475</td></tr>
<tr><td>Front cover, 5.5" x 8.5" book, with bleed</td><td>5.625" x 8.75"</td><td>1688 x 2625</td></tr>
<tr><td>Front cover, 6" x 9" book, with bleed</td><td>6.125" x 9.25"</td><td>1838 x 2775</td></tr>
<tr><td>Full-page picture, 8.5" x 11" book, with bleed</td><td>8.625" x 11.25"</td><td>2588 x 3375</td></tr>
<tr><td>Half-page picture in a 6" x 9" book</td><td>4.5" x 3"</td><td>1350 x 900</td></tr>
<tr><td>Author photo on the back</td><td>1.5" x 2"</td><td>450 x 600</td></tr>
</table></div>
<p>Not sure what yours is? SparkPrep's free <a href="${L.dpiChecker}">image DPI checker</a> reads the picture in your browser (nothing is uploaded) and tells you the biggest size it prints sharp.</p>

<h2>Stop Word from shrinking your pictures</h2>
<ol class="steps">
  <li>File → Options → Advanced → <strong>Image Size and Quality</strong>.</li>
  <li>Tick <strong>Do not compress images in file</strong> and set Default resolution to <strong>High fidelity</strong>.</li>
  <li>Delete the pictures and insert the originals again (pictures already compressed stay compressed).</li>
  <li>Save as PDF with "Standard (publishing online and printing)".</li>
</ol>

<h2>Canva</h2>
<ul class="checks">
  <li>Always download <strong>PDF Print</strong>, never PDF Standard.</li>
  <li>Upload the biggest version of your photo you have. Don't stretch a small picture to fill a full page.</li>
</ul>

<h2>InDesign</h2>
<ul class="checks">
  <li>Window → Links shows each picture's <strong>Effective PPI</strong>. Aim for 300 or more.</li>
  <li>On export, under Compression, don't downsample below 300.</li>
</ul>

<h2>What doesn't work</h2>
<ul class="checks">
  <li><strong>Changing the DPI number in Photoshop</strong> without adding pixels. It just relabels the file.</li>
  <li><strong>Screenshots.</strong> A screenshot is screen resolution (about 72 to 150).</li>
  <li><strong>Pictures saved from social media or messages.</strong> They're shrunk on upload. Ask for the original file.</li>
</ul>
<p>If the original is all you have, careful upscaling can help a little. SparkPrep uses its own non-AI upscale method that keeps your art as it is (it doesn't invent new detail), and tells you honestly when a new file would be better.</p>
${fullGuide("fix-low-resolution-images", "\"Image resolution is below 300 DPI\"")}
`,
    faq: [
      { q: "What DPI do I need for a printed book?", a: "300 DPI at the printed size. Line art and text-only images look best at 600." },
      { q: "Can I print a 72 DPI picture?", a: "Only very small. A picture at 72 DPI prints sharp at about a quarter of its screen size." },
    ],
  },
  {
    path: "/color-and-ink/",
    nav: "Color & ink",
    crumb: "Fix color and ink coverage",
    title: "Fix RGB, CMYK & 240% Ink Coverage in Book Files",
    description: "Fix 'ink coverage exceeds 240%' and 'RGB found' errors: convert book files to CMYK or true grayscale and lower total ink in Acrobat, InDesign and Canva.",
    eyebrow: "Fix: color and ink",
    h1: "How to fix color and ink problems",
    lead: "Screens make color with light (RGB). Printers use four inks (CMYK). Most color errors come from a file that's still in screen color, or from black made out of all four inks at once.",
    answer: "<p>Convert color files to <strong>CMYK</strong> and keep total ink (C+M+Y+K) under <strong>240%</strong> for IngramSpark. Make black text 100% K only. For a black and white book, export the interior as <strong>grayscale</strong> so no color or rich black is left.</p>",
    body: `
<h2>Three different problems</h2>
<div class="table-wrap"><table>
<tr><th>Problem</th><th>Who rejects it</th><th>Usual cause</th></tr>
<tr><td>RGB color in the file</td><td>IngramSpark (PDF/X-1a), Lulu; KDP converts it but colors can shift</td><td>Files from Word, Canva or phone photos</td></tr>
<tr><td>Total ink over 240%</td><td>IngramSpark</td><td>Rich black backgrounds, dark photos converted without an ink limit</td></tr>
<tr><td>Color in a black and white interior</td><td>All printers</td><td>"Black" text saved as RGB, blue links, a colored logo</td></tr>
</table></div>

<h2>Black and white interior: the fastest fix</h2>
<p>Export it as <strong>grayscale</strong>. Grayscale uses black ink only, so it can never go over 100% ink and has no color in it.</p>
<ol class="steps">
  <li>Acrobat Pro: Tools → Print Production → <strong>Convert Colors</strong>.</li>
  <li>Conversion profile: a gray profile such as <strong>Dot Gain 15%</strong> or Gray Gamma 2.2. Apply to all pages.</li>
  <li>Save as a new PDF and upload that one.</li>
</ol>
<p>No Acrobat? In Word, set all text to Automatic/black, turn pictures to grayscale (Picture Format → Color → Grayscale) and remove blue hyperlinks (select all, Ctrl+Shift+F9 turns links into plain text). It reduces the problem, but Word can't make a true grayscale PDF.</p>

<h2>Color covers and interiors: bring ink under 240%</h2>
<ol class="steps">
  <li><strong>Find it:</strong> Acrobat Pro → Print Production → Output Preview → tick Total Area Coverage, set 240%. Problem areas light up.</li>
  <li><strong>Black text and black shapes:</strong> make them C0 M0 Y0 K100, not a "rich" mix.</li>
  <li><strong>Big black backgrounds:</strong> use a lighter rich black, for example C40 M30 Y30 K100 (200% total).</li>
  <li><strong>Photos:</strong> convert to CMYK with a profile that has a low ink limit, then check Output Preview again.</li>
  <li>Export as PDF/X-1a.</li>
</ol>

<h2>Canva</h2>
<p>Canva Pro's PDF Print download has a <strong>CMYK</strong> color profile option. Use it for covers. It doesn't let you set an ink limit, so dark Canva covers often still pass KDP but fail IngramSpark's 240% check. Check the downloaded file, or let SparkPrep measure it.</p>

<h2>Expect colors to change a little</h2>
<p>Bright screen colors (electric blue, neon green, hot pink) can't be made with ink. They print duller. Look at your cover in CMYK before you approve it, and order a proof.</p>
<p>SparkPrep measures the ink on every page, brings it under 240% while keeping black text sharp, and exports true black and white interiors.</p>
${fullGuide("fix-ink-coverage-240", "\"Ink coverage exceeds 240%\"")}
${fullGuide("fix-rgb-in-black-and-white-interior", "RGB found in a black and white interior")}
`,
    faq: [
      { q: "What is total ink coverage?", a: "Cyan, magenta, yellow and black added together at one spot. 100% black alone is 100%. A rich black can be 300% or more." },
      { q: "Does KDP need CMYK?", a: "KDP accepts RGB and converts it, but colors can shift. IngramSpark's PDF/X-1a requires CMYK or grayscale." },
    ],
  },
  {
    path: "/spine/",
    nav: "Spine",
    crumb: "Fix spine width and spine text",
    title: "Fix Book Spine Width & Spine Text Errors (KDP, IngramSpark)",
    description: "Fix a wrong spine width or spine text error: how to re-fit your cover for a new page count or paper, center spine text and know when spine text is allowed.",
    eyebrow: "Fix: spine",
    h1: "How to fix spine width and spine text",
    lead: "The spine is exactly as thick as your pages. Change the page count or the paper, and the whole cover changes width. Spine text that was centered yesterday can now hang over the edge.",
    answer: "<p>Work out the spine from your printer's own paper numbers (KDP white: pages x 0.002252\"; cream: pages x 0.0025\"), rebuild the cover at the new full width, and keep spine text about 0.0625\" (1/16\") in from each fold. KDP allows spine text above 79 pages; IngramSpark paperbacks from 48 pages.</p>",
    body: `
<h2>Re-fit the cover after a page count change</h2>
<ol class="steps">
  <li>Get the <strong>final</strong> page count from the PDF (not from Word's status bar).</li>
  <li>Work out the new spine width for your printer and paper. See the <a href="${site("covers", "/spine-width/")}">spine width page</a> or the free <a href="${L.spineCalc}">spine calculator</a>.</li>
  <li>Change the cover's total width by the difference. Example: going from 300 to 340 pages on KDP white adds 40 x 0.002252 = 0.09".</li>
  <li><strong>Keep the back cover where it is and move the front cover over</strong> by that amount. Don't stretch the art.</li>
  <li>Widen the spine background to fill the new spine and re-center the spine text.</li>
  <li>Export again and compare the PDF's width to your printer's template.</li>
</ol>

<h2>Spine text rules</h2>
<ul class="checks">
  <li><strong>KDP:</strong> spine text only for books with more than 79 pages.</li>
  <li><strong>IngramSpark:</strong> no spine text on paperbacks under 48 pages.</li>
  <li>Leave a gap of at least 0.0625" (1/16") between text and each spine fold. The fold can move slightly in printing.</li>
  <li>In the US and UK, spine text usually reads top to bottom (book lying face up, you can read it).</li>
</ul>

<h2>Spine text too wide</h2>
<p>On a thin spine, even a short title can be too tall for the space. Fixes, in order:</p>
<ol class="steps">
  <li>Make the font smaller until there's 1/16" clear on each side.</li>
  <li>Use a narrower (condensed) font for the spine only.</li>
  <li>Drop the subtitle from the spine; keep title and author.</li>
  <li>If it still doesn't fit, leave the spine plain. A clean color is better than text wrapping onto the front.</li>
</ol>

<h2>Changed paper? Check the spine</h2>
<p>Switching from white to cream paper makes the spine wider (on KDP, a 300-page book goes from about 0.676" to 0.750"). Switching printers changes it too. Never reuse a spine width from another printer or paper.</p>
<p>SparkPrep re-fits your cover to the new spine for you, and its Cover Studio remembers which spine a design was built for, so it can warn you when your page count changes.</p>
${fullGuide("fix-spine-text-too-wide", "spine text too wide")}
${fullGuide("fix-spine-text-not-allowed", "spine text not allowed under the minimum page count")}
`,
    faq: [
      { q: "How many pages do I need for spine text?", a: "More than 79 pages on KDP. At least 48 pages for IngramSpark paperbacks." },
      { q: "Why is my spine text off-center in the proof?", a: "Usually the spine width doesn't match the final page count or paper, or the text sits too close to a fold. Rebuild with the exact width and keep 1/16 inch clear on each side." },
    ],
  },
];
