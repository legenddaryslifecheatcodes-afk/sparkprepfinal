import { AlertTriangle, Lock } from "lucide-react";

// The hard warning before a book reaches SparkPrep (owner's rule, 2026-10-28): once a book is started, its title and
// author name are locked. Shown in both studios' "Send to my book", New Book and "Start This Book". `lock` = the
// book's title_lock when it's already locked; otherwise the author must tick the box to go on.
// confirm=false shows the warning without the tick box (New Book: nothing is paid yet, the box comes at Start).
export default function TitleLockNotice({ title, author, lock, checked, onChange, confirm = true, dark = false, testid = "title-lock-notice" }) {
  const box = dark ? "border-red-500/70 bg-red-950/40 text-red-100" : "border-red-600 bg-red-50 text-red-900";
  const strong = dark ? "text-white" : "text-black";

  if (lock) {
    return (
      <div className={`p-3 border-2 text-xs ${box}`} data-testid={`${testid}-locked`}>
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-[11px]"><Lock className="w-3.5 h-3.5" /> Title and author name are locked</div>
        <p className="mt-1">
          This book is locked to <span className={`font-semibold ${strong}`}>"{lock.title}"</span>
          {lock.author ? <> by <span className={`font-semibold ${strong}`}>{lock.author}</span></> : null}.
          Your cover must show this exact title and author name, or the export will be stopped.
        </p>
      </div>
    );
  }

  return (
    <div className={`p-3 border-2 text-xs ${box}`} data-testid={testid}>
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-[11px]"><AlertTriangle className="w-3.5 h-3.5" /> Check your title and author name now</div>
      <p className="mt-1">
        Once your book is started in SparkPrep, the title and author name are <span className="font-bold">locked and can't be changed</span>.
      </p>
      <div className="mt-2">
        Title: <span className={`font-semibold ${strong}`}>{title?.trim() || "(no title yet)"}</span>
        {" · "}Author: <span className={`font-semibold ${strong}`}>{author?.trim() || "(no author name yet)"}</span>
      </div>
      {confirm && (
        <label className="mt-2 flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" data-testid={`${testid}-confirm`} />
          <span>I've checked the spelling. My title and author name are final.</span>
        </label>
      )}
    </div>
  );
}
