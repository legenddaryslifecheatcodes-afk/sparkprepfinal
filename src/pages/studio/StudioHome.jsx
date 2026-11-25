import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FolderOpen, Target, ListChecks, Gauge, CalendarDays, LayoutTemplate, BookOpenText, History, Check, ArrowRight, X } from "lucide-react";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { usePricing, money } from "@/lib/pricing";
import { studioCall, fmtBytes, fmtDay } from "@/lib/studio";
import StudioLayout from "./StudioLayout";

export default function StudioHome() {
  const [status, setStatus] = useState(null);
  const [books, setBooks] = useState(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const load = async () => {
    try {
      const [{ data: s }, { data: b }] = await Promise.all([api.get("/studio/status"), api.get("/studio/books")]);
      setStatus(s); setBooks(b.books);
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
      setStatus({ member: false }); setBooks([]);
    }
  };
  useEffect(() => { load(); }, []);

  if (!status) return <StudioLayout member={false}><div className="st-muted py-20 text-center">Opening your studio…</div></StudioLayout>;
  if (!status.member && !books?.length) return <StudioLayout member={false}><JoinInvite /></StudioLayout>;

  const used = status.storage?.used_bytes || 0, quota = status.storage?.quota_bytes || 1;
  return (
    <StudioLayout>
      {!status.member && (
        <div className="st-card p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" data-testid="studio-lapsed">
          <div>
            <div className="st-serif text-lg">Your membership has ended</div>
            <p className="st-muted text-sm mt-1">Your books and files are safe. You can open and download them any time. Rejoin to keep working on them.</p>
          </div>
          <JoinButton />
        </div>
      )}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="st-eyebrow">My Book Library</div>
          <h2 className="st-serif text-3xl mt-2">{books.length ? `${books.length} book${books.length === 1 ? "" : "s"} in progress` : "Start your first book"}</h2>
        </div>
        {status.member && (
          <button className="st-btn" onClick={() => setOpen(true)} data-testid="studio-new-book" data-next-step="Click to start" data-next-step-priority="2">
            <Plus className="w-4 h-4" /> New book
          </button>
        )}
      </section>

      {books.length === 0 ? (
        <div className="st-card mt-8 p-8 sm:p-12 text-center">
          <FolderOpen className="w-10 h-10 mx-auto text-[var(--st-gold)]" />
          <div className="st-serif text-2xl mt-4">Every book gets its own folder</div>
          <p className="st-muted mt-2 max-w-md mx-auto">Drafts with full version history, covers, research, notes, goals, a publishing checklist and a launch plan.</p>
          <button className="st-btn mt-6" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Create my first book</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {books.map((b) => <BookCard key={b.id} b={b} />)}
        </div>
      )}

      <section className="grid sm:grid-cols-3 gap-5 mt-10">
        <Link to="/studio/templates" className="st-card p-6 block">
          <LayoutTemplate className="w-6 h-6 text-[var(--st-gold)]" />
          <div className="st-serif text-xl mt-3">Author templates</div>
          <p className="st-muted text-sm mt-1">Outlines, character sheets, book descriptions, launch posts and more.</p>
        </Link>
        <Link to="/studio/library" className="st-card p-6 block">
          <BookOpenText className="w-6 h-6 text-[var(--st-gold)]" />
          <div className="st-serif text-xl mt-3">Members Library</div>
          <p className="st-muted text-sm mt-1">Articles on marketing, launching and publishing that aren't on the public site.</p>
        </Link>
        <div className="st-card p-6">
          <History className="w-6 h-6 text-[var(--st-gold)]" />
          <div className="st-serif text-xl mt-3">Your storage</div>
          <div className="st-bar mt-4"><span style={{ width: `${Math.min(100, (100 * used) / quota)}%` }} /></div>
          <p className="st-muted text-sm mt-2">{fmtBytes(used)} of {fmtBytes(quota)} used. Every version of every file counts.</p>
        </div>
      </section>

      {open && <NewBookDialog onClose={() => setOpen(false)} onMade={(b) => nav(`/studio/book/${b.id}`)} />}
    </StudioLayout>
  );
}

function BookCard({ b }) {
  return (
    <Link to={`/studio/book/${b.id}`} className="st-card p-6 block group" data-testid={`studio-book-${b.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="st-serif text-xl leading-tight truncate">{b.title}</div>
          <div className="st-muted text-sm mt-1 truncate">{b.next_step ? `Next: ${b.next_step.label}` : "Ready to publish"}</div>
        </div>
        <ArrowRight className="w-5 h-5 st-faint group-hover:text-[var(--st-gold)] transition-colors flex-none" />
      </div>
      <Progress label="Writing" value={b.writing_progress} ivory />
      <Progress label="Publishing" value={b.publishing_progress} />
      <div className="flex flex-wrap gap-2 mt-5">
        <span className="st-pill">{b.file_count} file{b.file_count === 1 ? "" : "s"}</span>
        {b.launch_date && <span className="st-pill st-pill-gold">Launch {fmtDay(b.launch_date)}</span>}
        {b.genre && <span className="st-pill">{b.genre}</span>}
      </div>
    </Link>
  );
}

export function Progress({ label, value, ivory }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between text-[12.5px]"><span className="st-muted">{label}</span><span className="font-semibold">{value}%</span></div>
      <div className={`st-bar mt-1.5 ${ivory ? "st-bar-ivory" : ""}`}><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function NewBookDialog({ onClose, onMade }) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [target, setTarget] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/projects").then(({ data }) => setProjects(data.projects || [])).catch(() => {}); }, []);
  const save = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const b = await studioCall(() => api.post("/studio/books", {
      title: title.trim(), genre: genre.trim() || null, target_words: target ? Number(target) : null, project_id: projectId || null,
    }), "Your book folder is ready");
    setBusy(false);
    if (b) onMade(b);
  };
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="st-card w-full sm:max-w-lg p-6 sm:p-8 rounded-b-none sm:rounded-[18px]" style={{ background: "#14110d" }}>
        <div className="flex justify-between items-start">
          <div><div className="st-eyebrow">New book</div><div className="st-serif text-2xl mt-2">Start a book folder</div></div>
          <button type="button" onClick={onClose} aria-label="Close" className="st-muted"><X className="w-5 h-5" /></button>
        </div>
        <label className="st-label mt-6">Book title</label>
        <input className="st-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Road to Success" required data-testid="studio-new-title" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div><label className="st-label">Kind of book</label><input className="st-input" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Memoir, children's…" /></div>
          <div><label className="st-label">Word goal (optional)</label><input className="st-input" type="number" min="0" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="60000" /></div>
        </div>
        {projects.length > 0 && (
          <>
            <label className="st-label mt-4">Link a book you already started in Legenddary SparkPrep (optional)</label>
            <select className="st-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Don't link</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <p className="st-faint text-xs mt-1.5">Linking fills in your readiness steps from the files and checks already in that book.</p>
          </>
        )}
        <button className="st-btn w-full mt-7" disabled={busy || !title.trim()} data-next-step="Click to create" data-testid="studio-new-save">
          {busy ? "Creating…" : "Create book folder"}
        </button>
      </form>
    </div>
  );
}

function JoinButton({ big }) {
  const pricing = usePricing();
  const [busy, setBusy] = useState(false);
  const price = pricing?.membership?.price_cents;
  const join = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/payments/subscribe", { plan: "member", origin_url: window.location.origin });
      window.location.href = data.checkout_url;
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
      setBusy(false);
    }
  };
  return (
    <button className={`st-btn ${big ? "px-8 py-4 text-base" : ""}`} onClick={join} disabled={busy} data-next-step="Click to join" data-testid="studio-join">
      {busy ? "Opening checkout…" : price != null ? `Become a member · ${money(price)}/month` : "Become a member"}
    </button>
  );
}

const PERKS = [
  [FolderOpen, "A folder for every book", "Drafts, covers, inside pages, research, publishing info and final versions, kept safe online."],
  [History, "Version history", "Every upload is saved as its own version. Go back to an earlier draft any time."],
  [Target, "Word goals and streaks", "Daily and weekly goals, words written, chapters done and a writing streak."],
  [Gauge, "Two kinds of progress", "Writing progress and publishing progress, side by side, so you always know how close you are."],
  [ListChecks, "Publishing checklist", "Every step from finished manuscript to published book, in plain English."],
  [CalendarDays, "Launch planner", "Pick a launch date and get a full plan with real dates for every task."],
  [LayoutTemplate, "Author templates", "Outlines, character sheets, proposals, bios, book descriptions and launch posts."],
  [BookOpenText, "Members Library", "New articles 3 times a week on marketing, launching and publishing, only for members."],
];

function JoinInvite() {
  const pricing = usePricing();
  const bookPrice = pricing?.membership?.book_price_cents, fullPrice = pricing?.book?.price_cents;
  return (
    <div data-testid="studio-invite">
      <section className="st-card p-7 sm:p-12 text-center relative overflow-hidden">
        <div className="st-eyebrow">Your author headquarters</div>
        <h2 className="st-serif text-3xl sm:text-5xl mt-4 leading-tight">Everything your book needs,<br className="hidden sm:block" /> <span className="st-gold-text">in one studio.</span></h2>
        <p className="st-muted mt-4 max-w-xl mx-auto">Keep every book organized from the first draft to launch day. Included with the Legenddary SparkPrep membership.</p>
        <div className="mt-8"><JoinButton big /></div>
        {bookPrice != null && fullPrice != null && (
          <p className="st-faint text-sm mt-4">Members also pay {money(bookPrice)} per book instead of {money(fullPrice)}. Cancel any time.</p>
        )}
      </section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {PERKS.map(([Icon, title, text]) => (
          <div key={title} className="st-card p-6">
            <Icon className="w-6 h-6 text-[var(--st-gold)]" />
            <div className="st-serif text-lg mt-3">{title}</div>
            <p className="st-muted text-sm mt-1.5 leading-relaxed">{text}</p>
          </div>
        ))}
      </section>
      <p className="st-faint text-xs mt-6 flex items-center gap-2 justify-center"><Check className="w-3.5 h-3.5" /> If you ever leave, your files stay yours to download.</p>
    </div>
  );
}
