import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { loadSpecLists, fmtIn } from "@/lib/coverStudio/specs";

const Lbl = ({ children }) => <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{children}</div>;

function Pick({ label, value, options, onChange, testid }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9" data-testid={testid}><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export const specsOfProject = (p) => ({
  platform: p.platform, binding: p.binding, trim_size: p.trim_size, paper_type: p.paper_type,
  page_count: p.page_count, spine_width_override: p.spine_width_override || null,
});

export default function SpecsPanel({ specs, setSpecs, geo, linkedBook, onLinkBook }) {
  const { user } = useAuth();
  const [lists, setLists] = useState(null);
  const [books, setBooks] = useState(null);
  const [pages, setPages] = useState(String(specs.page_count));

  useEffect(() => { loadSpecLists().then(setLists); }, []);
  useEffect(() => { setPages(String(specs.page_count)); }, [specs.page_count]);
  useEffect(() => {
    if (!user) return;
    api.get("/projects").then(({ data }) => setBooks(data.projects || [])).catch(() => setBooks([]));
  }, [user]);

  if (!lists) return <div className="text-xs text-neutral-500">Loading book sizes…</div>;
  const set = (k, v) => setSpecs({ ...specs, [k]: v, spine_width_override: k === "page_count" || k === "paper_type" ? null : specs.spine_width_override });
  const fc = geo?.full_cover;

  return (
    <div className="space-y-3" data-testid="studio-specs">
      {user && books && books.length > 0 && (
        <div className="p-3 bg-[#FFF8EF] border border-[#F3D9B8]">
          <Lbl>Already have a book in SparkPrep?</Lbl>
          <Select value={linkedBook?.id || ""} onValueChange={(id) => { const b = books.find((x) => x.id === id); if (b) onLinkBook(b); }}>
            <SelectTrigger className="h-9 bg-white" data-testid="studio-link-book"><SelectValue placeholder="Use my book's exact specs" /></SelectTrigger>
            <SelectContent>
              {books.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-neutral-600 mt-1.5">Your cover is sized to that book, and "Send to my book" puts it straight in.</p>
        </div>
      )}
      <p className="text-[11px] text-neutral-600">
        Don't know these yet? No problem. Start with the defaults (6" x 9" paperback, 200 pages) and change them any time. Your design moves with the new size.
      </p>
      <Pick label="Printer" value={specs.platform} onChange={(v) => set("platform", v)} testid="studio-spec-platform"
        options={Object.entries(lists.platforms).map(([k, v]) => [k, v.name])} />
      <Pick label="Binding" value={specs.binding} onChange={(v) => set("binding", v)} testid="studio-spec-binding"
        options={Object.entries(lists.binding_types).map(([k, v]) => [k, v.label])} />
      <Pick label="Trim size" value={specs.trim_size} onChange={(v) => set("trim_size", v)} testid="studio-spec-trim"
        options={Object.entries(lists.trim_sizes).map(([k, v]) => [k, v.label])} />
      <Pick label="Paper" value={specs.paper_type} onChange={(v) => set("paper_type", v)} testid="studio-spec-paper"
        options={Object.entries(lists.paper_types).map(([k, v]) => [k, v.label])} />
      <div>
        <Lbl>Page count</Lbl>
        <Input type="number" min={2} max={1200} value={pages} className="h-9" data-testid="studio-spec-pages"
          onChange={(e) => setPages(e.target.value)}
          onBlur={() => { const n = Math.max(2, Math.min(1200, parseInt(pages, 10) || 200)); setPages(String(n)); if (n !== specs.page_count) set("page_count", n); }}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
      </div>

      {fc && (
        <div className="mt-2 border border-neutral-200 bg-white p-3 text-xs space-y-1" data-testid="studio-spec-summary">
          <div className="flex justify-between"><span className="text-neutral-500">Full cover file</span><b>{fmtIn(fc.total_width)} x {fmtIn(fc.total_height)}</b></div>
          <div className="flex justify-between"><span className="text-neutral-500">Spine width</span><b>{fmtIn(fc.spine_width)}{geo.spine_is_estimate ? " (estimate)" : ""}</b></div>
          <div className="flex justify-between"><span className="text-neutral-500">Bleed</span><b>{fmtIn(fc.bleed)}</b></div>
          <div className="flex justify-between"><span className="text-neutral-500">Safe margin</span><b>{fmtIn(geo.safe_margin)}</b></div>
          {fc.flap_width > 0 && <div className="flex justify-between"><span className="text-neutral-500">Flaps</span><b>{fmtIn(fc.flap_width)} each</b></div>}
          <div className="flex justify-between"><span className="text-neutral-500">Print size</span><b>{Math.round(fc.total_width * 300)} x {Math.round(fc.total_height * 300)} px at 300 DPI</b></div>
          {geo.spine_text_allowed === false && <p className="text-amber-700 pt-1">At this page count the spine is too thin for words, so templates leave it plain.</p>}
          {geo.spine_is_estimate && <p className="text-neutral-500 pt-1">Hardcover spines come from the printer's own template. If you have it, SparkPrep's Editor can read your exact number.</p>}
          {geo.offline && <p className="text-amber-700 pt-1">Couldn't reach SparkPrep's spec calculator, so this is a paperback estimate. Check it before printing.</p>}
        </div>
      )}
    </div>
  );
}
