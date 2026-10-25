import { useEffect, useMemo, useState } from "react";
import { GENRES, templatesFor } from "@/lib/coverStudio/templates";
import { renderThumb } from "@/lib/coverStudio/thumbs";

const PAGE = 24;

function Thumb({ tpl, geo, words, onPick, busy }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let live = true;
    setUrl(null);
    renderThumb(tpl.key, geo, words).then((u) => { if (live) setUrl(u); }).catch(() => {});
    return () => { live = false; };
  }, [tpl.key, geo, words]);
  const ratio = geo.full_cover.panel_height / geo.full_cover.panel_width;
  return (
    <button
      onClick={() => onPick(tpl.key)}
      disabled={busy}
      className="group text-left disabled:opacity-60"
      data-testid={`studio-template-${tpl.key}`}
      title={tpl.name}
    >
      <div className="relative w-full bg-neutral-200 border border-neutral-300 group-hover:border-black transition-colors overflow-hidden" style={{ paddingTop: `${ratio * 100}%` }}>
        {url ? <img src={url} alt={tpl.name} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 animate-pulse bg-neutral-200" />}
      </div>
      <div className="mt-1 text-[10px] leading-tight text-neutral-600 truncate">{tpl.name}</div>
    </button>
  );
}

export default function TemplatesPanel({ geo, words, onPick, busy, genre, setGenre }) {
  const [shown, setShown] = useState(PAGE);
  const list = useMemo(() => templatesFor(genre), [genre]);
  useEffect(() => setShown(PAGE), [genre]);
  // Thumbnails show the author's own title, but re-draw only once they stop typing.
  const [thumbWords, setThumbWords] = useState(words);
  useEffect(() => {
    const t = setTimeout(() => setThumbWords({ title: words.title, author: words.author, subtitle: words.subtitle }), 600);
    return () => clearTimeout(t);
  }, [words.title, words.author, words.subtitle]);

  if (!geo) return null;
  return (
    <div data-testid="studio-templates">
      <p className="text-[11px] text-neutral-600 mb-3">
        {list.length} free templates, sized to your book. Every one is free to use, always. Pick one, then change anything.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {GENRES.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setGenre(k)}
            className={`px-2 py-1 text-[10px] font-mono-spec tracking-wider uppercase border ${genre === k ? "bg-black text-white border-black" : "bg-white border-neutral-300 hover:border-black"}`}
            data-testid={`studio-genre-${k}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {list.slice(0, shown).map((tpl) => (
          <Thumb key={tpl.key} tpl={tpl} geo={geo} words={thumbWords} onPick={onPick} busy={busy} />
        ))}
      </div>
      {shown < list.length && (
        <button onClick={() => setShown(shown + PAGE)} className="mt-3 w-full py-2 border border-neutral-300 hover:border-black text-xs font-mono-spec tracking-widest uppercase" data-testid="studio-templates-more">
          Show more ({list.length - shown} left)
        </button>
      )}
    </div>
  );
}
