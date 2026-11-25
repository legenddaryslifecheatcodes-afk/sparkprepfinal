import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, PlayCircle, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { fmtDay } from "@/lib/studio";
import StudioLayout from "./StudioLayout";

// Members Library: articles are served only by the members-only API (never as public pages), so Google and
// non-members can't read them. /studio is also marked noindex.
export default function StudioLibrary() {
  const { slug } = useParams();
  return slug ? <Article slug={slug} /> : <Index />;
}

function Index() {
  const [data, setData] = useState(null);
  const [cat, setCat] = useState("all");
  const nav = useNavigate();
  useEffect(() => {
    api.get("/studio/library").then(({ data }) => setData(data)).catch(() => nav("/studio"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <StudioLayout><div className="st-muted py-20 text-center">Opening the library…</div></StudioLayout>;
  const list = data.articles.filter((a) => cat === "all" || a.category === cat);
  const [lead, ...rest] = list;
  const cats = Object.entries(data.categories).filter(([k]) => data.articles.some((a) => a.category === k));
  return (
    <StudioLayout>
      <div className="st-eyebrow">Members Library</div>
      <h2 className="st-serif text-3xl mt-2">For members only</h2>
      <p className="st-muted mt-2 max-w-2xl">Marketing, launching and publishing know-how you won't find on the public site. New articles every Monday, Wednesday and Friday.</p>
      <div className="flex gap-2 mt-6 st-scroll-x">
        <button className={`st-tab ${cat === "all" ? "st-tab-on" : ""}`} onClick={() => setCat("all")}>All</button>
        {cats.map(([k, label]) => <button key={k} className={`st-tab ${cat === k ? "st-tab-on" : ""}`} onClick={() => setCat(k)}>{label}</button>)}
      </div>
      {lead && (
        <Link to={`/studio/library/${lead.slug}`} className="st-card block p-7 sm:p-10 mt-8" data-testid="library-lead">
          <div className="flex gap-2 items-center"><span className="st-pill st-pill-gold">{lead.category_label}</span><span className="st-faint text-xs">{fmtDay(lead.publish_on)}</span></div>
          <div className="st-serif text-3xl sm:text-4xl mt-4 leading-tight">{lead.title}</div>
          <p className="st-muted mt-3 max-w-2xl">{lead.summary}</p>
          <div className="st-faint text-sm mt-5 inline-flex items-center gap-2"><Clock className="w-4 h-4" /> {lead.minutes} min read{lead.has_video && <><PlayCircle className="w-4 h-4 ml-2" /> Video</>}</div>
        </Link>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {rest.map((a) => (
          <Link key={a.slug} to={`/studio/library/${a.slug}`} className="st-card p-6 flex flex-col">
            <div className="flex gap-2 items-center"><span className="st-pill">{a.category_label}</span></div>
            <div className="st-serif text-xl mt-3 leading-snug">{a.title}</div>
            <p className="st-muted text-sm mt-2 flex-1">{a.summary}</p>
            <div className="st-faint text-xs mt-4 inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {a.minutes} min · {fmtDay(a.publish_on)}</div>
          </Link>
        ))}
      </div>
    </StudioLayout>
  );
}

function Article({ slug }) {
  const [a, setA] = useState(null);
  const nav = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/studio/library/${slug}`).then(({ data }) => setA(data)).catch(() => nav("/studio/library"));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!a) return <StudioLayout><div className="st-muted py-20 text-center">Opening…</div></StudioLayout>;
  return (
    <StudioLayout>
      <article className="max-w-[720px] mx-auto">
        <Link to="/studio/library" className="inline-flex items-center gap-1.5 st-muted text-sm"><ArrowLeft className="w-4 h-4" /> Members Library</Link>
        <div className="flex gap-2 items-center mt-6"><span className="st-pill st-pill-gold">{a.category_label}</span><span className="st-faint text-xs">{fmtDay(a.publish_on)} · {a.minutes} min read</span></div>
        <h2 className="st-serif text-[34px] sm:text-5xl mt-4 leading-[1.08]">{a.title}</h2>
        <p className="st-muted text-lg mt-4 leading-relaxed">{a.summary}</p>
        <div className="st-rule my-8" />
        {a.video_url && (
          <video className="w-full rounded-2xl border border-[var(--st-line)] mb-8" src={a.video_url} controls preload="none" playsInline />
        )}
        <div className="st-article">
          {a.body.map((blk, i) => {
            if (blk.h) return <h2 key={i}>{blk.h}</h2>;
            if (blk.list) return <ul key={i}>{blk.list.map((li, j) => <li key={j}>{li}</li>)}</ul>;
            if (blk.tip) return (
              <div key={i} className="st-card p-5 my-7 flex gap-3" style={{ borderColor: "var(--st-line-strong)" }}>
                <Lightbulb className="w-5 h-5 text-[var(--st-gold)] flex-none mt-0.5" /><div className="text-[15.5px] leading-relaxed text-[#e9e2d0]">{blk.tip}</div>
              </div>
            );
            return <p key={i}>{blk.p}</p>;
          })}
        </div>
        <div className="st-rule my-10" />
        <Link to="/studio" className="st-btn">Back to my books</Link>
      </article>
    </StudioLayout>
  );
}
