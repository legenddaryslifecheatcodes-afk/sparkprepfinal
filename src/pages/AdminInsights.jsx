import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import Nav from "@/components/Nav";
import { RefreshCw, AlertTriangle, TrendingUp, LogOut, Footprints } from "lucide-react";

// The owner's Insights page (2026-11-27, Trey: "I need that to be on the site itself ... if something's broken we
// can fix it, if something is working we want to know that too"). How far visitors get, where they stop, the
// trouble they hit and what's working. Data: GET /api/admin/insights (backend site_insights.py). Built for a phone.
const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];
const GOLD = "#D4AF37";

function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

function howLong(sec) {
  if (!sec || sec < 5) return "a few seconds";
  if (sec < 60) return `${sec} seconds`;
  const m = Math.round(sec / 60);
  return m < 60 ? `${m} min` : `${Math.round(m / 6) / 10} hr`;
}

function Stat({ label, value, hint, accent }) {
  return (
    <div className="marketing-surface p-4">
      <div className="font-mono-spec text-[9px] tracking-widest uppercase text-neutral-500">{label}</div>
      <div className={`font-display font-black text-3xl tracking-tighter mt-1 ${accent || ""}`}>{value}</div>
      {hint && <div className="text-xs text-neutral-500 mt-1">{hint}</div>}
    </div>
  );
}

function Section({ icon: Icon, title, hint, children, tone }) {
  return (
    <div className={`mt-6 marketing-surface p-5 ${tone === "bad" ? "border border-red-900/60" : ""}`}>
      <h2 className="font-display font-black text-lg tracking-tight flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${tone === "bad" ? "text-red-400" : tone === "good" ? "text-emerald-400" : "text-[#D4AF37]"}`} />}
        {title}
      </h2>
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function Funnel({ rows, biggest }) {
  const top = Math.max(1, rows[0]?.count || 0);
  return (
    <ol className="mt-4 space-y-3">
      {rows.map((r, i) => (
        <li key={r.key}>
          <div className="flex justify-between gap-3 text-sm">
            <span>
              <span className="font-mono-spec text-neutral-500 mr-2">{i + 1}</span>
              {r.label}
            </span>
            <span className="font-mono-spec shrink-0">{r.count}</span>
          </div>
          <div className="h-2.5 bg-neutral-800 mt-1">
            <div className="h-2.5" style={{ width: `${(r.count / top) * 100}%`, minWidth: r.count ? 3 : 0, background: r.key === "paid" ? "#34d399" : GOLD }} />
          </div>
          {i > 0 && r.lost > 0 && (
            <div className={`text-xs mt-1 ${r.key === biggest ? "text-red-400 font-semibold" : "text-neutral-500"}`}>
              {r.lost} didn't go on{r.key === biggest ? " (the biggest drop: fix this first)" : ""}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function WorkingTable({ rows, nameLabel }) {
  if (!rows.length) return <p className="text-sm text-neutral-500 mt-3">Nothing yet in this range.</p>;
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] font-mono-spec uppercase tracking-widest text-neutral-500">
            <th className="py-1 pr-3">{nameLabel}</th>
            <th className="py-1 pr-3 text-right">People</th>
            <th className="py-1 pr-3 text-right">Took a step</th>
            <th className="py-1 pr-3 text-right">Signed up</th>
            <th className="py-1 text-right">Payment page</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="py-2 pr-3 max-w-[12rem] truncate">{r.name}</td>
              <td className="py-2 pr-3 text-right font-mono-spec">{r.visitors}</td>
              <td className={`py-2 pr-3 text-right font-mono-spec ${r.took_step ? "text-emerald-400" : "text-neutral-500"}`}>
                {r.took_step}{r.visitors ? ` (${r.step_pct}%)` : ""}
              </td>
              <td className="py-2 pr-3 text-right font-mono-spec">{r.signed_up}</td>
              <td className="py-2 text-right font-mono-spec">{r.checkout}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DOT = { page: "bg-neutral-500", click: "bg-sky-400", step: "bg-emerald-400", trouble: "bg-red-500" };

function Journey({ j }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-3">
      <button onClick={() => setOpen(!open)} className="w-full text-left flex justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-sm truncate">
            {j.furthest}
            {j.trouble > 0 && <span className="ml-2 text-xs text-red-400">· hit trouble</span>}
          </span>
          <span className="block text-xs text-neutral-500 truncate">
            From {j.source} · {j.device || "?"}{j.country ? ` · ${j.country}` : ""} · stayed {howLong(j.seconds)}
          </span>
        </span>
        <span className="text-xs text-neutral-500 shrink-0">{timeAgo(j.at)}</span>
      </button>
      {open && (
        <ol className="mt-2 ml-1 border-l border-neutral-800 pl-3 space-y-1">
          {j.events.map((e, i) => (
            <li key={i} className={`text-xs flex gap-2 items-start ${e.type === "trouble" ? "text-red-300" : e.type === "step" ? "text-emerald-300" : "text-neutral-300"}`}>
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${DOT[e.type] || "bg-neutral-500"}`} />
              <span className="min-w-0 break-words">{e.text}</span>
            </li>
          ))}
          {j.more > 0 && <li className="text-xs text-neutral-500">…and {j.more} more</li>}
        </ol>
      )}
    </li>
  );
}

export default function AdminInsights() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(true);
  const timer = useRef(null);

  // The owner's own phone/laptop shouldn't count as a visitor: opening this page turns counting off here.
  useEffect(() => {
    try { localStorage.setItem("sp_notrack", "1"); } catch (_) { /* private mode */ }
  }, []);

  const load = (d = days) => {
    setLoading(true);
    api.get(`/admin/insights?days=${d}`)
      .then(({ data }) => { setData(data); setErr(""); })
      .catch((e) => setErr(fmtErr(e.response?.data?.detail)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(days); }, [days]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    clearInterval(timer.current);
    if (live) timer.current = setInterval(() => load(), 60000);   // near-live: refreshes every minute
    return () => clearInterval(timer.current);
  }, [live, days]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = data?.totals;

  return (
    <div className="marketing min-h-screen">
      <Nav dark />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">[ Admin · Insights ]</span>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tighter mt-1">How far people get</h1>
          </div>
          <Link to="/admin/traffic" className="text-xs font-mono-spec uppercase tracking-widest text-neutral-400 underline">Visitor counts</Link>
        </div>

        <div className="mt-5 flex gap-2 flex-wrap items-center">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-2 text-xs font-mono-spec uppercase tracking-widest border ${days === r.days ? "border-[#D4AF37] text-[#D4AF37]" : "border-neutral-700 text-neutral-400"}`}
            >
              {r.label}
            </button>
          ))}
          <button onClick={() => load()} className="px-3 py-2 text-xs border border-neutral-700 text-neutral-400 flex items-center gap-1" aria-label="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <label className="text-xs text-neutral-400 flex items-center gap-2 ml-1">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> Update every minute
          </label>
        </div>

        {err && <p className="mt-6 text-red-400 text-sm">{err}</p>}
        {!data && !err && <p className="mt-6 text-neutral-500 text-sm">Loading…</p>}

        {data && (
          <>
            {data.headlines.length > 0 && (
              <div className="mt-6 marketing-surface p-5 border border-[#D4AF37]/40">
                <h2 className="font-display font-black text-lg tracking-tight">What stands out</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-neutral-200 list-disc pl-5">
                  {data.headlines.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
              <Stat label="Visitors" value={t.visitors} hint="People, once a day" accent="text-[#D4AF37]" />
              <Stat label="On the site now" value={t.live_now} hint="Last 5 minutes" accent="text-emerald-400" />
              <Stat label="Took a step" value={t.took_a_step} hint="Uploaded, signed up, used AI or more" />
              <Stat label="Hit trouble" value={t.hit_trouble} hint={`${t.trouble_events} problem${t.trouble_events === 1 ? "" : "s"} seen`} accent={t.hit_trouble ? "text-red-400" : ""} />
              <Stat label="Paid" value={t.paid} accent={t.paid ? "text-emerald-400" : ""} />
            </div>

            <Section icon={Footprints} title="Step by step: how far people get" hint="Each person counted once a day for every step they really did. Some skip the free check and sign up straight away.">
              <Funnel rows={data.funnel} biggest={data.biggest_drop} />
            </Section>

            <Section icon={AlertTriangle} title="Trouble people hit" tone="bad"
              hint="Errors, blocked steps and crashes real visitors ran into, with the message they saw. Newest problems show up within a minute.">
              {data.trouble.length === 0 ? (
                <p className="text-sm text-neutral-500 mt-3">No trouble seen in this range.</p>
              ) : (
                <ul className="mt-3 divide-y divide-neutral-800">
                  {data.trouble.map((g, i) => (
                    <li key={i} className="py-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold">{g.where}{g.status ? <span className="text-neutral-500 font-normal"> · code {g.status}</span> : null}</span>
                        <span className="text-xs text-neutral-500 shrink-0">{timeAgo(g.last)}</span>
                      </div>
                      {g.message && <div className="text-neutral-300 mt-1">They saw: "{g.message}"</div>}
                      <div className="text-xs text-neutral-500 mt-1">
                        {g.visitors} {g.visitors === 1 ? "person" : "people"} · {g.count} time{g.count === 1 ? "" : "s"}
                        {g.pages.length ? ` · on ${g.pages.join(", ")}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section icon={TrendingUp} title="What's working: where people come from" tone="good"
              hint="Which sources bring people who take a step (upload a file, sign up, use an AI helper, open a payment page).">
              <WorkingTable rows={data.by_source} nameLabel="Came from" />
            </Section>

            <Section icon={TrendingUp} title="What's working: first page they saw" tone="good">
              <WorkingTable rows={data.by_landing} nameLabel="First page" />
            </Section>

            <Section icon={LogOut} title="Where people leave without doing anything" hint="The last page of visits that never took a step.">
              {data.exit_pages.length === 0 ? (
                <p className="text-sm text-neutral-500 mt-3">Nothing yet in this range.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.exit_pages.map(([page, n]) => (
                    <li key={page} className="text-sm flex justify-between gap-3">
                      <span className="truncate">{page}</span>
                      <span className="font-mono-spec text-neutral-300 shrink-0">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Latest visits, step by step" hint="Tap a visit to see every page, step and problem in order. No names or emails are kept.">
              {data.journeys.length === 0 ? (
                <p className="text-sm text-neutral-500 mt-3">No visits yet in this range.</p>
              ) : (
                <ul className="mt-2 divide-y divide-neutral-800">
                  {data.journeys.map((j, i) => <Journey key={`${j.at}-${i}`} j={j} />)}
                </ul>
              )}
            </Section>

            <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
              How this works: no cookies and no saved IP addresses, so the site needs no cookie banner. A visitor is one
              person on one day. Steps come from the site's own server, so they're counted even when a browser blocks the
              visitor counter. Payments are counted when Stripe confirms them. Your own devices stop being counted once you
              open this page. Updated {timeAgo(data.generated_at)}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
