import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Check, ArrowRight, Loader2 } from "lucide-react";

/**
 * The Editor's guide for first-time users (owner, 2026-09-30): five steps across the top, the CURRENT step
 * glows, done steps get a check, and under them ONE line says what to do now with ONE glowing button that does
 * it. The same fix buttons also sit right next to each problem (owner, 2026-10-26), and the floating next-step
 * pointer (NextStepPointer.jsx) points at whichever one is next.
 *
 * steps:   [{ key, label, done }]
 * current: key of the step to do now (the first one not done)
 * now:     { title, detail, action: { label, onClick, busy, busyLabel } | null, secondary: { label, onClick } | null }
 */
export default function StepGuide({ steps, current, now, rescan }) {
  // After every action, a pop-up says where to go next -- with the next button right inside it (owner: "something
  // should pop up to tell the user where to go"). Not on first load (the guide itself is on screen then).
  const lastKey = useRef(null);
  const nowKey = `${current}|${now?.title || ""}`;
  useEffect(() => {
    if (lastKey.current === null) { lastKey.current = nowKey; return; }
    if (nowKey === lastKey.current || !now) return;
    lastKey.current = nowKey;
    toast(`Next: ${now.title}`, {
      description: now.detail,
      duration: 12000,
      action: now.action && !now.action.busy ? { label: now.action.label, onClick: now.action.onClick } : undefined,
    });
  }, [nowKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="border border-neutral-800 bg-[#0D0D0D] p-4 mb-4" data-testid="step-guide">
      <style>{CSS}</style>
      <div className="flex items-start justify-between gap-3 flex-wrap">
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap" aria-label="Steps">
        {steps.map((s, i) => {
          const isNow = s.key === current;
          return (
            <li key={s.key} className="flex items-center gap-1.5 sm:gap-2" data-testid={`step-${s.key}`} data-state={s.done ? "done" : isNow ? "now" : "later"}>
              <span
                className={`flex items-center gap-2 px-2.5 py-1.5 border font-mono-spec text-[10px] tracking-widest uppercase ${
                  s.done ? "border-emerald-700 text-emerald-300 bg-emerald-950/30"
                  : isNow ? "border-[#D4AF37] text-black bg-[#D4AF37] sp-step-glow"
                  : "border-neutral-800 text-neutral-600"}`}
                aria-current={isNow ? "step" : undefined}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  s.done ? "bg-emerald-500 text-black" : isNow ? "bg-black text-[#D4AF37]" : "bg-neutral-800 text-neutral-500"}`}>
                  {s.done ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {s.label}
              </span>
              {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-neutral-700 hidden sm:block" />}
            </li>
          );
        })}
      </ol>
      {rescan && (
        <button onClick={rescan.onClick} disabled={rescan.busy}
          className="px-3 py-1.5 border border-neutral-600 text-neutral-200 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase disabled:opacity-50 flex items-center gap-1.5"
          data-testid="rescan-book">
          {rescan.busy && <Loader2 className="w-3 h-3 animate-spin" />}{rescan.busy ? "Scanning…" : "Re-scan my book"}
        </button>
      )}
      </div>

      {now && (
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap" data-testid="step-now">
          <div className="min-w-0 flex-1">
            <div className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">What to do now</div>
            <div className="font-display font-bold text-lg text-white mt-0.5 leading-tight">{now.title}</div>
            {now.detail && <div className="text-xs text-neutral-400 mt-1 leading-relaxed max-w-2xl">{now.detail}</div>}
          </div>
          <div className="flex flex-col items-stretch gap-1.5 shrink-0">
            {now.action && (
              <button
                onClick={now.action.onClick}
                disabled={!!now.action.busy || now.action.disabled}
                className="px-6 py-3 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-60 sp-step-glow"
                data-testid="step-action"
                data-next-step={NEXT_STEP_HEAD[current] || "Click here next"}
                data-next-step-priority="1"
              >
                {now.action.busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {now.action.busy ? (now.action.busyLabel || "Working…") : now.action.label}
              </button>
            )}
            {now.secondary && (
              <button onClick={now.secondary.onClick} className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-2" data-testid="step-secondary">
                {now.secondary.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Headline for the floating next-step pointer (NextStepPointer.jsx) when it points at the guide's button.
const NEXT_STEP_HEAD = { details: "Click to start", upload: "Click to upload", fix: "Click to fix", final: "Click to check", export: "Click to export" };

// The section the current step is about gets the same glow (see Editor: glowIf).
export const STEP_GLOW_CLASS = "sp-section-glow";

const CSS = `
@keyframes sp-step-glow{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.0),0 0 10px rgba(212,175,55,.35)}50%{box-shadow:0 0 0 3px rgba(212,175,55,.25),0 0 22px rgba(212,175,55,.6)}}
.sp-step-glow{animation:sp-step-glow 1.8s ease-in-out infinite}
@keyframes sp-section-glow{0%,100%{box-shadow:inset 0 0 0 1px rgba(212,175,55,.45)}50%{box-shadow:inset 0 0 0 2px rgba(212,175,55,.9)}}
.sp-section-glow{animation:sp-section-glow 1.8s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.sp-step-glow,.sp-section-glow{animation:none!important;box-shadow:0 0 0 2px rgba(212,175,55,.7)}}
`;
