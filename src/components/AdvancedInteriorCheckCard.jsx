import { useEffect, useState } from "react";
import { api, fmtErr } from "@/lib/api";
import { usePricing, isBookModel } from "@/lib/pricing";
import { toast } from "sonner";
import { ShieldCheck, FileSearch, Lock, Loader2, Wrench, AlertTriangle, RotateCcw } from "lucide-react";

// Mirrors backend ADVANCED_INTERIOR_PRICE_CENTS in server.py -- keep in sync.
const PRICE_BY_TIER = {
  free: 49.99,
  author: 39.99,
  creator_pro: 34.99,
  publisher: 29.99,
  studio: 29.99,
};
const MAX_PAGES = 300;

function pagesOf(f) {
  const p = f.pinpoint || {};
  const list = p.pages || p.pages_affected;
  if (Array.isArray(list) && list.length) return list;
  return null;
}

export default function AdvancedInteriorCheckCard({ project, user, projectId, onProjectChange, refreshKey }) {
  const [status, setStatus] = useState(null); // null = loading; server shape: {paid, runs_used, max_runs, last_run, is_stale}
  const [purchasing, setPurchasing] = useState(false);
  const [running, setRunning] = useState(false);
  const bookModel = isBookModel(usePricing());

  const tier = user?.tier || "free";
  const price = PRICE_BY_TIER[tier] ?? PRICE_BY_TIER.free;
  const hasSubscriberDiscount = tier !== "free";
  const overPageLimit = (project?.page_count || 0) > MAX_PAGES;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("interior_check_session_id");
    if (sessionId) {
      api.get(`/projects/${projectId}/interior-check/verify`, { params: { session_id: sessionId } })
        .then(({ data }) => {
          setStatus(data);
          if (data.paid) toast.success("Advanced Interior Check unlocked — press Run to check every page.");
        })
        .catch(() => setStatus({ paid: false }))
        .finally(() => {
          params.delete("interior_check_session_id");
          const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
          window.history.replaceState({}, "", clean);
        });
      return;
    }
    api.get(`/projects/${projectId}/interior-check/status`)
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus({ paid: false }));
  }, [projectId, refreshKey]);

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
      const lr = data.last_run;
      if (lr?.status === "clean") toast.success(`Checked ${lr.file_checked?.pages_checked ?? "all"} pages — no issues remain.`);
      else toast.warning(`Check complete — ${lr?.unresolved?.length || 0} issue${lr?.unresolved?.length === 1 ? " needs" : "s need"} your attention.`);
      // A run can replace the stored interior with SparkPrep's repaired file,
      // so the rest of the editor must reload to show the file actually on record.
      if (onProjectChange) await onProjectChange();
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail) || "The check couldn't be completed. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const runsUsed = status?.runs_used ?? 0;
  const maxRuns = status?.max_runs ?? 3;
  const runsLeft = Math.max(0, maxRuns - runsUsed);
  const lastRun = status?.last_run || null;

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
                {bookModel || status?.included_with_book ? "Included with your book" : "Add-on — not part of your plan"}
              </span>
            </div>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Full structural check of every page (up to {MAX_PAGES}), not just the standard one-page check
              included with your account. SparkPrep fixes what it safely can, then tells you exactly which pages
              still need your attention.{" "}
              {bookModel
                ? <strong>Included with every book — {maxRuns} runs.</strong>
                : <><strong>One-time purchase for this book only</strong> — {maxRuns} runs included.</>}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {status === null ? (
          <div className="font-mono-spec text-xs text-neutral-500">Checking status…</div>
        ) : status.paid ? (
          <div data-testid="interior-check-results">
            {running ? (
              <div className="flex items-start gap-3" data-testid="interior-check-running">
                <Loader2 className="w-5 h-5 animate-spin text-[#8A6D24] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[#8A6D24]">Checking every page of your interior…</div>
                  <p className="text-xs text-neutral-600 mt-1">
                    Long books can take a few minutes. Keep this tab open — your results will appear here.
                  </p>
                </div>
              </div>
            ) : !lastRun ? (
              <div className="flex items-end justify-between flex-wrap gap-4" data-testid="interior-check-ready">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#8A6D24]">
                    <ShieldCheck className="w-4 h-4" /> Unlocked — ready to run
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                    Nothing has been checked yet. Press Run to check your interior page by page.
                  </p>
                  <p className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mt-2">
                    {runsLeft} of {maxRuns} runs left
                  </p>
                </div>
                <button
                  onClick={runCheck}
                  disabled={runsLeft === 0}
                  className="px-6 py-3 bg-[#D4A857] text-black font-mono-spec text-xs tracking-widest uppercase hover:brightness-105 btn-industrial disabled:opacity-50"
                  data-testid="interior-check-run-btn"
                >
                  Run Advanced Check
                </button>
              </div>
            ) : (
              <RunResults lastRun={lastRun} isStale={status.is_stale} runsLeft={runsLeft} maxRuns={maxRuns} onRun={runCheck} />
            )}
          </div>
        ) : bookModel ? (
          <div className="flex items-start gap-2 text-sm text-neutral-700" data-testid="interior-check-needs-book">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#8A6D24]" />
            <span>Start this book (top of the page) to run the full check — it's included, no extra charge.</span>
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
                Advanced Interior Check (up to {MAX_PAGES} pages)
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

function RunResults({ lastRun, isStale, runsLeft, maxRuns, onRun }) {
  const fc = lastRun.file_checked || {};
  const clean = lastRun.status === "clean";
  const unresolved = lastRun.unresolved || [];
  const fixedActions = [...new Set((lastRun.fixed || []).map((f) => f.action).filter(Boolean))];

  return (
    <div>
      {isStale && (
        <div className="mb-3 border border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-start gap-2" data-testid="interior-check-stale">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Your interior file has changed since this check ran. These results are for the previous file — run the check again to check the current one.
        </div>
      )}

      <div className={`flex items-center gap-2 text-sm font-semibold ${clean ? "text-emerald-700" : "text-[#8A6D24]"}`}>
        {clean ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        {clean
          ? "Check complete — no issues remain"
          : `Check complete — ${unresolved.length} issue${unresolved.length === 1 ? " needs" : "s need"} your attention`}
      </div>

      {fc.total_pages > 0 && (
        <div className="mt-1.5 inline-flex items-center gap-1.5 border border-[#D4A857]/50 bg-[#D4A857]/10 px-2.5 py-1" data-testid="pages-checked-proof">
          <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#8A6D24] font-bold">
            {fc.pages_checked} of {fc.total_pages} pages checked · run {lastRun.run_number} of {maxRuns}
          </span>
        </div>
      )}

      {fixedActions.length > 0 && (
        <div className="mt-3" data-testid="interior-check-fixed">
          <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Fixed automatically</div>
          <ul className="mt-1 space-y-1">
            {fixedActions.map((a, i) => (
              <li key={i} className="text-sm text-emerald-800 flex items-start gap-1.5">
                <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {unresolved.length > 0 && (
        <div className="mt-3">
          <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Needs your attention</div>
          <ul className="mt-1 space-y-2" data-testid="interior-check-unresolved">
            {unresolved.map((f, i) => {
              const pages = pagesOf(f);
              return (
                <li key={i} className="text-sm border border-[#D4A857]/40 bg-white px-3 py-2">
                  <div>
                    <span className={`font-mono-spec text-[9px] tracking-widest uppercase mr-2 ${f.severity === "fail" ? "text-red-700" : "text-amber-700"}`}>
                      {f.severity}
                    </span>
                    {f.title}
                  </div>
                  {f.why_it_fails && <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{f.why_it_fails}</p>}
                  {pages && (
                    <p className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500 mt-1">
                      Page{pages.length > 1 ? "s" : ""}: {pages.join(", ")}
                    </p>
                  )}
                  {f.fix_steps?.length > 0 && (
                    <ol className="list-decimal pl-5 mt-1.5 text-xs text-neutral-700 space-y-0.5">
                      {f.fix_steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <span className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">
          {runsLeft} of {maxRuns} runs left
        </span>
        {runsLeft > 0 && (
          <button
            onClick={onRun}
            className="px-4 py-2 border border-[#D4A857] text-[#8A6D24] font-mono-spec text-[10px] tracking-widest uppercase hover:bg-[#D4A857]/10 btn-industrial flex items-center gap-1.5"
            data-testid="interior-check-rerun-btn"
          >
            <RotateCcw className="w-3 h-3" /> Run again
          </button>
        )}
      </div>
    </div>
  );
}
