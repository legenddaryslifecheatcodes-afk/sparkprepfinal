import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePricing, money } from "@/lib/pricing";
import { toast } from "sonner";
import { BookOpen, Timer, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TitleLockNotice from "@/components/TitleLockNotice";

function remaining(sec) {
  const s = Math.max(0, Math.floor(sec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

// Book-pass model only: each book gets a 7-day window of unlimited exports, started here.
// Hidden when the server isn't on the book model (the endpoint 404s).
// creditAuditId: this project's paid "See My Results" audit, credited toward the book at checkout.
// title/author: the book's title and author name, shown in the lock warning before Start.
export default function BookPassBar({ projectId, bookRequiredAt, onStarted, creditAuditId, title, author }) {
  const [book, setBook] = useState(null);
  const [starting, setStarting] = useState(false);
  const [left, setLeft] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [namesOk, setNamesOk] = useState(false);
  const { refreshUser } = useAuth();
  const pricing = usePricing();

  const fetchBook = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/book`);
      setBook(data);
      setLeft(data.seconds_left ?? null);
    } catch {
      setBook(false);
    }
  }, [projectId]);

  useEffect(() => { fetchBook(); }, [fetchBook, bookRequiredAt]);

  useEffect(() => {
    if (left == null) return undefined;
    const t = setInterval(() => setLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearInterval(t);
  }, [left == null]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setStarting(true);
    try {
      await api.post(`/projects/${projectId}/activate-book`);
      setConfirming(false);
      toast.success(`Book started — unlimited exports for ${book.window_days} days.`);
      await fetchBook();
      if (refreshUser) refreshUser();
      if (onStarted) onStarted();
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
    } finally {
      setStarting(false);
    }
  };

  if (!book) return null;

  if (book.active && left != null && left > 0) {
    return (
      <div className="border border-emerald-700/60 bg-emerald-950/30 px-4 py-3 flex items-center gap-3 flex-wrap" data-testid="book-active">
        <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
        <div className="text-sm text-emerald-200">
          <span className="font-bold text-white">Book active</span> — unlimited exports · <span className="font-mono-spec tabular-nums">{remaining(left)}</span>
        </div>
      </div>
    );
  }

  if (book.available_books > 0) {
    return (
      <div className="border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-3 flex items-center justify-between gap-3 flex-wrap" data-testid="book-ready">
        <div className="flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="text-sm text-neutral-200">
            <span className="font-bold text-white">You have {book.available_books} book{book.available_books === 1 ? "" : "s"} ready.</span>{" "}
            Start this one to unlock {book.window_days} days of unlimited exports and the SparkPrep Standard Check of every page.
            <div className="text-[11px] text-neutral-400 mt-0.5">The {book.window_days}-day clock starts when you press Start.</div>
          </div>
        </div>
        <button onClick={() => { setNamesOk(false); setConfirming(true); }} disabled={starting} className="px-4 py-2 btn-gold font-mono-spec text-[10px] tracking-widest uppercase btn-industrial disabled:opacity-50 flex items-center gap-1.5" data-testid="start-book-btn">
          {starting && <Loader2 className="w-3 h-3 animate-spin" />} Start This Book
        </button>
        <Dialog open={confirming} onOpenChange={setConfirming}>
          <DialogContent className="max-w-md" data-testid="start-book-confirm">
            <DialogHeader>
              <DialogTitle className="font-display font-black text-2xl tracking-tighter">Before you start this book</DialogTitle>
              <DialogDescription className="text-sm text-neutral-600">
                Starting uses one book and opens {book.window_days} days of unlimited exports.
              </DialogDescription>
            </DialogHeader>
            <TitleLockNotice title={title} author={author} checked={namesOk} onChange={setNamesOk} testid="start-book-names" />
            <p className="text-[11px] text-neutral-500">Wrong title or author name? Close this and fix them in your book's details first.</p>
            <button onClick={start} disabled={starting || !namesOk} className="w-full py-3 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial disabled:opacity-50 flex items-center justify-center gap-1.5" data-testid="start-book-go" data-next-step="Click to start">
              {starting && <Loader2 className="w-3 h-3 animate-spin" />} Start This Book
            </button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const sub = pricing?.plans?.find((p) => p.id === "book_1");
  return (
    <div className="border border-neutral-700 bg-neutral-900/60 px-4 py-3 flex items-center justify-between gap-3 flex-wrap" data-testid="book-none">
      <div className="flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div className="text-sm text-neutral-300">
          {book.active ? "This book's export window has ended. " : ""}
          Let SparkPrep fix everything and hand you print-ready files — get a book for <span className="text-white font-semibold">{money(book.book_price_cents)}</span> one-time
          {sub && <> or <span className="text-white font-semibold">{money(sub.price_cents)}/month</span></>}. Cover, interior, or both — same price.
          {creditAuditId && <> Your audit fee is credited.</>}
        </div>
      </div>
      <Link to={creditAuditId ? `/pricing?audit=${creditAuditId}` : "/pricing"} className="px-4 py-2 bg-white text-black font-mono-spec text-[10px] tracking-widest uppercase hover:bg-neutral-200 btn-industrial" data-testid="get-book-btn">
        Get A Book
      </Link>
    </div>
  );
}
