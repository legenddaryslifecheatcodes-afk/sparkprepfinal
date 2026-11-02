import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import { usePricing, money, isBookModel, specialNote, savePercent } from "@/lib/pricing";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Nav from "@/components/Nav";
import SeasonBanner from "@/components/SeasonBanner";
import BrandWatermark from "@/components/BrandWatermark";
import { Check, Flame, BookOpen, CalendarClock } from "lucide-react";

export default function Pricing() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(null);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const auditId = params.get("audit");
  const pricing = usePricing();
  const bookModel = isBookModel(pricing);
  // The credit is whatever was actually paid for that audit (standard, Advanced, or both), so ask the server.
  const [auditCredit, setAuditCredit] = useState(null);
  useEffect(() => {
    if (!auditId) return;
    api.get(`/audit/${auditId}`).then(({ data }) => setAuditCredit(data.credit_cents || 0)).catch(() => setAuditCredit(0));
  }, [auditId]);

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
              <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter mt-3">One price per book.<br />Cover, inside pages, or both.</h1>
              <p className="text-neutral-400 mt-4 max-w-xl">No confusing plans. Every book includes a full check of every page, automatic fixes that are checked a second time, and {pricing.book.window_days} days of unlimited downloads.</p>
            </>
          ) : (
            <>
              <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter mt-3">Pay per title,<br />not per fix.</h1>
              <p className="text-neutral-400 mt-4 max-w-xl">Every plan includes print-color conversion, picture sharpness checks, a spine calculator, print-ready PDF files and printer templates. Cancel any time.</p>
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
              ? <BookModel pricing={pricing} busy={busy} onBuy={bookCheckout} auditId={auditId} auditCredit={auditCredit} user={user} nav={nav} />
              : <PricesUpdating />}
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
            Pay once. Upload a cover or inside pages and see every problem: what failed, exactly where, and which printer rule it breaks.
            {pricing.advanced_audit ? " Covers are checked in full; inside pages on page 1." : ""}
            {bookModel && <> <span className="text-white">Whatever you pay is credited toward your book</span> if you fix it with SparkPrep.</>}
          </p>
          {specialNote(pricing, "audit") && (
            <p className="mt-2 text-sm text-emerald-300" data-testid="pricing-audit-special">
              {specialNote(pricing, "audit")}{savePercent(pricing, "audit") ? ` — save ${savePercent(pricing, "audit")}%` : ""}
            </p>
          )}
          {pricing.advanced_audit && (
            <p className="mt-3 text-sm text-neutral-300" data-testid="pricing-advanced-audit">
              <span className="text-white font-semibold">Advanced Audit — {money(pricing.advanced_audit.price_cents)}:</span> the same audit on every page of your interior (up to {pricing.advanced_audit.max_pages}).
              {specialNote(pricing, "advanced_audit") && <span className="text-emerald-300"> {specialNote(pricing, "advanced_audit")}{savePercent(pricing, "advanced_audit") ? ` — save ${savePercent(pricing, "advanced_audit")}%` : ""}.</span>}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2 font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">
            <span className="border border-neutral-700 px-2 py-1">✓ No account</span>
            <span className="border border-neutral-700 px-2 py-1">✓ No subscription</span>
            <span className="border border-neutral-700 px-2 py-1">✓ Printer rule shown</span>
            <span className="border border-neutral-700 px-2 py-1">✓ Exact location</span>
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

function BookModel({ pricing, busy, onBuy, auditId, auditCredit, user, nav }) {
  const book = pricing.book;
  const credit = auditId ? (auditCredit || 0) : 0;
  const plans = pricing.plans || [];
  const membership = pricing.membership || null;   // $9.99/month: every book at the member price
  const main = membership ? null : plans.find((p) => p.id === "book_1");
  const later = plans.filter((p) => !p.available);
  // Is this visitor already a member? Then their book price is the member price.
  const [isMember, setIsMember] = useState(false);
  useEffect(() => {
    if (!user || !membership) return;
    api.get("/me/books").then(({ data }) => setIsMember(!!data.is_member)).catch(() => {});
  }, [user, membership]);
  const bookPrice = isMember && membership ? membership.book_price_cents : book.price_cents;

  return (
    <div className="mt-16" data-testid="book-pricing">
      {auditId && (
        <div className="mb-6 border border-emerald-700/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200" data-testid="audit-credit-banner">
          Your audit credit of {money(credit)} will be taken off at checkout.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="marketing-surface p-8 flex flex-col" data-testid="plan-book-pass">
          <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {isMember ? "Your member price" : "One book · no membership needed"}</div>
          <h3 className="font-display font-black text-3xl mt-2 tracking-tight">One Book</h3>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-display font-black text-5xl">{money(bookPrice)}</span>
            <span className="text-neutral-500 text-xs">per book</span>
          </div>
          {membership && !isMember && <div className="text-xs text-neutral-400 mt-1" data-testid="member-price-note">Members pay {money(membership.book_price_cents)}</div>}
          {credit > 0 && <div className="text-xs text-emerald-300 mt-1">You pay {money(bookPrice - credit)} with your audit credit</div>}
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
            {busy === "book" ? "Redirecting…" : `Buy One Book — ${money(bookPrice - credit)}`}
          </button>
        </div>

        {membership && (
          <div className="marketing-surface p-8 flex flex-col border-[#FF6A00]/50 ring-1 ring-[#FF6A00]/30 relative" data-testid="plan-membership">
            <div className="absolute top-0 right-0 bg-[#FF6A00] text-white font-mono-spec text-[10px] tracking-widest uppercase px-2 py-1">Best value</div>
            <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> For more than one book</div>
            <h3 className="font-display font-black text-3xl mt-2 tracking-tight">SparkPrep Membership</h3>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="font-display font-black text-5xl text-[#FF6A00]">{money(membership.price_cents)}</span>
              <span className="text-neutral-500 text-xs">/month</span>
            </div>
            <p className="text-sm text-neutral-300 mt-3">
              Members pay <span className="text-white font-semibold">{money(membership.book_price_cents)}</span> per book instead of {money(book.price_cents)}.
              That saves {money(membership.saves_per_book_cents)} on every book, so the membership pays for itself with your first book.
            </p>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              <li className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> Every book {money(membership.book_price_cents)}: cover, inside pages, or both, same price</li>
              {book.includes.slice(1).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> {f}</li>
              ))}
              <li className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> The membership doesn't include a book. You buy each book when you need it.</li>
              <li className="flex items-start gap-1.5 text-neutral-300"><Check className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" /> Cancel any time. Books you already bought stay yours.</li>
            </ul>
            {isMember ? (
              <div className="mt-8 w-full py-3 text-center border border-emerald-700 text-emerald-300 font-mono-spec text-xs tracking-widest uppercase" data-testid="membership-active">You're a member</div>
            ) : (
              <button
                onClick={() => onBuy(membership.plan)}
                disabled={busy === membership.plan}
                className="mt-8 w-full py-3 btn-spark font-mono-spec text-xs tracking-widest uppercase btn-industrial disabled:opacity-50"
                data-testid="subscribe-membership"
              >
                {busy === membership.plan ? "Redirecting…" : `Become A Member — ${money(membership.price_cents)}/mo`}
              </button>
            )}
            {credit > 0 && !isMember && <div className="text-xs text-neutral-400 mt-2">Your audit credit is saved for your book.</div>}
          </div>
        )}

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
                <div className="font-display font-black text-xl mt-1">{p.name}</div>
              </div>
              <span className="font-mono-spec text-[10px] tracking-widest uppercase border border-neutral-700 px-2 py-1 text-neutral-400">Coming soon</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 marketing-surface p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-display font-black text-xl">Just looking?</div>
          <p className="text-sm text-neutral-400 mt-1">
            Free account: upload your book and SparkPrep runs a real scan of it. See exactly what it found for {money(pricing.audit.price_cents)} (credited toward your book).
            Get a book when you want SparkPrep to fix everything and hand you print-ready files.
          </p>
        </div>
        <button onClick={() => nav(user ? "/dashboard" : "/register")} className="px-5 py-2.5 border border-neutral-700 hover:border-white font-mono-spec text-xs tracking-widest uppercase btn-industrial" data-testid="start-free">
          Start Free
        </button>
      </div>
    </div>
  );
}

// Shown only if the server ever stops sending the one-price-per-book model.
// The old monthly plan ladder ($19.99-$199.99) was removed so it can never show by mistake.
function PricesUpdating() {
  return (
    <div className="mt-16 marketing-surface p-8 text-neutral-300" data-testid="pricing-updating">
      Our book prices are being updated. Run an audit above, or check back in a few minutes.
    </div>
  );
}
