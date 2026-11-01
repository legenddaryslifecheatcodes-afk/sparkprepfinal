import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { money } from "@/lib/pricing";

// Homepage article for FIRST-TIME self-publishers (Trey, 2026-11-01): why you need a preflight
// check, what freelancers and publishing packages really cost, how long it takes, the risk, and
// what SparkPrep does. Outside figures are the companies' own published numbers (sources below);
// SparkPrep prices always come live from /api/pricing, never typed in here.
const SOURCES = {
  reedsy: "https://reedsy.com/blog/guide/how-to-self-publish-a-book/cost-to-self-publish/",
  bookbaby: "https://www.bookbaby.com/Pricing",
  kdp: "https://kdp.amazon.com/en_US/help/topic/G202173620",
};

// Shown on the page AND in the FAQPage structured data (public/index.html). Keep both the same.
// No SparkPrep prices here, because the structured data can't read live prices.
export const HOME_FAQ = [
  {
    q: "What is SparkPrep?",
    a: "SparkPrep is an all-in-one self-publishing suite. You design your book cover, write and format your inside pages, check both against the print rules of Amazon KDP, IngramSpark, Barnes & Noble and Lulu, fix every problem, and download print-ready files, all in one place.",
  },
  {
    q: "What is a book preflight check?",
    a: "A book preflight check looks at your cover and inside pages before you upload them, the same way the printer will. It checks size, bleed, margins, spine width, colors, picture sharpness and fonts, so Amazon KDP or IngramSpark doesn't reject your book. It's one of the tools built into SparkPrep.",
  },
  {
    q: "Why did KDP or IngramSpark reject my book file?",
    a: "Most rejections come from a few file problems: art that doesn't reach past the trim edge (bleed), text too close to the edge, the wrong spine width for your page count, blurry pictures under 300 DPI, screen colors (RGB) instead of print colors, too much ink in dark areas, or fonts that aren't built into the PDF.",
  },
  {
    q: "How much does it cost to hire someone to format a book for print?",
    a: "Reedsy reports a median of about $930 for a professional cover and an average of about $800 for interior formatting, so about $1,730 for both. Newer designers often charge about $300 to $500 for a cover.",
  },
  {
    q: "How long does it take to get a book print-ready?",
    a: "With freelancers it often takes several weeks: finding someone, waiting for their schedule and going through rounds of changes. Then KDP says it takes about 3 business days for a book, or each fix, to go live. SparkPrep checks and fixes your files in minutes.",
  },
  {
    q: "Do I need a preflight check if I made my cover in Canva or my book in Word?",
    a: "Yes. Canva and Word don't check printer rules. A file can look perfect on screen and still have no bleed, screen colors or the wrong spine width. A preflight check catches these before you upload.",
  },
  {
    q: "Does SparkPrep work for KDP, IngramSpark, Barnes & Noble and Lulu?",
    a: "Yes. SparkPrep checks your files against each printer's own rules: Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu.",
  },
];

function Src({ href, children }) {
  return <a href={href} target="_blank" rel="nofollow noopener noreferrer" className="underline decoration-neutral-600 hover:text-white">{children}</a>;
}

export function FirstBookArticle({ pricing, auditPrice, auditNote }) {
  const book = pricing?.book?.price_cents ? money(pricing.book.price_cents) : null;
  const advanced = pricing?.advanced_audit?.price_cents ? money(pricing.advanced_audit.price_cents) : null;
  const maxPages = pricing?.advanced_audit?.max_pages;

  return (
    <section className="border-t border-neutral-900 bg-neutral-950" aria-labelledby="first-book">
      <article className="max-w-3xl mx-auto px-6 py-20 text-neutral-300 text-lg leading-relaxed" data-testid="first-book-article">
        <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ Your First Book ]</span>
        <h2 id="first-book" className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3 text-white">
          Publishing your first book? Read this before you upload.
        </h2>
        <p className="mt-6">
          You wrote the book. That's the hard part. Now Amazon KDP or IngramSpark wants two print files: a cover and the inside pages. They have to follow the printer's rules exactly. Here is what that means, what your options cost, and how long each one takes.
        </p>

        <h3 className="font-display font-bold text-2xl text-white mt-12 tracking-tight">Why you need a preflight check</h3>
        <p className="mt-4">
          Before your book prints, a machine checks your files. If one thing is off, the book is sent back to you. The most common problems are:
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-[#D4AF37]">
          <li><strong className="text-white">No bleed:</strong> your cover art has to run a little past the edge, because the edge is cut off.</li>
          <li><strong className="text-white">Text too close to the edge</strong> or to the spine fold.</li>
          <li><strong className="text-white">The wrong spine width.</strong> It depends on your page count and paper, and each printer has its own number.</li>
          <li><strong className="text-white">Blurry pictures</strong> (under 300 DPI).</li>
          <li><strong className="text-white">Screen colors instead of print colors,</strong> or too much ink in dark areas.</li>
          <li><strong className="text-white">Fonts that aren't built into the PDF.</strong></li>
        </ul>
        <p className="mt-4">
          You can't see most of these on your screen. Checking for them before you upload is called a <strong className="text-white">preflight check</strong>.
        </p>

        <h3 className="font-display font-bold text-2xl text-white mt-12 tracking-tight">Option 1: Hire a freelancer</h3>
        <p className="mt-4">Most new authors hire a cover designer and someone to format the inside pages. Here is what that typically costs:</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-base border border-neutral-800">
            <thead>
              <tr className="bg-neutral-900 text-left text-white">
                <th className="p-3 font-semibold">Job</th>
                <th className="p-3 font-semibold">Typical price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr><td className="p-3">Professional cover</td><td className="p-3">About <strong className="text-white">$930</strong> (median). Most cost $630 to $1,200.</td></tr>
              <tr><td className="p-3">Newer cover designer</td><td className="p-3">About <strong className="text-white">$300 to $500</strong></td></tr>
              <tr><td className="p-3">Inside pages (formatting)</td><td className="p-3">About <strong className="text-white">$800</strong> on average. Most cost $475 to $1,275.</td></tr>
              <tr className="bg-[#D4AF37]/[0.06]"><td className="p-3 text-white font-semibold">Cover + inside pages</td><td className="p-3"><strong className="text-white">About $1,730</strong></td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-neutral-500">Typical ranges from <Src href={SOURCES.reedsy}>Reedsy's published figures</Src>. Prices vary by designer and genre.</p>

        <p className="mt-6"><strong className="text-white">How long it takes:</strong> often several weeks. You find someone, wait for their schedule, look at drafts, and ask for changes, usually more than once. After you upload, KDP says it takes about <Src href={SOURCES.kdp}>3 business days</Src> for a book, or an update, to go live. If it's rejected, you fix it and wait again.</p>
        <p className="mt-4"><strong className="text-white">The risk:</strong> a cover can look great and still be rejected. Not every designer checks bleed, the ink limit or the spine width for your exact printer and page count. If the file comes back, you go back to the designer, wait again, and sometimes pay again. A typo fix or a new page count later means another request, too.</p>
        <p className="mt-4">A good designer is worth it if you want original, hand-made art. Just know what you're paying for.</p>

        <h3 className="font-display font-bold text-2xl text-white mt-12 tracking-tight">Option 2: A publishing package (the expensive option)</h3>
        <p className="mt-4">
          Self-publishing companies sell packages that do it all for you. BookBaby, one of the best known, says a professional package with editing, a custom cover, formatting and a print run costs <strong className="text-white">roughly $2,000 to $7,000</strong>. Its cover design alone starts at <strong className="text-white">$399</strong>, and it says the work typically takes <strong className="text-white">several weeks</strong>.
        </p>
        <p className="mt-3 text-sm text-neutral-500">Figures from <Src href={SOURCES.bookbaby}>BookBaby's own pricing page</Src>.</p>

        <h3 className="font-display font-bold text-2xl text-white mt-12 tracking-tight">Option 3: Do it yourself for free</h3>
        <p className="mt-4">Word and Canva are free, but they don't check printer rules. Most first-time authors find out about bleed, ink limits and spine width from a rejection email.</p>

        <h3 className="font-display font-bold text-2xl text-white mt-12 tracking-tight">What SparkPrep does</h3>
        <p className="mt-4">
          SparkPrep was built by an author whose own book failed to print 18 times. It's an all-in-one self-publishing suite: you design, format, check, fix and export your book in one place. Our rule for every tool: power without complexity.
        </p>
        <ul className="mt-4 space-y-2 list-disc pl-6 marker:text-[#D4AF37]">
          <li><strong className="text-white">Free design tools:</strong> make your cover in Cover Studio and your pages in Interior Studio, already sized for your printer.</li>
          <li><strong className="text-white">Checks everything:</strong> your cover and your pages, against the rules of Amazon KDP, IngramSpark, Barnes &amp; Noble Press or Lulu.</li>
          <li><strong className="text-white">Plain English:</strong> it tells you what's wrong and where, without the jargon.</li>
          <li><strong className="text-white">Fixes it for you</strong> in minutes, then gives you print-ready files.</li>
        </ul>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-base border border-neutral-800" data-testid="first-book-compare">
            <thead>
              <tr className="bg-neutral-900 text-left text-white">
                <th className="p-3 font-semibold"></th>
                <th className="p-3 font-semibold">Freelancers</th>
                <th className="p-3 font-semibold">Publishing package</th>
                <th className="p-3 font-semibold text-[#D4AF37]">SparkPrep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr>
                <td className="p-3 text-white">Price</td>
                <td className="p-3">About $1,730</td>
                <td className="p-3">About $2,000 to $7,000</td>
                <td className="p-3">
                  {auditPrice ? <>Audit <strong className="text-white">{auditPrice}</strong>{advanced ? <>, full audit {advanced}{maxPages ? ` (up to ${maxPages} pages)` : ""}</> : null}{book ? <>; fixed, print-ready files <strong className="text-white">{book}</strong> per book</> : null}</> : <Link to="/pricing" className="underline">See today's prices</Link>}
                </td>
              </tr>
              <tr>
                <td className="p-3 text-white">Time</td>
                <td className="p-3">Often several weeks</td>
                <td className="p-3">Several weeks</td>
                <td className="p-3">Minutes</td>
              </tr>
              <tr>
                <td className="p-3 text-white">Checked against your printer's rules?</td>
                <td className="p-3">Depends on the freelancer</td>
                <td className="p-3">Depends on the package</td>
                <td className="p-3">Yes, every time</td>
              </tr>
            </tbody>
          </table>
        </div>
        {auditNote ? <p className="mt-3 text-sm text-neutral-500">{auditNote}. The audit price counts toward your book.</p> : null}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/audit" className="btn-gold px-7 py-4 font-mono-spec text-xs tracking-widest uppercase flex items-center gap-2 btn-industrial" data-testid="first-book-cta">
            Check my book {auditPrice ? `for ${auditPrice}` : ""} <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="/guides/what-is-preflight-first-time-authors/" className="px-7 py-4 font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/40 hover:text-white flex items-center gap-2">
            Read the full beginner's guide
          </a>
        </div>
      </article>
    </section>
  );
}

export default FirstBookArticle;
