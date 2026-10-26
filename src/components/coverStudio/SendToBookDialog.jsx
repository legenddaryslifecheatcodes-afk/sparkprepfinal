import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api, fmtErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { specsOfProject } from "@/components/coverStudio/SpecsPanel";
import { toast } from "sonner";
import { BookPlus, Send } from "lucide-react";

const sameSpecs = (a, b) => ["platform", "binding", "trim_size", "paper_type"].every((k) => a[k] === b[k])
  && Number(a.page_count) === Number(b.page_count)
  && Number(a.spine_width_override || 0) === Number(b.spine_width_override || 0);

async function dataUrlToBlob(url) {
  const res = await fetch(url);
  return res.blob();
}

// Puts the finished cover into a SparkPrep book, where the Editor checks it against the printer's rules,
// fixes what it can and exports the print-ready file.
export default function SendToBookDialog({ open, onOpenChange, engine, specs, words, linkedBook, onUseSpecs, problems, design }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [books, setBooks] = useState(null);
  const [pick, setPick] = useState(linkedBook?.id || "new");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!open || !user) return;
    setPick(linkedBook?.id || "new");
    api.get("/projects").then(({ data }) => setBooks(data.projects || [])).catch(() => setBooks([]));
  }, [open, user, linkedBook]);

  const target = books?.find((b) => b.id === pick);
  const mismatch = target && !sameSpecs(specsOfProject(target), specs);

  const send = async () => {
    setBusy("Drawing your cover at print size (300 DPI)…");
    try {
      let id = target?.id;
      if (!id) {
        setBusy("Creating your book…");
        const { data } = await api.post("/projects", {
          name: words.title?.trim() || "Untitled Book",
          platform: specs.platform, trim_size: specs.trim_size, paper_type: specs.paper_type,
          binding: specs.binding, page_count: Number(specs.page_count), project_type: "combined",
        });
        id = data.id;
      }
      setBusy("Drawing your cover at print size (300 DPI)…");
      const { url } = await engine.render({ dpi: 300, format: "jpeg", quality: 0.95 });
      const blob = await dataUrlToBlob(url);
      const fd = new FormData();
      fd.append("file", blob, `${(words.title || "cover").replace(/[^\w-]+/g, "_").slice(0, 40) || "cover"}_cover.jpg`);
      fd.append("source", "cover_studio");
      setBusy("Sending it to your book…");
      await api.post(`/projects/${id}/slot-upload/full_wrap`, fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 300000 });
      // Keep the editable design with the book too, so it can be reopened anywhere and re-fitted to a new spine.
      // The cover itself is already in the book, so a failure here only costs that convenience.
      const d = design?.();
      if (d) {
        setBusy("Saving your design with the book…");
        await api.put(`/projects/${id}/cover-studio`, d, { timeout: 120000 }).catch(() => {});
      }
      toast.success("Your cover is in your book. SparkPrep is checking it against the printer's rules now.");
      onOpenChange(false);
      nav(`/editor/${id}`);
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="studio-send-dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl tracking-tighter">Send to my SparkPrep book</DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            Your cover goes straight into the book as one full-wrap file (back, spine and front). SparkPrep then checks it against the printer's rules and gets it print-ready.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="text-sm mt-2">
            <p className="mb-4">Log in or create a free account to put this cover in a book. Your design stays saved in this browser while you do.</p>
            <div className="flex gap-2">
              <Link to="/login?next=/cover-studio" className="px-4 py-2.5 bg-black text-white font-mono-spec text-xs tracking-widest uppercase">Log in</Link>
              <Link to="/register?next=/cover-studio" className="px-4 py-2.5 btn-gold font-mono-spec text-xs tracking-widest uppercase">Create free account</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            <button onClick={() => setPick("new")} className={`w-full text-left p-3 border flex items-center gap-3 ${pick === "new" ? "border-black bg-[#FFF8EF]" : "border-neutral-300"}`} data-testid="studio-send-new">
              <BookPlus className="w-5 h-5" />
              <div><div className="font-semibold text-sm">A new book</div><div className="text-[11px] text-neutral-600">Named "{words.title || "Untitled Book"}", with the specs you designed for.</div></div>
            </button>
            {(books || []).map((b) => (
              <button key={b.id} onClick={() => setPick(b.id)} className={`w-full text-left p-3 border ${pick === b.id ? "border-black bg-[#FFF8EF]" : "border-neutral-300"}`} data-testid={`studio-send-book-${b.id}`}>
                <div className="font-semibold text-sm">{b.name}</div>
                <div className="text-[11px] text-neutral-600">{b.trim_size} · {b.binding?.replace(/_/g, " ")} · {b.page_count} pages · {b.platform}</div>
              </button>
            ))}
            {books === null && <div className="text-xs text-neutral-500">Loading your books…</div>}
            {mismatch && (
              <div className="p-3 pill-warn text-xs" data-testid="studio-send-mismatch">
                This book is a different size from the cover you designed. Switch your design to its size first, then send it. Your design moves with it.
                <button onClick={() => onUseSpecs(target)} className="block mt-2 px-3 py-1.5 bg-black text-white font-mono-spec text-[10px] tracking-widest uppercase">Use this book's size</button>
              </div>
            )}
            {problems?.length > 0 && (
              <div className="p-3 pill-warn text-xs">
                {problems.length === 1 ? "One thing" : `${problems.length} things`} on your cover may get cut off or rejected. You can still send it; SparkPrep's checks will show them too.
              </div>
            )}
            <button onClick={send} disabled={!!busy || mismatch} className="mt-2 w-full py-3 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-50" data-testid="studio-send-go" data-next-step="Click to send">
              <Send className="w-4 h-4" /> {busy || "Send my cover"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
