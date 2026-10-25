import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { FONTS, FONT_CATEGORIES, loadPreview, previewFamily } from "@/lib/coverStudio/fonts";

// Every font shown in its own face. Only the letters of each name are downloaded until a font is picked.
export default function FontPicker({ value, onPick, height = 260 }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [limit, setLimit] = useState(60);
  const [, force] = useState(0);
  const box = useRef(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FONTS.filter((f) => (cat === "all" || f.category === cat) && (!s || f.family.toLowerCase().includes(s)));
  }, [q, cat]);

  useEffect(() => setLimit(60), [q, cat]);

  useEffect(() => {
    let live = true;
    Promise.all(list.slice(0, limit).map((f) => loadPreview(f.family))).then(() => { if (live) force((n) => n + 1); });
    return () => { live = false; };
  }, [list, limit]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight > el.scrollHeight - 80 && limit < list.length) setLimit(limit + 60);
  };

  return (
    <div data-testid="studio-font-picker">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${FONTS.length} fonts`} className="h-8 text-sm" data-testid="studio-font-search" />
      <div className="flex flex-wrap gap-1 mt-2">
        {FONT_CATEGORIES.map(([k, label]) => (
          <button key={k} onClick={() => setCat(k)} className={`px-1.5 py-0.5 text-[10px] font-mono-spec uppercase border ${cat === k ? "bg-black text-white border-black" : "bg-white border-neutral-300"}`}>{label}</button>
        ))}
      </div>
      <div ref={box} onScroll={onScroll} className="mt-2 overflow-y-auto border border-neutral-200 bg-white" style={{ height }}>
        {list.slice(0, limit).map((f) => (
          <button
            key={f.family}
            onClick={() => onPick(f.family)}
            className={`block w-full text-left px-2.5 py-1.5 text-[17px] leading-tight hover:bg-neutral-100 ${value === f.family ? "bg-[#FFF1E6]" : ""}`}
            style={{ fontFamily: previewFamily(f.family) }}
            data-testid={`studio-font-${f.family.replace(/\s+/g, "-")}`}
          >
            {f.family}
          </button>
        ))}
        {!list.length && <div className="p-3 text-xs text-neutral-500">No font by that name.</div>}
      </div>
      <p className="text-[10px] text-neutral-500 mt-1.5">All fonts are free for commercial use on covers you sell (Google Fonts, open licenses).</p>
    </div>
  );
}
