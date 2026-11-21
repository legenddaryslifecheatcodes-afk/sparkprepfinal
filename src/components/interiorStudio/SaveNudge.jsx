import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Save, X } from "lucide-react";

// "Don't lose your book" reminder (Trey, 2026-11-20). Until the writing is saved to a SparkPrep book it lives
// only in this browser, so clearing it or switching devices loses it. Three reminders at most, ever, per
// browser: the first after a few minutes of real writing, the second 10 minutes after the first, the last
// 30 minutes after that. A small card in the bottom-left corner (the assistant chat owns the right), never a
// blocking pop-up.
const KEY = "sp_interior_save_nudges";
const FIRST_AFTER_MS = 3 * 60 * 1000;
const GAPS_MS = [10 * 60 * 1000, 30 * 60 * 1000]; // wait after reminder 1, then after reminder 2
const MIN_WORDS = 50;
const CHECK_MS = 20 * 1000;

const MESSAGES = [
  { title: "Don't lose your book", body: "Right now your writing is only saved in this web browser. Save it free so it's safe, even if you switch devices." },
  { title: "Quick reminder: save your book", body: "Your book still lives only in this browser. Clearing it or switching devices would erase it. Saving is free and takes a minute." },
  { title: "Last reminder, promise", body: "We'll stop asking after this. Save your book free so all this work is safe." },
];

function readState() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null") || { count: 0, last: 0 }; } catch { return { count: 0, last: 0 }; }
}
function writeState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private window: reminders just for this visit */ }
}

export default function SaveNudge({ saved, words, loggedIn, onSave }) {
  const [shown, setShown] = useState(null); // index into MESSAGES while a reminder is on screen
  const [openedAt] = useState(() => Date.now());

  useEffect(() => {
    if (saved || shown !== null) return undefined;
    const tick = () => {
      const st = readState();
      if (st.count >= MESSAGES.length || words < MIN_WORDS) return;
      const now = Date.now();
      const due = st.count === 0
        ? now - openedAt >= FIRST_AFTER_MS
        : now - st.last >= GAPS_MS[st.count - 1];
      if (!due) return;
      writeState({ count: st.count + 1, last: now });
      setShown(st.count);
    };
    tick();
    const t = setInterval(tick, CHECK_MS);
    return () => clearInterval(t);
  }, [saved, shown, words, openedAt]);

  // Saved to a book while a reminder was up: put it away.
  useEffect(() => { if (saved) setShown(null); }, [saved]);

  if (shown === null) return null;
  const m = MESSAGES[shown];
  const close = () => {
    writeState({ ...readState(), last: Date.now() }); // the next gap starts when they wave it off
    setShown(null);
  };
  const btn = "px-4 py-2.5 btn-gold font-mono-spec text-[11px] tracking-widest uppercase btn-industrial flex items-center gap-1.5";

  return (
    <div role="status" className="fixed z-40 bottom-3 left-3 right-24 sm:right-auto sm:left-4 sm:bottom-4 sm:w-[360px] bg-white border border-neutral-300 shadow-xl p-4" data-testid="interior-save-nudge">
      <button onClick={close} className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-black" aria-label="Not now" data-testid="interior-save-nudge-close"><X className="w-4 h-4" /></button>
      <div className="font-display font-bold text-base pr-6">{m.title}</div>
      <p className="text-[13px] text-neutral-700 mt-1">{m.body}</p>
      <div className="flex items-center gap-3 mt-3">
        {loggedIn ? (
          <button onClick={() => { setShown(null); onSave(); }} className={btn} data-testid="interior-save-nudge-go"><Save className="w-4 h-4" /> Save my book</button>
        ) : (
          <Link to="/register?next=/interior-studio" className={btn} data-testid="interior-save-nudge-go"><Save className="w-4 h-4" /> Save it free</Link>
        )}
        <button onClick={close} className="text-xs text-neutral-500 hover:text-black underline">Not now</button>
      </div>
    </div>
  );
}
