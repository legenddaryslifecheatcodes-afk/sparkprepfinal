import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import Nav from "@/components/Nav";
import { Check, Sparkles } from "lucide-react";
import { usePricing, money, isBookModel, specialNote, savePercent } from "@/lib/pricing";

// Owner's rule: one defined audit, no free preview. Before paying, the customer sees only the honest total --
// never which issues, their severity, or a rejection risk. The server enforces this too (audit_get).
export default function AuditPreview() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const nav = useNavigate();
  const pricing = usePricing();

  useEffect(() => {
    api.get(`/audit/${id}`).then(({ data }) => {
      if (data.paid) nav(`/audit/${id}/report`, { replace: true });
      else setAudit(data);
    }).catch(() => nav("/audit"));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const unlock = async (level = "standard") => {
    setCheckingOut(level);
    try {
      const { data } = await api.post(`/audit/${id}/checkout`, { origin_url: window.location.origin, level });
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail) || "Checkout failed");
      setCheckingOut(false);
    }
  };

  if (!audit) return <div className="marketing min-h-screen"><Nav dark /><div className="p-10 font-mono-spec text-xs text-neutral-500">Loading…</div></div>;
  const total = audit.summary?.total_issues ?? 0;
  const isInterior = audit.file_type === "interior";
  const price = pricing ? money(pricing.audit.price_cents) : "";

  return (
    <div className="marketing min-h-screen noise-overlay">
      <Nav dark />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">[ Audit {id.slice(0, 8)} ]</span>
        <p className="text-neutral-400 mt-3">
          Checked against <span className="font-mono-spec text-white">{audit.platform_name}</span> · trim <span className="font-mono-spec text-white">{audit.trim_label}</span> · file <span className="font-mono-spec text-white">{audit.file_metadata?.original_filename}</span>
        </p>

        {total > 0 ? (
          <div className="mt-8 marketing-surface p-8 border-white/30" data-testid="unlock-cta">
            <h1 className="font-display font-black text-3xl md:text-4xl tracking-tighter" data-testid="preview-title">
              SparkPrep found {total} issue{total === 1 ? "" : "s"} that may stop this file from being accepted.
            </h1>
            <ul className="mt-6 space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /> Exactly where each problem is</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /> What failed and why it gets rejected</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /> The publisher requirement it breaks</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /> A downloadable PDF of your audit</li>
            </ul>
            <button
              onClick={() => unlock("standard")}
              disabled={!!checkingOut}
              className="mt-7 w-full bg-white text-black px-6 py-4 font-mono-spec text-xs tracking-widest uppercase hover:bg-neutral-200 disabled:opacity-50 btn-industrial"
              data-testid="unlock-btn"
              data-next-step="See what to fix"
            >
              {checkingOut === "standard" ? "Redirecting…" : `See My Results${price ? ` — ${price}` : ""}${isInterior ? " · page 1" : ""}`}
            </button>
            {specialNote(pricing, "audit") && (
              <div className="mt-2 text-center text-xs text-emerald-300" data-testid="audit-special-note">
                {specialNote(pricing, "audit")}{savePercent(pricing, "audit") ? ` — save ${savePercent(pricing, "audit")}%` : ""}
              </div>
            )}
            {isInterior && pricing?.advanced_audit && (
              <div className="mt-5 border border-neutral-700 p-4" data-testid="advanced-audit-offer">
                <div className="font-display font-bold text-white">Advanced Audit — every page</div>
                <p className="text-sm text-neutral-400 mt-1">The same audit on every page of your interior (up to {pricing.advanced_audit.max_pages}), not just page 1.</p>
                <button
                  onClick={() => unlock("advanced")}
                  disabled={!!checkingOut}
                  className="mt-3 w-full border border-white text-white px-6 py-3 font-mono-spec text-xs tracking-widest uppercase hover:bg-white hover:text-black disabled:opacity-50 btn-industrial"
                  data-testid="unlock-advanced-btn"
                >
                  {checkingOut === "advanced" ? "Redirecting…" : `Advanced Audit — ${money(pricing.advanced_audit.price_cents)}`}
                </button>
                {specialNote(pricing, "advanced_audit") && (
                  <div className="mt-2 text-center text-xs text-emerald-300">
                    {specialNote(pricing, "advanced_audit")}{savePercent(pricing, "advanced_audit") ? ` — save ${savePercent(pricing, "advanced_audit")}%` : ""}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 text-center text-xs text-neutral-400">
              {isBookModel(pricing) && "Whatever you pay is credited in full toward your SparkPrep book. "}Secure via Stripe · No account needed.
            </div>
            <p className="mt-6 text-sm text-neutral-400">Then let SparkPrep fix it for you — no need to go anywhere else.</p>
          </div>
        ) : (
          <div className="mt-8 marketing-surface p-8 text-center" data-testid="audit-clean">
            <Check className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="font-display font-bold text-2xl mt-4 text-white">
              {isInterior ? "No issues found on page 1 of your interior." : "No issues found."}
            </p>
            <p className="text-neutral-400 text-sm mt-2">Your file passed SparkPrep's checks. Thank you for trying SparkPrep!</p>
          </div>
        )}

        {isInterior && (
          <p className="mt-6 text-xs text-neutral-500 leading-relaxed" data-testid="audit-page-one-note">
            For interiors, the standard audit checks <span className="text-neutral-300">page 1</span> of your file. The Advanced Audit checks every page (up to 300), and so does a SparkPrep book.
          </p>
        )}
      </div>
    </div>
  );
}
