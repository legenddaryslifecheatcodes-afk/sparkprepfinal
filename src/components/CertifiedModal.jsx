import { useEffect, useState } from "react";
import { AlertTriangle, Check, Download } from "lucide-react";

/**
 * Shown after an export. The seal is earned at export, not before: SparkPrep re-checks the FINAL files
 * (every interior page, up to 300) and only when everything is clear is the book "SparkPrep Certified".
 * Otherwise it says plainly what's still open -- the report in the download has the steps to fix each one.
 */
export default function CertifiedModal({ result, title = "Your book", onClose, onDownload, onDownloadFile }) {
  const files = result?.files || [];
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try { await onDownload?.(); } finally { setDownloading(false); }
  };
  const [live, setLive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLive(true), 250); return () => clearTimeout(t); }, []);
  const certified = !!result?.certified;

  return (
    <div className="fixed inset-0 z-[96] bg-black/92 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid="certified-modal">
      <style>{CSS}</style>
      <div className="relative w-full max-w-lg text-center">
        {certified ? (
          <>
            <div className={`sp-seal mx-auto ${live ? "sp-seal-in" : "opacity-0"}`} data-testid="certified-seal">
              <div className="sp-seal-inner">
                <div className="font-display font-black text-sm tracking-[0.25em] text-black/80">SPARKPREP</div>
                <div className="font-display font-black text-3xl text-[#8a6a17] leading-none mt-1">CERTIFIED</div>
                <div className="font-mono-spec text-[8px] tracking-[0.3em] text-black/70 mt-2">PUBLISHER PREFLIGHT</div>
              </div>
            </div>
            <h1 className="font-display font-black text-3xl text-white mt-7 leading-tight">{title} is SparkPrep Certified.</h1>
            <p className="text-neutral-400 mt-3 text-sm max-w-sm mx-auto leading-relaxed">
              SparkPrep checked your final files — every page — and everything is clear. Your files include
              <span className="text-white"> The SparkPrep Certified Complete Publisher Preflight Report</span>.
            </p>
            {result.certificate_id && (
              <div className="mt-3 font-mono-spec text-[11px] tracking-widest text-[#D4AF37]" data-testid="certificate-id">
                Certificate {result.certificate_id}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-amber-400/70 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="font-display font-black text-2xl text-white mt-6 leading-tight">{files.length ? "Your files are ready" : "Your files are downloaded"} — a few things are still open.</h1>
            <ul className="mt-4 text-left text-sm text-amber-200 space-y-1.5 max-w-md mx-auto" data-testid="still-open">
              {(result?.still_open || []).map((t) => <li key={t}>• {t}</li>)}
            </ul>
            <p className="text-neutral-400 mt-4 text-sm max-w-md mx-auto leading-relaxed">
              Your SparkPrep Preflight Report (below) shows how to fix each one, step by step.
              Fix them, export again, and your book earns <span className="text-[#D4AF37]">SparkPrep Certified</span>.
            </p>
          </>
        )}
        {files.length > 0 ? (
          <FileList files={files} onDownloadFile={onDownloadFile} onDownloadZip={download} zipBusy={downloading} onClose={onClose} />
        ) : (<>
        <div className="mt-6 border border-neutral-800 bg-black/40 p-4 text-left max-w-md mx-auto" data-testid="download-box">
          <div className="text-sm text-white font-semibold">Your download</div>
          <div className="text-xs text-neutral-400 mt-1 leading-relaxed">
            One file with your print-ready files and your {certified ? "SparkPrep Certified report" : "SparkPrep Preflight Report"} inside.
            {result?.downloaded === true && <span className="text-emerald-300"> It's in your Downloads folder.</span>}
            {result?.downloaded === false && <span className="text-amber-300"> Your browser didn't start it — press the button below.</span>}
            {result?.downloaded === null && <span> Starting now…</span>}
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={download} disabled={downloading} className="px-6 py-3.5 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center gap-2 disabled:opacity-60" data-testid="certified-download" data-next-step="Click to download">
            <Download className="w-4 h-4" /> {downloading ? "Downloading…" : result?.downloaded ? "Download again" : "Download my files"}
          </button>
          <button onClick={onClose} className="px-6 py-3.5 border border-neutral-700 text-neutral-300 hover:border-white hover:text-white font-mono-spec text-xs tracking-widest uppercase" data-testid="certified-close">
            Done
          </button>
        </div>
        </>)}
      </div>
    </div>
  );
}

/** One button per finished file, each saying where it goes -- so nobody has to dig through a ZIP (owner,
 * 2026-10-05: "I need them to be easy to find because SparkPrep isn't just for me"). */
function FileList({ files, onDownloadFile, onDownloadZip, zipBusy, onClose }) {
  const [state, setState] = useState({});          // kind -> "busy" | "done" | "error"
  const get = async (f) => {
    setState((s) => ({ ...s, [f.kind]: "busy" }));
    try { await onDownloadFile?.(f); setState((s) => ({ ...s, [f.kind]: "done" })); }
    catch { setState((s) => ({ ...s, [f.kind]: "error" })); }
  };
  return (
    <div className="mt-6 max-w-md mx-auto text-left" data-testid="download-files">
      <div className="text-sm text-white font-semibold">Your files — press each one to save it</div>
      <div className="text-xs text-neutral-400 mt-1 leading-relaxed">
        Each file saves to your <span className="text-white">Downloads</span> folder under the name shown, ready to upload.
      </div>
      <ul className="mt-3 space-y-2">
        {files.map((f, i) => {
          const st = state[f.kind];
          return (
            <li key={f.kind} className="border border-neutral-800 bg-black/40 p-3 flex items-center gap-3" data-testid={`download-file-${f.kind}`}>
              <div className="w-6 h-6 shrink-0 rounded-full bg-neutral-800 text-[#D4AF37] font-mono-spec text-[11px] flex items-center justify-center">
                {st === "done" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white font-semibold">{f.label}</div>
                <div className="text-[11px] text-neutral-400 leading-snug">{f.where}</div>
                <div className="text-[10px] font-mono-spec text-neutral-500 mt-0.5 truncate" title={f.filename}>{f.filename}</div>
                {st === "error" && <div className="text-[11px] text-amber-300 mt-0.5">That didn't save — press it again.</div>}
              </div>
              <button onClick={() => get(f)} disabled={st === "busy"}
                className={`shrink-0 px-3 py-2 font-mono-spec text-[10px] tracking-widest uppercase flex items-center gap-1.5 disabled:opacity-60 ${
                  st === "done" ? "border border-emerald-700 text-emerald-300" : "btn-gold btn-industrial"}`}
                data-testid={`download-file-btn-${f.kind}`}>
                <Download className="w-3.5 h-3.5" /> {st === "busy" ? "Saving…" : st === "done" ? "Saved" : "Save"}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onDownloadZip} disabled={zipBusy} className="text-[11px] text-neutral-500 hover:text-white underline underline-offset-2" data-testid="certified-download">
          {zipBusy ? "Downloading…" : "Or download everything as one ZIP"}
        </button>
        <button onClick={onClose} className="px-6 py-3 border border-neutral-700 text-neutral-300 hover:border-white hover:text-white font-mono-spec text-xs tracking-widest uppercase" data-testid="certified-close">
          Done
        </button>
      </div>
    </div>
  );
}

const CSS = `
.sp-seal{width:176px;height:176px;border-radius:9999px;padding:8px;background:conic-gradient(from 0deg,#b8912f,#f1d78a,#b8912f,#e8c96b,#b8912f);box-shadow:0 0 50px rgba(212,175,55,.45)}
.sp-seal-inner{width:100%;height:100%;border-radius:9999px;background:#fbf6e8;border:2px solid #b8912f;display:flex;flex-direction:column;align-items:center;justify-content:center}
@keyframes sp-seal-in{0%{transform:scale(.4) rotate(-25deg);opacity:0}70%{transform:scale(1.08) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
.sp-seal-in{animation:sp-seal-in .7s cubic-bezier(.2,.9,.3,1.2) both}
@media (prefers-reduced-motion: reduce){.sp-seal-in{animation:none!important}}
`;
