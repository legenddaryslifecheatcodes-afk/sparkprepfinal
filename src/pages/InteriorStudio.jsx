import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder, CharacterCount } from "@tiptap/extensions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, fmtErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LogoMark } from "@/components/Logo";
import { loadSpecLists } from "@/lib/coverStudio/specs";
import { PageBreak } from "@/lib/interiorStudio/pageBreak";
import { BookImage, uploadBookImage } from "@/lib/interiorStudio/bookImage";
import { importWordFile } from "@/lib/interiorStudio/importWord";
import { loadBookFont, fontStack } from "@/lib/interiorStudio/fonts";
import Toolbar from "@/components/interiorStudio/Toolbar";
import PagesPreview from "@/components/interiorStudio/PagesPreview";
import SendInteriorDialog from "@/components/interiorStudio/SendInteriorDialog";
import WritingHelpPanel, { useWritingHelp } from "@/components/interiorStudio/WritingHelpPanel";
import { WritingMarks } from "@/lib/interiorStudio/writingHelp";
import { BookOpen, FileUp, Palette, Ruler, Send, NotebookPen, Eye, PenLine, SpellCheck } from "lucide-react";

// The Interior Studio: write (or bring in a Word file) like in Word, pick a book style, and watch the real
// printed pages build beside you. The pages are typeset by SparkPrep's server with the chosen printer's own
// margin rules for the book's page count, so what you see is what gets printed.

const SAVE_KEY = "sp_interior_studio_v1";
const SPELL_KEY = "sp_interior_spellcheck";
const PREVIEW_DELAY_MS = 1500;
const DEFAULT_SPECS = { platform: "kdp", trim_size: "6x9", paper_type: "cream_50lb", binding: "paperback" };
const STARTER = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "The Beginning" }] },
    { type: "paragraph", content: [{ type: "text", text: "Start writing here, paste your book in, or bring in your Word file with the Import button at the top. Every line you type shows up on the printed pages on the right a moment later." }] },
    { type: "paragraph", content: [{ type: "text", text: "Make a line a chapter title with the Style box (or Ctrl+Alt+1), and each chapter starts on its own page. Add a scene break for a pause inside a chapter." }] },
  ],
};

const TABS = [
  ["details", "Book details", NotebookPen],
  ["style", "Book style", Palette],
  ["size", "Book size", Ruler],
  ["help", "Writing help", SpellCheck],
];

const Lbl = ({ children }) => <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{children}</div>;

function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch { return null; }
}
function writeSave(v) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)); return true; } catch { return false; }
}

function DetailsPanel({ details, setDetails }) {
  const set = (k, v) => setDetails({ ...details, [k]: v });
  const field = (k, label, ph = "", rows = 0) => (
    <div key={k}>
      <Lbl>{label}</Lbl>
      {rows ? (
        <Textarea rows={rows} value={details[k] || ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} data-testid={`interior-detail-${k}`} />
      ) : (
        <Input value={details[k] || ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="h-9" data-testid={`interior-detail-${k}`} />
      )}
    </div>
  );
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-neutral-600">These make your title page, copyright page and the names at the top of each page.</p>
      {field("title", "Title")}
      {field("subtitle", "Subtitle", "Optional")}
      {field("author", "Author name")}
      {field("dedication", "Dedication", "Optional. Gets its own page.", 3)}
      {field("copyright", "Copyright page", `Leave empty for: Copyright © ${new Date().getFullYear()} ${details.author || "Your Name"}. All rights reserved.`, 4)}
      {field("isbn", "ISBN", "Optional. Printed on the copyright page.")}
      <label className="flex items-center gap-2 text-xs pt-1">
        <input type="checkbox" checked={details.toc !== false} onChange={(e) => set("toc", e.target.checked)} data-testid="interior-detail-toc" />
        Add a table of contents (with the real page numbers)
      </label>
    </div>
  );
}

function StylePanel({ styles, value, onPick }) {
  useEffect(() => { (styles || []).forEach((s) => { loadBookFont(s.body_font); loadBookFont(s.heading_font); }); }, [styles]);
  if (!styles) return <div className="text-xs text-neutral-500">Loading book styles…</div>;
  const genres = [...new Set(styles.map((s) => s.genre))];
  return (
    <div className="space-y-4" data-testid="interior-styles">
      <p className="text-[11px] text-neutral-600">A book style sets the fonts, chapter openings and spacing. Switch any time: your words stay the same.</p>
      {genres.map((g) => (
        <div key={g}>
          <Lbl>{g}</Lbl>
          <div className="space-y-1.5">
            {styles.filter((s) => s.genre === g).map((s) => (
              <button key={s.key} onClick={() => onPick(s.key)} className={`w-full text-left p-3 border bg-white ${value === s.key ? "border-black ring-1 ring-black" : "border-neutral-300 hover:border-neutral-500"}`} data-testid={`interior-style-${s.key}`}>
                <div style={{ fontFamily: fontStack(s.heading_font) }} className="text-lg leading-tight">{s.label}</div>
                <div style={{ fontFamily: fontStack(s.body_font) }} className="text-[13px] text-neutral-700 mt-1 leading-snug">The rain had not stopped for three days.</div>
                <div className="text-[10px] text-neutral-500 mt-1.5">{s.blurb}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-neutral-500">Every font is open-licensed and embedded in your print file, so it's safe to sell.</p>
    </div>
  );
}

function SizePanel({ lists, specs, setSpecs, linkedBook, books, onLinkBook }) {
  if (!lists) return <div className="text-xs text-neutral-500">Loading book sizes…</div>;
  const sel = (k, label, options, testid) => (
    <div>
      <Lbl>{label}</Lbl>
      <select value={specs[k]} onChange={(e) => setSpecs({ ...specs, [k]: e.target.value })} className="w-full h-9 px-2 border border-neutral-300 bg-white text-sm" data-testid={testid}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
  return (
    <div className="space-y-3">
      {books && books.length > 0 && (
        <div className="p-3 bg-[#FFF8EF] border border-[#F3D9B8]">
          <Lbl>Already have a book in SparkPrep?</Lbl>
          <select value={linkedBook?.id || ""} onChange={(e) => { const b = books.find((x) => x.id === e.target.value); if (b) onLinkBook(b); }} className="w-full h-9 px-2 border border-neutral-300 bg-white text-sm" data-testid="interior-link-book">
            <option value="">Use my book's size and printer</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}
      {sel("platform", "Printer", Object.entries(lists.platforms).map(([k, v]) => [k, v.name]), "interior-spec-platform")}
      {sel("trim_size", "Trim size", Object.entries(lists.trim_sizes).map(([k, v]) => [k, v.label]), "interior-spec-trim")}
      <p className="text-[11px] text-neutral-600">
        The margins follow the printer's own rules, and the inside margin (by the spine) grows automatically as your book gets longer. Page count is worked out for you.
      </p>
    </div>
  );
}

export default function InteriorStudio() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const saved = useRef(readSave());
  const [specs, setSpecs] = useState(saved.current?.specs || DEFAULT_SPECS);
  const [details, setDetails] = useState(saved.current?.details || { title: "", author: "", toc: true });
  const [styleKey, setStyleKey] = useState(saved.current?.style || "classic_novel");
  const [linkedBook, setLinkedBook] = useState(saved.current?.linkedBook || null);
  const [styles, setStyles] = useState(null);
  const [lists, setLists] = useState(null);
  const [books, setBooks] = useState(null);
  const [tab, setTab] = useState(() => (window.innerWidth >= 1280 ? "details" : null));
  const [mobileView, setMobileView] = useState("write");
  const [docVersion, setDocVersion] = useState(0);
  const [preview, setPreview] = useState(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [showSend, setShowSend] = useState(false);
  const fileInput = useRef(null);
  const pictureInput = useRef(null);
  const reqId = useRef(0);
  const savedWarned = useRef(false);
  const pickRef = useRef(null);
  const [spellcheck, setSpellcheck] = useState(() => { try { return localStorage.getItem(SPELL_KEY) !== "off"; } catch { return true; } });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] }, code: false, codeBlock: false, link: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your book…" }),
      CharacterCount,
      PageBreak,
      BookImage,
      WritingMarks.configure({ onPick: (id) => pickRef.current?.(id) }),
    ],
    content: saved.current?.doc || STARTER,
    onUpdate: () => setDocVersion((v) => v + 1),
    editorProps: { attributes: { class: "interior-doc focus:outline-none", "data-testid": "interior-editor", spellcheck: spellcheck ? "true" : "false" } },
  });

  const style = useMemo(() => styles?.find((s) => s.key === styleKey), [styles, styleKey]);
  const wh = useWritingHelp(editor, { title: details.title, genre: style?.genre });
  pickRef.current = (id) => { wh.setActive(id); setTab("help"); };

  // The browser's own red underlines for misspelled words (free), on unless the author turns them off.
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({ editorProps: { attributes: { class: "interior-doc focus:outline-none", "data-testid": "interior-editor", spellcheck: spellcheck ? "true" : "false" } } });
    try { localStorage.setItem(SPELL_KEY, spellcheck ? "on" : "off"); } catch { /* private window: just this visit */ }
  }, [editor, spellcheck]);
  useEffect(() => { if (style) { loadBookFont(style.body_font); loadBookFont(style.heading_font); } }, [style]);

  useEffect(() => {
    api.get("/interior/styles").then(({ data }) => setStyles(data.styles)).catch(() => setStyles([]));
    loadSpecLists().then(setLists);
  }, []);
  useEffect(() => {
    if (!user) return;
    api.get("/projects").then(({ data }) => setBooks(data.projects || [])).catch(() => setBooks([]));
  }, [user]);

  // A book from the Editor (?book=<id>): its printer and size, and the writing saved with it last time.
  useEffect(() => {
    const id = params.get("book");
    if (!id || !user || !editor) return;
    api.get(`/projects/${id}/interior-studio`).then(({ data }) => {
      const p = data.project;
      setLinkedBook({ id: p.id, name: p.name });
      setSpecs((s) => ({ ...s, platform: p.platform, trim_size: p.trim_size, binding: p.binding }));
      const d = data.doc;
      if (d?.content?.content?.length) {
        editor.commands.setContent(d.content);
        setDetails({ toc: true, ...d.details });
        if (d.style) setStyleKey(d.style);
        toast.success(`Opened the pages saved with "${p.name}".`);
      } else if (p.name) {
        setDetails((x) => ({ ...x, title: x.title || p.name }));
      }
      setDocVersion((v) => v + 1);
    }).catch(() => {});
  }, [params, user, editor]);

  const buildBody = useCallback(() => ({
    style: styleKey, platform: specs.platform, trim_size: specs.trim_size, details,
    content: editor?.getJSON() || { type: "doc", content: [] }, page_hint: preview?.page_count || null,
  }), [styleKey, specs, details, editor, preview]);

  // Re-typeset a moment after the author stops typing; only the newest answer is shown.
  useEffect(() => {
    if (!editor) return undefined;
    const t = setTimeout(async () => {
      const id = ++reqId.current;
      setPreviewBusy(true);
      try {
        const { data } = await api.post("/interior/preview", buildBody(), { timeout: 120000 });
        if (id === reqId.current) { setPreview(data); setPreviewError(null); }
      } catch (e) {
        if (id === reqId.current) setPreviewError(fmtErr(e.response?.data?.detail) || "Couldn't reach SparkPrep to lay out the pages. Your writing is safe here; it will try again when you type.");
      } finally {
        if (id === reqId.current) setPreviewBusy(false);
      }
    }, PREVIEW_DELAY_MS);
    return () => clearTimeout(t);
  }, [docVersion, styleKey, specs.platform, specs.trim_size, details, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the writing in this browser as the author goes.
  useEffect(() => {
    if (!editor) return undefined;
    const t = setTimeout(() => {
      const ok = writeSave({ doc: editor.getJSON(), details, style: styleKey, specs, linkedBook });
      if (!ok && !savedWarned.current) {
        savedWarned.current = true;
        toast.warning("This book is too big to keep in your browser. Send it to your book to save it.");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [docVersion, details, styleKey, specs, linkedBook, editor]);

  const onImport = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !editor) return;
    if (!/\.docx$/i.test(f.name)) { toast.error("Pick a Word file that ends in .docx. (An older .doc file: open it in Word and use File > Save As > .docx.)"); return; }
    const id = toast.loading("Bringing in your Word file…");
    try {
      const r = await importWordFile(f, {
        uploadImage: uploadBookImage,
        onProgress: (n) => toast.loading(`Bringing in your Word file… (picture ${n})`, { id }),
      });
      const hasWriting = (editor.storage.characterCount?.words?.() || 0) > 80;
      if (hasWriting && !window.confirm("Replace what's in the editor with this Word file?")) { toast.dismiss(id); return; }
      editor.commands.setContent(r.html);
      setDetails({
        ...details,
        title: r.title || details.title || f.name.replace(/\.docx$/i, "").replace(/[_-]+/g, " "),
        ...(r.subtitle ? { subtitle: r.subtitle } : {}),
      });
      setDocVersion((v) => v + 1);
      const kept = r.images - r.imagesFailed;
      const extra = (kept ? ` ${kept} picture${kept === 1 ? "" : "s"} too.` : "")
        + (r.imagesFailed ? ` ${r.imagesFailed} picture${r.imagesFailed === 1 ? " couldn't" : "s couldn't"} be brought in; add ${r.imagesFailed === 1 ? "it" : "them"} with the Picture button.` : "");
      toast.success(`Brought in ${r.words.toLocaleString()} words and ${r.chapters} chapter${r.chapters === 1 ? "" : "s"}.${extra}`, { id, duration: 8000 });
    } catch (err) {
      toast.error(`That Word file couldn't be read: ${err.message}`, { id });
    }
  };

  const onPicture = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = "";
    if (!files.length || !editor) return;
    const id = toast.loading(files.length === 1 ? "Adding your picture…" : `Adding ${files.length} pictures…`);
    let added = 0;
    for (const f of files) {
      try {
        const pic = await uploadBookImage(f);
        editor.chain().focus().insertBookImage({ id: pic.id }).run();
        added += 1;
      } catch (err) {
        toast.error(`${f.name}: ${fmtErr(err.response?.data?.detail) || err.message}`);
      }
    }
    if (added) toast.success(added === 1 ? "Picture added. Pick its size under it; the printed pages show where it lands." : `${added} pictures added.`, { id });
    else toast.dismiss(id);
  };

  const onLinkBook = (b) => {
    setLinkedBook({ id: b.id, name: b.name });
    setSpecs({ ...specs, platform: b.platform, trim_size: b.trim_size, binding: b.binding, paper_type: b.paper_type });
    toast.success(`Your pages are now set up for "${b.name}".`);
  };

  const words = editor?.storage.characterCount?.words?.() || 0;
  const trim = lists?.trim_sizes?.[specs.trim_size];
  const platformName = lists?.platforms?.[specs.platform]?.name || specs.platform;
  const docStyle = style ? { "--book-body": fontStack(style.body_font), "--book-head": fontStack(style.heading_font) } : {};

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F5] text-neutral-900" data-testid="interior-studio">
      <style>{`
        .interior-doc { font-family: var(--book-body, Georgia, serif); font-size: 17px; line-height: 1.6; min-height: 60vh; }
        .interior-doc p { margin: 0 0 0.6em; }
        .interior-doc h1 { font-family: var(--book-head, Georgia, serif); font-size: 1.7em; text-align: center; margin: 1.6em 0 0.8em; line-height: 1.2; }
        .interior-doc h1:first-child { margin-top: 0.4em; }
        .interior-doc h1::before { content: "Chapter title"; display: block; font: 600 9px/1 ui-monospace, monospace; letter-spacing: .15em; text-transform: uppercase; color: #FF6A00; margin-bottom: 6px; }
        .interior-doc h2 { font-family: var(--book-head, Georgia, serif); font-size: 1.2em; font-weight: 700; margin: 1.2em 0 0.4em; }
        .interior-doc blockquote { margin: 0.8em 2em; font-size: 0.95em; color: #333; border-left: 2px solid #ddd; padding-left: 1em; }
        .interior-doc ul { list-style: disc; padding-left: 1.6em; margin: 0 0 0.6em; }
        .interior-doc ol { list-style: decimal; padding-left: 1.6em; margin: 0 0 0.6em; }
        .interior-doc hr { border: 0; margin: 1.2em 0; text-align: center; height: auto; }
        .interior-doc hr::after { content: "*   *   *"; white-space: pre; color: #888; letter-spacing: .2em; }
        .interior-doc hr.ProseMirror-selectednode::after, .interior-doc .is-page-break.ProseMirror-selectednode { outline: 2px solid #FF6A00; }
        .interior-doc .is-page-break { margin: 1.4em 0; border-top: 2px dashed #bbb; text-align: center; font: 600 9px/1 ui-monospace, monospace; letter-spacing: .15em; text-transform: uppercase; color: #999; padding-top: 4px; }
        .interior-doc .wh-mark { cursor: pointer; text-decoration: underline wavy; text-decoration-thickness: 1.5px; text-underline-offset: 3px; text-decoration-skip-ink: none; }
        .interior-doc .wh-fix { text-decoration-color: #D92D20; }
        .interior-doc .wh-word { text-decoration-color: #2563EB; }
        ${wh.active ? `.interior-doc [data-wh="${wh.active}"] { background: #FFE2C7; }` : ""}
        .interior-doc .book-image.is-selected img { outline: 2px solid #FF6A00; outline-offset: 2px; }
        .interior-doc p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #aaa; float: left; height: 0; pointer-events: none; }
      `}</style>

      <header className="h-14 shrink-0 flex items-center gap-2 px-3 sm:px-4 bg-[#0D0D0D] text-white border-b border-neutral-800">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 mr-1" title="Back to SparkPrep"><LogoMark size={28} /></Link>
        <div className="mr-auto min-w-0">
          <div className="font-display font-black text-base leading-none tracking-tight">Interior Studio</div>
          <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500 truncate">
            {specs.trim_size} · {platformName}{preview ? ` · ${preview.page_count} pages` : ""} · {words.toLocaleString()} words
          </div>
        </div>
        <input ref={pictureInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/tiff" multiple className="hidden" onChange={onPicture} data-testid="interior-picture-input" />
        <input ref={fileInput} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={onImport} data-testid="interior-import-input" />
        <button onClick={() => fileInput.current?.click()} className="h-9 px-2.5 flex items-center gap-1.5 border border-neutral-700 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase" title="Bring in a Word file (.docx)" data-testid="interior-import"><FileUp className="w-4 h-4" /><span className="hidden sm:inline">Import Word</span></button>
        <Link to="/cover-studio" className="hidden md:flex h-9 px-2.5 items-center gap-1.5 border border-neutral-700 hover:border-white font-mono-spec text-[10px] tracking-widest uppercase" title="Design the cover"><BookOpen className="w-4 h-4" /> Cover Studio</Link>
        <button onClick={() => setShowSend(true)} className="h-9 px-3 flex items-center gap-1.5 btn-gold font-mono-spec text-[10px] tracking-widest uppercase btn-industrial" data-testid="interior-send"><Send className="w-4 h-4" /><span className="hidden md:inline">Send to my book</span></button>
      </header>

      {/* Small screens: switch between writing and the printed pages */}
      <div className="lg:hidden shrink-0 grid grid-cols-2 border-b border-neutral-200 bg-white">
        {[["write", "Write", PenLine], ["pages", "Pages", Eye]].map(([k, l, I]) => (
          <button key={k} onClick={() => setMobileView(k)} className={`py-2 text-xs font-mono-spec uppercase tracking-widest flex items-center justify-center gap-1.5 ${mobileView === k ? "border-b-2 border-[#FF6A00] text-black" : "text-neutral-500"}`} data-testid={`interior-mobile-${k}`}><I className="w-4 h-4" /> {l}</button>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Settings */}
        <aside className="hidden xl:flex w-[300px] shrink-0 border-r border-neutral-200 bg-white min-h-0">
          <nav className="flex flex-col shrink-0 border-r border-neutral-200 bg-[#FAFAF8]">
            {TABS.map(([k, label, I]) => (
              <button key={k} onClick={() => setTab(k)} className={`w-[64px] h-[60px] flex flex-col items-center justify-center gap-1 text-[9px] font-mono-spec uppercase tracking-wide ${(tab || "details") === k ? "bg-white text-black border-l-2 border-[#FF6A00]" : "text-neutral-500 hover:text-black"}`} data-testid={`interior-tab-${k}`}>
                <I className="w-5 h-5" />{label}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 overflow-y-auto p-3">
            <div className="font-display font-bold text-lg mb-2">{(TABS.find(([k]) => k === tab) || TABS[0])[1]}</div>
            {(tab || "details") === "details" && <DetailsPanel details={details} setDetails={setDetails} />}
            {tab === "style" && <StylePanel styles={styles} value={styleKey} onPick={setStyleKey} />}
            {tab === "size" && <SizePanel lists={lists} specs={specs} setSpecs={setSpecs} linkedBook={linkedBook} books={books} onLinkBook={onLinkBook} />}
            {tab === "help" && <WritingHelpPanel wh={wh} spellcheck={spellcheck} setSpellcheck={setSpellcheck} />}
          </div>
        </aside>

        {/* Writing */}
        <main className={`flex-1 min-w-0 flex flex-col bg-white ${mobileView === "write" ? "" : "hidden lg:flex"}`}>
          <Toolbar editor={editor} onAddPicture={() => pictureInput.current?.click()} />
          <div className="flex-1 min-h-0 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) editor?.commands.focus("end"); }}>
            {/* Below xl the settings live above the page in a compact strip */}
            <div className="xl:hidden px-4 pt-3 flex gap-2 overflow-x-auto">
              {TABS.map(([k, label, I]) => (
                <button key={k} onClick={() => setTab(tab === k ? null : k)} className={`shrink-0 px-3 py-1.5 border text-xs flex items-center gap-1.5 ${tab === k ? "border-black bg-[#FFF8EF]" : "border-neutral-300"}`}><I className="w-3.5 h-3.5" /> {label}</button>
              ))}
            </div>
            {tab && (
              <div className="xl:hidden px-4 pt-3 max-w-[640px] mx-auto">
                {tab === "details" && <DetailsPanel details={details} setDetails={setDetails} />}
                {tab === "style" && <StylePanel styles={styles} value={styleKey} onPick={setStyleKey} />}
                {tab === "size" && <SizePanel lists={lists} specs={specs} setSpecs={setSpecs} linkedBook={linkedBook} books={books} onLinkBook={onLinkBook} />}
                {tab === "help" && <WritingHelpPanel wh={wh} spellcheck={spellcheck} setSpellcheck={setSpellcheck} />}
              </div>
            )}
            <div className="max-w-[680px] mx-auto px-6 sm:px-10 py-8" style={docStyle}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </main>

        {/* Printed pages */}
        <aside className={`lg:w-[400px] xl:w-[440px] shrink-0 border-l border-neutral-200 bg-[#EFEEEA] min-h-0 ${mobileView === "pages" ? "flex-1" : "hidden lg:block"}`}>
          <PagesPreview preview={preview} busy={previewBusy} error={previewError} trim={trim} />
        </aside>
      </div>

      <SendInteriorDialog open={showSend} onOpenChange={setShowSend} buildBody={buildBody} specs={{ ...specs, platformName }}
        details={details} linkedBook={linkedBook} onSent={setLinkedBook} pageCount={preview?.page_count} />
    </div>
  );
}
