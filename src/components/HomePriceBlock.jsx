import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Tag } from "lucide-react";
import { money } from "@/lib/pricing";

// Book prices, big, near the top of the homepage (2026-11-10, Trey: "the price isn't on the front page...
// people need to see it's not $1,700"). Every number comes from GET /api/pricing (the same config the
// server charges from), so nothing here can drift from what checkout charges. The freelancer figure is
// Reedsy's own published average (same source as the first-book article further down the page).
const REEDSY = "https://reedsy.com/blog/guide/how-to-self-publish-a-book/cost-to-self-publish/";

// Compact version for inside the hero, right under the buttons.
export function HeroPriceStrip({ pricing }) {
  const book = pricing?.book;
  const member = pricing?.membership;
  if (!book?.price_cents) return null;
  return (
    <a href="#book-price" className="mt-6 block max-w-xl border-2 border-[#D4AF37] bg-black/60 px-5 py-4 hover:bg-[#D4AF37]/10 transition-colors" data-testid="hero-price-strip">
      <div className="font-mono-spec text-[10px] tracking-[0.22em] uppercase text-[#D4AF37]">Fix everything · one price per book</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-display font-black text-4xl md:text-5xl text-white">{money(book.price_cents)}</span>
        {member?.book_price_cents ? (
          <span className="text-neutral-300 text-base">
            or <span className="font-display font-black text-3xl text-[#D4AF37]">{money(member.book_price_cents)}</span> with the {money(member.price_cents)}/month membership
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-sm text-neutral-400">Full cover check + fix and full inside-page check + fix. Not $1,700. <span className="text-[#D4AF37]">See what's included ↓</span></div>
    </a>
  );
}

export default function HomePriceBlock({ pricing }) {
  const book = pricing?.book;
  const member = pricing?.membership;
  if (!book?.price_cents) return null;
  const maxPages = pricing?.advanced_audit?.max_pages || 300;
  const days = book.window_days;
  const savesFirst = member ? book.price_cents - member.book_price_cents - member.price_cents : 0;

  const includes = [
    "Full cover (exterior) check: front, spine and back",
    "Full cover fix: bleed, size, spine width, colors, ink",
    `Full inside-page (interior) check, every page up to ${maxPages}`,
    "Full inside-page fix: margins, page size, fonts, blurry pictures",
    "Cover design (Cover Studio + AI cover help)",
    "Writing and editing help (spelling, grammar, wording)",
    "A PDF report of every problem found and every repair made",
    "SparkPrep Certified stamp when your files pass every check",
    `Print-ready files for KDP, IngramSpark, Barnes & Noble and Lulu${days ? `, with ${days} days of unlimited downloads` : ""}`,
  ];

  return (
    <section id="book-price" className="border-t border-neutral-900 bg-gradient-to-b from-[#151007] to-[#0A0A0A] scroll-mt-20" aria-labelledby="book-price-title" data-testid="home-price-block">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37] flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> [ What it costs ]</span>
        <h2 id="book-price-title" className="font-display font-black text-4xl md:text-6xl tracking-tighter mt-4 leading-[0.95]">
          Your whole book fixed for <span className="text-[#D4AF37]">{money(book.price_cents)}</span>.
          {member?.book_price_cents ? <><br />Members pay <span className="text-[#D4AF37]">{money(member.book_price_cents)}</span>.</> : null}
        </h2>
        <p className="mt-6 text-lg text-neutral-300 max-w-3xl leading-relaxed">
          Hiring freelancers for a cover and inside pages costs about <span className="text-white font-semibold">$1,730</span> on average
          (<a href={REEDSY} target="_blank" rel="nofollow noopener noreferrer" className="underline decoration-neutral-600 hover:text-white">Reedsy's figures</a>), and it often takes weeks.
          SparkPrep checks and fixes both, for one price per book.
        </p>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="marketing-surface p-8 border-2 border-white/20" data-testid="home-price-book">
            <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-400">One book · no membership</div>
            <div className="mt-3 font-display font-black text-6xl md:text-7xl text-white">{money(book.price_cents)}</div>
            <div className="text-neutral-400 text-sm mt-1">per book. Cover, inside pages, or both. Same price.</div>
          </div>
          {member?.book_price_cents ? (
            <div className="marketing-surface p-8 border-2 border-[#D4AF37] relative" data-testid="home-price-member">
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black font-mono-spec text-[10px] tracking-widest uppercase px-2 py-1">Best value</div>
              <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-400">With the {money(member.price_cents)}/month membership</div>
              <div className="mt-3 font-display font-black text-6xl md:text-7xl text-[#D4AF37]">{money(member.book_price_cents)}</div>
              <div className="text-neutral-400 text-sm mt-1">
                per book, plus {money(member.price_cents)}/month.
                {savesFirst > 0 ? <> You save about ${Math.round(savesFirst / 100)} on your first book, and {money(member.saves_per_book_cents)} on every book after.</> : null}
                {" "}Cancel any time.
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-10">
          <h3 className="font-display font-bold text-2xl text-white tracking-tight">Every book includes</h3>
          <ul className="mt-4 grid md:grid-cols-2 gap-x-8 gap-y-3 text-neutral-300">
            {includes.map((f) => (
              <li key={f} className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 mt-0.5 text-[#D4AF37] shrink-0" /> {f}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/pricing" className="btn-gold px-7 py-4 font-mono-spec text-xs tracking-widest uppercase flex items-center gap-2 btn-industrial" data-testid="home-price-cta">
            See Pricing <ArrowRight className="w-4 h-4" />
          </Link>
          {pricing?.free_audit?.active ? (
            <Link to="/audit" className="border border-white text-white hover:bg-white hover:text-black px-7 py-4 font-mono-spec text-xs tracking-widest uppercase flex items-center gap-2 btn-industrial">
              Not sure yet? Get the free audit first
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
