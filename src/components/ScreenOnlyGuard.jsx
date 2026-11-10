import { useEffect, useState } from "react";

// Free Holiday Audit results are for the screen only (Trey, 2026-11-10). A web page can't truly stop a
// screenshot (a phone camera or OS tool always works), so this makes copying hard instead: no text
// selection, no right-click, no copy, printing shows a notice instead of the report, the report blurs
// when the window loses focus (most snipping tools take focus first), Print Screen blurs it too, and the
// author's email is watermarked across it so a shared screenshot points back to them.
export default function ScreenOnlyGuard({ active, email, children }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active) return undefined;
    const hide = () => setHidden(true);
    const show = () => setHidden(false);
    const onKey = (e) => {
      const k = (e.key || "").toLowerCase();
      if (k === "printscreen") {
        hide();
        try { navigator.clipboard?.writeText(""); } catch { /* not allowed: fine */ }
        setTimeout(show, 1500);
      }
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "c", "a"].includes(k)) e.preventDefault();
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k)) hide();   // Mac screenshot keys
    };
    const stop = (e) => e.preventDefault();
    const onVis = () => (document.hidden ? hide() : show());
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    document.addEventListener("copy", stop);
    document.addEventListener("contextmenu", stop);
    return () => {
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      document.removeEventListener("copy", stop);
      document.removeEventListener("contextmenu", stop);
    };
  }, [active]);

  if (!active) return children;
  const mark = email || "SparkPrep free audit";
  return (
    <div className="relative screen-only-guard" style={{ userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }} data-testid="screen-only-guard">
      <style>{`@media print { .screen-only-guard { display: none !important; } .screen-only-print-note { display: block !important; } }`}</style>
      <div className="screen-only-print-note hidden p-10 text-black">Your free SparkPrep audit is shown on screen only. A printable PDF report comes with a paid audit or a SparkPrep book.</div>
      <div style={{ filter: hidden ? "blur(14px)" : "none", transition: "filter 0.1s" }}>{children}</div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none" style={{ zIndex: 5 }}>
        <div className="absolute -inset-1/2 flex flex-wrap content-start gap-x-24 gap-y-20 rotate-[-24deg] opacity-[0.07] text-white font-mono-spec text-sm whitespace-nowrap">
          {Array.from({ length: 160 }).map((_, i) => <span key={i}>{mark} · SparkPrep</span>)}
        </div>
      </div>
      {hidden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-center px-6" data-testid="screen-only-hidden">
          <p className="font-display font-bold text-xl text-white max-w-md">Your results are hidden while this window isn't active. Click back here to see them.</p>
        </div>
      )}
    </div>
  );
}
