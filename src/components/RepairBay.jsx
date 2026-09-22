import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL, api, fmtErr } from "@/lib/api";
import { XCircle, CheckCircle2, ShieldCheck, Wrench, ScanSearch, Eye, Gavel, Loader2, PartyPopper, RotateCcw } from "lucide-react";

/**
 * RepairBay -- the live "problem -> repair -> proof" screen for Auto-Fix.
 *
 * Streams the four-agent pipeline (POST /projects/:id/autofix/verified) and
 * plays it back on screen: red tags for every problem Agent 1 confirms, live
 * repair text while Agent 2 works, red -> green flips as Agent 3 verifies each
 * one, then the supervisor's sign-off and the "press Enter" prompt. Everything
 * shown comes from real events; the only thing this component adds is pacing
 * (short holds so a fast fix is still legible).
 */

// Plain-language tags for each problem the backend can report.
const FRIENDLY = {
  colorspace: "RGB color profile",
  dpi: "Low resolution: under 300 DPI",
  transparency: "Live transparency",
  live_transparency_detected: "Live transparency",
  layers_detected: "Hidden layers",
  total_ink_coverage: "Ink coverage too heavy",
  tac: "Ink coverage too heavy",
  cover_safety_margin: "Text too close to the edge",
  interior_safety_margin: "Text outside the safe margin",
  interior_page_size_mismatch: "Wrong page size",
};
const friendly = (i) => FRIENDLY[i.id] || i.label;

const AGENTS = [
  { n: 1, name: "Triage", icon: ScanSearch, doing: "Scanning your file" },
  { n: 2, name: "Repair", icon: Wrench, doing: "Repairing" },
  { n: 3, name: "Verify", icon: Eye, doing: "Independently checking the fix" },
  { n: 4, name: "Supervisor", icon: Gavel, doing: "Auditing everything" },
];

// How long each kind of event is held on screen before the next one plays.
const HOLD = { issues_before: 2400, finding: 40, check_result: 650, agent_start: 450, rollback: 900, criterion: 130, repair_plan: 600, default: 100 };

const CELEBRATE = ["Awesome!", "Fantastic!", "Nailed it!", "Print-ready!"];

export default function RepairBay({ projectId, slot, fileLabel = "your file", onResult, onClose, onLegacyFallback }) {
  const [phase, setPhase] = useState("connecting"); // connecting|scanning|alarm|repairing|verifying|auditing|fixed|confirming|confirmed|partial|noaction|failed
  const [agent, setAgent] = useState(0);
  const [agentState, setAgentState] = useState({});   // {1:"done"...}
  const [issues, setIssues] = useState([]);           // [{id,label,message,status,tag,after}]
  const [healthBefore, setHealthBefore] = useState(null);
  const [health, setHealth] = useState(null);
  const [plan, setPlan] = useState([]);
  const [planIdx, setPlanIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [aiNote, setAiNote] = useState(null);
  const [resultMsg, setResultMsg] = useState("");
  const [final, setFinal] = useState(null);           // result data
  const [confirmed, setConfirmed] = useState(null);   // confirm rescan data
  const [error, setError] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [word, setWord] = useState(0);

  const queue = useRef([]);
  const playing = useRef(false);
  const streamDone = useRef(false);
  const started = useRef(false);
  const finalRef = useRef(null);

  const addLog = (ev) => setLog((l) => [...l.slice(-60), ev]);

  const apply = useCallback((ev) => {
    const d = ev.data || {};
    switch (ev.type) {
      case "pipeline_start": setPhase("scanning"); break;
      case "agent_start": setAgent(ev.agent); setAgentState((s) => ({ ...s, [ev.agent]: "running" }));
        setPhase({ 1: "scanning", 2: "repairing", 3: "verifying", 4: "auditing" }[ev.agent] || "scanning"); break;
      case "agent_done": setAgentState((s) => ({ ...s, [ev.agent]: d.state === "failed" ? "failed" : d.state === "exited" ? "exited" : "done" })); break;
      case "issues_before": {
        const list = (d.issues || []).filter((i) => i.status !== "pass" && !i.informational)
          .map((i) => ({ ...i, tag: friendly(i), resolved: false }));
        setIssues(list); setHealthBefore(d.health); setHealth(d.health);
        if (list.length) setPhase("alarm");
        break;
      }
      case "repair_plan": setPlan(d.plan || []); setPlanIdx(0); break;
      case "check_result":
        setIssues((list) => list.map((i) => (i.id === d.id ? { ...i, resolved: !!d.resolved, after: d.after } : i)));
        break;
      case "issues_after": setHealth(d.health); break;
      case "criterion": setCriteria((c) => [...c, { agent: ev.agent, ...d }]); break;
      case "ai_review": setAiNote({ summary: ev.message, concerns: d.concerns || [] }); break;
      case "prompt": setPhase("fixed"); break;
      case "rollback": break;
      case "result": {
        const p = d.pipeline || {};
        finalRef.current = d; setFinal(d); setResultMsg(p.message || ev.message);
        if (p.health_after != null) setHealth(p.health_after);
        if (p.status === "confirmed") setPhase("fixed");
        else if (p.status === "partial") setPhase("partial");
        else if (p.status === "no_action") setPhase("noaction");
        else setPhase("failed");
        if (d.file_metadata && onResult) onResult(d, { stage: "result" });
        break;
      }
      default: break;
    }
    if (ev.message && ev.type !== "result" && ev.type !== "issues_before") addLog(ev);
  }, [onResult]);

  const pump = useCallback(async () => {
    if (playing.current) return;
    playing.current = true;
    while (queue.current.length) {
      const ev = queue.current.shift();
      apply(ev);
      await new Promise((r) => setTimeout(r, HOLD[ev.type] ?? HOLD.default));
    }
    playing.current = false;
  }, [apply]);

  const push = useCallback((ev) => { queue.current.push(ev); pump(); }, [pump]);

  // ---- run the pipeline (stream, with a buffered fallback) ----
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = localStorage.getItem("sp_token");
    const qs = slot ? `?slot=${encodeURIComponent(slot)}` : "";
    (async () => {
      try {
        const res = await fetch(`${API_URL}/projects/${projectId}/autofix/verified${qs}`, {
          method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          // Route missing entirely = an older backend without the verified pipeline: use the classic Auto-Fix instead.
          if (res.status === 404 && body.detail === "Not Found" && onLegacyFallback) { onLegacyFallback(); return; }
          throw new Error(fmtErr(body.detail) || `Request failed (${res.status})`);
        }
        if (!res.body?.getReader) throw new Error("no-stream");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
            if (!line) continue;
            try {
              const ev = JSON.parse(line);
              if (ev.type === "heartbeat") setElapsed(ev.data?.elapsed || 0); else push(ev);
            } catch { /* ignore a partial/garbled line */ }
          }
        }
        streamDone.current = true;
        if (!finalRef.current && !queue.current.length) throw new Error("The connection closed before the repair finished.");
      } catch (e) {
        if (e.message === "no-stream") { await bufferedRun(); return; }
        setError(e.message || "Something went wrong."); setPhase("failed");
      }
    })();

    async function bufferedRun() {
      try {
        const { data } = await api.post(`/projects/${projectId}/autofix/verified`, null, { params: { ...(slot ? { slot } : {}), stream: false } });
        (data.audit_trail || []).forEach((ev) => push(ev));
      } catch (e) { setError(fmtErr(e.response?.data?.detail)); setPhase("failed"); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotate the "what the engine is doing now" line through the plan while repairing.
  useEffect(() => {
    if (phase !== "repairing" || plan.length < 2) return undefined;
    const t = setInterval(() => setPlanIdx((i) => (i + 1) % plan.length), 1800);
    return () => clearInterval(t);
  }, [phase, plan]);

  useEffect(() => {
    if (phase !== "fixed" && phase !== "confirmed") return undefined;
    const t = setInterval(() => setWord((w) => (w + 1) % CELEBRATE.length), 1600);
    return () => clearInterval(t);
  }, [phase]);

  // ---- Enter -> rescan + system confirmation ----
  const confirm = useCallback(async () => {
    if (phase !== "fixed") return;
    setPhase("confirming");
    try {
      const { data } = await api.post(`/projects/${projectId}/autofix/confirm`, null, slot ? { params: { slot } } : undefined);
      setConfirmed(data);
      setPhase("confirmed");
      if (onResult) onResult(data, { stage: "confirm" });
    } catch (e) {
      setError(fmtErr(e.response?.data?.detail)); setPhase("failed");
    }
  }, [phase, projectId, slot, onResult]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && phase === "fixed") { e.preventDefault(); confirm(); }
      else if (e.key === "Escape" && ["confirmed", "partial", "noaction", "failed"].includes(phase)) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, confirm, onClose]);

  // ---------------------------------------------------------------- render
  const broken = issues.length > 0 && !["fixed", "confirming", "confirmed"].includes(phase) && issues.some((i) => !i.resolved);
  const celebrating = phase === "fixed" || phase === "confirming" || phase === "confirmed";
  const theme = celebrating ? "border-emerald-500/60 shadow-[0_0_60px_rgba(16,185,129,0.25)]"
    : broken && (phase === "alarm" || phase === "repairing") ? "border-red-600/70 shadow-[0_0_60px_rgba(220,38,38,0.25)]"
    : "border-neutral-700";
  const finished = ["confirmed", "partial", "noaction", "failed"].includes(phase);

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" data-testid="repair-bay" role="dialog" aria-modal="true">
      <style>{CSS}</style>
      {celebrating && <Confetti />}
      <div className={`relative w-full max-w-3xl bg-[#0D0D0D] border-2 ${theme} transition-all duration-700 my-auto`}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 font-mono-spec text-[10px] tracking-[0.25em] uppercase text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> SparkPrep Repair Bay
            <span className="text-neutral-600 normal-case tracking-normal">· {fileLabel}</span>
          </div>
          {finished && <button onClick={onClose} className="text-neutral-400 hover:text-white text-xs font-mono-spec uppercase tracking-widest" data-testid="repair-close">Close ✕</button>}
        </div>

        {/* agent rail */}
        <div className="grid grid-cols-4 gap-px bg-neutral-800 border-b border-neutral-800">
          {AGENTS.map((a) => {
            const st = agentState[a.n];
            const Icon = a.icon;
            const active = st === "running";
            return (
              <div key={a.n} className={`bg-[#0D0D0D] px-3 py-2.5 flex items-center gap-2 ${active ? "bg-neutral-900" : ""}`} data-testid={`agent-${a.n}`} data-state={st || "idle"}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${st === "done" ? "bg-emerald-500/20 text-emerald-400" : st === "failed" ? "bg-red-500/20 text-red-400" : active ? "bg-[#D4AF37]/20 text-[#D4AF37]" : st === "exited" ? "bg-neutral-700 text-neutral-300" : "bg-neutral-900 text-neutral-600"}`}>
                  {active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : st === "done" ? <CheckCircle2 className="w-3.5 h-3.5" /> : st === "failed" ? <XCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </span>
                <div className="min-w-0">
                  <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500">Agent {a.n}</div>
                  <div className={`text-xs font-bold truncate ${st ? "text-white" : "text-neutral-600"}`}>{a.name}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 space-y-4">
          <Banner phase={phase} issues={issues} plan={plan} planIdx={planIdx} elapsed={elapsed} word={CELEBRATE[word]}
            resultMsg={resultMsg} error={error} health={health} healthBefore={healthBefore} agent={agent} />

          {/* problem / resolution list */}
          {issues.length > 0 && (
            <ul className="space-y-2" data-testid="repair-issues">
              {issues.map((i) => (
                <li key={i.id} data-testid={`issue-${i.id}`} data-resolved={i.resolved ? "1" : "0"}
                  className={`flex items-center gap-3 border px-3 py-2.5 transition-all duration-500 ${i.resolved ? "border-emerald-700/70 bg-emerald-950/30 sp-flip" : "border-red-800/80 bg-red-950/30 sp-alarm"}`}>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 font-mono-spec text-[10px] font-bold tracking-widest uppercase ${i.resolved ? "bg-emerald-500 text-black" : "bg-red-600 text-white"}`}>
                    {i.resolved ? <><CheckCircle2 className="w-3 h-3" /> Resolved</> : <><XCircle className="w-3 h-3" /> {i.status === "fail" ? "Failed" : "Problem"}</>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-bold ${i.resolved ? "text-emerald-200" : "text-red-200"}`}>{i.resolved ? "Compliant" : i.tag}{i.resolved && <span className="text-emerald-400/70 font-normal"> — {i.tag}</span>}</div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {i.resolved ? (i.after?.label || "Passes") : `${i.label} — ${i.message}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Enter prompt */}
          {(phase === "fixed" || phase === "confirming") && (
            <button onClick={confirm} disabled={phase === "confirming"} data-testid="repair-enter-prompt"
              className="w-full text-left border-2 border-emerald-400 bg-emerald-500/10 px-4 py-3.5 flex items-center gap-3 sp-pulse-green">
              <span className="font-mono-spec text-[11px] font-bold border border-emerald-300 text-emerald-200 px-2 py-1 rounded-sm">ENTER ↵</span>
              <span className="text-emerald-100 font-bold text-sm">{final?.pipeline?.prompt || "Fixed — press Enter for rescan and system confirmation"}</span>
              {phase === "confirming" && <span className="ml-auto flex items-center gap-2 text-emerald-300 text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Rescanning…</span>}
            </button>
          )}

          {/* confirmation rescan */}
          {phase === "confirmed" && confirmed && <Confirmed data={confirmed} onClose={onClose} healthBefore={healthBefore} />}

          {phase === "partial" && final?.pipeline?.remaining?.length > 0 && (
            <div className="border border-amber-700/60 bg-amber-950/20 p-3 text-xs text-amber-200 space-y-1" data-testid="repair-remaining">
              <div className="font-bold">Still open (not something Auto-Fix can do):</div>
              {final.pipeline.remaining.map((r) => <div key={r.id}>• {friendly(r)} — <span className="text-amber-300/80">{r.engine ? "try again" : r.id === "dpi" ? "use AI Upscale" : "needs a manual fix"}</span></div>)}
            </div>
          )}

          {aiNote && aiNote.summary && (
            <div className="text-[11px] text-neutral-400 border-l-2 border-[#D4AF37] pl-3" data-testid="repair-ai-note">
              <span className="font-mono-spec text-[9px] tracking-widest uppercase text-[#D4AF37]">Supervisor's note</span><br />{aiNote.summary}
              {aiNote.concerns?.length > 0 && <div className="text-amber-300 mt-1">Flagged: {aiNote.concerns.join("; ")}</div>}
            </div>
          )}

          {/* audit trail */}
          <div>
            <button onClick={() => setShowLog((v) => !v)} className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500 hover:text-neutral-300" data-testid="repair-log-toggle">
              {showLog ? "▾ Hide" : "▸ Show"} audit trail ({log.length + criteria.length})
            </button>
            {showLog && (
              <div className="mt-2 max-h-48 overflow-y-auto bg-black border border-neutral-800 p-2 font-mono-spec text-[10px] leading-relaxed text-neutral-400" data-testid="repair-log">
                {log.map((l) => <div key={l.seq}><span className="text-neutral-600">{String(l.t).padStart(5, " ")}s</span> <span className="text-[#D4AF37]">[{l.agent ? `A${l.agent}` : "SYS"}]</span> {l.message}</div>)}
                {criteria.filter((c) => c.agent === 4).length > 0 && <div className="text-[#D4AF37] mt-1">— supervisor audit —</div>}
                {criteria.filter((c) => c.agent === 4).map((c, i) => <div key={i} className={c.passed ? "text-emerald-400" : "text-red-400"}>{c.passed ? "✓" : "✗"} {c.label} <span className="text-neutral-500">— {c.evidence}</span></div>)}
              </div>
            )}
          </div>

          {finished && phase !== "confirmed" && (
            <div className="flex justify-end gap-2">
              {phase === "failed" && (
                <button onClick={() => onClose(true)} className="px-3 py-2 border border-neutral-600 text-neutral-200 hover:border-white text-[10px] font-mono-spec tracking-widest uppercase inline-flex items-center gap-1.5" data-testid="repair-retry"><RotateCcw className="w-3 h-3" /> Try again</button>
              )}
              <button onClick={() => onClose()} className="px-4 py-2 btn-gold font-mono-spec text-[10px] tracking-widest uppercase" data-testid="repair-done">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ pieces
function Banner({ phase, issues, plan, planIdx, elapsed, word, resultMsg, error, health, healthBefore, agent }) {
  const open = issues.filter((i) => !i.resolved).length;
  let tone = "text-neutral-300", title = "Connecting…", sub = "";
  switch (phase) {
    case "connecting": case "scanning": title = "Scanning your file…"; sub = "Agent 1 is re-running the scan to confirm what's wrong."; break;
    case "alarm": tone = "text-red-300"; title = `Your file is broken — ${issues.length} problem${issues.length === 1 ? "" : "s"} found`; sub = "Confirmed by a fresh scan. Sending it to the repair engine…"; break;
    case "repairing": tone = "text-amber-300"; title = plan[planIdx]?.doing || "Repairing your file…"; sub = `Agent 2 is applying the fix${elapsed ? ` · ${elapsed}s` : ""} — nothing is marked fixed until someone else checks it.`; break;
    case "verifying": tone = "text-sky-300"; title = "Repair applied — now proving it works"; sub = "Agent 3 is independently re-scanning the saved file."; break;
    case "auditing": tone = "text-sky-300"; title = "Supervisor is auditing the whole trail"; sub = "Agent 4 checks that nothing was skipped, faked or broken elsewhere."; break;
    case "fixed": case "confirming": tone = "text-emerald-300"; title = `${word} Your file is fixed.`; sub = `All ${issues.length} problem${issues.length === 1 ? "" : "s"} confirmed gone by an independent check and signed off by the supervisor.`; break;
    case "confirmed": tone = "text-emerald-300"; title = `${word} System confirmed — OK to export.`; sub = "The scan was re-run from scratch on the saved file and everything passed."; break;
    case "partial": tone = "text-amber-300"; title = "Improved — but not everything could be fixed"; sub = resultMsg; break;
    case "noaction": tone = "text-emerald-300"; title = "Nothing to fix"; sub = resultMsg; break;
    default: tone = "text-red-300"; title = "The repair couldn't be completed"; sub = error || resultMsg;
  }
  const celebrate = ["fixed", "confirming", "confirmed"].includes(phase);
  return (
    <div className="flex items-center gap-5" data-testid="repair-banner" data-phase={phase}>
      <Gauge health={health ?? 0} healthBefore={healthBefore} show={health != null} state={celebrate ? "clean" : phase === "repairing" || phase === "verifying" || phase === "auditing" ? "repairing" : issues.length ? "misfire" : "idle"} />
      <div className="min-w-0">
        <div className={`font-display font-black text-xl sm:text-2xl leading-tight ${tone} ${celebrate ? "sp-pop" : phase === "alarm" ? "sp-shake" : ""}`} data-testid="repair-title">
          {celebrate && <PartyPopper className="inline w-6 h-6 mr-2 -mt-1" />}{title}
        </div>
        <div className="text-xs text-neutral-400 mt-1">{sub}</div>
        {(phase === "repairing") && <div className="mt-2 h-1.5 bg-neutral-800 overflow-hidden"><div className="h-full w-1/3 bg-amber-400 sp-slide" /></div>}
      </div>
    </div>
  );
}

// Print-engine health gauge: sputters when unhealthy, runs smooth at 100.
function Gauge({ health, healthBefore, show, state }) {
  const pct = Math.max(0, Math.min(100, health));
  const angle = -90 + (pct / 100) * 180;
  const color = state === "clean" ? "#10B981" : state === "repairing" ? "#F59E0B" : state === "misfire" ? "#DC2626" : "#525252";
  const label = state === "clean" ? "RUNNING CLEAN" : state === "repairing" ? "REPAIRING" : state === "misfire" ? "MISFIRING" : "STANDBY";
  return (
    <div className="shrink-0 w-32 sm:w-40 text-center" data-testid="repair-gauge" data-health={show ? pct : ""} data-state={state}>
      <svg viewBox="0 0 120 70" className="w-full">
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="#262626" strokeWidth="9" strokeLinecap="round" />
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 157} 157`} style={{ transition: "stroke-dasharray 900ms ease, stroke 400ms" }} />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "60px 62px", transition: "transform 900ms cubic-bezier(.2,1.4,.4,1)" }}>
          <g className={state === "misfire" ? "sp-jitter" : state === "repairing" ? "sp-jitter-soft" : ""} style={{ transformOrigin: "60px 62px" }}>
            <line x1="60" y1="62" x2="60" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
        <circle cx="60" cy="62" r="5" fill={color} />
      </svg>
      <div className="font-display font-black text-2xl leading-none" style={{ color }}>{show ? `${pct}%` : "--"}</div>
      <div className="font-mono-spec text-[9px] tracking-[0.2em] mt-1" style={{ color }}>{label}</div>
      {healthBefore != null && state === "clean" && <div className="text-[9px] text-neutral-500 mt-0.5">was {healthBefore}%</div>}
    </div>
  );
}

function Confirmed({ data, onClose, healthBefore }) {
  const real = (data.compliance || []).filter((c) => !["bleed", "pdfx1a", "pdf_dpi"].includes(c.id));
  const ok = real.every((c) => c.status === "pass");
  return (
    <div className="border border-emerald-700/70 bg-emerald-950/20 p-4 space-y-3" data-testid="repair-confirmed">
      <div className="font-mono-spec text-[9px] tracking-[0.25em] uppercase text-emerald-400">System confirmation · fresh rescan</div>
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
        {real.map((c) => (
          <li key={c.id} className="flex items-center gap-2 text-xs text-neutral-200"><span className={c.status === "pass" ? "text-emerald-400" : "text-amber-400"}>{c.status === "pass" ? "✓" : "!"}</span>{c.label}</li>
        ))}
      </ul>
      <div className="flex items-center justify-between pt-1">
        <div className={`font-display font-black ${ok ? "text-emerald-300" : "text-amber-300"}`}>{ok ? "All checks pass — OK to export." : "Some notes remain — review them before exporting."}</div>
        <button onClick={() => onClose()} className="px-4 py-2 btn-gold font-mono-spec text-[10px] tracking-widest uppercase" data-testid="repair-continue">Continue</button>
      </div>
    </div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 46 }, (_, i) => i);
  const colors = ["#10B981", "#D4AF37", "#FF6A00", "#007BFF", "#FAFAFA", "#E5C158"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[90]" aria-hidden="true" data-testid="repair-confetti">
      {bits.map((i) => (
        <span key={i} className="sp-confetti" style={{
          left: `${(i * 137) % 100}%`, background: colors[i % colors.length],
          animationDelay: `${(i % 12) * 0.12}s`, animationDuration: `${2.4 + (i % 5) * 0.35}s`,
          width: `${6 + (i % 4) * 2}px`, height: `${10 + (i % 3) * 4}px`,
        }} />
      ))}
    </div>
  );
}

const CSS = `
@keyframes sp-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes sp-jitter{0%{transform:rotate(-7deg)}25%{transform:rotate(6deg)}50%{transform:rotate(-4deg)}75%{transform:rotate(8deg)}100%{transform:rotate(-7deg)}}
@keyframes sp-jitter-soft{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes sp-alarm{0%,100%{box-shadow:inset 0 0 0 rgba(220,38,38,0)}50%{box-shadow:inset 0 0 22px rgba(220,38,38,.35)}}
@keyframes sp-flip{0%{transform:scale(.97);filter:brightness(2)}60%{transform:scale(1.02)}100%{transform:scale(1);filter:brightness(1)}}
@keyframes sp-pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}
@keyframes sp-pulse-green{0%,100%{box-shadow:0 0 0 rgba(16,185,129,0)}50%{box-shadow:0 0 28px rgba(16,185,129,.55)}}
@keyframes sp-slide{0%{margin-left:-35%}100%{margin-left:100%}}
@keyframes sp-fall{0%{transform:translateY(-8vh) rotate(0deg);opacity:1}100%{transform:translateY(108vh) rotate(720deg);opacity:.9}}
.sp-shake{animation:sp-shake .5s ease-in-out 3}
.sp-jitter{animation:sp-jitter .18s linear infinite}
.sp-jitter-soft{animation:sp-jitter-soft .6s ease-in-out infinite}
.sp-alarm{animation:sp-alarm 1.4s ease-in-out infinite}
.sp-flip{animation:sp-flip .6s ease-out}
.sp-pop{animation:sp-pop .6s ease-out}
.sp-pulse-green{animation:sp-pulse-green 1.4s ease-in-out infinite}
.sp-slide{animation:sp-slide 1.1s linear infinite}
.sp-confetti{position:absolute;top:-6vh;border-radius:1px;animation-name:sp-fall;animation-timing-function:linear;animation-iteration-count:2}
@media (prefers-reduced-motion: reduce){.sp-shake,.sp-jitter,.sp-jitter-soft,.sp-alarm,.sp-flip,.sp-pop,.sp-pulse-green,.sp-slide,.sp-confetti{animation:none!important}}
`;
