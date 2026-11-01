import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import SeasonBanner from "@/components/SeasonBanner";
import { LogoMark, SparkPrepLogo } from "@/components/Logo";
import BrandWatermark from "@/components/BrandWatermark";
import GuaranteeSeal from "@/components/GuaranteeSeal";
import { CheckCircle2, Zap, FileCheck2, Palette, Ruler, Layers, Flame, ArrowRight } from "lucide-react";
import { usePricing, money, isBookModel, specialNote } from "@/lib/pricing";
import { HOME_FAQ, FirstBookArticle } from "@/components/FirstBookArticle";

export default function Landing() {
  const pricing = usePricing();
  const auditPrice = pricing ? `${money(pricing.audit.price_cents)} ` : "";
  return (
    <div className="marketing min-h-screen noise-overlay">
      <SeasonBanner />
      <Nav dark />

      {/* Hero (2026-11-01, Trey: built the way Google reads a page -- one keyword H1, a short
          plain-English answer right under it, the commercial in the hero, then the first-time
          author article and an FAQ further down. Buttons, links and test ids are unchanged.) */}
      <section className="relative overflow-hidden">
        <BrandWatermark variant="dark" position="hero-left" scale={0.62} maxPx={780} />

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-3">
              <LogoMark size={32} />
              <span className="font-mono-spec text-[10px] tracking-[0.28em] uppercase text-[#D4AF37]">
                Publish · Automate · Elevate
              </span>
            </div>

            <span className="mt-8 inline-flex items-center gap-2 font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-1.5" data-testid="hero-tag">
              Built by an author whose book was rejected 18 times
            </span>

            <h1 className="mt-8" data-testid="hero-title">
              <span className="block font-mono-spec text-sm md:text-base tracking-[0.18em] uppercase text-neutral-300">
                Book preflight checker for KDP &amp; IngramSpark
              </span>
              <span className="block font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter mt-4 leading-[0.9]">
                Your book,<br />
                ready to<br />
                <span className="text-[#D4AF37]" style={{ background: "linear-gradient(180deg, #E5C158, #D4AF37 55%, #B8933E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>print</span><br />
                the first time.
              </span>
            </h1>

            <p className="mt-8 text-lg text-neutral-300 max-w-xl leading-relaxed">
              Amazon KDP and IngramSpark send books back for small file problems: blurry pictures, the wrong colors, art that stops short of the edge, or a spine that's the wrong width. Upload your cover and pages. <span className="text-white font-semibold">SparkPrep</span> finds every problem, tells you what it means, and fixes it in minutes.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register" className="btn-gold px-7 py-4 font-mono-spec text-xs tracking-widest uppercase flex items-center gap-2 btn-industrial" data-testid="hero-cta-primary" data-next-step="Start here">
                Prep My First Book <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/audit" className="btn-spark px-7 py-4 font-mono-spec text-xs tracking-widest uppercase text-white flex items-center gap-2 btn-industrial" data-testid="hero-cta-audit">
                <Flame className="w-3.5 h-3.5" /> Try the {auditPrice}Audit
              </Link>
            </div>
            {/* "See Pricing" used to sit here as a third hero button -- pricing is
                one click away in the nav on every page, so a dedicated hero button
                for it just competed with the two real entry points above. */}

            {/* Short answer box: written as a 40-60 word definition so Google can lift it as a featured snippet. */}
            <div className="mt-10 max-w-xl border-l-2 border-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-4" data-testid="hero-definition">
              <h2 className="font-display font-bold text-lg text-white tracking-tight">What is a book preflight check?</h2>
              <p className="mt-2 text-neutral-300 leading-relaxed">
                A book preflight check looks at your cover and inside pages before you upload them, the same way the printer will. It checks size, bleed, margins, spine width, colors, picture sharpness and fonts, so Amazon KDP or IngramSpark doesn't reject your book.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-xs font-mono-spec tracking-widest text-neutral-500 uppercase">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> IngramSpark</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Amazon KDP</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Barnes & Noble</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Lulu</span>
            </div>
          </div>

          {/* The SparkPrep commercial, now in the hero. Click to play: no autoplay, nothing downloads until pressed. */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[320px]">
              <GuaranteeSeal
                size={96}
                className="block absolute -top-6 -right-4 sm:-top-8 sm:-right-8 sm:w-[116px] sm:h-[116px] z-10 -rotate-12 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
              />
              <video
                className="w-full aspect-[9/16] bg-black border border-[#D4AF37]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                src="/media/sparkprep-commercial.mp4"
                poster="/media/sparkprep-commercial-poster.jpg"
                controls
                playsInline
                preload="none"
                aria-label="SparkPrep commercial: a rejected book file, fixed by SparkPrep (dramatization, AI-generated actors)"
                data-testid="home-commercial"
              />
            </div>
            <p className="mt-3 text-[11px] text-neutral-500 text-center max-w-[320px]">Watch the 40-second ad. Dramatization with AI-generated actors.</p>
          </div>
        </div>
      </section>

      {/* First-time author article (2026-11-01, Trey: talk to new authors, honest numbers). */}
      <FirstBookArticle pricing={pricing} auditPrice={auditPrice.trim()} auditNote={specialNote(pricing, "audit")} />

      {/* New authors: the three things nobody tells you, beside the old editor mock (moved here from the hero). */}
      <section className="border-t border-neutral-900" aria-labelledby="new-authors">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ New to Self-Publishing? ]</span>
            <h2 id="new-authors" className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3">What nobody tells you<br />before you <span className="text-[#D4AF37]">upload</span>.</h2>
            <ul className="mt-8 space-y-4 text-neutral-300 text-lg leading-relaxed max-w-xl">
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" /> Before printing, KDP and IngramSpark check your files by machine. If one thing is off, your book is sent back.</li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" /> They check things like bleed, colors, picture sharpness, margins and spine width. Most first-time authors have never heard of them.</li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" /> Checking your files before you upload is called <span className="text-white font-semibold">preflight</span>. SparkPrep does it for you, and fixes what it finds.</li>
            </ul>
            <a href="/guides/what-is-preflight-first-time-authors/" className="inline-flex items-center gap-2 mt-8 text-[#D4AF37] hover:text-white font-mono-spec text-xs tracking-widest uppercase">New here? Start with this guide <ArrowRight className="w-4 h-4" /></a>
          </div>

          <div className="md:col-span-5 relative">
            <div className="marketing-surface border-[#D4AF37]/20 p-4 relative">
              <div className="flex items-center justify-between text-xs font-mono-spec text-neutral-500 mb-3 uppercase tracking-widest">
                <span>Cover · 6" × 9"</span>
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> PASS</span>
              </div>
              <div className="aspect-[3/4] bg-neutral-950 relative overflow-hidden">
                <div className="absolute inset-2 book-mockup bg-gradient-to-br from-[#3A2A0A] via-[#0A0A0A] to-[#0A0A0A] flex flex-col justify-between p-6 border-l-2 border-[#D4AF37]">
                  <div>
                    <p className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">Novel</p>
                    <h3 className="font-display font-black text-2xl text-white mt-1 tracking-tight">The Long Print</h3>
                  </div>
                  <p className="font-mono-spec text-[10px] text-[#D4AF37]/80 tracking-widest">M. J. HANLON</p>
                </div>
                <div className="absolute inset-4 overlay-bleed pointer-events-none opacity-70" />
                <div className="absolute inset-6 overlay-trim pointer-events-none opacity-70" />
                <div className="absolute inset-8 overlay-safe pointer-events-none opacity-70" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono-spec tracking-widest">
                <div className="border border-neutral-800 p-2">
                  <div className="text-neutral-500">SHARPNESS</div>
                  <div className="text-emerald-400">312 DPI</div>
                </div>
                <div className="border border-neutral-800 p-2">
                  <div className="text-neutral-500">COLOR</div>
                  <div className="text-emerald-400">PRINT INK</div>
                </div>
                <div className="border border-[#D4AF37]/40 bg-[#D4AF37]/5 p-2">
                  <div className="text-neutral-500">SPINE</div>
                  <div className="text-[#D4AF37]">0.451"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento */}
      <section className="border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ What SparkPrep Checks For You ]</span>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3 max-w-3xl">Every reason books get<br />sent back, <span className="text-[#D4AF37]">checked</span>.</h2>

          <div className="grid md:grid-cols-12 gap-4 mt-14">
            {[
              { icon: Ruler, title: "Sharp Pictures", desc: "Printing needs 300 DPI (dots per inch). SparkPrep shows which pictures will print blurry, in green, yellow or red.", span: "md:col-span-5", accent: true },
              { icon: Palette, title: "Print-Safe Colors", desc: "Screens make color with light (RGB). Printers use ink (CMYK). SparkPrep switches your colors over in one click.", span: "md:col-span-4" },
              { icon: Layers, title: "No Print Surprises", desc: "See-through effects and stacked layers can print wrong. SparkPrep merges them into one flat picture for you.", span: "md:col-span-3" },
              { icon: Zap, title: "The Right Spine Size", desc: "Type your page count. Get the exact spine width for your paper.", span: "md:col-span-4" },
              { icon: FileCheck2, title: "A File Printers Accept", desc: "Your finished PDF has every font built in, sharp pictures, and the exact size and bleed (the extra edge printers trim off). It's saved the way printers ask for (PDF/X-1a).", span: "md:col-span-5", accent: true },
              { icon: CheckCircle2, title: "Built for 4 Printers", desc: "Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu, each checked against its own rules.", span: "md:col-span-3" },
            ].map((f, i) => (
              <div key={i} className={`marketing-surface p-8 ${f.accent ? "border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/[0.06] to-transparent" : ""} ${f.span} min-h-[220px] flex flex-col justify-between`} data-testid={`feature-${i}`}>
                <div className={`w-10 h-10 flex items-center justify-center ${f.accent ? "bg-[#D4AF37] text-black" : "border border-neutral-700 text-white"}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl tracking-tight text-white">{f.title}</h3>
                  <p className="text-neutral-400 text-sm mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ How It Works ]</span>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3 max-w-3xl">Five steps.<br />Then <span className="text-[#D4AF37]">export</span>.</h2>
          <div className="grid md:grid-cols-5 gap-4 mt-12">
            {["Pick your printer", "Pick your book size + paper", "Enter your page count", "Upload your file", "Download print-ready files"].map((step, i) => (
              <div key={i} className={`border ${i === 4 ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-neutral-800"} p-6`} data-testid={`step-${i}`}>
                <div className={`font-mono-spec text-[10px] tracking-widest ${i === 4 ? "text-[#D4AF37]" : "text-neutral-600"}`}>STEP {String(i + 1).padStart(2, "0")}</div>
                <div className={`font-display font-bold text-xl mt-4 tracking-tight ${i === 4 ? "text-[#D4AF37]" : "text-white"}`}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ: the same questions and answers are in the FAQPage structured data in public/index.html -- keep them matching. */}
      <section className="border-t border-neutral-900" aria-labelledby="home-faq">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ Questions ]</span>
          <h2 id="home-faq" className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3">Common questions</h2>
          <div className="mt-10 divide-y divide-neutral-800 border-y border-neutral-800">
            {HOME_FAQ.map((f, i) => (
              <details key={i} className="group py-5" data-testid={`home-faq-${i}`} open={i === 0}>
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <h3 className="font-display font-bold text-xl text-white tracking-tight">{f.q}</h3>
                  <span className="text-[#D4AF37] text-2xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-neutral-300 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-900 bg-gradient-to-b from-[#0A0A0A] to-[#151007]">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="flex flex-col items-center gap-4">
            <SparkPrepLogo height={140} />
            <LogoMark size={44} />
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter mt-8">
            Stop guessing.<br />
            <span style={{ background: "linear-gradient(180deg, #E5C158, #D4AF37 55%, #B8933E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start printing.</span>
          </h2>
          {isBookModel(pricing) ? (
            <p className="text-neutral-400 mt-6 max-w-xl mx-auto">
              Try SparkPrep free: create an account, upload your book, and watch SparkPrep run a real scan of your file.
              Want to see exactly what it found? Unlock your complete audit for {auditPrice.trim()}. When SparkPrep fixes your book and hands you
              print-ready files, that {auditPrice.trim()} is credited toward your {money(pricing.book.price_cents)} book.
              No subscription. No credit card required to try SparkPrep.
            </p>
          ) : (
            <p className="text-neutral-400 mt-6 max-w-xl mx-auto">Create a free account for unlimited previews & compliance checks in the Editor — upgrade anytime to export. No credit card to start.</p>
          )}
          {/* One button, not two -- the $X audit path is already offered once, in the
              hero above. Repeating both choices again here just re-opens a decision
              someone visiting this far down the page has usually already made. */}
          <div className="mt-10 flex justify-center">
            <Link to="/register" className="btn-gold px-8 py-4 font-mono-spec text-xs tracking-widest uppercase btn-industrial" data-testid="footer-cta" data-next-step="Start here">
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-900 py-8 text-xs text-neutral-600 font-mono-spec tracking-widest uppercase text-center">
        <nav aria-label="Free tools" className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 normal-case tracking-normal text-neutral-400">
          <a href="/tools/" className="hover:text-white">Free tools</a>
          <a href="/guides/" className="hover:text-white">Guides</a>
          <a href="/kdp-cover-calculator/" className="hover:text-white">KDP cover calculator</a>
          <a href="/book-spine-width-calculator/" className="hover:text-white">Spine width calculator</a>
          <a href="/book-cover-dimensions/" className="hover:text-white">Book cover dimensions</a>
          <a href="/ingramspark-cover-template/" className="hover:text-white">IngramSpark cover template</a>
          <a href="/ingramspark-rejection-fixes/" className="hover:text-white">IngramSpark rejection fixes</a>
          <a href="/book-margin-calculator/" className="hover:text-white">Margin &amp; bleed calculator</a>
          <a href="/image-dpi-checker/" className="hover:text-white">Image DPI checker</a>
          <a href="/book-page-count-calculator/" className="hover:text-white">Page count calculator</a>
          <a href="/templates/" className="hover:text-white">Free cover templates</a>
          <a href="/free-book-formatting-guide/" className="hover:text-white">Free formatting guide</a>
          <a href="/free-manuscript-checklist/" className="hover:text-white">Free manuscript checklist</a>
          <a href="/free-indie-author-templates/" className="hover:text-white">Free author templates</a>
        </nav>
        © Legenddary — Publish · Automate · Elevate · We Build. You Legenddary.
      </footer>
    </div>
  );
}
