import { useEffect, useState } from "react";
import { PartyPopper, Zap, Download } from "lucide-react";

/**
 * BookReadyCelebration -- the one big moment in the whole app: every part
 * this project needs (cover, interior, or both) has just passed every
 * check for the first time. Distinct from Repair Bay's own per-run confetti
 * (a small, per-file "nice, that's fixed" moment) -- this is the "you did
 * it, the whole book is print-ready" milestone, and it only ever plays once
 * per project (see book_ready_celebrated_at).
 */
export default function BookReadyCelebration({ title = "your book", onExport, onClose }) {
  const [phase, setPhase] = useState("charging"); // charging -> live
  useEffect(() => {
    const t = setTimeout(() => setPhase("live"), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[95] bg-black/92 backdrop-blur-md flex items-center justify-center p-4" data-testid="book-ready-celebration" role="dialog" aria-modal="true">
      <style>{CSS}</style>
      <Confetti big />
      <div className="relative w-full max-w-lg text-center">
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border-2 border-[#D4AF37]/40 ${phase === "live" ? "sp-ring-pulse" : ""}`} />
          <div className={`absolute inset-3 rounded-full border-2 border-[#D4AF37]/60 ${phase === "live" ? "sp-ring-pulse" : ""}`} style={{ animationDelay: "0.3s" }} />
          <div className={`w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center ${phase === "charging" ? "sp-charge" : "sp-engine-live"}`}>
            <Zap className="w-8 h-8 text-black" fill="black" />
          </div>
        </div>

        <div className={`mt-8 ${phase === "live" ? "sp-pop" : "opacity-0"}`}>
          <div className="font-mono-spec text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] flex items-center justify-center gap-2">
            <PartyPopper className="w-3.5 h-3.5" /> Print engine at full power
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-3 leading-tight">
            {title} is ready.
          </h1>
          <p className="text-neutral-400 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
            Every check passed — cover, interior, whatever this book needed. Nothing left to fix.
            Export now: SparkPrep checks every page of your final files and, when everything is clear,
            stamps them <span className="text-[#D4AF37]">SparkPrep Certified</span>.
          </p>
        </div>

        <div className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 ${phase === "live" ? "sp-pop" : "opacity-0"}`} style={{ animationDelay: "0.15s" }}>
          {onExport && (
            <button onClick={onExport} className="w-full sm:w-auto px-6 py-3.5 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2" data-testid="celebration-export" data-next-step="Click to export">
              <Download className="w-4 h-4" /> Export Now
            </button>
          )}
          <button onClick={onClose} className="w-full sm:w-auto px-6 py-3.5 border border-neutral-700 text-neutral-300 hover:border-white hover:text-white font-mono-spec text-xs tracking-widest uppercase" data-testid="celebration-close">
            Keep Working
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti({ big }) {
  const n = big ? 70 : 40;
  const bits = Array.from({ length: n }, (_, i) => i);
  const colors = ["#10B981", "#D4AF37", "#FF6A00", "#007BFF", "#FAFAFA", "#E5C158"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[1]" aria-hidden="true">
      {bits.map((i) => (
        <span key={i} className="sp-book-confetti" style={{
          left: `${(i * 97) % 100}%`, background: colors[i % colors.length],
          animationDelay: `${(i % 14) * 0.1}s`, animationDuration: `${2.6 + (i % 6) * 0.35}s`,
          width: `${6 + (i % 4) * 2}px`, height: `${10 + (i % 3) * 5}px`,
        }} />
      ))}
    </div>
  );
}

const CSS = `
@keyframes sp-charge{0%,100%{transform:scale(0.9);opacity:.6}50%{transform:scale(1);opacity:1}}
@keyframes sp-ring-pulse{0%{transform:scale(0.85);opacity:.9}100%{transform:scale(1.6);opacity:0}}
@keyframes sp-engine-live{0%{box-shadow:0 0 0 rgba(212,175,55,0)}50%{box-shadow:0 0 40px rgba(212,175,55,.7)}100%{box-shadow:0 0 18px rgba(212,175,55,.5)}}
@keyframes sp-pop{0%{transform:scale(.9);opacity:0}60%{transform:scale(1.03);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes sp-book-fall{0%{transform:translateY(-8vh) rotate(0deg);opacity:1}100%{transform:translateY(108vh) rotate(720deg);opacity:.9}}
.sp-charge{animation:sp-charge .9s ease-in-out infinite}
.sp-ring-pulse{animation:sp-ring-pulse 1.8s ease-out infinite}
.sp-engine-live{animation:sp-engine-live 2.2s ease-in-out infinite}
.sp-pop{animation:sp-pop .5s ease-out both}
.sp-book-confetti{position:absolute;top:-6vh;border-radius:1px;animation-name:sp-book-fall;animation-timing-function:linear;animation-iteration-count:1}
@media (prefers-reduced-motion: reduce){.sp-charge,.sp-ring-pulse,.sp-engine-live,.sp-pop,.sp-book-confetti{animation:none!important}}
`;
