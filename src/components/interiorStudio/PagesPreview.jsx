import { useState } from "react";
import { API_URL } from "@/lib/api";
import { AlertTriangle, CheckCircle2, Loader2, ZoomIn, ZoomOut } from "lucide-react";

const fmt = (v) => `${Math.round(v * 1000) / 1000}"`;

// The printed pages, as the typesetter laid them out: left and right pages side by side like an open book.
// Page 1 is a right-hand page on its own, the way a printed book opens.
export default function PagesPreview({ preview, busy, error, trim }) {
  const [zoom, setZoom] = useState(1);
  if (!preview && !error) {
    return <div className="h-full flex items-center justify-center text-xs font-mono-spec text-neutral-500 gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Laying out your pages…</div>;
  }
  const n = preview?.page_count || 0;
  const spreads = [[null, 1]];
  for (let p = 2; p <= n; p += 2) spreads.push([p, p + 1 <= n ? p + 1 : null]);
  const ratio = trim ? trim.h / trim.w : 1.5;
  const w = Math.round(150 * zoom);
  const src = (p) => `${API_URL}/interior/preview/${preview.key}/page/${p}`;
  const m = preview?.margins;
  const own = preview?.distributor_own || preview?.distributor_minimums;

  return (
    <div className="h-full flex flex-col" data-testid="interior-preview">
      <div className="shrink-0 px-3 py-2 border-b border-neutral-200 bg-white flex items-center gap-2">
        <div className="mr-auto">
          <div className="font-display font-bold text-sm leading-tight">{n ? `${n} printed pages` : "Your pages"}</div>
          <div className="text-[10px] text-neutral-500 font-mono-spec">{preview ? `${preview.chapters} chapters · ${preview.words.toLocaleString()} words` : ""}</div>
        </div>
        {busy && <span className="flex items-center gap-1 text-[10px] font-mono-spec text-neutral-500" data-testid="interior-preview-busy"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating</span>}
        <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))} className="w-7 h-7 border border-neutral-300 flex items-center justify-center" title="Smaller pages"><ZoomOut className="w-3.5 h-3.5" /></button>
        <button onClick={() => setZoom((z) => Math.min(2.6, z + 0.2))} className="w-7 h-7 border border-neutral-300 flex items-center justify-center" title="Bigger pages"><ZoomIn className="w-3.5 h-3.5" /></button>
      </div>

      {error && <div className="m-3 pill-fail text-xs p-2.5">{error}</div>}

      {preview && (
        <div className="shrink-0 px-3 py-2 text-[11px] border-b border-neutral-200 bg-[#FBFBF9] space-y-1.5" data-testid="interior-margins">
          <div className="flex items-start gap-1.5 text-neutral-700">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-700" />
            <span>
              Margins: inside {fmt(m.inside)}, outside {fmt(m.outside)}, top {fmt(m.top)}, bottom {fmt(m.bottom)}.
              {" "}Never below {preview.margin_source} for {n} pages ({fmt(own.inside)} inside, {fmt(Math.min(own.outside, own.top))} elsewhere), or SparkPrep's {fmt(preview.safe_margin)} safe margin.
            </span>
          </div>
          {(preview.notes || []).map((note) => (
            <div key={note.id} className="flex items-start gap-1.5 text-amber-800" data-testid={`interior-note-${note.id}`}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> <span>{note.message}</span>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#E4E3DE] p-4">
          <div className="flex flex-col items-center gap-4">
            {spreads.map(([l, r]) => (
              <div key={`${l}-${r}`} className="flex shadow-[0_6px_24px_rgba(0,0,0,0.18)]">
                {[l, r].map((p, i) => (
                  <div key={i} style={{ width: w, height: Math.round(w * ratio) }} className={`relative ${p ? "bg-white" : "bg-transparent"}`}>
                    {p && <img src={src(p)} alt={`Page ${p}`} loading="lazy" className="w-full h-full block" data-testid={`interior-page-${p}`} />}
                    {p && <span className="absolute -bottom-4 left-0 right-0 text-center text-[9px] font-mono-spec text-neutral-500">{p}</span>}
                    {p && i === 0 && <span className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />}
                    {p && i === 1 && <span className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-neutral-500 mt-6">A screen preview. The print-ready file is made at full quality when you send it to your book.</p>
        </div>
      )}
    </div>
  );
}
