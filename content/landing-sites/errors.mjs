// sparkpreplandingerrors.legenddary.com — KDP & IngramSpark rejection messages decoded, in plain English.
import { MAIN_LINKS as L, site } from "./shared.mjs";

// One decoded message. quoted=true only when the wording comes from a real rejection the owner received.
function msg({ text, quoted, means, cause, fix, fixHref, fixLabel }) {
  return `<div class="box">
<h3>“${text}”</h3>
<p class="note">${quoted ? "Real wording from an IngramSpark rejection email." : "Paraphrased: the exact wording varies."}</p>
<p><strong>What it means:</strong> ${means}</p>
<p><strong>Most likely cause:</strong> ${cause}</p>
<p><strong>Do this:</strong> ${fix} <a href="${fixHref}">${fixLabel || "Step-by-step fix"} →</a></p>
</div>`;
}

export const pages = [
  {
    path: "/",
    nav: "All messages",
    crumb: "Book rejection messages decoded",
    title: "KDP & IngramSpark Rejection Messages Explained Simply",
    description: "Got a rejection from KDP or IngramSpark? Look up the message, see what it really means in plain English, the most likely cause, and exactly what to do next.",
    eyebrow: "Got a rejection? Start here.",
    h1: "Your book was rejected. Here's what the message means.",
    lead: "Printer rejection messages are short, shouty and written for print shops. This site turns each one into plain English: what it means, why it happened, and what to do next.",
    answer: "<p>Most KDP and IngramSpark rejections come down to a handful of problems: <strong>missing bleed, content outside the safety area, a PDF at the wrong page size, total ink over 240%, color in a black and white book, a wrong spine width, fonts not embedded</strong> and <strong>template lines left on the cover</strong>. Each has a known fix.</p>",
    body: `
<h2>Look up your message</h2>
<div class="table-wrap"><table>
<tr><th>If your message mentions…</th><th>It's really about</th><th>Go to</th></tr>
<tr><td>"bleed"</td><td>Cover art doesn't reach past the trim edge</td><td><a href="/ingramspark/#bleed">IngramSpark</a> · <a href="/kdp/#bleed">KDP</a></td></tr>
<tr><td>"safety area", "margins", "too close to the edge"</td><td>Text or page numbers too near an edge</td><td><a href="/ingramspark/#safety">IngramSpark</a> · <a href="/kdp/#margins">KDP</a></td></tr>
<tr><td>"not centered", "page size", "trim size"</td><td>PDF pages are the wrong size (often letter)</td><td><a href="/ingramspark/#safety">IngramSpark</a> · <a href="/kdp/#size">KDP</a></td></tr>
<tr><td>"240%", "ink coverage", "TAC"</td><td>Too much ink in dark areas</td><td><a href="/ingramspark/#ink">IngramSpark</a></td></tr>
<tr><td>"RGB", "color in black and white"</td><td>Screen color hiding in the file</td><td><a href="/ingramspark/#rgb">IngramSpark</a></td></tr>
<tr><td>"spine width", "spine text"</td><td>Cover built for the wrong page count or paper</td><td><a href="/ingramspark/#spine">IngramSpark</a> · <a href="/kdp/#spine">KDP</a></td></tr>
<tr><td>"template elements", "document size"</td><td>Printer's guide lines left in, or wrong cover size</td><td><a href="/ingramspark/#template">IngramSpark</a></td></tr>
<tr><td>"font", "embedded"</td><td>Fonts not built into the PDF</td><td><a href="/kdp/#fonts">KDP</a></td></tr>
<tr><td>"resolution", "DPI", "blurry"</td><td>Pictures too small for their printed size</td><td><a href="/kdp/#dpi">KDP</a></td></tr>
<tr><td>"ISBN does not match"</td><td>Barcode ISBN differs from the edition's ISBN</td><td><a href="/ingramspark/#isbn">IngramSpark</a></td></tr>
<tr><td>"jacket layout", "fold"</td><td>Text on a dust jacket fold, or wrong jacket size</td><td><a href="/ingramspark/#jacket">IngramSpark</a></td></tr>
<tr><td>"PDF/X-1a"</td><td>The PDF type isn't the print standard</td><td><a href="/ingramspark/#pdfx">IngramSpark</a></td></tr>
</table></div>

<h2>First, don't panic</h2>
<p>A rejection doesn't mean your book is bad, and it doesn't cost you your spot. It means one or two technical things in the file don't match the printer's rules. Almost all of them are fixable in an evening, if you know what they mean. <a href="/after-a-rejection/">Here's exactly what to do after a rejection.</a></p>

<h2>Why the messages are so confusing</h2>
<ul class="checks">
  <li><strong>They're written for print professionals.</strong> "Bookblock", "TAC" and "PDF/X-1a" are print-shop words.</li>
  <li><strong>One message can have several causes.</strong> "Content outside the safety area" can be small margins, low page numbers or the wrong page size.</li>
  <li><strong>They rarely say where.</strong> You get the problem, not the page number.</li>
  <li><strong>Several problems come at once</strong>, and fixing one can trigger another.</li>
</ul>
<p>SparkPrep's founder got <strong>18 rejections</strong> on his own book before he understood every one of these. SparkPrep was built so you don't have to. It reads your files and shows each problem, where it is, in plain English.</p>
`,
    faq: [
      { q: "Why did IngramSpark reject my book?", a: "The most common reasons are missing cover bleed, interior content outside the 0.5 inch safety area, total ink over 240%, color in a black and white interior, and a wrong spine width." },
      { q: "Does a rejection cost money?", a: "The rejection itself doesn't. What costs you is time: fixing, re-uploading and waiting for the next review, and paying a freelancer again if they made the file." },
    ],
  },
  {
    path: "/ingramspark/",
    nav: "IngramSpark",
    crumb: "IngramSpark rejection messages",
    title: "IngramSpark Rejection Messages: What They Mean & Fixes",
    description: "IngramSpark rejection emails decoded: insufficient bleed, bookblock safety area, ink over 240%, jacket layout, spine width, template elements and ISBN.",
    eyebrow: "IngramSpark",
    h1: "IngramSpark rejection messages, decoded",
    lead: "IngramSpark is the strictest of the big printers, and its rejection emails are written in capital letters for print professionals. Here is what each common one means.",
    answer: "<p>IngramSpark rejects files that break its rules: <strong>0.125\" cover bleed</strong>, everything <strong>0.5\" from trim edges</strong>, <strong>total ink 240% or less</strong>, the <strong>exact spine width</strong> for page count and paper, a clear <strong>barcode area</strong>, no leftover <strong>template lines</strong>, and a <strong>PDF/X-1a</strong> file.</p>",
    cardText: "Bleed, bookblock safety area, 240% ink, jacket layout, spine, template and ISBN messages.",
    body: `
<span id="bleed"></span>
${msg({ text: "INSUFFICIENT OR NO BLEED ON COVER LAYOUT", quoted: true, means: "The background on your cover stops at (or near) the trim line. IngramSpark needs it to run 0.125\" past every outer edge, because that strip is cut off.", cause: "The cover was made at the book's trim size, or the art wasn't stretched to the bleed edge, or the PDF export cropped the bleed.", fix: "Rebuild the cover at full size including bleed and stretch the background to the outer edge.", fixHref: site("fix", "/bleed/"), fixLabel: "Add bleed" })}
<span id="safety"></span>
${msg({ text: "BOOKBLOCK: INTERIOR CONTENT EXTENDS OUTSIDE THE SAFETY AREA … INTERIOR CONTENT IS NOT CENTERED", quoted: true, means: "\"Bookblock\" means your interior pages. Something on them (text, page numbers, borders) is closer than 0.5\" to an edge, and the content isn't centered on the page.", cause: "Almost always a PDF made at letter size (8.5\" x 11\") for a smaller book, so IngramSpark has to shrink it. Second most common: page numbers sitting too low.", fix: "Set the page size to your trim size, set every margin to at least 0.5\", move page numbers up, and export a new PDF.", fixHref: site("fix", "/page-size/"), fixLabel: "Fix page size and margins" })}
<span id="ink"></span>
${msg({ text: "Ink coverage exceeds 240%", quoted: true, means: "Somewhere, cyan + magenta + yellow + black add up to more than 240%. That much ink soaks the paper and smears.", cause: "Rich black backgrounds or text, dark photos, or a black and white interior saved in color.", fix: "Make black text 100% black only, lighten rich black backgrounds, and export black and white interiors as grayscale.", fixHref: site("fix", "/color-and-ink/"), fixLabel: "Fix ink coverage" })}
<span id="rgb"></span>
${msg({ text: "RGB / color content found in a black & white interior", quoted: false, means: "Your book is set to black and white, but the PDF has color in it, even if you can't see it.", cause: "Black text saved as RGB, a blue hyperlink, a colored logo on the copyright page, or a color photo.", fix: "Convert the interior to grayscale (Acrobat Pro: Print Production → Convert Colors) and remove colored links and logos.", fixHref: site("fix", "/color-and-ink/"), fixLabel: "Make it truly black and white" })}
<span id="spine"></span>
${msg({ text: "JACKET LAYOUT NOT BUILT TO SPEC. INCORRECT SPINE WIDTH — SPINE SHOULD BE 0.313\" FOR 78 PAGES. REDUCE SPINE TEXT TO FIT.", quoted: true, means: "Your cover's spine isn't the width IngramSpark worked out for your page count and paper, and the spine text is too big for the real spine.", cause: "The cover was built from another printer's numbers (often KDP's), an old page count, or the wrong paper.", fix: "Generate IngramSpark's own template for this book, re-fit the spine to its width, and shrink the spine text to leave 1/16\" each side.", fixHref: site("fix", "/spine/"), fixLabel: "Fix the spine" })}
<span id="template"></span>
${msg({ text: "Cover contains template elements / document size incorrect", quoted: false, means: "Guide lines or boxes from IngramSpark's cover template are still visible in your art, or the file isn't the template's size.", cause: "Designing on top of the template and exporting without hiding or deleting the template layer.", fix: "Delete the template layer, check the full cover size against the template, and export again.", fixHref: site("covers", "/ingramspark-cover-size/"), fixLabel: "IngramSpark cover sizes" })}
<span id="isbn"></span>
${msg({ text: "The ISBN on the cover does not match the ISBN of this title", quoted: false, means: "The ISBN in your barcode (or printed on the cover) is different from the ISBN you set up for this edition.", cause: "Reusing the paperback cover for the hardcover, or an old ISBN from a previous version.", fix: "Use the ISBN for this exact format and regenerate the barcode.", fixHref: site("covers", "/barcode-and-back-cover/"), fixLabel: "Barcode and ISBN rules" })}
<span id="jacket"></span>
${msg({ text: "JACKET LAYOUT NOT BUILT TO THE CORRECT SPECIFICATIONS", quoted: true, means: "Your dust jacket doesn't line up with the template: wrong size, or text across the flap folds.", cause: "A jacket built from a paperback cover, or text placed where the jacket folds around the book.", fix: "Rebuild on IngramSpark's jacket template and keep text clear of every fold line.", fixHref: site("covers", "/hardcover-and-dust-jacket/"), fixLabel: "Hardcover and jacket rules" })}
<span id="pdfx"></span>
${msg({ text: "The file is not PDF/X-1a compliant", quoted: false, means: "IngramSpark wants the print-standard PDF type, PDF/X-1a, which has embedded fonts, CMYK or gray color, and no live transparency.", cause: "Exporting from Word or Canva, which don't make PDF/X-1a.", fix: "Export as PDF/X-1a from InDesign or Affinity, or convert in Acrobat Pro (Print Production → Preflight → PDF/X-1a).", fixHref: site("fix", "/transparency/"), fixLabel: "Flatten and convert" })}
<p>Got a message that's not here? <a href="${L.ingramFixes}">SparkPrep's IngramSpark rejection fixes</a> page lists more.</p>
`,
    faq: [
      { q: "What does bookblock mean on IngramSpark?", a: "It means the interior pages of your book, as opposed to the cover." },
      { q: "How do I stop IngramSpark rejecting my file?", a: "Build to its rules: 0.5 inch margins, total ink under 240%, its own spine width, 0.125 inch bleed, a clear barcode area and a PDF/X-1a file. Then preflight before uploading." },
    ],
  },
  {
    path: "/kdp/",
    nav: "Amazon KDP",
    crumb: "Amazon KDP file errors",
    title: "Amazon KDP File Errors Explained: Margins, Bleed, Fonts",
    description: "Amazon KDP print previewer and file errors in plain English: text outside margins, bleed, page size mismatch, fonts not embedded, low resolution and spine text.",
    eyebrow: "Amazon KDP",
    h1: "Amazon KDP file errors, explained",
    lead: "KDP shows most problems in its print previewer before you can publish, sometimes with a red box on the page. Here's what each kind of message is telling you.",
    answer: "<p>KDP's most common print file errors are <strong>text outside the margins</strong> (inside margin too small for the page count), <strong>missing bleed</strong>, <strong>page size not matching the trim size</strong>, <strong>fonts not embedded</strong>, <strong>low-resolution images</strong> and <strong>spine text on books of 79 pages or fewer</strong>.</p>",
    cardText: "Margins, bleed, page size, fonts, image resolution and spine text errors on KDP.",
    body: `
<span id="margins"></span>
${msg({ text: "Text is outside the margins / content too close to the edge", quoted: false, means: "Something on a page sits inside KDP's no-go strip near an edge or the spine.", cause: "The inside margin is too small for your page count (KDP grows it from 0.375\" to 0.875\"), or page numbers sit too low.", fix: "Use KDP's table for your page count and mirror margins in Word.", fixHref: site("fix", "/margins/"), fixLabel: "KDP margin table and fix" })}
<span id="bleed"></span>
${msg({ text: "Your cover/background doesn't extend to the bleed edge", quoted: false, means: "Art must run 0.125\" past each outer edge of the cover, or of any interior page where art touches the edge.", cause: "A cover made at trim size, or interior bleed chosen in setup without making the pages bigger.", fix: "Rebuild at full size with bleed, or turn off bleed in setup if nothing touches the edge of your pages.", fixHref: site("fix", "/bleed/"), fixLabel: "Add bleed" })}
<span id="size"></span>
${msg({ text: "Interior page size does not match the trim size selected", quoted: false, means: "The PDF's pages are a different size from the trim size you chose in KDP.", cause: "A letter or A4 Word document, or bleed chosen in KDP but not added to the PDF (or the other way round).", fix: "Set the page size in your original file to your trim size (plus bleed if needed) and export again.", fixHref: site("fix", "/page-size/"), fixLabel: "Fix page size" })}
<span id="fonts"></span>
${msg({ text: "Font not embedded", quoted: false, means: "The PDF names a font but doesn't carry it, so KDP can't print it as you set it.", cause: "Word's \"do not embed common system fonts\" setting, or a font whose license blocks embedding.", fix: "Turn on font embedding and re-export, or swap the font.", fixHref: site("fix", "/fonts/"), fixLabel: "Embed fonts" })}
<span id="dpi"></span>
${msg({ text: "Image resolution is low / below 300 DPI", quoted: false, means: "A picture doesn't have enough pixels for the size it prints, so it may look blurry.", cause: "A small picture stretched big, a screenshot, or Word compressing images when saving.", fix: "Use the original, larger picture and turn off compression before exporting.", fixHref: site("fix", "/image-resolution/"), fixLabel: "Fix picture quality" })}
<span id="spine"></span>
${msg({ text: "Spine text is not allowed for books under the minimum page count", quoted: false, means: "Your book has 79 pages or fewer, so its spine is too thin for text on KDP.", cause: "A design made for a thicker book, or a final page count lower than planned.", fix: "Remove text from the spine (keep the color or art), or add real content to reach 80 pages.", fixHref: site("fix", "/spine/"), fixLabel: "Spine rules and fixes" })}
<span id="cover-size"></span>
${msg({ text: "Cover dimensions do not match the required size for this book", quoted: false, means: "The full cover file isn't the width and height KDP expects for your trim, page count and paper.", cause: "A spine from another printer or paper, or a page count that changed after the cover was made.", fix: "Work out the size again from the final page count and rebuild.", fixHref: site("covers", "/cover-size-chart/"), fixLabel: "KDP cover size chart" })}
<h2>KDP's previewer is your friend, up to a point</h2>
<p>KDP's online previewer shows red boxes where it finds problems and won't let you continue until the serious ones are fixed. It won't tell you how to fix them, and some things (like a spine that's a little off-center, or colors that shift in print) only show up in a printed proof. Preflight before uploading, use the previewer, then order a proof.</p>
`,
    faq: [
      { q: "Why does KDP say my text is outside the margins?", a: "Usually because the inside margin is smaller than KDP's minimum for your page count, or page numbers and headers sit too close to the edge." },
      { q: "How long does KDP take to review a paperback?", a: "KDP says books are usually live within about 3 business days after you publish, once the files pass. A rejection restarts the clock." },
    ],
  },
  {
    path: "/passed-kdp-failed-ingramspark/",
    nav: "Passed KDP, failed Ingram",
    crumb: "Passed KDP, failed IngramSpark",
    title: "Why Your Book Passed KDP But Failed IngramSpark",
    description: "Your files worked on KDP but IngramSpark rejected them. The five rules that differ (margins, ink, spine, barcode, PDF type) and how to pass both.",
    eyebrow: "The going-wide trap",
    h1: "Why your book passed KDP but failed IngramSpark",
    lead: "It's one of the most common surprises in self-publishing. KDP printed your book happily, then IngramSpark sent the same files back. Nothing is wrong with you: the two printers simply use different rules.",
    answer: "<p>IngramSpark is stricter than KDP in five places: <strong>0.5\" margins on every edge</strong> (KDP allows 0.25\" outside), a <strong>240% ink limit</strong>, a <strong>different spine width</strong> (different paper), a <strong>different barcode box</strong>, and a preference for <strong>PDF/X-1a</strong> files. Files built for KDP's minimums often fail one of these.</p>",
    cardText: "The five rules that differ, and how to make one set of files pass both printers.",
    body: `
<h2>The five differences, in order of how often they bite</h2>
<h3>1. Margins</h3>
<p>KDP lets text sit 0.25" from the outside edge. IngramSpark wants 0.5" from <em>every</em> edge, including page numbers. If you used KDP's minimums, IngramSpark will say your content "extends outside the safety area". <a href="${site("fix", "/margins/")}">Margin fix.</a></p>
<h3>2. Ink</h3>
<p>KDP doesn't publish a total ink number. IngramSpark rejects anything over 240%. Dark covers and black and white interiors saved in color are the usual culprits. <a href="${site("fix", "/color-and-ink/")}">Ink fix.</a></p>
<h3>3. Spine width</h3>
<p>The papers are different. A 300-page book on white paper has a spine of about 0.676" at KDP and about 0.586" at IngramSpark. The KDP cover is almost 0.1" too wide for IngramSpark. <a href="${site("covers", "/spine-width/")}">Spine chart.</a></p>
<h3>4. Barcode</h3>
<p>KDP adds its barcode in a 2" x 1.2" box if you leave the space. IngramSpark's template has its own barcode position and size. A KDP cover with a blank corner may need a barcode added for IngramSpark. <a href="${site("covers", "/barcode-and-back-cover/")}">Barcode rules.</a></p>
<h3>5. File type</h3>
<p>KDP accepts a normal print PDF. IngramSpark prefers PDF/X-1a, which rules out live transparency and RGB color. A Canva or Word PDF can fail on this alone. <a href="${site("fix", "/transparency/")}">Flatten and convert.</a></p>

<h2>One interior for both printers</h2>
<ul class="checks">
  <li>Margins: 0.5" or more on every edge, plus KDP's inside margin for your page count if it's bigger.</li>
  <li>Black and white: grayscale only. Color: CMYK under 240%.</li>
  <li>Fonts embedded, pictures 300 DPI, PDF/X-1a.</li>
</ul>
<p>Built this way, the same interior usually passes both.</p>

<h2>Two covers, always</h2>
<p>Because of the spine and barcode, build each printer's cover from its own template. It's the same art, re-fitted. SparkPrep re-fits a cover from one printer to another in a few minutes, and checks the ink and barcode at the same time.</p>
`,
    faq: [
      { q: "Can I use my KDP files on IngramSpark?", a: "The interior often works if it already has 0.5 inch margins and stays under 240% ink. The cover almost always needs re-fitting to IngramSpark's spine width and template." },
      { q: "Why is IngramSpark stricter than KDP?", a: "IngramSpark prints for bookstores and libraries worldwide on many presses, so it holds every file to one strict print standard." },
    ],
  },
  {
    path: "/after-a-rejection/",
    nav: "After a rejection",
    crumb: "What to do after a rejection",
    title: "Book Rejected by the Printer? What to Do Next (Step by Step)",
    description: "What to do after KDP or IngramSpark rejects your book file: decode the message, find every problem, fix the original, re-check and avoid a second rejection.",
    eyebrow: "Next steps",
    h1: "Your file was rejected. Here's what to do next.",
    lead: "The worst thing to do after a rejection is to fix the one thing it mentioned and upload again straight away. Rejections often come in rounds. Here's how to make the next upload the last one.",
    answer: "<p>After a rejection: <strong>1)</strong> look up what the message really means, <strong>2)</strong> check the whole file for every problem, not just the one named, <strong>3)</strong> fix the original file, <strong>4)</strong> re-check the new PDF, including the spine if the page count changed, <strong>5)</strong> re-upload and approve the new proof.</p>",
    cardText: "A calm, step-by-step plan so the next upload is the last one.",
    body: `
<h2>Step by step</h2>
<ol class="steps">
  <li><strong>Read the whole message.</strong> IngramSpark emails often list several problems in one block of capital letters. Split them into separate items.</li>
  <li><strong>Decode each one.</strong> Use the <a href="/">message lookup</a>. Write down the likely cause for each.</li>
  <li><strong>Check the whole file, not just what was named.</strong> Printers sometimes stop at the first few problems. Run the <a href="${site("landing", "/preflight-checklist/")}">full preflight checklist</a> or a SparkPrep scan.</li>
  <li><strong>Fix the original</strong> (Word, Canva, InDesign, Affinity), not the PDF. Fix page size first, then margins, then everything else.</li>
  <li><strong>Note your new page count.</strong> If it changed, your spine changed. Re-fit the cover.</li>
  <li><strong>Re-check the new PDFs</strong> before uploading.</li>
  <li><strong>Upload both files</strong> if the spine changed, even if only the interior was rejected.</li>
  <li><strong>Approve the new proof carefully.</strong> Look at every page in the online preview, then order a printed proof.</li>
</ol>

<h2>If a freelancer made the files</h2>
<ul class="checks">
  <li>Send them the exact message and ask them to fix it. Many include one round of fixes; ask before you pay again.</li>
  <li>Ask them to build to your printer's rules, not general ones. Name the printer, paper and page count.</li>
  <li>Get the original working file (InDesign, Affinity or Canva link), not just the PDF, so you can make small changes later.</li>
</ul>

<h2>How to avoid round two</h2>
<ul class="checks">
  <li>Don't change anything else while fixing. A late edit can move pages and change the spine.</li>
  <li>Keep both files in step: interior page count and cover spine always match.</li>
  <li>Keep a note of your printer's numbers for this book: trim, paper, page count, spine width.</li>
</ul>

<h2>How long it costs you</h2>
<p>Each round means fixing, uploading and waiting for a new review, often a few days each time. Authors who go round three or four times lose weeks, and sometimes a launch date. SparkPrep's founder lost months to 18 rounds on his own book. The fastest route is finding every problem at once, which is what SparkPrep's scan does: every problem, in every file, in minutes.</p>
`,
    faq: [
      { q: "Should I fix the PDF or the original file?", a: "The original file. Editing a PDF directly often creates new problems. Fix the source, then export a new PDF." },
      { q: "Why was my book rejected again after I fixed it?", a: "Usually a second problem that wasn't in the first message, or a fix that changed the page count and so the spine width." },
    ],
  },
  {
    path: "/lulu-and-barnes-noble/",
    nav: "Lulu & B&N Press",
    crumb: "Lulu and Barnes & Noble Press errors",
    title: "Lulu & Barnes & Noble Press File Errors and Their Rules",
    description: "Common file problems on Lulu and Barnes & Noble Press, the rules behind them (bleed, margins, barcode, page counts) and how they differ from KDP and Ingram.",
    eyebrow: "Lulu and B&N Press",
    h1: "Lulu and Barnes & Noble Press file errors",
    lead: "Lulu and Barnes & Noble Press get fewer headlines than KDP and IngramSpark, but they check files just as carefully. Their rules sit between the two.",
    answer: "<p>Lulu and Barnes &amp; Noble Press both want <strong>0.125\" bleed</strong>, about <strong>0.5\" safety margins</strong> (B&amp;N asks 0.75\" on the inside), fonts embedded, 300 DPI pictures, and a <strong>2\" x 1.2\" barcode area</strong>. Use each one's own cover template, because their spine widths differ from KDP's and IngramSpark's.</p>",
    cardText: "The rules Lulu and Barnes & Noble Press check, and how they differ.",
    body: `
<h2>The rules side by side</h2>
<div class="table-wrap"><table>
<tr><th>Rule</th><th>Lulu</th><th>Barnes &amp; Noble Press</th></tr>
<tr><td>Cover bleed</td><td>0.125"</td><td>0.125"</td></tr>
<tr><td>Interior safety margin</td><td>0.5"; inside grows with page count</td><td>0.5" (0.75" inside)</td></tr>
<tr><td>Barcode area</td><td>2" x 1.2"</td><td>2" x 1.2"</td></tr>
<tr><td>Page count range</td><td>32 to 800 (varies by format)</td><td>48 to 800 (varies by format)</td></tr>
<tr><td>Spine width</td><td>From Lulu's own template</td><td>From B&amp;N's own template</td></tr>
</table></div>
<p class="note">From each printer's own guides; formats and limits change, so check before uploading.</p>

<h2>Common problems</h2>
<h3>"Your file has errors" on Lulu</h3>
<p>Lulu checks files on upload and lists problems such as wrong page size, fonts not embedded and pictures under resolution. The fixes are the same as everywhere: <a href="${site("fix", "/page-size/")}">page size</a>, <a href="${site("fix", "/fonts/")}">fonts</a>, <a href="${site("fix", "/image-resolution/")}">pictures</a>.</p>
<h3>Cover doesn't fit on Barnes &amp; Noble Press</h3>
<p>B&amp;N Press works out its own cover size from your trim, paper and page count. A KDP or IngramSpark cover will usually be the wrong width. Use B&amp;N's template and re-fit the spine.</p>
<h3>Inside margin too small</h3>
<p>B&amp;N Press asks for more room on the inside (0.75") than many KDP books use. If you came from KDP with a 0.375" or 0.5" gutter, widen it.</p>

<h2>Before you upload to Lulu or B&amp;N Press</h2>
<ul class="checks">
  <li>Interior PDF is exactly your trim size (plus bleed only if art touches the page edge).</li>
  <li>Inside margin is at least 0.75" for B&amp;N Press, and grows with page count on Lulu.</li>
  <li>Every font says "Embedded" in Acrobat's File → Properties → Fonts.</li>
  <li>Pictures are 300 DPI at their printed size.</li>
  <li>The cover was built from <em>this</em> printer's template, for your final page count and paper.</li>
  <li>The lower right of the back cover is clear for the 2" x 1.2" barcode.</li>
  <li>If your page count is near the minimum (32 on Lulu, 48 on B&amp;N for most formats), check spine text is still allowed.</li>
</ul>

<h2>Publishing to several printers at once?</h2>
<p>Build the interior to the strictest numbers (0.5" outside, the biggest inside margin any of your printers asks for, grayscale or CMYK under 240%). Then make one cover per printer from its own template. SparkPrep checks against KDP, IngramSpark, Barnes &amp; Noble Press and Lulu, each with its own numbers, never another printer's.</p>
`,
    faq: [
      { q: "Can I use my KDP cover on Lulu?", a: "Usually not as is. Lulu's spine width comes from its own paper, so re-fit the cover to Lulu's template." },
      { q: "What margins does Barnes & Noble Press need?", a: "At least 0.5 inch on the outside, top and bottom, and 0.75 inch on the inside." },
    ],
  },
];
