import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import { LogoMark, SparkPrepLogo } from "@/components/Logo";
import BrandWatermark from "@/components/BrandWatermark";
import GuaranteeSeal from "@/components/GuaranteeSeal";
import { CheckCircle2, Zap, FileCheck2, Ruler, Layers, Flame, ArrowRight, Gift, Search, Palette } from "lucide-react";
import { usePricing, money, isBookModel, specialNote } from "@/lib/pricing";
import { HOME_FAQ, FirstBookArticle } from "@/components/FirstBookArticle";
import HomePriceBlock, { HeroPriceStrip } from "@/components/HomePriceBlock";
import HowSparkPrepWorks from "@/components/HowSparkPrepWorks";
import FreeCheckBanner from "@/components/FreeCheckBanner";

export default function Landing() {
  const pricing = usePricing();
  const auditPrice = pricing ? `${money(pricing.audit.price_cents)} ` : "";
  // Holiday Free Audit (Nov 2026, Trey): the free audit leads the page while it runs. Until prices load we show
  // it too, so the page doesn't jump; once the server says the offer is over, the normal hero comes back.
  const freeAudit = pricing ? !!pricing.free_audit?.active : true;
  return (
    <div className="marketing min-h-screen noise-overlay">
      <FreeCheckBanner pricing={pricing} />
      <Nav dark heroLogo />

      {/* Hero (2026-11-21, Trey's A.P.P.S. directive + his mockup): centered, big glowing A.P.P.S. first (what
          SparkPrep IS), then the free audit box right under it (the action). Lettering is large and high
          contrast on purpose. The commercial moved to the section below. Test ids, links and the
          data-next-step marker are unchanged, so tracking and the "Click to fix" pointer still work. */}
      <section className="relative overflow-hidden" data-testid="hero">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 22%, rgba(229,193,88,0.22), rgba(212,175,55,0.06) 45%, transparent 70%)" }} />
        <div aria-hidden="true" className="hidden md:block pointer-events-none absolute left-1/2 top-[478px] -translate-x-1/2 w-[900px] max-w-[140%] h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #E5C158, transparent)", boxShadow: "0 0 24px 4px rgba(229,193,88,0.45)" }} />

        <div className="relative max-w-5xl mx-auto px-5 pt-12 md:pt-16 pb-16 text-center">
          {/* The brand leads (Trey: nothing should outshine the brand it represents). */}
          <a href="/" className="block w-fit mx-auto" data-testid="hero-brand-logo">
            <img src="/brand/sparkprep-logo.png" alt="Legenddary SparkPrep: The Evolution of Self-Publishing" className="mx-auto h-[170px] sm:h-[210px] md:h-[250px] w-auto object-contain" style={{ filter: "drop-shadow(0 0 28px rgba(229,193,88,0.45))" }} draggable={false} fetchpriority="high" />
          </a>

          <span className="mt-4 inline-block font-display font-black text-xs md:text-sm tracking-[0.4em] uppercase text-black rounded-full px-7 py-2 shadow-[0_0_24px_rgba(229,193,88,0.55)]" style={{ background: "linear-gradient(180deg, #F3DC8A, #D4AF37 60%, #B8933E)" }} data-testid="hero-tag">
            Introducing
          </span>

          <h1 className="mt-4" data-testid="hero-title">
            <span className="block mb-3 font-display font-black italic text-2xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }} data-testid="hero-check-line">
              {freeAudit ? "Free " : ""}KDP &amp; IngramSpark Book Check
            </span>
            <span className="block font-display font-black italic tracking-tight leading-none text-[3.25rem] sm:text-[4.75rem] md:text-[6rem]" style={{ background: "linear-gradient(180deg, #FFF1B8 0%, #F3DC8A 25%, #D4AF37 60%, #9C7A2E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 22px rgba(229,193,88,0.55)) drop-shadow(0 4px 2px rgba(0,0,0,0.8))" }}>
              A.P.P.S.
            </span>
            <span className="block mt-1 font-display font-black italic text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>
              <span className="text-[#F3DC8A]">Automated Publishing</span> <span className="text-white">Production System</span>
            </span>
          </h1>
          {/* Hero copy (2026-11-25, Trey): his one-line intro (same words as the page's meta description), then his six numbered
              points, then the book box (CTAs unchanged), then his story. Prices come from /api/pricing. */}
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-2xl text-white leading-relaxed font-medium" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }} data-testid="hero-intro">
            <strong className="text-[#F3DC8A]">Legenddary SparkPrep A.P.P.S.</strong> checks, fixes and prepares print-ready books to meet KDP, IngramSpark, Lulu and Barnes &amp; Noble Press specifications.
          </p>

          <ol className="mt-12 grid md:grid-cols-2 gap-4 md:gap-5 text-left" aria-label="What Legenddary SparkPrep does" data-testid="hero-points">
            {heroPoints(pricing, freeAudit).map(([title, body], i) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-[#D4AF37]/40 bg-black/70 p-5 md:p-6">
                <span className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-display font-black text-xl md:text-2xl text-black" style={{ background: "linear-gradient(180deg, #F3DC8A, #D4AF37 60%, #B8933E)" }} aria-hidden="true">{i + 1}</span>
                <div>
                  <h2 className="font-display font-black italic text-xl md:text-2xl text-[#F3DC8A] leading-tight">{title}</h2>
                  <p className="mt-2 text-base md:text-lg text-neutral-100 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* The main action sells the whole book (2026-11-24, Trey: the hero advertises what pays; the free check
              lives in the banner above and in one small link here). Prices come from /api/pricing. */}
          <div className="mt-12 max-w-3xl mx-auto border-2 border-[#E5C158] rounded-2xl bg-gradient-to-b from-[#D4AF37]/[0.16] to-black/80 px-5 md:px-10 py-8 shadow-[0_0_50px_rgba(229,193,88,0.28)]" data-testid="hero-book-box">
            <h2 className="font-display font-black italic text-3xl md:text-5xl text-white tracking-tight leading-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }} data-testid="hero-book-title">
              Your Whole Book, <span className="text-[#F3DC8A]">Print-Ready.</span>
            </h2>
            <p className="mt-4 text-lg md:text-xl text-white font-medium">
              Design your cover, format your pages, check both against Amazon KDP and IngramSpark rules, fix the problems and download print-ready files. One system, one price per book.
            </p>
            {pricing?.book?.price_cents ? (
              <p className="mt-5 text-white" data-testid="hero-book-price">
                <span className="font-display font-black text-4xl md:text-5xl">{money(pricing.book.price_cents)}</span>
                <span className="text-neutral-300 text-base md:text-lg"> per book</span>
                {pricing?.membership?.book_price_cents ? (
                  <span className="text-neutral-300 text-base md:text-lg"> · or <span className="font-display font-black text-2xl md:text-3xl text-[#F3DC8A]">{money(pricing.membership.book_price_cents)}</span> with the {money(pricing.membership.price_cents)}/month membership</span>
                ) : null}
              </p>
            ) : null}
            <Link to="/register" className="mt-6 btn-gold w-full justify-center rounded-xl px-6 py-5 md:py-6 font-display font-black italic text-xl md:text-3xl tracking-wide uppercase flex items-center gap-3 btn-industrial shadow-[0_0_30px_rgba(229,193,88,0.5)]" data-testid="hero-cta-primary" data-next-step="Start here">
              <Zap className="w-7 h-7" strokeWidth={3} /> Start my book <ArrowRight className="w-7 h-7" strokeWidth={3} />
            </Link>
            <p className="mt-4 text-base md:text-lg text-white">
              Not ready yet? <Link to="/audit" className="text-[#F3DC8A] font-semibold underline underline-offset-4 hover:text-white" data-testid="hero-cta-audit">{freeAudit ? "Check your book free first" : "Get a book audit first"}</Link>.
            </p>
          </div>

          {/* Trey's story (2026-11-25), lightly smoothed. */}
          <article className="mt-14 max-w-3xl mx-auto text-left border-l-4 border-[#D4AF37] bg-[#D4AF37]/[0.07] rounded-r-2xl px-5 md:px-10 py-8" aria-labelledby="hero-story-title" data-testid="hero-story">
            <h2 id="hero-story-title" className="font-display font-black italic text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Struggle Gave Birth to <span className="text-[#F3DC8A]">Legenddary SparkPrep</span>
            </h2>
            <div className="mt-5 space-y-4 text-base md:text-lg text-neutral-100 leading-relaxed">
              <p>Legenddary SparkPrep was born out of frustration, determination, and a desire to make a difference.</p>
              <p>Bringing a book into the world isn't always easy. The process can be overwhelming, confusing, expensive, and at times discouraging. For independent authors and self-publishers, finding the right information, resources, and help can feel like an uphill battle.</p>
              <p>We know because we've lived that struggle ourselves.</p>
              <p>Legenddary SparkPrep grew out of that experience, with a simple belief: no author should have to walk that road feeling helpless or alone.</p>
              <p>Our goal is to make publishing knowledge, practical resources, and professional help easier to reach for the people who need them. Whether you're writing your first manuscript, getting a book ready to publish, or building a career as an independent author, we want Legenddary SparkPrep to be a resource you can depend on.</p>
              <p>We believe the hard things we go through can have a purpose beyond ourselves. What we learn from those challenges can make the road easier for someone else.</p>
              <p>The struggle doesn't have to be for nothing. The pain doesn't have to be permanent. And what we build from it can last far longer than the hardship that inspired it.</p>
              <p className="font-display font-bold italic text-xl md:text-2xl text-[#F3DC8A]">May our story inspire you to give birth to your own dreams, and never let the pain stop you.</p>
              <p className="text-neutral-300">Joshua Davis, Founder</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link to="/register" className="btn-gold rounded-xl px-5 py-3 font-display font-black italic uppercase tracking-wide inline-flex items-center gap-2" data-testid="hero-story-cta">
                <Zap className="w-5 h-5" strokeWidth={3} /> Start my book
              </Link>
              <Link to="/audit?utm_source=home-story" className="self-center text-[#F3DC8A] font-semibold underline underline-offset-4 hover:text-white" data-testid="hero-story-audit">{freeAudit ? "Check my book free" : "Get my book audit"}</Link>
            </div>
          </article>

          <p className="mt-8 font-display font-bold italic text-2xl md:text-3xl text-[#F3DC8A]" data-testid="hero-motto">Power without complexity.</p>
          <p className="mt-3 text-base text-neutral-200">
            New here? <a href="/automated-publishing-production-system/" className="text-white font-semibold underline decoration-[#D4AF37] underline-offset-4 hover:text-[#F3DC8A]" data-testid="hero-apps">Read what an A.P.P.S. is</a>.
          </p>
        </div>
      </section>

      {/* Under the hero: the plain definition, prices, free tools and the commercial (moved down from the hero). */}
      <section className="relative overflow-hidden border-t border-neutral-900">
        <BrandWatermark variant="dark" position="hero-left" scale={0.62} maxPx={780} />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-7">
            <div className="max-w-xl border-l-2 border-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-4" data-testid="hero-what-is">
              <h2 className="font-display font-bold text-xl text-white tracking-tight">What is SparkPrep?</h2>
              <p className="mt-2 text-neutral-200 leading-relaxed">
                Legenddary SparkPrep is an <a href="/automated-publishing-production-system/" className="text-white underline decoration-[#D4AF37]/60 underline-offset-4 hover:text-[#D4AF37]">Automated Publishing Production System (A.P.P.S.)</a>: one system that does the jobs of book formatting, typesetting, cover design, preflight checking and prepress. It builds your book, checks it against Amazon KDP and IngramSpark print rules, fixes what it safely can, and re-checks each fix before you print.
              </p>
            </div>

            <HeroPriceStrip pricing={pricing} />

            <div className="mt-10 max-w-xl" data-testid="hero-free-tools">
              <h2 className="font-display font-bold text-lg text-white tracking-tight">Also free for every author</h2>
              <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-neutral-300">
                <li><Link to="/cover-studio" className="flex items-center gap-2 hover:text-white"><CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> Cover Studio (cover designer)</Link></li>
                <li><Link to="/interior-studio" className="flex items-center gap-2 hover:text-white"><CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> Interior Studio (page designer)</Link></li>
                <li><a href="/tools/" className="flex items-center gap-2 hover:text-white"><CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> Spine, margin &amp; DPI checkers</a></li>
                <li><a href="/templates/" className="flex items-center gap-2 hover:text-white"><CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> 224 cover templates</a></li>
                <li><a href="/guides/" className="flex items-center gap-2 hover:text-white"><CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> Step-by-step fix guides</a></li>
                <li><Link to="/specs" className="flex items-center gap-2 hover:text-white"><CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> Printer spec library</Link></li>
              </ul>
            </div>

            {/* Short answer box: a 40-60 word definition so Google can lift it as a featured snippet. */}
            <div className="mt-10 max-w-xl border-l-2 border-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-4" data-testid="hero-definition">
              <h2 className="font-display font-bold text-lg text-white tracking-tight">What is a book file audit?</h2>
              <p className="mt-2 text-neutral-300 leading-relaxed">
                A book file audit is the first step of the SparkPrep A.P.P.S. It checks your cover and inside pages against the printer's rules before you upload. It finds problems like missing bleed, the wrong size or spine width, blurry pictures, screen colors and missing fonts, shows where each one is, and names the Amazon KDP or IngramSpark rule it breaks.
              </p>
              <Link to="/audit?utm_source=home-audit-box" className="mt-3 inline-flex items-center gap-2 text-[#F3DC8A] font-semibold hover:text-white" data-testid="audit-box-cta">{freeAudit ? "Check my book free" : "Get my book audit"} <ArrowRight className="w-4 h-4" /></Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-xs font-mono-spec tracking-widest text-neutral-500 uppercase">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> IngramSpark</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Amazon KDP</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Barnes & Noble</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Lulu</span>
            </div>
          </div>

          {/* The animated 72-second ad (2026-11-22, Trey: "it's important"; the 40-second live-action ad stays on /video/). Click to play: no autoplay, nothing downloads until pressed. */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[320px]">
              <GuaranteeSeal
                size={96}
                className="block absolute -top-6 -right-4 sm:-top-8 sm:-right-8 sm:w-[116px] sm:h-[116px] z-10 -rotate-12 drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
              />
              <video
                className="w-full aspect-[9/16] bg-black border border-[#D4AF37]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                src="/media/sparkprep-animated-ad-theme.mp4"
                poster="/media/sparkprep-animated-ad-poster.jpg"
                controls
                playsInline
                preload="none"
                aria-label="Animated SparkPrep ad for first-time authors: what a freelancer costs, the risks, and what SparkPrep does"
                data-testid="home-commercial"
              />
            </div>
            <p className="mt-3 text-sm text-neutral-300 text-center max-w-[320px]">Watch the 72-second story: what publishing your first book really costs, and how SparkPrep does it for less. <a href="/video/" className="underline text-[#D4AF37] hover:text-white">See our other ad</a></p>
          </div>
        </div>
      </section>

      {/* Book prices, big, right under the hero (2026-11-10). */}
      <HomePriceBlock pricing={pricing} />

      {/* What the A.P.P.S. brings together, right under the hero (2026-11-21: was "the all-in-one suite"). */}
      {(
        <section className="border-t border-neutral-900" aria-labelledby="suite-intro" data-testid="suite-intro">
          <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-7">
              <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ Built by an author whose book was rejected 18 times ]</span>
              <h2 id="suite-intro" className="font-display font-black text-5xl md:text-7xl tracking-tighter mt-4 leading-[0.9]">
                One system.<br />
                <span className="text-[#D4AF37]">Every step</span> of your book.
              </h2>
              <p className="mt-6 font-display font-bold italic text-2xl text-[#D4AF37]">Power without complexity.</p>
              <p className="mt-6 text-lg text-neutral-300 max-w-xl leading-relaxed">
                Formatting, preflight and prepress used to be separate tools and separate people. In the SparkPrep A.P.P.S. they are parts of one system: design your cover, write and format your pages, check them against Amazon KDP and IngramSpark's print rules, fix what it safely can, and download print-ready files. <span className="text-white font-semibold">Everything you need to publish, in one place</span>, in plain English.
              </p>
              {/* A.P.P.S. positioning (2026-11-18, Trey's wording). */}
              <div className="mt-8 max-w-xl border border-[#D4AF37]/30 px-5 py-4" data-testid="apps-positioning">
                <p className="font-mono-spec text-[11px] tracking-[0.22em] uppercase text-[#D4AF37]">Legenddary SparkPrep · The Automated Publishing Production System</p>
                <p className="mt-2 font-display font-bold text-xl text-white">Beyond formatting. Beyond preflight. Beyond prepress.</p>
                <p className="mt-1 text-neutral-300">One integrated system. Multiple production capabilities. A smarter way to publish.</p>
                <a href="/automated-publishing-production-system/" className="mt-3 inline-flex items-center gap-2 text-[#D4AF37] hover:text-white font-mono-spec text-xs tracking-widest uppercase">What is an A.P.P.S.? <ArrowRight className="w-3.5 h-3.5" /></a>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="border-l-2 border-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-4" data-testid="suite-definition">
                <h3 className="font-display font-bold text-lg text-white tracking-tight">What is SparkPrep?</h3>
                <p className="mt-2 text-neutral-300 leading-relaxed">
                  Legenddary&apos;s SparkPrep is an <a href="/automated-publishing-production-system/" className="text-white underline decoration-[#D4AF37]/60 underline-offset-2 hover:text-[#D4AF37]">Automated Publishing Production System (A.P.P.S.)</a>: one system that does the jobs of book formatting, typesetting, cover design, preflight checking and prepress. It builds your book, checks it against Amazon KDP and IngramSpark print rules, fixes what it safely can, and re-checks each fix before you print. It also covers Barnes &amp; Noble Press and Lulu, and exports print-ready PDF/X-1a files.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-6 text-xs font-mono-spec tracking-widest text-neutral-500 uppercase">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> IngramSpark</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Amazon KDP</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Barnes & Noble</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Lulu</span>
              </div>
              <Link to="/register" className="mt-8 inline-flex btn-spark px-7 py-4 font-mono-spec text-xs tracking-widest uppercase text-white items-center gap-2 btn-industrial">
                <Flame className="w-3.5 h-3.5" /> Start My Book <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How SparkPrep works, in Trey's own words, cleaned up (2026-11-21). */}
      <HowSparkPrepWorks />

      {/* First-time author article (2026-11-01, Trey: talk to new authors, honest numbers). */}
      <FirstBookArticle pricing={pricing} auditPrice={freeAudit && pricing ? "free" : auditPrice.trim()} auditNote={freeAudit ? "" : specialNote(pricing, "audit")} />

      {/* New authors: the three things nobody tells you, beside the old editor mock (moved here from the hero). */}
      <section className="border-t border-neutral-900" aria-labelledby="new-authors">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ New to Self-Publishing? ]</span>
            <h2 id="new-authors" className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3">What nobody tells you<br />before you <span className="text-[#D4AF37]">upload</span>.</h2>
            <ul className="mt-8 space-y-4 text-neutral-300 text-lg leading-relaxed max-w-xl">
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" /> Before printing, KDP and IngramSpark check your files by machine. If one thing is off, your book is sent back.</li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" /> They check things like bleed, colors, picture sharpness, margins and spine width. Most first-time authors have never heard of them.</li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" /> Checking your files before you upload is called <span className="text-white font-semibold">preflight</span>. It's one part of the SparkPrep A.P.P.S., which also fixes what it finds.</li>
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
              { icon: Ruler, title: "Sharp Pictures", desc: "Printing needs 300 DPI (dots per inch). SparkPrep shows which pictures will print blurry, in green, yellow or red.", span: "md:col-span-5", accent: true, link: ["/image-dpi-checker/", "Check a picture free"] },
              { icon: Palette, title: "Print-Safe Colors", desc: "Screens make color with light (RGB). Printers use ink (CMYK). SparkPrep switches your colors over in one click.", span: "md:col-span-4" },
              { icon: Layers, title: "No Print Surprises", desc: "See-through effects and stacked layers can print wrong. SparkPrep merges them into one flat picture for you.", span: "md:col-span-3" },
              { icon: Zap, title: "The Right Spine Size", desc: "Type your page count. Get the exact spine width for your paper.", span: "md:col-span-4", link: ["/book-spine-width-calculator/", "Spine width calculator"] },
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
                  {f.link ? <a href={f.link[0]} className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#D4AF37] font-semibold hover:text-white">{f.link[1]} <ArrowRight className="w-3.5 h-3.5" /></a> : null}
                </div>
              </div>
            ))}
          </div>
          {/* In-flow buttons (2026-11-24, Trey): every section ends with the next step it talks about. */}
          <div className="mt-10 flex flex-wrap items-center gap-4" data-testid="checks-ctas">
            <Link to="/audit?utm_source=home-checks" className="btn-gold px-7 py-4 font-mono-spec text-xs tracking-widest uppercase btn-industrial inline-flex items-center gap-2" data-testid="checks-cta-audit"><Search className="w-4 h-4" /> {freeAudit ? "Check my book for these, free" : "Check my book for these"}</Link>
            <Link to="/register" className="px-7 py-4 border border-[#D4AF37] text-[#F3DC8A] font-mono-spec text-xs tracking-widest uppercase hover:bg-[#D4AF37]/10 inline-flex items-center gap-2" data-testid="checks-cta-book">Fix them all with the A.P.P.S. <ArrowRight className="w-4 h-4" /></Link>
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
          <div className="mt-10 flex flex-wrap items-center gap-4" data-testid="steps-ctas">
            <Link to="/register" className="btn-gold px-7 py-4 font-mono-spec text-xs tracking-widest uppercase btn-industrial inline-flex items-center gap-2" data-testid="steps-cta-book"><Zap className="w-4 h-4" /> Start step 1 now</Link>
            <Link to="/interior-studio" className="text-neutral-300 hover:text-white underline decoration-[#D4AF37] underline-offset-4" data-testid="steps-cta-interior">No file yet? Write and format it in Interior Studio, free</Link>
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
          <p className="mt-8 text-neutral-300" data-testid="faq-cta">
            Still not sure? <Link to="/audit?utm_source=home-faq" className="text-[#F3DC8A] font-semibold underline underline-offset-4 hover:text-white">{freeAudit ? "Check your book free" : "Get a book audit"}</Link> and see what SparkPrep finds, or <a href="/automated-publishing-production-system/" className="text-[#F3DC8A] font-semibold underline underline-offset-4 hover:text-white">read what an A.P.P.S. does</a>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-900 bg-gradient-to-b from-[#0A0A0A] to-[#151007]">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="flex flex-col items-center gap-4">
            <SparkPrepLogo height={140} />
            <LogoMark size={44} />
            <p className="font-mono-spec text-xs tracking-[0.28em] uppercase text-[#D4AF37]">The Evolution of Self-Publishing</p>
            <p className="font-display font-bold italic text-2xl text-white">Power without complexity.</p>
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl tracking-tighter mt-8">
            Stop guessing.<br />
            <span style={{ background: "linear-gradient(180deg, #E5C158, #D4AF37 55%, #B8933E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start printing.</span>
          </h2>
          {freeAudit && pricing?.book ? (
            <p className="text-neutral-400 mt-6 max-w-xl mx-auto">
              This holiday season your first audit is free. Upload your book, see every problem, then let SparkPrep fix it all and hand you
              print-ready files for {money(pricing.book.price_cents)} a book. No subscription needed. No card to start.
            </p>
          ) : isBookModel(pricing) ? (
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
        <nav aria-label="Popular fix guides" className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 normal-case tracking-normal text-neutral-400">
          <a href="/guides/fix-cover-wrong-size/" className="hover:text-white">Cover wrong size</a>
          <a href="/guides/fix-kdp-margin-error/" className="hover:text-white">KDP margin error</a>
          <a href="/guides/fix-font-not-embedded/" className="hover:text-white">Font not embedded</a>
          <a href="/guides/fix-low-resolution-images/" className="hover:text-white">Low-resolution images</a>
          <a href="/guides/fix-cover-bleed-error/" className="hover:text-white">Cover bleed error</a>
          <a href="/guides/rgb-vs-cmyk-book-cover/" className="hover:text-white">RGB vs CMYK</a>
          <a href="/guides/fix-ink-coverage-240/" className="hover:text-white">Ink coverage over 240%</a>
          <a href="/guides/fix-pdf-page-size-mismatch/" className="hover:text-white">Page size mismatch</a>
        </nav>
        <nav aria-label="Free tools" className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 normal-case tracking-normal text-neutral-400">
          <a href="/tools/" className="hover:text-white">Free tools</a>
          <a href="/guides/" className="hover:text-white">Guides</a>
          <a href="/features/ai-book-cover-maker/" className="hover:text-white">AI Book Cover Maker</a>
          <a href="/features/book-editor-interior-formatter/" className="hover:text-white">Book Editor &amp; Interior Formatter</a>
          <a href="/features/cover-template-designer/" className="hover:text-white">Cover Template Designer</a>
          <a href="/features/ai-writing-assistant/" className="hover:text-white">AI Writing Assistant</a>
          <a href="/features/automated-book-preflight/" className="hover:text-white">Automated Book Preflight</a>
          <a href="/answers/" className="hover:text-white">Quick answers</a>
          <a href="/automated-publishing-production-system/" className="hover:text-white">What is an A.P.P.S.?</a>
          <a href="/apps-vs-traditional-publishing-software/" className="hover:text-white">A.P.P.S. vs traditional software</a>
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
          <Link to="/specs" className="hover:text-white">Printer specs</Link>
          <a href="/evolution-of-self-publishing/" className="hover:text-white">The evolution of self-publishing</a>
          <a href="/glossary/" className="hover:text-white">Glossary</a>
          <a href="/how-to-self-publish-a-book/" className="hover:text-white">How to self publish a book</a>
          <a href="/book-formatting/" className="hover:text-white">Book formatting</a>
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
          <a href="/about/" className="hover:text-white">About SparkPrep</a>
          <a href="/privacy/" className="hover:text-white">Privacy</a>
        </nav>
        <nav aria-label="More free help" className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 normal-case tracking-normal text-neutral-500">
          <a href="https://sparkpreplanding.legenddary.com/" className="hover:text-white">What is book preflight?</a>
          <a href="https://sparkpreplandingfix.legenddary.com/" className="hover:text-white">Print file fixes</a>
          <a href="https://sparkpreplandingcovers.legenddary.com/" className="hover:text-white">Cover size charts</a>
          <a href="https://sparkpreplandingerrors.legenddary.com/" className="hover:text-white">Rejection messages decoded</a>
          <a href="https://sparkpreplandingnewauthor.legenddary.com/" className="hover:text-white">First book guide</a>
        </nav>
        <div className="mb-2 text-[#D4AF37]">Legenddary&apos;s SparkPrep · The Evolution of Self-Publishing · Power Without Complexity</div>
        <div className="mb-2 normal-case tracking-normal text-neutral-500">SparkPrep is a <a href="https://www.legenddary.com/" className="text-neutral-300 underline hover:text-white">Legenddary</a> product.</div>
        © <a href="https://www.legenddary.com/" className="hover:text-white">Legenddary</a> — Publish · Automate · Elevate · We Build. You Legenddary.
      </footer>
    </div>
  );
}

// The six hero points (Trey, 2026-11-25). Prices and the free-check deadline come from /api/pricing.
function heroPoints(pricing, freeAudit) {
  const book = pricing?.book?.price_cents ? money(pricing.book.price_cents) : null;
  const member = pricing?.membership?.book_price_cents ? money(pricing.membership.book_price_cents) : null;
  const monthly = pricing?.membership?.price_cents ? money(pricing.membership.price_cents) : null;
  const priceLine = book
    ? `Legenddary SparkPrep gives you the tools, the checks and the fixes for ${book} per book. Members pay ${member || book} per book${monthly ? ` (membership is ${monthly} a month)` : ""}.`
    : "Legenddary SparkPrep gives you the tools, the checks and the fixes for one low price per book.";
  return [
    freeAudit
      ? ["Free Book Check", "Use our free book check before December 31. It looks at your whole cover and the first page of your inside pages for problems that get files rejected by Amazon KDP and IngramSpark. No account and no credit card, just your email. It's a smart first step before you submit."]
      : ["Book Check First", "Start with a book check. It looks at your cover and inside pages for problems that get files rejected by Amazon KDP and IngramSpark, so you know what needs fixing before you submit."],
    ["Finds the Problems", "The Legenddary SparkPrep A.P.P.S. (Automated Publishing Production System) looks through your book files for print problems, from missing bleed to the wrong spine width, so you know what needs attention before you submit."],
    ["Fixes Them and Checks Again", "Finding problems is only the start. The A.P.P.S. fixes what it safely can, then checks each fix a second time, so your files line up with the printer's rules."],
    ["Write, Design and Export in One Place", "Write and edit your book with the built-in book editor and writing helper. Make a cover with AI help or start from one of 224 templates. Format your inside pages and download print-ready files, all in one place. Your cover is built to the printer's size rules from the start, which helps avoid common layout mistakes."],
    ["Costs Far Less Than Hiring It Out", `Why pay hundreds or even thousands of dollars for separate publishing services? ${priceLine}`],
    ["Built for Every Major Printer", "The A.P.P.S. knows the print rules of Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu. It checks your files against each one's rules before you submit. Final approval is always up to the publisher."],
  ];
}
