import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Check, CheckCheck, Loader2, Sparkles, SpellCheck, X } from "lucide-react";
import {
  KIND_LABELS, isFix, linesInScope, batches, pinSuggestions, showSuggestion, dropSuggestions, acceptSuggestions,
} from "@/lib/interiorStudio/writingHelp";

const Lbl = ({ children }) => <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{children}</div>;

const SCOPES = [
  ["chapter", "The chapter I'm in"],
  ["selection", "What I've selected"],
  ["book", "My whole book"],
];

// The writing-help state lives with the page (not the panel), so suggestions survive switching tabs and the
// panel can be shown in either the side bar or the small-screen strip.
export function useWritingHelp(editor, { title, genre }) {
  const { user } = useAuth();
  const [scope, setScope] = useState("chapter");
  const [list, setList] = useState([]);
  const [status, setStatus] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [active, setActive] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const stop = useRef(false);
  const runId = useRef(0);

  const run = async (mode) => {
    if (!editor || status) return;
    if (!user) { setBlocked("login"); return; }
    const lines = linesInScope(editor, scope);
    if (!lines.length) {
      toast.error(scope === "selection" ? "Select the words you want checked first." : "There's no writing here to check yet.");
      return;
    }
    dropSuggestions(editor);
    setList([]);
    setActive(null);
    setBlocked(null);
    setLastRun(null);
    stop.current = false;
    const id = ++runId.current;
    const groups = batches(lines);
    let found = 0;
    for (let g = 0; g < groups.length; g += 1) {
      if (stop.current) break;
      setStatus(groups.length > 1 ? `Checking part ${g + 1} of ${groups.length}…` : "Reading your writing…");
      try {
        const { data } = await api.post("/ai/writing-help", {
          mode, title: title || null, genre: genre || null,
          paragraphs: groups[g].map((b) => ({ id: b.n, text: b.text })),
        }, { timeout: 120000 });
        if (id !== runId.current) return;
        const pinned = pinSuggestions(editor, data.suggestions || [], `${id}-${g}`);
        found += pinned.length;
        setList((l) => [...l, ...pinned]);
      } catch (e) {
        const s = e?.response?.status;
        if (s === 401) setBlocked("login");
        else if (s === 402) setBlocked("book");
        else toast.error(fmtErr(e?.response?.data?.detail) || "Couldn't reach the AI writing helper. Try again shortly.");
        break;
      }
    }
    if (id !== runId.current) return;
    setStatus(null);
    setLastRun({ mode, found });
  };

  const accept = (items) => {
    const done = acceptSuggestions(editor, items);
    const missed = items.length - done.length;
    if (missed) toast(`${missed === 1 ? "One change was" : `${missed} changes were`} skipped because the words were edited after the check.`);
    setList((l) => l.filter((s) => !items.some((x) => x.id === s.id)));
  };
  const skip = (s) => {
    dropSuggestions(editor, [s.id]);
    setList((l) => l.filter((x) => x.id !== s.id));
  };
  const show = (s) => {
    setActive(s.id);
    if (!showSuggestion(editor, s.id)) {
      toast("Those words were edited after the check, so this suggestion no longer fits.");
      skip(s);
    }
  };

  return { scope, setScope, list, status, blocked, active, setActive, lastRun, run, accept, skip, show, stop: () => { stop.current = true; } };
}

// AI Writing Help: a proofreader (spelling, grammar, punctuation) and a line editor (clearer wording), both
// suggesting small changes the author accepts or skips one by one. Free red underlines come from the browser.
export default function WritingHelpPanel({ wh, spellcheck, setSpellcheck }) {
  const { scope, setScope, list, status, blocked, active, lastRun, run, accept, skip, show } = wh;
  const cards = useRef({});
  const group = useId(); // the panel can be on the page twice (side bar and small-screen strip)

  // A click on an underline in the writing opens its card here.
  useEffect(() => {
    if (active) cards.current[active]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const fixes = list.filter((s) => isFix(s.kind));

  return (
    <div className="space-y-4" data-testid="writing-help">
      <div>
        <Lbl>Free spell check</Lbl>
        <label className="flex items-start gap-2 text-xs">
          <input type="checkbox" className="mt-0.5" checked={spellcheck} onChange={(e) => setSpellcheck(e.target.checked)} data-testid="writing-spellcheck" />
          <span>Red underlines under misspelled words as you type. Right-click one for your browser's suggestions.</span>
        </label>
      </div>

      <div className="pt-3 border-t border-neutral-200">
        <Lbl>AI writing help</Lbl>
        <p className="text-[11px] text-neutral-600 mb-2">
          SparkPrep reads your writing like a proofreader and suggests changes. Nothing changes until you accept it, and Ctrl+Z undoes any change.
        </p>
        <div className="space-y-1 mb-3">
          {SCOPES.map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 text-xs">
              <input type="radio" name={group} checked={scope === k} onChange={() => setScope(k)} data-testid={`writing-scope-${k}`} /> {l}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => run("spelling")} disabled={!!status} className="w-full py-2.5 btn-gold font-mono-spec text-[11px] tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-60" data-testid="writing-check-spelling">
            <SpellCheck className="w-4 h-4" /> Fix spelling &amp; grammar
          </button>
          <button onClick={() => run("wording")} disabled={!!status} className="w-full py-2.5 bg-black text-white font-mono-spec text-[11px] tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-60" data-testid="writing-check-wording">
            <Sparkles className="w-4 h-4" /> Improve my wording
          </button>
        </div>

        {status && (
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-700" data-testid="writing-status">
            <Loader2 className="w-4 h-4 animate-spin" /> <span className="mr-auto">{status}</span>
            {scope === "book" && <button onClick={wh.stop} className="underline" data-testid="writing-stop">Stop</button>}
          </div>
        )}
        {blocked === "login" && (
          <div className="mt-3 text-xs p-2.5 pill-warn">AI writing help needs a free SparkPrep account. <Link to="/login?next=/interior-studio" className="underline font-semibold">Log in</Link> or <Link to="/register?next=/interior-studio" className="underline font-semibold">sign up</Link>. Your writing stays saved here while you do.</div>
        )}
        {blocked === "book" && (
          <div className="mt-3 text-xs p-2.5 pill-warn" data-testid="writing-needs-book">AI writing help comes with a SparkPrep book. <Link to="/pricing" className="underline font-semibold">See pricing</Link>. Writing, the free spell check and the page preview stay free.</div>
        )}
      </div>

      {!status && lastRun && list.length === 0 && (
        <div className="text-xs p-2.5 pill-pass" data-testid="writing-all-clear">
          {lastRun.found ? "All done. Every suggestion has been handled." : lastRun.mode === "spelling" ? "No spelling or grammar mistakes found." : "This already reads well. No wording changes suggested."}
        </div>
      )}

      {list.length > 0 && (
        <div data-testid="writing-results">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-semibold text-sm mr-auto">{list.length} suggestion{list.length === 1 ? "" : "s"}</div>
            {fixes.length > 0 && (
              <button onClick={() => accept(fixes)} className="px-2 py-1 border border-black text-[10px] font-mono-spec uppercase tracking-wide flex items-center gap-1" title="Accept every spelling, grammar and punctuation fix" data-testid="writing-accept-fixes">
                <CheckCheck className="w-3.5 h-3.5" /> Accept all fixes
              </button>
            )}
          </div>
          <div className="space-y-2">
            {list.map((s) => (
              <div key={s.id} ref={(el) => { cards.current[s.id] = el; }} onClick={() => show(s)}
                className={`p-2.5 border bg-white cursor-pointer ${active === s.id ? "border-black ring-1 ring-black" : "border-neutral-300 hover:border-neutral-500"}`} data-testid="writing-card">
                <div className={`text-[9px] font-mono-spec uppercase tracking-widest mb-1 ${isFix(s.kind) ? "text-red-700" : "text-blue-700"}`}>{KIND_LABELS[s.kind] || "Suggestion"}</div>
                <div className="text-[13px] leading-snug break-words">
                  <span className="line-through text-neutral-500">{s.find}</span>
                  <span className="mx-1 text-neutral-400">→</span>
                  <span className="text-green-800 font-medium">{s.replace || "(remove)"}</span>
                </div>
                {s.why && s.why.toLowerCase() !== (KIND_LABELS[s.kind] || "").toLowerCase() && <div className="text-[11px] text-neutral-600 mt-1">{s.why}</div>}
                <div className="flex gap-1.5 mt-2">
                  <button onClick={(e) => { e.stopPropagation(); accept([s]); }} className="px-2 py-1 bg-black text-white text-[10px] font-mono-spec uppercase tracking-wide flex items-center gap-1" data-testid="writing-accept"><Check className="w-3.5 h-3.5" /> Accept</button>
                  <button onClick={(e) => { e.stopPropagation(); skip(s); }} className="px-2 py-1 border border-neutral-300 text-[10px] font-mono-spec uppercase tracking-wide flex items-center gap-1" data-testid="writing-skip"><X className="w-3.5 h-3.5" /> Skip</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
