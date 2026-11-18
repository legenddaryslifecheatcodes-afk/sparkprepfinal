import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtErr } from "@/lib/api";
import Nav from "@/components/Nav";
import { RefreshCw } from "lucide-react";

// The owner's traffic page (2026-11-08): who came through the site, real people vs bots, where they came
// from, which pages they read, and what they did. Built to read on a phone. Data: GET /api/admin/traffic.
const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const PAGE_NAMES = {
  "/": "Home page",
  "/audit": "Free audit page",
  "/pricing": "Pricing",
  "/guides/": "Guides list",
  "/tools/": "Free tools list",
  "/register": "Sign up page",
  "/login": "Log in page",
  "/fix-my-file/": "Fix my file",
  "/templates/": "Cover templates",
};

function pageName(p) {
  return PAGE_NAMES[p] || p;
}

function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} days ago`;
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

function BarList({ title, rows, empty, format = (k) => k }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="marketing-surface p-5">
      <h2 className="font-display font-black text-lg tracking-tight">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 mt-3">{empty || "Nothing yet."}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map(([k, n]) => (
            <li key={k} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">{format(k)}</span>
                <span className="font-mono-spec text-neutral-300 shrink-0">{n}</span>
              </div>
              <div className="h-1.5 bg-neutral-800 mt-1">
                <div className="h-1.5 bg-[#D4AF37]" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminTraffic() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // The owner's own phone/laptop shouldn't count as visitors: opening this page once turns counting off here.
  useEffect(() => {
    try { localStorage.setItem("sp_notrack", "1"); } catch (_) { /* private mode */ }
  }, []);

  const load = (d = days) => {
    setLoading(true);
    setErr("");
    api.get(`/admin/traffic?days=${d}`)
      .then(({ data }) => setData(data))
      .catch((e) => setErr(fmtErr(e.response?.data?.detail)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(days); }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = data?.totals;
  const maxDay = Math.max(1, ...(data?.by_day || []).map((d) => d.visitors));

  return (
    <div className="marketing min-h-screen">
      <Nav dark />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37]">[ Admin · Traffic ]</span>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tighter mt-1">Who came to the site</h1>
          </div>
          <Link to="/admin/beta" className="text-xs font-mono-spec uppercase tracking-widest text-neutral-400 underline">Other admin tools</Link>
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
        </div>

        {err && <p className="mt-6 text-red-400 text-sm">{err}</p>}
        {!data && !err && <p className="mt-6 text-neutral-500 text-sm">Loading…</p>}

        {data && (
          <>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Real visitors" value={t.visitors} hint="People, counted once a day" accent="text-[#D4AF37]" />
              <Stat label="Pages they read" value={t.page_views} />
              <Stat label="On the site now" value={t.live_now} hint="Last 5 minutes" accent="text-emerald-400" />
              <Stat label="Bot visits" value={t.bot_views} hint="Google, AI and other robots" />
              <Stat label="New accounts" value={t.signups} />
              <Stat label="Free audits claimed" value={t.free_audits_claimed} accent="text-[#D4AF37]" />
              <Stat label="Emails collected" value={t.emails_collected} />
              <Stat label="Pages per visitor" value={t.visitors ? (t.page_views / t.visitors).toFixed(1) : "0"} />
            </div>

            {data.by_day.length > 1 && (
              <div className="mt-6 marketing-surface p-5">
                <h2 className="font-display font-black text-lg tracking-tight">Real visitors each day</h2>
                <div className="mt-4 flex items-end gap-[3px] h-32">
                  {data.by_day.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.day}: ${d.visitors} visitors, ${d.views} pages, ${d.bots} bot visits`}>
                      <div className="text-[9px] text-neutral-400 mb-1">{data.by_day.length <= 14 ? d.visitors : ""}</div>
                      <div className="w-full bg-[#D4AF37]" style={{ height: `${(d.visitors / maxDay) * 100}%`, minHeight: d.visitors ? 3 : 1 }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-2 font-mono-spec">
                  <span>{data.from}</span><span>{data.to}</span>
                </div>
              </div>
            )}

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              <BarList title="Where people came from" rows={data.sources} empty="No outside visitors yet in this range." />
              <BarList title="Most read pages" rows={data.top_pages} format={pageName} />
              <BarList title="First page people landed on" rows={data.landing_pages} format={pageName} />
              <BarList title="Type of source" rows={data.source_kinds} />
              <BarList title="Phone or computer" rows={data.devices} />
              <BarList title="Country" rows={data.countries} format={(c) => (c === "?" ? "Unknown" : c)} />
              <BarList title="Buttons and downloads clicked" rows={data.events.map((e) => [`${e.label || e.event}`, e.count])} empty="No tracked clicks yet." />
              <BarList title="Emails by where they signed up" rows={data.emails_by_source} empty="No new emails in this range." />
              <BarList title="Bots that visited" rows={data.bots} empty="No bots seen." />
            </div>

            <div className="mt-6 marketing-surface p-5">
              <h2 className="font-display font-black text-lg tracking-tight">Latest visits</h2>
              {data.recent.length === 0 ? (
                <p className="text-sm text-neutral-500 mt-3">No visits yet in this range.</p>
              ) : (
                <ul className="mt-3 divide-y divide-neutral-800">
                  {data.recent.map((r, i) => (
                    <li key={i} className="py-2 text-sm flex justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate">{pageName(r.path)}</span>
                        <span className="block text-xs text-neutral-500 truncate">{r.source} · {r.device}{r.country ? ` · ${r.country}` : ""}</span>
                      </span>
                      <span className="text-xs text-neutral-500 shrink-0">{timeAgo(r.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-6 text-xs text-neutral-500 leading-relaxed">
              How this counts: no cookies and no saved IP addresses, so the site needs no cookie banner. A visitor is counted
              once per day. Bots are kept out of the visitor numbers. Your own phone stops being counted once you open this page.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
