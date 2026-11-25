import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Copy, FilePlus2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { studioCall } from "@/lib/studio";
import { STUDIO_TEMPLATES } from "@/lib/studioTemplates";
import StudioLayout from "./StudioLayout";

export default function StudioTemplates() {
  const [books, setBooks] = useState([]);
  const [member, setMember] = useState(true);
  const [preview, setPreview] = useState(null);
  const [bookId, setBookId] = useState("");
  const nav = useNavigate();
  useEffect(() => {
    api.get("/studio/books").then(({ data }) => { setBooks(data.books); setMember(data.member); setBookId(data.books[0]?.id || ""); }).catch(() => {});
  }, []);
  if (!member) return <Navigate to="/studio" replace />;
  const groups = [...new Set(STUDIO_TEMPLATES.map((t) => t.group))];
  const addToBook = async (t) => {
    if (!bookId) { toast.error("Make a book first, then add templates to it."); nav("/studio"); return; }
    const n = await studioCall(() => api.post(`/studio/books/${bookId}/notes`, { title: t.title, body: t.body, kind: "template" }), `${t.title} added to your book`);
    if (n) nav(`/studio/book/${bookId}?tab=notes`);
  };
  const copy = async (t) => { try { await navigator.clipboard.writeText(t.body); toast.success("Copied"); } catch { toast.error("Couldn't copy on this device"); } };
  return (
    <StudioLayout>
      <div className="st-eyebrow">Author template library</div>
      <h2 className="st-serif text-3xl mt-2">Ready-to-use templates</h2>
      <p className="st-muted mt-2 max-w-2xl">Pick one and it's added to your book's notes, ready to fill in. Or copy it into your own writing app.</p>
      {books.length > 0 && (
        <div className="mt-6 max-w-sm">
          <label className="st-label">Add templates to</label>
          <select className="st-input" value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>
      )}
      {groups.map((g) => (
        <section key={g} className="mt-10">
          <div className="st-muted text-xs uppercase tracking-[0.2em] mb-4">{g}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STUDIO_TEMPLATES.filter((t) => t.group === g).map((t) => (
              <div key={t.key} className="st-card p-6 flex flex-col">
                <div className="st-serif text-xl">{t.title}</div>
                <p className="st-muted text-sm mt-2 flex-1">{t.blurb}</p>
                <div className="flex gap-2 mt-5 flex-wrap">
                  <button className="st-btn" onClick={() => addToBook(t)} data-testid={`tpl-use-${t.key}`}><FilePlus2 className="w-4 h-4" /> Use in my book</button>
                  <button className="st-btn-ghost" onClick={() => setPreview(t)}>Preview</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {preview && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={() => setPreview(null)}>
          <div className="st-card w-full sm:max-w-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto" style={{ background: "#14110d" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between"><div className="st-serif text-2xl">{preview.title}</div><button onClick={() => setPreview(null)} aria-label="Close" className="st-muted"><X className="w-5 h-5" /></button></div>
            <pre className="whitespace-pre-wrap text-[14px] leading-7 mt-5 text-[#ddd5c3] font-sans">{preview.body}</pre>
            <div className="flex gap-2 mt-6"><button className="st-btn" onClick={() => addToBook(preview)}><FilePlus2 className="w-4 h-4" /> Use in my book</button>
              <button className="st-btn-ghost" onClick={() => copy(preview)}><Copy className="w-4 h-4" /> Copy</button></div>
          </div>
        </div>
      )}
    </StudioLayout>
  );
}
