import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api, fmtErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { BookPlus, Send } from "lucide-react";
import TitleLockNotice from "@/components/TitleLockNotice";

// Typesets the book at print quality and puts it in a SparkPrep book as its interior, where the usual checks
// run and the Editor takes it from there (cover, fixes, export).
export default function SendInteriorDialog({ open, onOpenChange, buildBody, specs, details, linkedBook, onSent, pageCount }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [books, setBooks] = useState(null);
  const [pick, setPick] = useState(linkedBook?.id || "new");
  const [busy, setBusy] = useState(null);
  const [namesOk, setNamesOk] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setPick(linkedBook?.id || "new");
    setNamesOk(false);
    api.get("/projects").then(({ data }) => setBooks(data.projects || [])).catch(() => setBooks([]));
  }, [open, user, linkedBook]);

  const target = books?.find((b) => b.id === pick);
  const differs = target && (target.platform !== specs.platform || target.trim_size !== specs.trim_size);

  const send = async () => {
    try {
      let id = target?.id;
      if (!id) {
        setBusy("Creating your book…");
        const { data } = await api.post("/projects", {
          name: details.title?.trim() || "Untitled Book", author_name: details.author?.trim() || null,
          platform: specs.platform, trim_size: specs.trim_size, paper_type: specs.paper_type || "white_50lb",
          binding: specs.binding || "paperback", page_count: Math.max(24, pageCount || 200), project_type: "combined",
        });
        id = data.id;
      }
      setBusy("Typesetting your book at print quality…");
      const { data } = await api.post(`/projects/${id}/interior-studio`, buildBody(), { timeout: 300000 });
      const pages = data.interior_studio?.page_count;
      toast.success(`Your ${pages ? `${pages}-page ` : ""}interior is in your book. SparkPrep is checking it against the printer's rules now.`);
      onSent?.({ id, name: target?.name || details.title || "Untitled Book" });
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
      <DialogContent className="max-w-lg" data-testid="interior-send-dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl tracking-tighter">Send to my SparkPrep book</DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            SparkPrep typesets your pages at full print quality and puts them in your book as its interior. Your writing is saved with the book, so you can come back here and keep editing.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="text-sm mt-2">
            <p className="mb-4">Log in or create a free account to put these pages in a book. Your writing stays saved in this browser while you do.</p>
            <div className="flex gap-2">
              <Link to="/login?next=/interior-studio" className="px-4 py-2.5 bg-black text-white font-mono-spec text-xs tracking-widest uppercase">Log in</Link>
              <Link to="/register?next=/interior-studio" className="px-4 py-2.5 btn-gold font-mono-spec text-xs tracking-widest uppercase">Create free account</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            <button onClick={() => setPick("new")} className={`w-full text-left p-3 border flex items-center gap-3 ${pick === "new" ? "border-black bg-[#FFF8EF]" : "border-neutral-300"}`} data-testid="interior-send-new">
              <BookPlus className="w-5 h-5" />
              <div><div className="font-semibold text-sm">A new book</div><div className="text-[11px] text-neutral-600">Named "{details.title || "Untitled Book"}", {specs.trim_size} for {specs.platformName || specs.platform}.</div></div>
            </button>
            {(books || []).map((b) => (
              <button key={b.id} onClick={() => setPick(b.id)} className={`w-full text-left p-3 border ${pick === b.id ? "border-black bg-[#FFF8EF]" : "border-neutral-300"}`} data-testid={`interior-send-book-${b.id}`}>
                <div className="font-semibold text-sm">{b.name}</div>
                <div className="text-[11px] text-neutral-600">{b.trim_size} · {b.binding?.replace(/_/g, " ")} · {b.platform}</div>
              </button>
            ))}
            {books === null && <div className="text-xs text-neutral-500">Loading your books…</div>}
            {differs && (
              <div className="p-3 pill-warn text-xs" data-testid="interior-send-differs">
                This book is set up as {target.trim_size} for {target.platform}, so your pages will be typeset at that size and to that printer's margins. Nothing else to do.
              </div>
            )}
            <TitleLockNotice title={details.title} author={details.author} lock={target?.title_lock} checked={namesOk} onChange={setNamesOk} testid="interior-send-names" />
            <button onClick={send} disabled={!!busy || (!target?.title_lock && !namesOk)} className="mt-2 w-full py-3 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-50" data-testid="interior-send-go" data-next-step="Click to send">
              <Send className="w-4 h-4" /> {busy || "Send my pages"}
            </button>
            <p className="text-[11px] text-neutral-500">Writing and previewing are free. The print-ready file comes with your book.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
