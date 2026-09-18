import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, FileSearch, Lock, Wrench, AlertTriangle } from "lucide-react";

// Mirrors backend ADVANCED_INTERIOR_PRICE_CENTS in server.py -- keep in sync.
const PRICE_BY_TIER = {
  free: 49.99,
  author: 39.99,
  creator_pro: 34.99,
  publisher: 29.99,
  studio: 29.99,
};
const MAX_PAGES = 300;

export default function AdvancedInteriorCheckCard({ project, user, projectId }) {
  const [status, setStatus] = useState(null); // null = loading, {paid, runs_used, max_runs, last_run, is_stale}
  const [purchasing, setPurchasing] = useState(false);
  const [running, setRunning] = useState(false);

  const tier = user?.tier || "free";
  const price = PRICE_BY_TIER[tier] ?? PRICE_BY_TIER.free;
  const hasSubscriberDiscount = tier !== "free";
  const overPageLimit = (project?.page_count || 0) > MAX_PAGES;

  const loadStatus = () =>
    api.get(`/projects/${projectId}/interior-check/status`)
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus({ paid: false }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("interior_check_session_id");
    if (sessionId) {
      api.get(`/projects/${projectId}/interior-check/verify`, { params: { session_id: sessionId } })
        .then(({ data }) => {
          setStatus(data);
          if (data.paid) toast.success("Advanced Interior Check unlocked");
        })
        .catch(() => setStatus({ paid: false }))
        .finally(() => {
          params.delete("interior_check_session_id");
          const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
          window.history.replaceState({}, "", clean);
        });
      return;
    }
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const purchase = async () => {
    setPurchasing(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/interior-check/checkout`, {
        origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (e) {
      const msg = fmtErr(e.response?.data?.detail);
      if (e.response?.status === 503) toast.info("Payments aren't configured yet — check back shortly.");
      else toast.error(msg);
      setPurchasing(false);
    }
  };

  const runCheck = async () => {
    setRunning(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/interior-check/run`);
      setStatus(data);
      const fixedCount = data.last_run?.fixed?.length || 0;
      const unresolvedCount = data.last_run?.unresolved?.length || 0;
      if (unresolvedCount === 0) toast.success("Advanced Interior Check complete — no issues remain.");
      else toast.success(`Advanced Interior Check complete — ${fixedCount ? "some issues fixed automatically, " : ""}${unresolvedCount} need your attention.`);
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
    } finally {
      setRunning(false);
    }
  };

  const runsUsed = status?.runs_used || 0;
  const maxRuns = status?.max_runs || 3;
  const runsRemaining = Math.max(0, maxRuns - runsUsed);
  const lastRun = status?.last_run;

  return (
    <section
      className="border-2 border-dashed border-[#D4A857] bg-[#FFFBF0]"
      data-testid="advanced-interior-check"
    >
      <div className="p-5 border-b-2 border-dashed border-[#D4A857]/60 flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3">
          <FileSearch className="w-5 h-5 text-[#B8933E] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-black text-lg tracking-tight">Advanced Interior Check</h3>
              <span className="font-mono-spec text-[9px] tracking-widest uppercase bg-[#D4A857] text-black px-1.5 py-0.5">
                Add-on — not part of your plan
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Full structural check of every page (up to {MAX_PAGES}), not just the standard one-page check
              included with your account. Automatically repairs what it safely can, then tells you exactly
              what's left. <strong>One-time purchase for this book only</strong> — it does not renew, and it
              is not a subscription upgrade.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {status === null ? (
          <div className="font-mono-spec text-xs text-neutral-500">Checking status…</div>
        ) : status.paid ? (
          <div data-testid="interior-check-results">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#8A6D24]">
                <ShieldCheck className="w-4 h-4" /> Unlocked for this book
              </div>
              <span className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500">
                {runsUsed} of {maxRuns} runs used
              </span>
            </div>

            {status.is_stale && (
              <div className="mt-3 flex items-start gap-2 border border-amber-500/50 bg-amber-50 px-3 py-2 text-sm text-amber-800" data-testid="interior-check-stale">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>You've uploaded a different interior file since this result. Run the check again to see results for your current file.</span>
              </div>
            )}

            {!lastRun && (
              <p className="text-sm text-neutral-600 mt-3">
                Ready when you are — this scans every page (up to {MAX_PAGES}), fixes what it safely can, and
                shows you exactly what's left.
              </p>
            )}

            {lastRun && (
              <div className="mt-3" data-testid="interior-check-last-run">
                <div className="inline-flex items-center gap-1.5 border border-[#D4A857]/50 bg-[#D4A857]/10 px-2.5 py-1" data-testid="pages-checked-proof">
                  <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#8A6D24] font-bold">
                    {lastRun.file_checked.pages_checked} of {lastRun.file_checked.total_pages} pages checked
                    {lastRun.iterations_used > 0 && ` · ${lastRun.iterations_used} repair pass${lastRun.iterations_used > 1 ? "es" : ""}`}
                  </span>
                </div>

                {lastRun.fixed?.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <Wrench className="w-3.5 h-3.5" /> Fixed automatically
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {lastRun.fixed.map((f, i) => (
                        <li key={i} className="text-xs text-neutral-600 border border-emerald-700/30 bg-emerald-50 px-2.5 py-1.5">
                          {f.action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lastRun.unresolved?.length > 0 ? (
                  <div className="mt-3">
                    <div className="text-sm font-semibold text-neutral-800">Needs your attention</div>
                    <ul className="mt-1.5 space-y-2">
                      {lastRun.unresolved.map((f, i) => (
                        <li key={i} className="text-sm border border-[#D4A857]/40 bg-white px-3 py-2">
                          <div>
                            <span className="font-mono-spec text-[9px] tracking-widest uppercase mr-2 text-neutral-500">
                              {f.severity}
                            </span>
                            {f.title}
                          </div>
                          {f.why_it_fails && <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{f.why_it_fails}</p>}
                          {f.fix_steps?.length > 0 && (
                            <ul className="text-xs text-neutral-600 mt-1 list-disc list-inside">
                              {f.fix_steps.map((step, si) => <li key={si}>{step}</li>)}
                            </ul>
                          )}
                          {f.pinpoint?.pages?.length > 0 && (
                            <p className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500 mt-1">
                              Page{f.pinpoint.pages.length > 1 ? "s" : ""}: {f.pinpoint.pages.join(", ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 mt-3">
                    No structural issues remain across all {lastRun.file_checked.total_pages} pages.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={runCheck}
              disabled={running || runsRemaining <= 0}
              className="mt-4 w-full btn-gold py-2.5 font-mono-spec text-[10px] tracking-widest uppercase btn-industrial disabled:opacity-40 flex items-center justify-center gap-2"
              data-testid="interior-check-run-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {running
                ? "Scanning and repairing…"
                : runsRemaining <= 0
                ? "No runs remaining"
                : lastRun
                ? `Run Again (${runsRemaining} left)`
                : "Run Advanced Check"}
            </button>
          </div>
        ) : (
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl tracking-tight">${price.toFixed(2)}</span>
                <span className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">one-time · this book</span>
              </div>
              {hasSubscriberDiscount && (
                <p className="text-xs text-[#8A6D24] mt-1 font-semibold">Your subscriber discount applies</p>
              )}
              <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mt-2">
                Advanced Interior Check (up to {MAX_PAGES} pages · 3 runs included)
              </p>
            </div>
            {overPageLimit ? (
              <div className="text-sm text-red-700 font-medium flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> This book has {project.page_count} pages — over the {MAX_PAGES}-page limit
              </div>
            ) : (
              <button
                onClick={purchase}
                disabled={purchasing}
                className="px-6 py-3 bg-[#D4A857] text-black font-mono-spec text-xs tracking-widest uppercase hover:brightness-105 btn-industrial disabled:opacity-50"
                data-testid="interior-check-purchase-btn"
              >
                {purchasing ? "Redirecting…" : `Unlock Advanced Check — $${price.toFixed(2)}`}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
