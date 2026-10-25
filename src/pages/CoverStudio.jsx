import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/Logo";
import { CoverEngine } from "@/lib/coverStudio/engine";
import { DEFAULT_SPECS, loadGeometry } from "@/lib/coverStudio/specs";
import { DEFAULT_TEXT } from "@/lib/coverStudio/templates";
import TemplatesPanel from "@/components/coverStudio/TemplatesPanel";
import FontPicker from "@/components/coverStudio/FontPicker";
import PropertiesPanel from "@/components/coverStudio/PropertiesPanel";
import SpecsPanel, { specsOfProject } from "@/components/coverStudio/SpecsPanel";
import AIPanel from "@/components/coverStudio/AIPanel";
import SendToBookDialog from "@/components/coverStudio/SendToBookDialog";
import Preview3DDialog from "@/components/coverStudio/Preview3DDialog";
import {
  LayoutTemplate, Sparkles, Type, Shapes, ImagePlus, Ruler, PenLine, Undo2, Redo2, Grid3x3, Box, Download, Send,
  Square, Circle as CircleIcon, Triangle, Star, Minus, RectangleHorizontal, Diamond, Frame, CircleDot, PaintBucket, AlertTriangle, CheckCircle2,
} from "lucide-react";

const SAVE_KEY = "sp_cover_studio_v1";
const DEFAULT_TEMPLATE = "classic-gold";

const TABS = [
  ["templates", "Templates", LayoutTemplate],
  ["ai", "AI Designer", Sparkles],
  ["words", "Words", PenLine],
  ["text", "Text & Fonts", Type],
  ["elements", "Shapes", Shapes],
  ["photos", "Pictures", ImagePlus],
  ["specs", "Book Specs", Ruler],
];

const ids = new WeakMap();
let nextId = 1;
// A stable key per cover object, so the settings panel keeps its state while that object is edited.
function objKey(o) {
  if (!ids.has(o)) ids.set(o, nextId++);
  return ids.get(o);
}

function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch { return null; }
}
function writeSave(v) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)); return true; } catch { return false; }
}

const Lbl = ({ children }) => <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{children}</div>;

function WordsPanel({ words, setWords }) {
  const field = (k, label, rows = 0, ph = "") => (
    <div key={k}>
      <Lbl>{label}</Lbl>
      {rows ? (
        <Textarea rows={rows} value={words[k] || ""} placeholder={ph} onChange={(e) => setWords({ ...words, [k]: e.target.value })} data-testid={`studio-word-${k}`} />
      ) : (
        <Input value={words[k] || ""} placeholder={ph} onChange={(e) => setWords({ ...words, [k]: e.target.value })} className="h-9" data-testid={`studio-word-${k}`} />
      )}
    </div>
  );
  return (
    <div className="space-y-3" data-testid="studio-words">
      <p className="text-[11px] text-neutral-600">Type once: your title and name fill the front and the spine together.</p>
      {field("title", "Title")}
      {field("subtitle", "Subtitle", 0, "Optional")}
      {field("author", "Author name")}
      {field("tagline", "Back-cover headline", 0, "A line that hooks the reader (optional)")}
      {field("blurb", "Back-cover description", 6)}
      {field("bio", "About the author", 3, "Optional")}
    </div>
  );
}

function TextPanel({ engine, onEdit }) {
  const [font, setFont] = useState("Playfair Display");
  const add = (kind) => engine?.addText(kind, font).then(onEdit);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-1.5">
        <button onClick={() => add("heading")} className="text-left px-3 py-2.5 border border-neutral-300 hover:border-black bg-white text-xl font-bold" data-testid="studio-add-heading">Add a heading</button>
        <button onClick={() => add("subheading")} className="text-left px-3 py-2 border border-neutral-300 hover:border-black bg-white text-base">Add a subheading</button>
        <button onClick={() => add("body")} className="text-left px-3 py-2 border border-neutral-300 hover:border-black bg-white text-xs">Add a paragraph</button>
      </div>
      <Lbl>Font for new text (or select text on the cover to change its font)</Lbl>
      <FontPicker value={font} height={320} onPick={(f) => {
        setFont(f);
        const o = engine?.active();
        if (o && o.type === "textbox") engine.update({ fontFamily: f }).then(onEdit);
      }} />
    </div>
  );
}

const SHAPES = [
  ["rect", "Rectangle", Square], ["rounded", "Rounded box", RectangleHorizontal], ["circle", "Circle", CircleIcon],
  ["ring", "Ring", CircleDot], ["triangle", "Triangle", Triangle], ["star", "Star", Star], ["diamond", "Diamond", Diamond],
  ["line", "Line", Minus], ["band", "Band", RectangleHorizontal], ["frame", "Frame", Frame],
];

function ElementsPanel({ engine, onEdit }) {
  const [color, setColor] = useState("#FF6A00");
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 border border-neutral-300 p-0" /> Colour for new shapes
      </label>
      <div className="grid grid-cols-3 gap-2">
        {SHAPES.map(([k, label, I]) => (
          <button key={k} onClick={() => { engine?.addShape(k, color); onEdit(); }} className="aspect-square border border-neutral-300 hover:border-black bg-white flex flex-col items-center justify-center gap-1 text-[10px] text-neutral-600" data-testid={`studio-shape-${k}`}>
            <I className="w-6 h-6" style={{ color }} />{label}
          </button>
        ))}
      </div>
      <button onClick={() => { const bg = engine?.background(); if (bg) { engine.canvas.setActiveObject(bg); engine.canvas.requestRenderAll(); onEdit(bg); } }} className="w-full py-2.5 border border-neutral-300 hover:border-black bg-white text-xs flex items-center justify-center gap-2" data-testid="studio-edit-bg">
        <PaintBucket className="w-4 h-4" /> Change the background colour
      </button>
    </div>
  );
}

function PhotosPanel({ engine, onEdit }) {
  const input = useRef(null);
  const [mode, setMode] = useState("front");
  const onFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast.error("Pick a picture file (JPG, PNG or WebP)."); return; }
    const r = new FileReader();
    r.onload = () => engine?.addImage(r.result, mode).then(() => onEdit()).catch(() => toast.error("That picture couldn't be opened."));
    r.readAsDataURL(f);
  };
  return (
    <div className="space-y-3">
      <Lbl>Where should it go?</Lbl>
      <div className="grid grid-cols-1 gap-1.5">
        {[["front", "Front cover, edge to edge (or into the template's picture window)"], ["wrap", "Across the whole cover: back, spine and front"], ["back", "Back cover"]].map(([k, l]) => (
          <label key={k} className={`flex items-start gap-2 p-2 border text-xs cursor-pointer ${mode === k ? "border-black bg-[#FFF8EF]" : "border-neutral-300 bg-white"}`}>
            <input type="radio" checked={mode === k} onChange={() => setMode(k)} className="mt-0.5" /> {l}
          </label>
        ))}
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={onFile} data-testid="studio-photo-input" />
      <button onClick={() => input.current?.click()} className="w-full py-3 bg-black text-white font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2" data-testid="studio-photo-upload">
        <ImagePlus className="w-4 h-4" /> Upload a picture
      </button>
      <p className="text-[11px] text-neutral-500">
        For a sharp print, a front-cover picture should be about 1,800 x 2,700 pixels or bigger. Click a picture on the cover to see how sharp it will print.
      </p>
    </div>
  );
}

function ChecksPanel({ problems, engine, geo, onEdit }) {
  return (
    <div data-testid="studio-checks">
      <Lbl>Print check</Lbl>
      {problems.length === 0 ? (
        <div className="flex items-start gap-2 text-xs pill-pass p-2.5"><CheckCircle2 className="w-4 h-4 shrink-0" /> Every word is inside the safe area and clear of the barcode.</div>
      ) : (
        <div className="space-y-1.5">
          {problems.map((p, i) => (
            <button key={i} onClick={() => { engine.canvas.setActiveObject(p.obj); engine.canvas.requestRenderAll(); onEdit(p.obj); }} className="w-full text-left flex items-start gap-2 text-xs pill-warn p-2.5" data-testid="studio-problem">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {p.msg}
            </button>
          ))}
        </div>
      )}
      <div className="mt-5 text-[11px] text-neutral-600 space-y-1.5">
        <Lbl>The guide lines</Lbl>
        <div><span className="inline-block w-3 h-3 align-middle mr-1.5" style={{ background: "rgba(198,40,40,0.25)" }} />Red edge: bleed. It gets cut off, so let colour run into it but keep words out.</div>
        <div><span className="inline-block w-3 h-0.5 align-middle mr-1.5 bg-[#D4AF37]" />Gold: where the printer trims the book.</div>
        <div><span className="inline-block w-3 h-0.5 align-middle mr-1.5 bg-[#007BFF]" />Blue: the folds around the spine{geo?.full_cover?.flap_width ? " and flaps" : ""}.</div>
        <div><span className="inline-block w-3 h-0.5 align-middle mr-1.5 bg-[#16A34A]" />Green: the safe area. Keep words and faces inside it.</div>
        <div><span className="inline-block w-3 h-3 align-middle mr-1.5 border border-dashed border-[#22C55E]" />Barcode area: the printer puts your ISBN barcode here.</div>
        <p className="pt-1 text-neutral-500">Guides never print. Click any word or shape on the cover to change it.</p>
      </div>
    </div>
  );
}

export default function CoverStudio() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const canvasEl = useRef(null);
  const stage = useRef(null);
  const engineRef = useRef(null);
  const [engine, setEngine] = useState(null);
  const saved = useRef(readSave());
  const [specs, setSpecs] = useState(saved.current?.specs || DEFAULT_SPECS);
  const [geo, setGeo] = useState(null);
  const [words, setWordsState] = useState({ ...DEFAULT_TEXT, ...(saved.current?.words || {}) });
  const [genre, setGenre] = useState(saved.current?.genre || "all");
  const [tab, setTab] = useState("templates");
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);
  const [guides, setGuides] = useState(true);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState([]);
  const [show3d, setShow3d] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [linkedBook, setLinkedBook] = useState(saved.current?.linkedBook || null);
  const [geoError, setGeoError] = useState(null);
  const wordsRef = useRef(words);
  const ready = useRef(false);

  const refresh = useCallback((obj) => {
    if (obj !== undefined) setSelected(obj);
    setTick((n) => n + 1);
  }, []);

  // The engine, once.
  useEffect(() => {
    const eng = new CoverEngine(canvasEl.current, {
      onSelect: (o) => { setSelected(o); setTick((n) => n + 1); },
      onChange: () => setTick((n) => n + 1),
      onWordEdited: (word, value, src) => {
        const next = { ...wordsRef.current, [word]: value };
        wordsRef.current = next;
        setWordsState(next);
        eng.setWords(next, src);
      },
    });
    engineRef.current = eng;
    setEngine(eng);
    return () => { eng.dispose(); engineRef.current = null; };
  }, []);

  // A book from the Editor (?book=<id>): use its exact specs and its title.
  useEffect(() => {
    const id = params.get("book");
    if (!id || !user) return;
    api.get(`/projects/${id}`).then(({ data }) => {
      setLinkedBook({ id: data.id, name: data.name });
      setSpecs(specsOfProject(data));
      if (data.name && (wordsRef.current.title === DEFAULT_TEXT.title || !wordsRef.current.title)) setWords({ ...wordsRef.current, title: data.name });
    }).catch(() => {});
  }, [params, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Book specs -> exact cover geometry -> re-lay the design onto it.
  useEffect(() => {
    if (!engine) return;
    let live = true;
    setGeoError(null);
    loadGeometry(specs).then(async (g) => {
      if (!live) return;
      const first = !engine.geo;
      if (first) {
        engine.setGeometry(g, { remap: false });
        if (saved.current?.snap) {
          try { await engine.restore(saved.current.snap); engine.commit(); } catch { await engine.applyTemplate(DEFAULT_TEMPLATE, wordsRef.current); }
        } else {
          await engine.applyTemplate(DEFAULT_TEMPLATE, wordsRef.current);
        }
        ready.current = true;
      } else {
        engine.setGeometry(g, { remap: true });
      }
      setGeo(g);
      const r = stage.current?.getBoundingClientRect();
      if (r) engine.fit(r.width, r.height);
      refresh();
    }).catch((e) => { if (live) setGeoError(e.message); });
    return () => { live = false; };
  }, [engine, specs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the canvas fitted to its box.
  useEffect(() => {
    const el = stage.current;
    if (!el || !engine) return undefined;
    const ro = new ResizeObserver(([e]) => engine.fit(e.contentRect.width, e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [engine]);

  const setWords = useCallback((next) => {
    wordsRef.current = next;
    setWordsState(next);
    engineRef.current?.setWords(next);
  }, []);

  // Save to this browser and re-run the print check whenever the design changes.
  useEffect(() => {
    if (!engine || !ready.current || !engine.geo) return undefined;
    const t = setTimeout(() => {
      setProblems(engine.problems());
      const snap = engine.history[engine.history.length - 1];
      const base = { specs, words, genre, linkedBook };
      if (!writeSave({ ...base, snap: snap ? JSON.parse(snap) : null })) writeSave(base);
    }, 700);
    return () => clearTimeout(t);
  }, [tick, words, specs, genre, linkedBook, engine]);

  // Keyboard: delete, undo / redo, duplicate, nudge.
  useEffect(() => {
    const onKey = (e) => {
      const eng = engineRef.current;
      if (!eng) return;
      const tag = (e.target?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || e.target?.isContentEditable) return;
      const o = eng.active();
      if (o?.isEditing) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); (e.shiftKey ? eng.redo() : eng.undo()).then(() => refresh(null)); return; }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); eng.redo().then(() => refresh(null)); return; }
      if (!o) return;
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); eng.remove(); refresh(null); return; }
      if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); eng.duplicate().then(() => refresh()); return; }
      const step = e.shiftKey ? 10 : 1;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key] && !o.lockMovementX) {
        e.preventDefault();
        o.set({ left: o.left + moves[e.key][0], top: o.top + moves[e.key][1] });
        o.setCoords();
        eng.canvas.requestRenderAll();
        eng.commitSoon();
        refresh();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [refresh]);

  const applyTemplate = useCallback(async (key, w) => {
    const eng = engineRef.current;
    if (!eng?.geo) return;
    setBusy(true);
    try {
      const tpl = await eng.applyTemplate(key, w || wordsRef.current);
      toast.success(`${tpl.name} applied. Your words carried over.`);
    } finally {
      setBusy(false);
      refresh(null);
    }
  }, [refresh]);

  const download = async (format) => {
    if (!engine) return;
    const id = toast.loading("Drawing your cover at print size (300 DPI)…");
    try {
      const { url, widthPx, heightPx } = await engine.render({ dpi: 300, format, quality: 0.95 });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(words.title || "cover").replace(/[^\w-]+/g, "_").slice(0, 40) || "cover"}_full_cover_300dpi.${format === "jpeg" ? "jpg" : "png"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success(`Downloaded: ${widthPx} x ${heightPx} pixels, back + spine + front with bleed. Send it to your book to get a print-ready PDF.`, { id });
    } catch (e) {
      toast.error(e.message, { id });
    }
  };

  const applyBookSpecs = (book) => {
    setLinkedBook({ id: book.id, name: book.name });
    setSpecs(specsOfProject(book));
    toast.success(`Your cover is now sized for "${book.name}".`);
  };

  const fc = geo?.full_cover;

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F5] text-neutral-900" data-testid="cover-studio">
      {/* Top bar */}
      <header className="h-14 shrink-0 flex items-center gap-2 px-3 sm:px-4 bg-[#0D0D0D] text-white border-b border-neutral-800">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 mr-1" title="Back to SparkPrep"><LogoMark size={28} /></Link>
        <div className="mr-auto min-w-0">
          <div className="font-display font-black text-base leading-none tracking-tight">Cover Studio</div>
          <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500 truncate">
            {fc ? `${specs.trim_size} · ${specs.binding.replace(/_/g, " ")} · ${specs.page_count} pages · spine ${Math.round(fc.spine_width * 1000) / 1000}"` : "Loading…"}
          </div>
        </div>
        <button onClick={() => engine?.undo().then(() => refresh(null))} disabled={!engine?.canUndo()} className="w-9 h-9 flex items-center justify-center border border-neutral-700 hover:border-white disabled:opacity-30" title="Undo (Ctrl+Z)" data-testid="studio-undo"><Undo2 className="w-4 h-4" /></button>
        <button onClick={() => engine?.redo().then(() => refresh(null))} disabled={!engine?.canRedo()} className="w-9 h-9 flex items-center justify-center border border-neutral-700 hover:border-white disabled:opacity-30" title="Redo" data-testid="studio-redo"><Redo2 className="w-4 h-4" /></button>
        <button onClick={() => { const n = !guides; setGuides(n); engine?.setGuides(n); }} className={`hidden sm:flex h-9 px-2.5 items-center gap-1.5 border font-mono-spec text-[10px] tracking-widest uppercase ${guides ? "border-[#D4AF37] text-[#D4AF37]" : "border-neutral-700 text-neutral-400"}`} title="Show or hide the print guides" data-testid="studio-guides"><Grid3x3 className="w-4 h-4" /> Guides</button>
        <button onClick={() => setShow3d(true)} disabled={!geo} className="h-9 px-2.5 flex items-center gap-1.5 border border-neutral-700 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase" data-testid="studio-3d"><Box className="w-4 h-4" /><span className="hidden sm:inline">3D Preview</span></button>
        <div className="relative group">
          <button className="h-9 px-2.5 flex items-center gap-1.5 border border-neutral-700 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase" data-testid="studio-download"><Download className="w-4 h-4" /><span className="hidden sm:inline">Download</span></button>
          <div className="absolute right-0 top-full pt-1 hidden group-hover:block group-focus-within:block z-50">
            <div className="bg-white text-neutral-900 border border-neutral-300 shadow-lg w-56 text-xs">
              <button onClick={() => download("png")} className="block w-full text-left px-3 py-2 hover:bg-neutral-100" data-testid="studio-download-png">PNG, 300 DPI (best quality)</button>
              <button onClick={() => download("jpeg")} className="block w-full text-left px-3 py-2 hover:bg-neutral-100" data-testid="studio-download-jpg">JPG, 300 DPI (smaller file)</button>
            </div>
          </div>
        </div>
        <button onClick={() => setShowSend(true)} disabled={!geo} className="h-9 px-3 flex items-center gap-1.5 btn-gold font-mono-spec text-[10px] tracking-widest uppercase btn-industrial" data-testid="studio-send"><Send className="w-4 h-4" /><span className="hidden md:inline">Send to my book</span></button>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Tools */}
        <aside className="order-2 lg:order-1 lg:w-[340px] shrink-0 flex flex-col lg:flex-row border-t lg:border-t-0 lg:border-r border-neutral-200 bg-white min-h-0 max-h-[45vh] lg:max-h-none">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-200 bg-[#FAFAF8]">
            {TABS.map(([k, label, I]) => (
              <button key={k} onClick={() => setTab(k)} className={`shrink-0 w-[68px] h-[60px] flex flex-col items-center justify-center gap-1 text-[9px] font-mono-spec uppercase tracking-wide ${tab === k ? "bg-white text-black lg:border-l-2 border-[#FF6A00]" : "text-neutral-500 hover:text-black"}`} data-testid={`studio-tab-${k}`}>
                <I className="w-5 h-5" />{label}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 overflow-y-auto p-3">
            <div className="font-display font-bold text-lg mb-2">{TABS.find(([k]) => k === tab)[1]}</div>
            {tab === "templates" && <TemplatesPanel geo={geo} words={words} onPick={applyTemplate} busy={busy} genre={genre} setGenre={setGenre} />}
            {tab === "ai" && engine && geo && <AIPanel engine={engine} geo={geo} words={words} setWords={setWords} genre={genre} setGenre={setGenre} applyTemplate={applyTemplate} />}
            {tab === "words" && <WordsPanel words={words} setWords={setWords} />}
            {tab === "text" && <TextPanel engine={engine} onEdit={refresh} />}
            {tab === "elements" && <ElementsPanel engine={engine} onEdit={refresh} />}
            {tab === "photos" && <PhotosPanel engine={engine} onEdit={refresh} />}
            {tab === "specs" && <SpecsPanel specs={specs} setSpecs={setSpecs} geo={geo} linkedBook={linkedBook} onLinkBook={applyBookSpecs} />}
          </div>
        </aside>

        {/* Canvas */}
        <main className="order-1 lg:order-2 flex-1 min-w-0 min-h-[40vh] relative bg-[#E4E3DE]">
          <div ref={stage} className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <canvas ref={canvasEl} data-testid="studio-canvas" />
            </div>
          </div>
          {geoError && <div className="absolute top-3 left-1/2 -translate-x-1/2 pill-fail text-xs px-3 py-2">{geoError}</div>}
          {!geo && !geoError && <div className="absolute inset-0 flex items-center justify-center text-xs font-mono-spec text-neutral-500">Sizing your cover…</div>}
        </main>

        {/* Selection / checks */}
        <aside className="order-3 hidden lg:block w-[300px] shrink-0 border-l border-neutral-200 bg-white overflow-y-auto p-3">
          {selected ? (
            <>
              <div className="font-display font-bold text-lg mb-3">
                {selected.sp_role === "bg" ? "Background" : selected.type === "textbox" ? "Text" : selected.type === "image" ? "Picture" : "Shape"}
              </div>
              <PropertiesPanel key={objKey(selected)} obj={selected} engine={engine} onEdit={() => setTick((n) => n + 1)} tick={tick} />
            </>
          ) : (
            <ChecksPanel problems={problems} engine={engine} geo={geo} onEdit={refresh} />
          )}
        </aside>
      </div>

      {/* Small screens: the selected item's settings in a sheet under the canvas */}
      {selected && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 max-h-[50vh] overflow-y-auto bg-white border-t border-neutral-300 shadow-2xl p-3 z-40" data-testid="studio-mobile-props">
          <div className="flex justify-between items-center mb-2">
            <div className="font-display font-bold">Edit</div>
            <button onClick={() => { engine?.canvas.discardActiveObject(); engine?.canvas.requestRenderAll(); setSelected(null); }} className="text-xs underline">Done</button>
          </div>
          <PropertiesPanel obj={selected} engine={engine} onEdit={() => setTick((n) => n + 1)} tick={tick} />
        </div>
      )}

      <Preview3DDialog open={show3d} onOpenChange={setShow3d} engine={engine} geo={geo} />
      <SendToBookDialog open={showSend} onOpenChange={setShowSend} engine={engine} specs={specs} words={words} linkedBook={linkedBook} onUseSpecs={applyBookSpecs} problems={problems} />
    </div>
  );
}

