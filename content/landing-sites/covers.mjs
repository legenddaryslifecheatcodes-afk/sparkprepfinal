// sparkpreplandingcovers.legenddary.com — print cover sizes, spine widths, barcode space, hardcover rules.
import { MAIN_LINKS as L, site } from "./shared.mjs";

const BLEED = 0.125;
const TRIMS = [
  [5, 8],
  [5.25, 8],
  [5.5, 8.5],
  [6, 9],
  [7, 10],
  [8.5, 11],
];
const PAGE_COUNTS = [100, 150, 200, 250, 300, 350, 400];
const f3 = (n) => n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");

// KDP paperback paper thickness per page (KDP's own published numbers).
const KDP = { white: 0.002252, cream: 0.0025, color: 0.002347 };
// IngramSpark pages per inch (from IngramSpark's paper specs).
const IS_PPI = { "White 50#": 512, "Creme 50#": 444, "Groundwood 38#": 400, "Color 70#": 377 };

function kdpTable(paper) {
  const per = KDP[paper];
  const head = `<tr><th>Trim size</th>${PAGE_COUNTS.map((p) => `<th>${p} pages</th>`).join("")}</tr>`;
  const rows = TRIMS.map(([w, h]) => {
    const cells = PAGE_COUNTS.map((p) => {
      const spine = p * per;
      const width = BLEED * 2 + w * 2 + spine;
      return `<td>${f3(width)}" x ${f3(h + BLEED * 2)}"</td>`;
    }).join("");
    return `<tr><td>${w}" x ${h}"</td>${cells}</tr>`;
  }).join("");
  return `<div class="table-wrap"><table>${head}${rows}</table></div>`;
}

function spineTable() {
  const head = `<tr><th>Pages</th><th>KDP white</th><th>KDP cream</th><th>KDP color</th>${Object.keys(IS_PPI).map((k) => `<th>IngramSpark ${k}</th>`).join("")}</tr>`;
  const rows = [24, 48, 80, 100, 150, 200, 250, 300, 350, 400, 500, 600]
    .map((p) => `<tr><td>${p}</td><td>${f3(p * KDP.white)}"</td><td>${f3(p * KDP.cream)}"</td><td>${f3(p * KDP.color)}"</td>${Object.values(IS_PPI).map((ppi) => `<td>${f3(p / ppi)}"</td>`).join("")}</tr>`)
    .join("");
  return `<div class="table-wrap"><table>${head}${rows}</table></div>`;
}

function isTable() {
  const head = `<tr><th>Trim size</th>${[150, 200, 300, 400].map((p) => `<th>${p} pages</th>`).join("")}</tr>`;
  const rows = TRIMS.map(([w, h]) => `<tr><td>${w}" x ${h}"</td>${[150, 200, 300, 400].map((p) => `<td>${f3(BLEED * 2 + w * 2 + p / 512)}" x ${f3(h + BLEED * 2)}"</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table>${head}${rows}</table></div>`;
}

export const pages = [
  {
    path: "/",
    nav: "Cover anatomy",
    crumb: "How a print book cover is built",
    title: "Book Cover Size for Print: How to Work It Out (Formula)",
    description: "How a print book cover file is built: back, spine and front in one wide file, plus bleed and safe zones. The simple full cover size formula, with an example.",
    eyebrow: "Print covers, made simple",
    h1: "How big is a print book cover? (The formula)",
    lead: "An ebook cover is just the front. A print cover is one wide file: back cover, spine and front cover side by side, plus a little extra around the edge for trimming.",
    answer: "<p><strong>Full cover width</strong> = 0.125\" bleed + book width + spine width + book width + 0.125\" bleed. <strong>Full cover height</strong> = 0.125\" + book height + 0.125\". Spine width = page count x your printer's paper thickness. Example: a 6\" x 9\", 300-page KDP book on white paper is <strong>12.926\" x 9.25\"</strong>.</p>",
    body: `
<h2>The five parts of a paperback cover file</h2>
<div class="table-wrap"><table>
<tr><th>Part</th><th>Size</th><th>What goes there</th></tr>
<tr><td>Bleed (left edge)</td><td>0.125"</td><td>Background only. It's cut off.</td></tr>
<tr><td>Back cover</td><td>Your book's width</td><td>Blurb, author photo, barcode space (lower right)</td></tr>
<tr><td>Spine</td><td>Page count x paper thickness</td><td>Title and author, if the book is thick enough</td></tr>
<tr><td>Front cover</td><td>Your book's width</td><td>Title, subtitle, author name, art</td></tr>
<tr><td>Bleed (right edge, top and bottom)</td><td>0.125"</td><td>Background only. It's cut off.</td></tr>
</table></div>

<h2>Worked example</h2>
<p>A 6" x 9" paperback, 300 pages, white paper, printed by KDP:</p>
<ol class="steps">
  <li>Spine = 300 x 0.002252" = <strong>0.676"</strong></li>
  <li>Width = 0.125 + 6 + 0.676 + 6 + 0.125 = <strong>12.926"</strong></li>
  <li>Height = 0.125 + 9 + 0.125 = <strong>9.25"</strong></li>
  <li>At 300 DPI that's about <strong>3878 x 2775 pixels</strong>.</li>
</ol>
<p>The same book at IngramSpark on 50# white paper has a spine of about 0.586" (300 ÷ 512), so its cover is about 12.836" wide. Same book, different cover. See the <a href="/cover-size-chart/">KDP chart</a> and the <a href="/ingramspark-cover-size/">IngramSpark chart</a>.</p>

<h2>The safe zone</h2>
<p>Printers trim and fold with a little wiggle. Keep anything important (words, faces, logos) inside a safe zone:</p>
<ul class="checks">
  <li>At least <strong>0.125" inside the trim line</strong> for KDP, and more is better. Many designers use 0.25".</li>
  <li>At least <strong>0.0625" (1/16") from each spine fold</strong> for spine text.</li>
  <li>The <a href="/barcode-and-back-cover/">barcode box</a> on the back kept clear.</li>
</ul>

<h2>Order of work that saves redoing your cover</h2>
<ol class="steps">
  <li>Choose printer, trim size and paper.</li>
  <li>Finish the interior so you know the final page count.</li>
  <li>Get the spine width and full cover size for that printer.</li>
  <li>Download that printer's template, or start in a tool that's already sized.</li>
  <li>Design, then preflight before upload.</li>
</ol>
<p>Skip the math: SparkPrep's free <a href="${L.coverStudio}">Cover Studio</a> builds the full wrap at the right size for your printer, page count and paper, with 224 free templates and the guides drawn in. Or use the free <a href="${L.kdpCalc}">KDP cover calculator</a>.</p>
`,
    faq: [
      { q: "What size is a 6x9 book cover with spine?", a: "It depends on page count and paper. A 300-page 6x9 KDP paperback on white paper is 12.926 by 9.25 inches including bleed." },
      { q: "Is the bleed included in the cover size?", a: "Yes. Printers want the uploaded cover at full size including 0.125 inch bleed on the outer edges." },
    ],
  },
  {
    path: "/cover-size-chart/",
    nav: "KDP size chart",
    crumb: "KDP paperback cover size chart",
    title: "KDP Paperback Cover Size Chart by Trim & Page Count",
    description: "Full KDP paperback cover sizes, including spine and bleed, for 5x8, 5.25x8, 5.5x8.5, 6x9, 7x10 and 8.5x11 books from 100 to 400 pages, on white and cream paper.",
    eyebrow: "Look up your size",
    h1: "KDP paperback cover size chart",
    lead: "Find your trim size and page count to get the full cover size (back + spine + front + bleed) for an Amazon KDP paperback. Worked out from KDP's own paper thickness numbers.",
    answer: "<p>KDP full cover width = 0.25\" + 2 x trim width + spine; height = trim height + 0.25\". Spine = pages x 0.002252\" (white) or x 0.0025\" (cream). Example: <strong>5.5\" x 8.5\", 200 pages, white = 11.700\" x 8.75\"</strong>.</p>",
    cardText: "Full cover sizes for six trim sizes and 100 to 400 pages, white and cream.",
    body: `
<h2>White paper (black and white interior)</h2>
${kdpTable("white")}
<h2>Cream paper (black and white interior)</h2>
${kdpTable("cream")}
<h2>Premium color paper</h2>
${kdpTable("color")}
<p class="note">Sizes are width x height in inches, including 0.125" bleed on every outer edge. Worked out with KDP's published paper thickness (white 0.002252", cream 0.0025", premium color 0.002347" per page). KDP's own cover template for your exact book is the final word; if it differs by a hair, use KDP's.</p>

<h2>How to read the chart</h2>
<ul class="checks">
  <li>Your page count isn't listed? Add or subtract: every extra page adds 0.002252" (white) or 0.0025" (cream) to the width.</li>
  <li>Use your <strong>final</strong> PDF page count, including front matter and blank pages.</li>
  <li>To get pixels at 300 DPI, multiply each number by 300.</li>
</ul>

<h2>Common mistakes</h2>
<ul class="checks">
  <li><strong>Using the trim size as the cover size.</strong> 6" x 9" is the book, not the cover.</li>
  <li><strong>Guessing the page count</strong> before the interior is final. Re-check the spine after the last edit.</li>
  <li><strong>Using a cream spine on a white book</strong> (or the other way round). On 300 pages that's 0.074" off.</li>
</ul>
<p>For an exact number for any page count, use SparkPrep's free <a href="${L.kdpCalc}">KDP cover calculator</a>. Printing with IngramSpark? Use the <a href="/ingramspark-cover-size/">IngramSpark chart</a> instead.</p>
`,
    faq: [
      { q: "What is the cover size for a 5x8 book with 200 pages on KDP?", a: "On white paper about 10.700 by 8.25 inches including bleed (spine 0.450 inch). On cream paper about 10.750 by 8.25 inches (spine 0.5 inch)." },
      { q: "Does KDP give me a cover template?", a: "Yes. KDP's cover template tool gives a PDF and PNG template for your trim size, page count and paper." },
    ],
  },
  {
    path: "/ingramspark-cover-size/",
    nav: "IngramSpark sizes",
    crumb: "IngramSpark cover size",
    title: "IngramSpark Cover Size & Spine Width (Paperback Guide)",
    description: "Work out an IngramSpark paperback cover size and spine width from pages per inch, with a size chart for common trims, and why it differs from your KDP cover.",
    eyebrow: "IngramSpark covers",
    h1: "IngramSpark cover size and spine width",
    lead: "IngramSpark measures paper in pages per inch (PPI), not thickness per page. Divide your page count by your paper's PPI and you have the spine. Then build the cover around it.",
    answer: "<p>IngramSpark spine width ≈ page count ÷ pages per inch (about 512 for 50# white, 444 for 50# creme, 400 for groundwood, 377 for 70# color). Full cover width = 0.25\" + 2 x trim width + spine; height = trim height + 0.25\". Always confirm with IngramSpark's own cover template.</p>",
    cardText: "IngramSpark spine from pages per inch, and full cover sizes for common trims.",
    body: `
<h2>IngramSpark paperback cover sizes (50# white paper)</h2>
${isTable()}
<p class="note">Width x height in inches, including 0.125" bleed. Spine worked out as pages ÷ 512. IngramSpark's free cover template generator gives the exact size for your ISBN, paper and binding; use it for your final file.</p>

<h2>Pages per inch by paper</h2>
<div class="table-wrap"><table>
<tr><th>IngramSpark paper</th><th>Pages per inch</th><th>Spine for 300 pages</th></tr>
${Object.entries(IS_PPI).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td><td>${f3(300 / v)}"</td></tr>`).join("")}
</table></div>

<h2>What else IngramSpark checks on covers</h2>
<ul class="checks">
  <li><strong>Total ink under 240%.</strong> Dark covers fail this most. <a href="${site("fix", "/color-and-ink/")}">How to fix it.</a></li>
  <li><strong>Barcode area</strong> of 1.75" x 1" on the back left clear. <a href="/barcode-and-back-cover/">Details.</a></li>
  <li><strong>No template guide lines</strong> left in the art. The template's colored lines must be deleted before export.</li>
  <li><strong>PDF/X-1a</strong> file with fonts embedded and no live transparency.</li>
  <li><strong>No spine text under 48 pages</strong> (paperback).</li>
</ul>

<h2>Moving a KDP cover to IngramSpark</h2>
<ol class="steps">
  <li>Generate IngramSpark's template for the same trim, page count and paper.</li>
  <li>Compare spine widths. On white paper, IngramSpark's is usually narrower than KDP's.</li>
  <li>Narrow the spine, slide the front cover in by the difference and re-center spine text.</li>
  <li>Check the barcode area (IngramSpark's is a different size and position from KDP's).</li>
  <li>Check total ink and export as PDF/X-1a.</li>
</ol>
<p>SparkPrep does steps 2 to 5 for you: upload your KDP cover, choose IngramSpark, and it re-fits the spine and checks the rest. See also the free <a href="${L.ingramTemplate}">IngramSpark cover template guide</a>.</p>
`,
    faq: [
      { q: "How do I calculate IngramSpark spine width?", a: "Divide your page count by your paper's pages per inch, about 512 for 50 lb white and 444 for 50 lb creme. Then confirm with IngramSpark's cover template." },
      { q: "Is the IngramSpark spine the same as KDP?", a: "No. Their papers differ, so the same book gets a different spine width at each printer." },
    ],
  },
  {
    path: "/spine-width/",
    nav: "Spine widths",
    crumb: "Book spine width chart",
    title: "Book Spine Width Chart: KDP & IngramSpark by Page Count",
    description: "Spine width for 24 to 600 pages on KDP white, cream and color paper and IngramSpark white, creme, groundwood and color paper, plus spine text rules.",
    eyebrow: "Spine widths",
    h1: "Book spine width chart (KDP and IngramSpark)",
    lead: "The spine is the only part of your cover that changes with your page count. Here it is for both big printers and every common paper, side by side.",
    answer: "<p><strong>KDP</strong> spine = pages x 0.002252\" (white), 0.0025\" (cream) or 0.002347\" (premium color). <strong>IngramSpark</strong> spine ≈ pages ÷ 512 (50# white), 444 (50# creme), 400 (groundwood) or 377 (70# color). A 200-page book on KDP white paper has a 0.450\" spine.</p>",
    cardText: "Spine widths from 24 to 600 pages for every common KDP and IngramSpark paper.",
    body: `
${spineTable()}
<p class="note">Inches. IngramSpark figures are page count ÷ pages per inch and are close estimates; IngramSpark's cover template for your book is the final word.</p>

<h2>When can I put text on the spine?</h2>
<div class="table-wrap"><table>
<tr><th>Printer</th><th>Spine text allowed from</th><th>Spine at that point (white paper)</th></tr>
<tr><td>Amazon KDP</td><td>80 pages (more than 79)</td><td>About 0.18"</td></tr>
<tr><td>IngramSpark (paperback)</td><td>48 pages</td><td>About 0.094"</td></tr>
</table></div>
<p>Allowed isn't the same as readable. Under about 0.25" (roughly 110 pages on KDP white), spine text has to be tiny. Many authors leave thin spines plain, or use just the title.</p>

<h2>Spine text that fits</h2>
<ul class="checks">
  <li>Leave at least 1/16" (0.0625") clear on each side, between the text and the fold.</li>
  <li>So the tallest letters can be at most spine width minus 0.125".</li>
  <li>Example: a 0.45" spine allows text about 0.325" tall, which is roughly 24 to 28 point type.</li>
</ul>
<p>Text sliding onto the front cover? <a href="${site("fix", "/spine/")}">How to fix the spine.</a> Exact number for any count? Use the free <a href="${L.spineCalc}">spine width calculator</a>.</p>
`,
    faq: [
      { q: "How wide is the spine of a 200-page book?", a: "On KDP white paper, 0.450 inch. On KDP cream, 0.500 inch. On IngramSpark 50 lb white, about 0.391 inch." },
      { q: "Does cream paper make a thicker book?", a: "Yes. Cream pages are thicker, so the spine is wider for the same page count." },
    ],
  },
  {
    path: "/barcode-and-back-cover/",
    nav: "Barcode & back",
    crumb: "Barcode space and back cover layout",
    title: "Book Barcode Size & Back Cover Layout for KDP & IngramSpark",
    description: "Where the barcode goes on a print book's back cover, the box size for KDP (2x1.2 in) and IngramSpark (1.75x1 in), ISBN rules and a simple back cover layout.",
    eyebrow: "Back cover",
    h1: "Barcode space and back cover layout",
    lead: "The back cover sells the book, but it also has a job for the printer and the bookstore: a clear, scannable barcode. Leave the right space and the rest is yours.",
    answer: "<p>Leave the lower right of the back cover clear: <strong>2\" wide x 1.2\" tall for KDP</strong> (KDP adds its barcode there if you don't), and at least <strong>1.75\" x 1\" for IngramSpark</strong>. The ISBN in your barcode must match the ISBN of that exact edition.</p>",
    cardText: "Barcode box sizes, ISBN rules and a back cover layout that passes.",
    body: `
<h2>Barcode box sizes</h2>
<div class="table-wrap"><table>
<tr><th>Printer</th><th>Box size</th><th>Where</th><th>Who adds the barcode</th></tr>
<tr><td>Amazon KDP</td><td>2" x 1.2"</td><td>Lower right of the back cover</td><td>KDP, if you don't</td></tr>
<tr><td>IngramSpark</td><td>1.75" x 1" (at least)</td><td>Shown on IngramSpark's template</td><td>IngramSpark's template includes it</td></tr>
<tr><td>Barnes &amp; Noble Press</td><td>2" x 1.2"</td><td>Lower right of the back cover</td><td>See B&amp;N's template</td></tr>
<tr><td>Lulu</td><td>2" x 1.2"</td><td>Lower right of the back cover</td><td>See Lulu's template</td></tr>
</table></div>
<p>Keep a plain, light background behind the barcode. A busy photo behind a barcode can make it unscannable.</p>

<h2>ISBN rules that cause rejections</h2>
<ul class="checks">
  <li><strong>One ISBN per format.</strong> Paperback, hardcover and ebook each need their own.</li>
  <li><strong>The barcode's ISBN must match</strong> the ISBN you entered for that edition, digit for digit.</li>
  <li><strong>KDP's free ISBN</strong> can only be used for the KDP edition. For IngramSpark you need your own ISBN or IngramSpark's.</li>
  <li><strong>A price in the barcode</strong> (the small add-on) must match your list price, or use 90000 for "no price".</li>
</ul>

<h2>A back cover layout that works</h2>
<ol class="steps">
  <li><strong>Top third:</strong> a short hook line in bigger type.</li>
  <li><strong>Middle:</strong> the blurb, 100 to 200 words, at least 10 point, high contrast.</li>
  <li><strong>Lower left:</strong> author photo and one-line bio, or a review quote.</li>
  <li><strong>Lower right:</strong> the clear barcode box.</li>
  <li><strong>Edges:</strong> 0.125" bleed on the outer edge and a safe zone inside the trim and spine fold.</li>
</ol>
<p>Don't put the blurb in pale gray on a photo. It may look stylish on screen and unreadable in print.</p>
<p>SparkPrep checks the barcode area is clear and that the ISBN on your cover matches your book's ISBN. Need a fix? See <a href="${site("errors", "/ingramspark/")}">IngramSpark's ISBN mismatch message</a>.</p>
`,
    faq: [
      { q: "Do I need to add a barcode to my KDP cover?", a: "No. KDP adds one in a 2 by 1.2 inch area at the lower right of the back cover if you leave it empty." },
      { q: "Can I put the barcode anywhere?", a: "Follow your printer's template. KDP and most printers expect the lower right of the back cover." },
    ],
  },
  {
    path: "/hardcover-and-dust-jacket/",
    nav: "Hardcover",
    crumb: "Hardcover and dust jacket covers",
    title: "Hardcover & Dust Jacket Cover Files: What's Different",
    description: "How hardcover case wraps and dust jackets differ from paperback covers: wrap, hinges, flaps, the files a jacketed book needs, and mistakes printers reject.",
    eyebrow: "Hardcovers",
    h1: "Hardcover and dust jacket covers: what's different",
    lead: "A hardcover isn't a paperback cover printed bigger. The cover wraps around boards, bends at hinges and, with a dust jacket, folds into flaps. Each has its own no-go zones.",
    answer: "<p>A hardcover <strong>case wrap</strong> is printed bigger than the book and wrapped around the boards, so it needs extra wrap area and clear hinge areas beside the spine. A <strong>dust jacket</strong> adds front and back flaps. A jacketed book can need three files: case, jacket and interior. Always build from your printer's hardcover template.</p>",
    cardText: "Case wraps, hinges, flaps and the three files a jacketed hardcover needs.",
    body: `
<h2>Two kinds of hardcover</h2>
<div class="table-wrap"><table>
<tr><th></th><th>Case laminate (printed case)</th><th>Cloth case with dust jacket</th></tr>
<tr><td>What it is</td><td>Your art printed on the hard cover itself</td><td>Plain cloth cover, with your art on a paper jacket</td></tr>
<tr><td>Files</td><td>Case cover + interior</td><td>Jacket + interior (and a case/spine stamp file if your printer asks)</td></tr>
<tr><td>Offered by</td><td>KDP and IngramSpark</td><td>IngramSpark (KDP doesn't offer dust jackets)</td></tr>
</table></div>

<h2>What's different from a paperback</h2>
<ul class="checks">
  <li><strong>Wrap area.</strong> A case cover is bigger than the book because it wraps around the edges of the boards. Art must run into the wrap; nothing important can sit there.</li>
  <li><strong>Hinges.</strong> Next to the spine, the cover bends where the board meets the spine. Keep text and faces out of the hinge.</li>
  <li><strong>Wider spine.</strong> Boards add thickness, so a hardcover spine is wider than the same book in paperback.</li>
  <li><strong>Flaps (jackets).</strong> Jacket flaps fold inside the cover. Text on the flaps must stay clear of the fold lines.</li>
</ul>

<h2>Mistakes that get hardcovers rejected</h2>
<ul class="checks">
  <li><strong>Reusing the paperback cover</strong> at hardcover size. The panels don't line up.</li>
  <li><strong>Text across the jacket fold</strong> (between front panel and flap). It ends up bent inside the book.</li>
  <li><strong>Missing a file.</strong> Uploading only the jacket when the printer also needs the case.</li>
  <li><strong>Template lines left in.</strong> Hardcover templates have many guide lines; every one must be deleted.</li>
</ul>

<h2>How to do it right</h2>
<ol class="steps">
  <li>Finish the interior and get the final page count.</li>
  <li>Download your printer's hardcover template for that trim, page count and paper. Use the case template for a printed case; the jacket template for a dust jacket.</li>
  <li>Design on the template, keeping text out of wrap, hinge and fold areas.</li>
  <li>Delete the template layer, export as PDF/X-1a and preflight.</li>
</ol>
<p>SparkPrep knows hardcover geometry for case and jacket books, flags text on jacket folds, and tells you when a jacketed book is missing a file. Fixing the problem by hand? See <a href="${site("fix", "/")}">print file fixes</a>.</p>
`,
    faq: [
      { q: "Does KDP offer dust jackets?", a: "No. KDP hardcovers are case laminate, with the art printed on the cover itself. IngramSpark offers dust jackets." },
      { q: "Can I use my paperback cover for a hardcover?", a: "Not as is. A hardcover needs wrap and hinge areas and a wider spine, so it must be rebuilt on the hardcover template." },
    ],
  },
];
