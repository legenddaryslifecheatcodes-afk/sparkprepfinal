import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Circle, Loader2, Upload, Download, RotateCcw, Trash2, Plus, Flame, CalendarDays, FileText, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { studioCall, downloadStudioFile, fmtBytes, fmtDay, daysUntil } from "@/lib/studio";
import { money } from "@/lib/pricing";
import StudioLayout from "./StudioLayout";
import { Progress } from "./StudioHome";

const TABS = [["overview", "Overview"], ["writing", "Writing"], ["files", "Files"], ["checklist", "Checklist"],
  ["launch", "Launch plan"], ["notes", "Notes"], ["business", "Business"]];

export default function StudioBook() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [meta, setMeta] = useState(null);
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("tab") || "overview");
  const nav = useNavigate();

  const load = async () => {
    const [{ data: book }, { data: s }] = await Promise.all([api.get(`/studio/books/${id}`), api.get("/studio/status")]);
    setB(book); setMeta(s);
  };
  useEffect(() => { load().catch(() => nav("/studio")); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!b || !meta) return <StudioLayout><div className="st-muted py-20 text-center">Opening your book…</div></StudioLayout>;
  const canEdit = b.member;
  const ctx = { b, setB: (nb) => setB({ ...nb, member: b.member }), meta, canEdit, reload: load, id };

  return (
    <StudioLayout>
      <Link to="/studio" className="inline-flex items-center gap-1.5 st-muted text-sm hover:text-[var(--st-ivory)]"><ArrowLeft className="w-4 h-4" /> All books</Link>
      <section className="mt-4 flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
        <div className="min-w-0">
          <div className="st-eyebrow">{b.genre || "Book folder"}</div>
          <h2 className="st-serif text-3xl sm:text-4xl mt-2 leading-tight break-words">{b.title}</h2>
          {b.project_name && <p className="st-muted text-sm mt-2">Linked to your SparkPrep book “{b.project_name}”</p>}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:w-[420px]">
          <div className="st-card px-5 py-4"><Progress label="Writing" value={b.writing_progress} ivory /></div>
          <div className="st-card px-5 py-4"><Progress label="Publishing" value={b.publishing_progress} /></div>
        </div>
      </section>
      {!canEdit && <p className="st-card p-4 mt-6 text-sm st-muted">Your membership has ended, so this book is read-only. Your files can still be downloaded.</p>}
      <div className="mt-7 flex gap-2 st-scroll-x" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" className={`st-tab ${tab === k ? "st-tab-on" : ""}`} onClick={() => setTab(k)} data-testid={`book-tab-${k}`}>{label}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "overview" && <Overview {...ctx} go={setTab} />}
        {tab === "writing" && <Writing {...ctx} />}
        {tab === "files" && <Files {...ctx} />}
        {tab === "checklist" && <Checklist {...ctx} />}
        {tab === "launch" && <Launch {...ctx} />}
        {tab === "notes" && <Notes {...ctx} />}
        {tab === "business" && <Business {...ctx} />}
      </div>
    </StudioLayout>
  );
}

// ---------------------------------------------------------------- overview: the readiness dashboard
const STEP_TAB = { manuscript: "writing", editing: "checklist", cover: "checklist", interior: "checklist", details: "checklist", inspection: "checklist", submit: "checklist" };

function Overview({ b, go }) {
  const next = b.next_step;
  const left = daysUntil(b.launch_date);
  return (
    <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
      <div className="st-card p-6 sm:p-8">
        <div className="flex items-center gap-6">
          <div className="st-ring" style={{ "--p": b.publishing_progress }}><div><span className="st-serif text-3xl">{b.publishing_progress}%</span></div></div>
          <div>
            <div className="st-eyebrow">Publishing readiness</div>
            <div className="st-serif text-2xl mt-2">{next ? next.label : "Ready to publish"}</div>
            <p className="st-muted text-sm mt-1">{next ? "This is your next step." : "Every step is done. Congratulations."}</p>
            {next && <button className="st-btn mt-4" onClick={() => go(STEP_TAB[next.key])} data-next-step="Click for next step">Work on this <span aria-hidden>→</span></button>}
          </div>
        </div>
        <div className="st-rule my-6" />
        <ol className="space-y-3">
          {b.readiness.map((s) => (
            <li key={s.key} className="flex items-start gap-3">
              <StepIcon state={s.state} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3"><span className={s.state === "done" ? "" : "st-muted"}>{s.label}</span>
                  <span className={`text-xs ${s.state === "done" ? "text-[var(--st-gold)]" : "st-faint"}`}>{s.state === "done" ? "Done" : s.state === "in_progress" ? "In progress" : "Not started"}</span></div>
                {s.source && <div className="st-faint text-xs mt-0.5">{s.source}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="space-y-5">
        <div className="st-card p-6">
          <div className="st-eyebrow">Writing</div>
          <div className="flex items-baseline gap-2 mt-3"><span className="st-serif text-4xl">{b.words_written.toLocaleString()}</span><span className="st-muted">words{b.target_words ? ` of ${b.target_words.toLocaleString()}` : ""}</span></div>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="inline-flex items-center gap-1.5"><Flame className="w-4 h-4 text-[var(--st-gold)]" /> {b.words.streak_days}-day streak</span>
            <span className="st-muted">{b.words.this_week.toLocaleString()} this week</span>
          </div>
          <button className="st-btn-ghost mt-5" onClick={() => go("writing")}>Log today's words</button>
        </div>
        <div className="st-card p-6">
          <div className="st-eyebrow">Launch</div>
          {b.launch_date ? (
            <>
              <div className="st-serif text-2xl mt-3">{fmtDay(b.launch_date)}</div>
              <p className="st-muted text-sm mt-1">{left > 0 ? `${left} days to go` : left === 0 ? "Launch day is today" : `Launched ${-left} days ago`} · {b.launch_tasks.filter((t) => t.done).length} of {b.launch_tasks.length} tasks done</p>
            </>
          ) : <p className="st-muted text-sm mt-3">No launch date yet. Pick one and get a full plan.</p>}
          <button className="st-btn-ghost mt-5" onClick={() => go("launch")}>Open launch plan</button>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ state }) {
  if (state === "done") return <span className="st-check" data-on="true"><Check className="w-3.5 h-3.5" /></span>;
  if (state === "in_progress") return <span className="st-check" style={{ borderColor: "var(--st-gold)" }}><span className="w-2 h-2 rounded-full bg-[var(--st-gold)]" /></span>;
  return <span className="st-check"><Circle className="w-2 h-2 opacity-0" /></span>;
}

// ---------------------------------------------------------------- writing goals + word count
function Writing({ b, setB, canEdit, id }) {
  const [total, setTotal] = useState("");
  const [added, setAdded] = useState("");
  const [goals, setGoals] = useState({ target_words: b.target_words || "", daily_goal: b.daily_goal || "", weekly_goal: b.weekly_goal || "",
    chapters_total: b.chapters_total || "", chapters_done: b.chapters_done || "" });
  const max = Math.max(1, ...b.words.last_14_days.map((d) => d.words), b.daily_goal || 0);
  const logWords = async (body) => { const nb = await studioCall(() => api.post(`/studio/books/${id}/words`, body), "Words saved"); if (nb) { setB(nb); setTotal(""); setAdded(""); } };
  const saveGoals = async () => {
    const body = Object.fromEntries(Object.entries(goals).map(([k, v]) => [k, v === "" ? 0 : Number(v)]));
    const nb = await studioCall(() => api.patch(`/studio/books/${id}`, body), "Goals saved"); if (nb) setB(nb);
  };
  const doneToggle = async () => { const nb = await studioCall(() => api.patch(`/studio/books/${id}`, { manuscript_done: !b.manuscript_done })); if (nb) setB(nb); };
  const dayPct = b.daily_goal ? Math.min(100, Math.round((100 * b.words.today) / b.daily_goal)) : null;
  const weekPct = b.weekly_goal ? Math.min(100, Math.round((100 * b.words.this_week) / b.weekly_goal)) : null;
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="st-card p-6 sm:p-8">
        <div className="st-eyebrow">Today</div>
        <div className="flex items-baseline gap-2 mt-3"><span className="st-serif text-5xl">{b.words.today.toLocaleString()}</span><span className="st-muted">words today</span></div>
        {dayPct != null && <Progress label={`Daily goal · ${b.daily_goal.toLocaleString()}`} value={dayPct} />}
        {weekPct != null && <Progress label={`Weekly goal · ${b.weekly_goal.toLocaleString()}`} value={weekPct} ivory />}
        <div className="flex items-end gap-1.5 h-28 mt-8" aria-label="Words per day, last 14 days">
          {b.words.last_14_days.map((d) => (
            <div key={d.day} className="flex-1 h-full flex flex-col justify-end items-center gap-1" title={`${fmtDay(d.day)}: ${d.words} words`}>
              <div className="w-full rounded-t-md" style={{ height: `${Math.max(3, (100 * Math.max(0, d.words)) / max)}%`, background: d.words > 0 ? "linear-gradient(180deg,#f3dc8c,#b8922a)" : "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between st-faint text-[11px] mt-2"><span>2 weeks ago</span><span>Today</span></div>
        {canEdit && (
          <div className="grid sm:grid-cols-2 gap-3 mt-7">
            <form onSubmit={(e) => { e.preventDefault(); if (added) logWords({ added: Number(added) }); }}>
              <label className="st-label">Words I wrote today</label>
              <div className="flex gap-2"><input className="st-input" type="number" inputMode="numeric" value={added} onChange={(e) => setAdded(e.target.value)} placeholder="500" data-testid="words-added" />
                <button className="st-btn px-4" data-next-step="Click to save">Add</button></div>
            </form>
            <form onSubmit={(e) => { e.preventDefault(); if (total) logWords({ total: Number(total) }); }}>
              <label className="st-label">Or: my book's total word count</label>
              <div className="flex gap-2"><input className="st-input" type="number" inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} placeholder={String(b.words_written)} />
                <button className="st-btn-ghost">Set</button></div>
            </form>
          </div>
        )}
      </div>
      <div className="st-card p-6 sm:p-8">
        <div className="st-eyebrow">Goals</div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[["target_words", "Book length goal (words)"], ["daily_goal", "Daily goal (words)"], ["weekly_goal", "Weekly goal (words)"], ["chapters_total", "Chapters planned"], ["chapters_done", "Chapters finished"]].map(([k, label]) => (
            <div key={k} className={k === "target_words" ? "col-span-2" : ""}>
              <label className="st-label">{label}</label>
              <input className="st-input" type="number" min="0" inputMode="numeric" disabled={!canEdit} value={goals[k]} onChange={(e) => setGoals({ ...goals, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        {canEdit && <button className="st-btn mt-6" onClick={saveGoals}>Save goals</button>}
        <div className="st-rule my-7" />
        <div className="flex items-center justify-between gap-4">
          <div><div className="st-serif text-lg">Manuscript finished?</div><p className="st-muted text-sm">Mark it when the full draft is done. Writing progress becomes 100%.</p></div>
          <button disabled={!canEdit} onClick={doneToggle} className="st-check" data-on={b.manuscript_done ? "true" : "false"} aria-label="Manuscript finished">{b.manuscript_done && <Check className="w-3.5 h-3.5" />}</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- files with version history
function Files({ b, meta, canEdit, reload, id }) {
  const [folder, setFolder] = useState(meta.folders[0].key);
  const [busy, setBusy] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const input = useRef(null);
  const versionFor = useRef(null);
  const inFolder = b.files.filter((f) => f.folder === folder);
  const pick = (groupId = null) => { versionFor.current = groupId; input.current?.click(); };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > meta.storage.max_file_mb * 1024 * 1024) { await studioCall(() => Promise.reject({ response: { data: { detail: `Files can be up to ${meta.storage.max_file_mb} MB.` } } })); return; }
    const fd = new FormData();
    fd.append("folder", folder); fd.append("file", file);
    if (versionFor.current) fd.append("group_id", versionFor.current);
    setBusy(true);
    const ok = await studioCall(() => api.post(`/studio/books/${id}/files`, fd), versionFor.current ? "New version saved" : "File saved");
    setBusy(false);
    if (ok) reload();
  };
  const act = async (fn, msg) => { if (await studioCall(fn, msg)) reload(); };
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-5">
      <div className="st-card p-3 flex lg:flex-col gap-1 st-scroll-x">
        {meta.folders.map((f) => {
          const n = b.files.filter((x) => x.folder === f.key).length;
          return (
            <button key={f.key} onClick={() => setFolder(f.key)} className={`text-left px-4 py-3 rounded-xl whitespace-nowrap flex justify-between gap-4 ${folder === f.key ? "bg-[rgba(212,175,55,0.12)] text-[var(--st-ivory)]" : "st-muted hover:text-[var(--st-ivory)]"}`}>
              <span>{f.label}</span><span className="st-faint">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="st-card p-6 sm:p-8 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="st-serif text-2xl">{meta.folders.find((f) => f.key === folder)?.label}</div>
            <p className="st-muted text-sm mt-1">Upload the same file name again and it's saved as the next version. Nothing is overwritten.</p></div>
          {canEdit && <button className="st-btn" onClick={() => pick()} disabled={busy} data-next-step="Click to upload" data-testid="studio-upload">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload file</button>}
          <input ref={input} type="file" className="hidden" onChange={onFile} />
        </div>
        <div className="st-rule my-6" />
        {inFolder.length === 0 ? <p className="st-muted text-center py-10">Nothing in this folder yet.</p> : (
          <ul className="space-y-3">
            {inFolder.map((g) => (
              <li key={g.group_id} className="rounded-2xl border border-[var(--st-line)] bg-[rgba(0,0,0,0.25)]">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--st-gold)] flex-none hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{g.name}</div>
                    <div className="st-faint text-xs mt-0.5">Version {g.current.version} · {fmtBytes(g.current.size)} · {fmtDay(g.current.created_at)}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="st-btn-ghost" onClick={() => downloadStudioFile(g.current)}><Download className="w-4 h-4" /> Download</button>
                    {canEdit && <button className="st-btn-ghost" onClick={() => { setFolder(g.folder); pick(g.group_id); }}><Upload className="w-4 h-4" /> New version</button>}
                    <button className="st-btn-ghost" onClick={() => setOpenGroup(openGroup === g.group_id ? null : g.group_id)} aria-expanded={openGroup === g.group_id}>
                      History ({g.versions.length}) <ChevronDown className={`w-4 h-4 transition-transform ${openGroup === g.group_id ? "rotate-180" : ""}`} /></button>
                  </div>
                </div>
                {openGroup === g.group_id && (
                  <ol className="border-t border-[var(--st-line)] px-4 py-3 space-y-2">
                    {g.versions.map((v, i) => (
                      <li key={v.id} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between text-sm">
                        <div><span className={i === 0 ? "text-[var(--st-gold)]" : ""}>Version {v.version}{i === 0 ? " (current)" : ""}</span>
                          <span className="st-faint"> · {fmtDay(v.created_at)} · {fmtBytes(v.size)}{v.note ? ` · ${v.note}` : ""}</span></div>
                        <div className="flex gap-3">
                          <button className="st-muted hover:text-[var(--st-ivory)] inline-flex items-center gap-1" onClick={() => downloadStudioFile(v)}><Download className="w-3.5 h-3.5" /> Download</button>
                          {canEdit && i > 0 && <button className="st-muted hover:text-[var(--st-ivory)] inline-flex items-center gap-1" onClick={() => act(() => api.post(`/studio/files/${v.id}/restore`), `Version ${v.version} is current again`)}><RotateCcw className="w-3.5 h-3.5" /> Make current</button>}
                          <button className="st-faint hover:text-red-300 inline-flex items-center gap-1" onClick={() => { if (window.confirm(`Delete version ${v.version}? This can't be undone.`)) act(() => api.delete(`/studio/files/${v.id}`), "Version deleted"); }}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="st-faint text-xs mt-6">Storage: {fmtBytes(meta.storage.used_bytes)} of {fmtBytes(meta.storage.quota_bytes)} used. Files up to {meta.storage.max_file_mb} MB each.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- publishing checklist
function Checklist({ b, setB, meta, canEdit, id }) {
  const groups = useMemo(() => {
    const out = [];
    for (const step of meta.readiness_steps) {
      const items = meta.checklist.filter((c) => c.step === step.key);
      if (items.length) out.push({ step, items });
    }
    return out;
  }, [meta]);
  const toggle = async (key) => {
    if (!canEdit) return;
    const nb = await studioCall(() => api.put(`/studio/books/${id}/checklist`, { key, done: !b.checklist[key] }));
    if (nb) setB(nb);
  };
  const done = meta.checklist.filter((c) => b.checklist[c.key]).length;
  return (
    <div className="st-card p-6 sm:p-8">
      <div className="flex justify-between items-end gap-4">
        <div><div className="st-eyebrow">Publishing checklist</div><div className="st-serif text-2xl mt-2">From finished manuscript to published book</div></div>
        <div className="st-serif text-2xl whitespace-nowrap">{done}<span className="st-muted text-base"> / {meta.checklist.length}</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mt-8">
        {groups.map(({ step, items }) => (
          <div key={step.key}>
            <div className="st-muted text-xs uppercase tracking-[0.2em] mb-3">{step.label}</div>
            <ul className="space-y-2.5">
              {items.map((c) => (
                <li key={c.key}>
                  <button onClick={() => toggle(c.key)} className="flex items-start gap-3 text-left w-full" disabled={!canEdit} data-testid={`check-${c.key}`}>
                    <span className="st-check mt-0.5" data-on={b.checklist[c.key] ? "true" : "false"}>{b.checklist[c.key] && <Check className="w-3.5 h-3.5" />}</span>
                    <span className={b.checklist[c.key] ? "st-muted line-through decoration-[var(--st-faint)]" : ""}>{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            {step.key === "inspection" && <Link to={b.project_id ? `/editor/${b.project_id}` : "/dashboard"} className="inline-block mt-3 text-sm text-[var(--st-gold)] hover:underline">Open the Legenddary SparkPrep check →</Link>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- launch planner
const GROUP_LABEL = { plan: "Planning", book: "The book", marketing: "Marketing", social: "Social media", launch: "Launch day" };

function Launch({ b, setB, canEdit, id }) {
  const [date, setDate] = useState(b.launch_date || "");
  const [label, setLabel] = useState("");
  const [due, setDue] = useState("");
  const makePlan = async () => { if (!date) return; const nb = await studioCall(() => api.post(`/studio/books/${id}/launch/plan`, { launch_date: date }), "Launch plan ready"); if (nb) setB(nb); };
  const toggle = async (t) => { if (!canEdit) return; const nb = await studioCall(() => api.patch(`/studio/books/${id}/launch/tasks/${t.id}`, { done: !t.done })); if (nb) setB(nb); };
  const remove = async (t) => { const nb = await studioCall(() => api.delete(`/studio/books/${id}/launch/tasks/${t.id}`)); if (nb) setB(nb); };
  const add = async (e) => { e.preventDefault(); if (!label.trim()) return; const nb = await studioCall(() => api.post(`/studio/books/${id}/launch/tasks`, { label, due: due || null, group: "plan" })); if (nb) { setB(nb); setLabel(""); setDue(""); } };
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-5">
      <div className="st-card p-6 h-fit">
        <CalendarDays className="w-6 h-6 text-[var(--st-gold)]" />
        <div className="st-serif text-2xl mt-3">Launch date</div>
        <p className="st-muted text-sm mt-1">Pick the day your book comes out. You'll get a full plan with a date on every task, and you can change anything.</p>
        <input type="date" className="st-input mt-4" value={date} onChange={(e) => setDate(e.target.value)} disabled={!canEdit} />
        {canEdit && <button className="st-btn w-full mt-4" onClick={makePlan} disabled={!date} data-next-step="Click to plan">{b.launch_tasks.length ? "Update my plan" : "Build my launch plan"}</button>}
        {b.launch_date && <p className="st-faint text-xs mt-3">Changing the date adds any missing starter tasks. Your own tasks and checkmarks are kept.</p>}
      </div>
      <div className="st-card p-6 sm:p-8 min-w-0">
        {b.launch_tasks.length === 0 ? <p className="st-muted text-center py-12">Pick a launch date to get your plan.</p> : (
          <ul className="space-y-2">
            {b.launch_tasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3 py-2 border-b border-[var(--st-line)] last:border-0">
                <button className="st-check mt-0.5" data-on={t.done ? "true" : "false"} onClick={() => toggle(t)} disabled={!canEdit} aria-label="Done">{t.done && <Check className="w-3.5 h-3.5" />}</button>
                <div className="flex-1 min-w-0">
                  <div className={t.done ? "st-muted line-through" : ""}>{t.label}</div>
                  <div className="st-faint text-xs mt-0.5">{GROUP_LABEL[t.group] || "Task"}{t.due ? ` · ${fmtDay(t.due)}` : ""}{!t.done && t.due && t.due < today ? " · overdue" : ""}</div>
                </div>
                {canEdit && <button className="st-faint hover:text-red-300" onClick={() => remove(t)} aria-label="Remove task"><Trash2 className="w-4 h-4" /></button>}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <form onSubmit={add} className="flex flex-col sm:flex-row gap-2 mt-6">
            <input className="st-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Add your own task" />
            <input className="st-input sm:w-44" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            <button className="st-btn-ghost"><Plus className="w-4 h-4" /> Add</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- notes (ideas, research, filled-in templates)
function Notes({ b, canEdit, reload, id }) {
  const [current, setCurrent] = useState(b.notes[0]?.id || null);
  const note = b.notes.find((n) => n.id === current);
  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [saved, setSaved] = useState(true);
  useEffect(() => { setTitle(note?.title || ""); setBody(note?.body || ""); setSaved(true); }, [current]); // eslint-disable-line react-hooks/exhaustive-deps
  const create = async () => { const n = await studioCall(() => api.post(`/studio/books/${id}/notes`, { title: "New note", body: "" })); if (n) { await reload(); setCurrent(n.id); } };
  const save = async () => { if (await studioCall(() => api.patch(`/studio/books/${id}/notes/${current}`, { title, body }), "Note saved")) { setSaved(true); reload(); } };
  const remove = async () => { if (!window.confirm("Delete this note?")) return; if (await studioCall(() => api.delete(`/studio/books/${id}/notes/${current}`))) { setCurrent(null); reload(); } };
  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-5">
      <div className="st-card p-3">
        {canEdit && <button className="st-btn w-full mb-2" onClick={create}><Plus className="w-4 h-4" /> New note</button>}
        <Link to="/studio/templates" className="block text-center text-sm text-[var(--st-gold)] py-2">Start from a template →</Link>
        <ul className="mt-1 max-h-[420px] overflow-y-auto">
          {b.notes.map((n) => (
            <li key={n.id}><button onClick={() => setCurrent(n.id)} className={`w-full text-left px-4 py-3 rounded-xl ${current === n.id ? "bg-[rgba(212,175,55,0.12)]" : "hover:bg-[rgba(255,255,255,0.03)]"}`}>
              <div className="truncate">{n.title}</div><div className="st-faint text-xs mt-0.5">{fmtDay(n.updated_at)}</div></button></li>
          ))}
          {b.notes.length === 0 && <li className="st-muted text-sm text-center py-6">No notes yet.</li>}
        </ul>
      </div>
      <div className="st-card p-6 sm:p-8 min-w-0">
        {!note ? <p className="st-muted text-center py-16">Ideas, research, character notes and filled-in templates live here.</p> : (
          <>
            <input className="st-input st-serif text-xl" value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} disabled={!canEdit} />
            <textarea className="st-textarea mt-4" value={body} onChange={(e) => { setBody(e.target.value); setSaved(false); }} disabled={!canEdit} style={{ minHeight: 380 }} />
            {canEdit && (
              <div className="flex justify-between items-center mt-4">
                <button className="st-faint hover:text-red-300 text-sm inline-flex items-center gap-1" onClick={remove}><Trash2 className="w-4 h-4" /> Delete</button>
                <button className="st-btn" onClick={save} disabled={saved}>{saved ? "Saved" : "Save note"}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the author's business tracker
const KINDS = [["expense", "Production cost"], ["marketing", "Marketing cost"], ["sale", "Sales income"]];

function Business({ b, setB, canEdit, id }) {
  const [kind, setKind] = useState("expense");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [copies, setCopies] = useState("");
  const [day, setDay] = useState("");
  const add = async (e) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(amount || "0") * 100);
    if (!label.trim() || !(cents >= 0)) return;
    const nb = await studioCall(() => api.post(`/studio/books/${id}/ledger`, { kind, label, amount_cents: cents, copies: kind === "sale" && copies ? Number(copies) : null, day: day || null }), "Saved");
    if (nb) { setB(nb); setLabel(""); setAmount(""); setCopies(""); }
  };
  const remove = async (e) => { const nb = await studioCall(() => api.delete(`/studio/books/${id}/ledger/${e.id}`)); if (nb) setB(nb); };
  const spent = b.totals.expense + b.totals.marketing;
  const net = b.totals.sale - spent;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["Spent making it", money(b.totals.expense)], ["Spent on marketing", money(b.totals.marketing)], ["Sales income", money(b.totals.sale)], [net >= 0 ? "Profit so far" : "Still to earn back", money(Math.abs(net))]].map(([l, v], i) => (
          <div key={l} className="st-card p-5"><div className="st-muted text-xs">{l}</div><div className={`st-serif text-2xl mt-2 ${i === 3 && net >= 0 && b.totals.sale > 0 ? "st-gold-text" : ""}`}>{v}</div></div>
        ))}
      </div>
      <div className="st-card p-6 sm:p-8">
        <div className="st-eyebrow">Business tracker</div>
        <p className="st-muted text-sm mt-2">Write down what this book costs and what it earns{b.copies_sold ? `. ${b.copies_sold.toLocaleString()} copies sold so far` : ""}. Add sales from your printer's sales report.</p>
        {canEdit && (
          <form onSubmit={add} className="grid sm:grid-cols-[150px_1fr_120px_100px_150px_auto] gap-2 mt-5">
            <select className="st-input" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input className="st-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={kind === "sale" ? "November KDP sales" : "Editor, ISBN, ads…"} />
            <input className="st-input" type="number" step="0.01" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$0.00" />
            <input className="st-input" type="number" min="0" inputMode="numeric" value={copies} onChange={(e) => setCopies(e.target.value)} placeholder="Copies" disabled={kind !== "sale"} />
            <input className="st-input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            <button className="st-btn">Add</button>
          </form>
        )}
        <ul className="mt-6">
          {b.ledger.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-3 border-b border-[var(--st-line)] last:border-0 text-sm">
              <span className={`st-pill ${e.kind === "sale" ? "st-pill-gold" : ""}`}>{KINDS.find(([k]) => k === e.kind)?.[1]}</span>
              <span className="flex-1 min-w-0 truncate">{e.label}{e.copies ? ` · ${e.copies} copies` : ""}</span>
              <span className="st-faint hidden sm:inline">{fmtDay(e.day)}</span>
              <span className={e.kind === "sale" ? "text-[var(--st-gold)]" : ""}>{e.kind === "sale" ? "+" : "−"}{money(e.amount_cents)}</span>
              {canEdit && <button className="st-faint hover:text-red-300" onClick={() => remove(e)} aria-label="Remove"><Trash2 className="w-4 h-4" /></button>}
            </li>
          ))}
          {b.ledger.length === 0 && <li className="st-muted text-center py-8">Nothing written down yet.</li>}
        </ul>
      </div>
    </div>
  );
}
