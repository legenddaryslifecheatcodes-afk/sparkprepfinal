import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api, fmtErr, API_URL } from "@/lib/api";
import Nav from "@/components/Nav";
import { toast } from "sonner";
import { Check, AlertTriangle, XCircle, MapPin, BookOpen, Wrench, CheckCircle2 } from "lucide-react";
import { usePricing, money, isBookModel } from "@/lib/pricing";

const sevIcon = (s) => s === "pass" ? <Check className="w-4 h-4" /> : s === "warning" ? <AlertTriangle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
const sevClass = (s) => s === "pass" ? "text-emerald-400 border-emerald-400/30 bg-emerald-500/10" : s === "warning" ? "text-amber-400 border-amber-400/30 bg-amber-500/10" : "text-red-400 border-red-400/30 bg-red-500/10";

export default function AuditReport() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState(sessionId ? "verifying" : "loading");
  const [audit, setAudit] = useState(null);
  const pricing = usePricing();

  useEffect(() => {
    (async () => {
      if (sessionId) {
        // Poll verify
        for (let i = 0; i < 20; i++) {
          try {
            const { data: v } = await api.get(`/audit/${id}/verify`, { params: { session_id: sessionId } });
            if (v.paid) break;
          } catch {}
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
      try {
        const { data } = await api.get(`/audit/${id}`);
        setAudit(data);
        setStatus(data.paid ? "paid" : "unpaid");
      } catch { setStatus("error"); }
    })();
  }, [id, sessionId]);

  if (status === "loading" || status === "verifying") {
    return (
      <div className="marketing min-h-screen">
        <Nav dark />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="animate-pulse font-mono-spec text-xs tracking-widest text-neutral-400 uppercase">
            {status === "verifying" ? "Verifying payment with Stripe…" : "Loading…"}
          </div>
        </div>
      </div>
    );
  }
  if (status === "unpaid") {
    return (
      <div className="marketing min-h-screen">
        <Nav dark />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <h1 className="font-display font-black text-4xl tracking-tighter">Payment not confirmed</h1>
          <p className="text-neutral-400 mt-4">If you just paid, wait 30 seconds and refresh. Otherwise:</p>
          <Link to={`/audit/${id}/preview`} className="mt-6 inline-block border border-white px-5 py-2.5 font-mono-spec text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors">Back to Preview</Link>
        </div>
      </div>
    );
  }

  const findings = audit?.full_report || [];
  const s = audit?.summary || {};
  const creditCta = isBookModel(pricing) && audit?.paid;
  const advanced = audit?.level === "advanced";
  const upgradeCents = pricing?.advanced_audit && pricing?.audit ? pricing.advanced_audit.price_cents - pricing.audit.price_cents : null;
  const upgrade = async () => {
    try {
      const { data } = await api.post(`/audit/${id}/checkout`, { origin_url: window.location.origin, level: "advanced" });
      window.location.href = data.checkout_url;
    } catch (e) { toast.error(fmtErr(e.response?.data?.detail) || "Checkout failed"); }
  };

  return (
    <div className="marketing min-h-screen noise-overlay">
      <Nav dark />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-mono-spec text-[10px] tracking-widest uppercase text-emerald-400" data-testid="paid-badge">
            {advanced ? "[ Paid · Advanced Audit · Every Page Checked ]" : "[ Paid · Audit Unlocked ]"}
          </span>
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl tracking-tighter" data-testid="report-title">Your print failure report.</h1>
        <p className="text-neutral-400 mt-3">
          <span className="font-mono-spec text-white">{audit?.platform_name}</span> · trim <span className="font-mono-spec text-white">{audit?.trim_label}</span> · file <span className="font-mono-spec text-white">{audit?.file_metadata?.original_filename}</span>
        </p>
        {audit?.paid && (
          <a
            href={`${API_URL}/audit/${id}/report`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border border-white px-5 py-2.5 font-mono-spec text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
            data-testid="audit-report-pdf"
          >
            Download PDF Report
          </a>
        )}

        {/* Overall banner */}
        <div className="mt-8 marketing-surface p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Overall</div>
              <div className="font-display font-black text-3xl tracking-tight mt-1">
                {s.rejection_risk === "high" ? "High risk of rejection" : s.rejection_risk === "medium" ? "Medium risk" : s.rejection_risk === "low" ? "Low risk" : "Minimal risk"}
              </div>
            </div>
            <div className="flex gap-6 font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">
              <div><div>Critical</div><div className="text-red-400 text-2xl font-display">{s.critical_failures ?? 0}</div></div>
              <div><div>Warnings</div><div className="text-amber-400 text-2xl font-display">{s.warnings ?? 0}</div></div>
            </div>
          </div>
        </div>

        {!advanced && ["interior", "combined"].includes(audit?.file_type) && (
          <p className="mt-4 text-xs text-neutral-500" data-testid="audit-page-one-note">
            For interiors, this audit checks <span className="text-neutral-300">page 1</span> of the file. The Advanced Audit checks every page (up to 300), and so does a SparkPrep book.
          </p>
        )}
        {audit?.can_upgrade && upgradeCents > 0 && (
          <div className="mt-4 border border-neutral-700 p-4 flex items-center justify-between gap-4 flex-wrap" data-testid="audit-upgrade">
            <div className="text-sm text-neutral-300">
              <span className="font-display font-bold text-white">Check every page.</span> Upgrade to the Advanced Audit — you pay only the {money(upgradeCents)} difference, and it's all credited toward your book.
            </div>
            <button onClick={upgrade} className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black font-mono-spec text-[10px] tracking-widest uppercase btn-industrial" data-testid="audit-upgrade-btn">
              Upgrade — {money(upgradeCents)}
            </button>
          </div>
        )}

        {creditCta && findings.length > 0 && (
          <div className="mt-4 border border-emerald-700/60 bg-emerald-950/30 p-5 flex items-center justify-between gap-4 flex-wrap" data-testid="audit-credit-cta">
            <div>
              <div className="font-display font-black text-xl text-white">SparkPrep can fix {findings.length === 1 ? "this issue" : "these issues"} for you right now.</div>
              <p className="text-sm text-emerald-200 mt-1">
                No need to go anywhere else.{audit?.credit_cents > 0 && <> Your {money(audit.credit_cents)} audit is credited in full toward your book — {money(pricing.book.price_cents - audit.credit_cents)} for one book, cover, interior, or both.</>}
              </p>
            </div>
            <Link to={`/pricing?audit=${id}`} className="bg-white text-black px-5 py-3 font-mono-spec text-xs tracking-widest uppercase hover:bg-neutral-200 btn-industrial" data-testid="audit-credit-btn">
              Use My Credit
            </Link>
          </div>
        )}

        {/* Detailed findings */}
        <div className="mt-8 space-y-3" data-testid="findings-list">
          {findings.map((f, i) => (
            <div key={i} className="marketing-surface p-6" data-testid={`finding-${i}`}>
              <div className="flex items-start gap-3">
                <div className={`px-2 py-0.5 border font-mono-spec text-[10px] tracking-widest uppercase inline-flex items-center gap-1 ${sevClass(f.severity)}`}>
                  {sevIcon(f.severity)} {f.severity}
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-xl tracking-tight text-white">{f.title}</div>
                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed">{f.why_it_fails}</p>
                </div>
              </div>

              {/* Publisher rule */}
              <div className="mt-5 pl-3 border-l-2 border-neutral-700">
                <div className="flex items-center gap-2 font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">
                  <BookOpen className="w-3 h-3" /> Publisher Rule
                </div>
                <p className="text-sm text-neutral-200 mt-1 font-mono-spec">{f.publisher_rule}</p>
              </div>

              {/* Pinpoint */}
              {f.pinpoint && (
                <div className="mt-4 pl-3 border-l-2 border-neutral-700">
                  <div className="flex items-center gap-2 font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">
                    <MapPin className="w-3 h-3" /> Where in your file
                  </div>
                  <div className="text-sm text-neutral-200 mt-1 font-mono-spec">
                    Region: <span className="text-white">{f.pinpoint.region}</span>
                    {f.pinpoint.actual_dpi != null && <> · Actual DPI: <span className="text-red-300">{f.pinpoint.actual_dpi}</span> / Required: <span className="text-white">{f.pinpoint.required_dpi || 300}</span></>}
                    {f.pinpoint.actual_pixels && <> · Actual: <span className="text-red-300">{f.pinpoint.actual_pixels[0]}×{f.pinpoint.actual_pixels[1]}px</span></>}
                    {f.pinpoint.required_pixels && <> · Required: <span className="text-white">{f.pinpoint.required_pixels[0]}×{f.pinpoint.required_pixels[1]}px</span></>}
                    {f.pinpoint.actual_inches && <> · Actual: <span className="text-red-300">{f.pinpoint.actual_inches[0]}×{f.pinpoint.actual_inches[1]}"</span></>}
                    {f.pinpoint.expected_inches && <> · Expected: <span className="text-white">{f.pinpoint.expected_inches[0]}×{f.pinpoint.expected_inches[1]}"</span></>}
                    {f.pinpoint.actual && f.pinpoint.required && <> · <span className="text-red-300">{f.pinpoint.actual}</span> → <span className="text-white">{f.pinpoint.required}</span></>}
                  </div>
                </div>
              )}

              {/* The audit detects; SparkPrep's book fixes. No repair tutorial here (owner's rule). */}
              {f.one_click_fix && (
                <div className="mt-5 pt-4 border-t border-neutral-800 font-mono-spec text-[10px] tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" /> SparkPrep fixes this for you automatically
                </div>
              )}
            </div>
          ))}
          {findings.length === 0 && (
            <div className="marketing-surface p-8 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
              <p className="font-display font-bold text-2xl mt-4 text-white">Your file passes every check.</p>
              <p className="text-neutral-400 text-sm mt-2">Ready for submission. Thank you for using SparkPrep!</p>
            </div>
          )}
        </div>

        {/* Upsell to the product: the audit only finds problems; the book fixes them */}
        {findings.length > 0 && (
          <div className="mt-10 marketing-surface p-6 text-center">
            <span className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">[ Want us to fix it? ]</span>
            <h3 className="font-display font-black text-2xl md:text-3xl tracking-tighter mt-3">Skip the manual work.</h3>
            <p className="text-neutral-400 mt-3 max-w-xl mx-auto text-sm">SparkPrep can fix every issue above for you right now — no need to go anywhere else. With a SparkPrep book, Repair Bay fixes your files and exports them print-ready (CMYK, 300 DPI, flattened, PDF/X-1a).</p>
            <Link to={creditCta ? `/pricing?audit=${id}` : "/register"} className="mt-6 inline-block bg-white text-black px-6 py-3 font-mono-spec text-xs tracking-widest uppercase hover:bg-neutral-200 btn-industrial" data-testid="upsell-signup">
              {creditCta ? "Fix It With SparkPrep" : "Start Free Account"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
