import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import { usePricing, money, isBookModel } from "@/lib/pricing";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Nav from "@/components/Nav";
import SeasonBanner from "@/components/SeasonBanner";
import BrandWatermark from "@/components/BrandWatermark";
import { Check, Flame, BookOpen, CalendarClock } from "lucide-react";

const TIERS = [
  {
    key: "free",
    name: "Free",
    tag: "Get started",
    price: 0,
    price_label: "$0",
    books: "Preview & compliance only",
    features: [
      "No exports — upgrade to export",
      "Uploads up to 25 MB",
      "KDP + IngramSpark templates",
      "DPI, CMYK + spine calculator",
    ],
    cta: "Start Free",
  },
  {
    key: "author",
    name: "Author",
    tag: "For self-publishers",
    price: 19.99,
    price_label: "$19.99",
    books: "1 full book / month",
    features: [
      "Cover + spine + back + interior",
      "15 print-ready exports / month",
      "Uploads up to 100 MB",
      "All distributor templates",
      "AI Blurb Writer",
    ],
    cta: "Choose Author",
  },
  {
    key: "creator_pro",
    name: "Creator Pro",
    tag: "For prolific writers",
    price: 39.99,
    price_label: "$39.99",
    books: "3 full books / month",
    features: [
      "Everything in Author",
      "45 exports / month",
      "Uploads up to 250 MB",
      "Priority AI blurb + 3D mockup",
      "Email support",
    ],
    cta: "Choose Creator Pro",
    highlight: true,
  },
  {
    key: "publisher",
    name: "Publisher",
    tag: "For small imprints",
    price: 69.99,
    price_label: "$69.99",
    books: "7 full books / month",
    features: [
      "Everything in Creator Pro",
      "100 exports / month",
      "Team seats (up to 3)",
      "Uploads up to 500 MB",
      "Bulk audit + batch export",
      "Priority support",
    ],
    cta: "Choose Publisher",
  },
  {
    key: "studio",
    name: "Studio",
    tag: "For prepress studios",
    price: 199.99,
    price_label: "$199.99",
    books: "30 full books / month",
    gold: true,
    features: [
      "Everything in Publisher",
      "300 exports / month",
      "Team seats (up to 10)",
      "Uploads up to 1 GB",
      "Advanced color profiles + white-label",
      "Dedicated account manager",
    ],
    cta: "Choose Studio",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(null);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const auditId = params.get("audit");
  const pricing = usePricing();
  const bookModel = isBookModel(pricing);

  const legacyCheckout = async (tier) => {
    if (tier === "free") { nav(user ? "/dashboard" : "/register"); return; }
    if (!user) { nav("/register"); return; }
    setBusy(tier);
    try {
      const { data } = await api.post("/payments/checkout", { tier, origin_url: window.location.origin });
      window.location.href = data.checkout_url;
    } catch (e) {
      const msg = fmtErr(e.response?.data?.detail);
      if (e.response?.status === 503) toast.info("Payments are being set up — check back shortly.");
      else toast.error(msg);
      setBusy(null);
    }
  };

  const bookCheckout = async (kind) => {
    if (!user) { nav("/register"); return; }
    setBusy(kind);
    try {
      const body = { origin_url: window.location.origin, ...(auditId ? { audit_id: auditId } : {}) };
      const { data } = kind === "book"
        ? await api.post("/payments/book-pass", body)
        : await api.post("/payments/subscribe", { ...body, plan: kind });
      window.location.href = data.checkout_url;
    } catch (e) {
      const msg = fmtErr(e.response?.data?.detail);
      if (e.response?.status === 503) toast.info("Payments are being set up — check back shortly.");
      else toast.error(msg);
      setBusy(null);
    }
  };

  return (
    <div className="marketing min-h-screen">
      <SeasonBanner />
      <Nav dark />
      <div className="relative overflow-hidden">
        <BrandWatermark variant="dark" position="hero-right" scale={0.55} maxPx={720} opacity={0.22} />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <span className="font-mono-spec text-xs tracking-widest uppercase text-neutral-500">[ Pricing ]</span>
          {pricing === null ? (
            <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter mt-3">Pricing.</h1>
          ) : bookModel ? (
            <>
              <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter mt-3">One price per book.<br />Cover, interior, or both.</h1>
              <p className="text-neutral-400 mt-4 max-w-xl">No plans to decode. Every book includes the full interior deep-check, Auto-Fix with independent verification, and {pricing.book.window_days} days of unlimited exports.</p>
            </>
          ) : (
            <>
              <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter mt-3">Pay per title,<br />not per fix.</h1>
              <p className="text-neutral-400 mt-4 max-w-xl">Every plan includes CMYK, DPI, spine calculator, PDF/X-1a export and distributor templates. Cancel any time.</p>
            </>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-16">

        {pricing === null ? (
          <div className="mt-12 font-mono-spec text-xs tracking-widest uppercase text-neutral-500" data-testid="pricing-loading">Loading prices…</div>
        ) : (
          <>
            <AuditCard pricing={pricing} bookModel={bookModel} />
            {bookModel
              ? <BookModel pricing={pricing} busy={busy} onBuy={bookCheckout} auditId={auditId} user={user} nav={nav} />
              : <LegacyLadder busy={busy} onChoose={legacyCheckout} />}
          </>
        )}
      </div>
    </div>
  );
}

function AuditCard({ pricing, bookModel }) {
  const price = pricing.audit.price_cents;
  const dollars = Math.floor(price / 100);
  const cents = String(price % 100).padStart(2, "0");
  return (
    <div className="mt-12 bg-gradient-to-r from-[#FF6A00] to-[#FF8B3D] p-[1px]" data-testid="audit-hero">
      <div className="bg-[#0D0D0D] p-8 grid md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <div className="inline-flex items-center gap-2 bg-[#FF6A00] text-white px-2 py-1 font-mono-spec text-[10px] tracking-widest uppercase">
            <Flame className="w-3 h-3" /> No Signup Required
          </div>
          <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-4">{money(price)} Print Failure Audit.</h2>
          <p className="text-neutral-400 mt-3 max-w-xl leading-relaxed">
            One-time pay. Upload a cover or interior and get a pixel-level pinpointed audit — with the exact publisher rule cited, region flagged, and step-by-step fix instructions.
            {bookModel && <> <span className="text-white">The full {money(pricing.audit.credit_cents)} is credited toward your book</span> if you fix it with SparkPrep.</>}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">
            <span className="border border-neutral-700 px-2 py-1">✓ No account</span>
            <span className="border border-neutral-700 px-2 py-1">✓ No subscription</span>
            <span className="border border-neutral-700 px-2 py-1">✓ Publisher rule cited</span>
            <span className="border border-neutral-700 px-2 py-1">✓ Fix steps</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">One-time</div>
          <div className="font-display font-black text-6xl tracking-tighter">${dollars}<span className="text-neutral-500">.{cents}</span></div>
          <a href="/audit" className="mt-4 inline-block bg-white text-[#FF6A00] px-6 py-3 font-mono-spec text-xs tracking-widest uppercase hover:bg-neutral-100 btn-industrial" data-testid="audit-cta">
            Run An Audit
          </a>
        </div>
      </div>
    </div>
  );
}

function BookModel({ pricing, busy, onBuy, auditId, user, nav }) {
  const book = pricing.book;
  const credit = auditId ? pricing.audit.credit_cents : 0;
  const plans = pricing.plans || [];
  const main = plans.find((p) => p.id === "book_1");
  const later = plans.filter((p) => p.id !== "book_1");

  return (
    <div className="mt-16" data-testid="book-pricing">
      {auditId && (
        <div className="mb-6 border border-emerald-700/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200" data-testid="audit-credit-banner">
          Your audit credit of {money(credit)} will be taken off at checkout.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="marketing-surface p-8 flex flex-col" data-testid="plan-book-pass">
          <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> One book · no subscription</div>
          <h3 className="font-display font-black text-3xl mt-2 tracking-tight">Single Book</h3>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-display font-black text-5xl">{money(book.price_cents)}</span>
            <span className="text-neutral-500 text-xs">one-time</span>
          </div>
          {credit > 0 && <div className="text-xs text-emerald-300 mt-1">You pay {money(book.price_cents - credit)} with your audit credit</div>}
          <ul className="mt-6 space-y-2 text-sm flex-1">
            {book.includes.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> {f}</li>
            ))}
          </ul>
          <button
            onClick={() => onBuy("book")}
            disabled={busy === "book"}
            className="mt-8 w-full py-3 bg-white text-black font-mono-spec text-xs tracking-widest uppercase hover:bg-neutral-200 btn-industrial disabled:opacity-50"
            data-testid="buy-book-pass"
          >
            {busy === "book" ? "Redirecting…" : `Buy One Book — ${money(book.price_cents - credit)}`}
          </button>
        </div>

        {main && (
          <div className="marketing-surface p-8 flex flex-col border-[#FF6A00]/50 ring-1 ring-[#FF6A00]/30 relative" data-testid="plan-book_1">
            <div className="absolute top-0 right-0 bg-[#FF6A00] text-white font-mono-spec text-[10px] tracking-widest uppercase px-2 py-1">Best value</div>
            <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> {main.audience}</div>
            <h3 className="font-display font-black text-3xl mt-2 tracking-tight">{main.name}</h3>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="font-display font-black text-5xl text-[#FF6A00]">{money(main.price_cents)}</span>
              <span className="text-neutral-500 text-xs">/month</span>
            </div>
            {credit > 0 && <div className="text-xs text-emerald-300 mt-1">First month {money(main.price_cents - credit)} with your audit credit</div>}
            <ul className="mt-6 space-y-2 text-sm flex-1">
              <li className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> {main.books_per_period} new book every month — cover, interior, or both</li>
              {book.includes.slice(1).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> {f}</li>
              ))}
              <li className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> Cancel any time — books already started stay usable</li>
            </ul>
            <button
              onClick={() => onBuy("book_1")}
              disabled={busy === "book_1"}
              className="mt-8 w-full py-3 btn-spark font-mono-spec text-xs tracking-widest uppercase btn-industrial disabled:opacity-50"
              data-testid="subscribe-book_1"
            >
              {busy === "book_1" ? "Redirecting…" : `Subscribe — ${money(main.price_cents)}/mo`}
            </button>
          </div>
        )}
      </div>

      {later.length > 0 && (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {later.map((p) => (
            <div key={p.id} className="border border-neutral-800 p-6 flex items-center justify-between gap-4 flex-wrap opacity-80" data-testid={`plan-${p.id}`}>
              <div>
                <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">{p.audience}</div>
                <div className="font-display font-black text-xl mt-1">{p.name} · {money(p.price_cents)}/mo</div>
              </div>
              <span className="font-mono-spec text-[10px] tracking-widest uppercase border border-neutral-700 px-2 py-1 text-neutral-400">Coming soon</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 marketing-surface p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-display font-black text-xl">Just looking?</div>
          <p className="text-sm text-neutral-400 mt-1">Free account: upload, preview and see the full compliance report. Buy a book when you're ready to export.</p>
        </div>
        <button onClick={() => nav(user ? "/dashboard" : "/register")} className="px-5 py-2.5 border border-neutral-700 hover:border-white font-mono-spec text-xs tracking-widest uppercase btn-industrial" data-testid="start-free">
          Start Free
        </button>
      </div>
    </div>
  );
}

function LegacyLadder({ busy, onChoose }) {
  return (
    <>
      <div className="mt-16">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <span className="font-mono-spec text-xs tracking-widest uppercase text-neutral-500">[ Subscription Ladder ]</span>
            <h2 className="font-display font-black text-3xl md:text-4xl tracking-tighter mt-2">Ship more books, month after month.</h2>
          </div>
          <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Books = complete cover + spine + back + interior</div>
        </div>
        <div className="grid md:grid-cols-5 gap-3 mt-10">
          {TIERS.map((t) => (
            <div
              key={t.key}
              className={`marketing-surface p-6 relative flex flex-col ${t.highlight ? "border-[#FF6A00]/50 ring-1 ring-[#FF6A00]/30" : ""} ${t.gold ? "border-[#D4A857]/50" : ""}`}
              data-testid={`tier-${t.key}`}
            >
              {t.highlight && (
                <div className="absolute top-0 right-0 bg-[#FF6A00] text-white font-mono-spec text-[10px] tracking-widest uppercase px-2 py-1" data-testid={`tier-badge-${t.key}`}>Most Popular</div>
              )}
              {t.gold && (
                <div className="absolute top-0 right-0 bg-[#D4A857] text-black font-mono-spec text-[10px] tracking-widest uppercase px-2 py-1" data-testid={`tier-badge-${t.key}`}>Premium</div>
              )}
              <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">{t.tag}</div>
              <h3 className="font-display font-black text-2xl mt-2 tracking-tight">{t.name}</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className={`font-display font-black text-4xl ${t.highlight ? "text-[#FF6A00]" : t.gold ? "text-[#D4A857]" : ""}`}>{t.price_label}</span>
                {t.price > 0 && <span className="text-neutral-500 text-xs">/mo</span>}
              </div>
              <div className="mt-3 font-mono-spec text-[10px] tracking-widest uppercase text-neutral-400 min-h-[32px]">{t.books}</div>
              <button
                onClick={() => onChoose(t.key)}
                disabled={busy === t.key}
                className={`mt-5 w-full py-2.5 font-mono-spec text-xs tracking-widest uppercase transition-colors btn-industrial ${
                  t.highlight ? "btn-spark" : t.gold ? "bg-[#D4A857] text-black hover:brightness-110" : t.price === 0 ? "border border-neutral-700 hover:border-white" : "bg-white text-black hover:bg-neutral-200"
                }`}
                data-testid={`tier-select-${t.key}`}
              >
                {busy === t.key ? "Redirecting…" : t.cta}
              </button>
              <ul className="mt-6 space-y-2 text-xs flex-1">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-neutral-300 leading-relaxed">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 text-center">
        <span className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Upgrade or downgrade any time — new limits apply on the next billing cycle.</span>
      </div>
    </>
  );
}
