import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, fmtErr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { GENRES, LAYOUT_KEYS, STYLE_KEYS, TEMPLATES, templatesFor } from "@/lib/coverStudio/templates";
import { toast } from "sonner";
import { Sparkles, Wand2 } from "lucide-react";

const Lbl = ({ children }) => <div className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{children}</div>;

// The AI cover designer. Step 1 plans the whole cover (layout, colours, fonts, the back-cover words and an
// art brief); step 2 paints artwork for the full wrap. Words are always set by SparkPrep's own text tools,
// never painted into the picture, because AI image models misspell titles.
export default function AIPanel({ engine, geo, words, setWords, genre, setGenre, applyTemplate }) {
  const { user } = useAuth();
  const [about, setAbout] = useState("");
  const [paint, setPaint] = useState(true);
  const [artPrompt, setArtPrompt] = useState("");
  const [step, setStep] = useState(null);
  const [blocked, setBlocked] = useState(null);

  const explain = (e) => {
    const s = e?.response?.status;
    const d = e?.response?.data?.detail;
    if (s === 401) setBlocked("login");
    else if (s === 402) setBlocked("book");
    return fmtErr(typeof d === "object" && d?.msg ? d.msg : d);
  };

  const paintArt = async (prompt) => {
    setStep("Painting artwork for the front, spine and back… (about a minute)");
    const fc = geo.full_cover;
    const { data } = await api.post("/ai/cover-art", {
      prompt, genre: genre !== "all" ? genre : null, width_in: fc.total_width, height_in: fc.total_height,
    }, { timeout: 180000 });
    await engine.addImage(`data:${data.mime || "image/png"};base64,${data.image_b64}`, "wrap", { ai: true });
  };

  const design = async () => {
    if (!words.title?.trim() || words.title === "Your Book Title") { toast.error("Type your book's title first."); return; }
    setBlocked(null);
    setStep("Planning your cover…");
    let plan = null;
    try {
      const { data } = await api.post("/ai/cover-plan", {
        title: words.title, author: words.author, subtitle: words.subtitle || null,
        genre: genre !== "all" ? GENRES.find(([k]) => k === genre)?.[1] : null,
        about: about || null, layouts: LAYOUT_KEYS, styles: STYLE_KEYS,
      }, { timeout: 90000 });
      plan = data;
    } catch (e) {
      const msg = explain(e);
      if ([401, 402].includes(e?.response?.status)) { setStep(null); return; }
      // The AI is down or not set up: still give the author a fitting start, and say so plainly.
      const pool = templatesFor(genre);
      const pick = pool[Math.floor(Math.random() * pool.length)] || TEMPLATES[0];
      await applyTemplate(pick.key);
      toast(`The AI designer isn't available right now (${msg}), so SparkPrep picked a ${pick.name} template for your genre.`);
      setStep(null);
      return;
    }
    try {
      const key = `${plan.layout}-${plan.style}`;
      const tpl = TEMPLATES.find((t) => t.key === key) || templatesFor(genre)[0] || TEMPLATES[0];
      const next = { ...words };
      if (plan.subtitle && !words.subtitle) next.subtitle = plan.subtitle;
      if (plan.tagline) next.tagline = plan.tagline;
      if (plan.blurb && (!words.blurb || words.blurb.startsWith("Write the back-cover"))) next.blurb = plan.blurb;
      setWords(next);
      await applyTemplate(tpl.key, next);
      if (plan.art_prompt) setArtPrompt(plan.art_prompt);
      if (paint && plan.art_prompt) await paintArt(plan.art_prompt);
      toast.success(paint ? "Your cover is designed: front, spine and back. Change anything you like." : "Your cover layout is ready. Change anything you like.");
    } catch (e) {
      toast.error(`The layout is in, but the artwork didn't finish: ${explain(e)}`);
    } finally {
      setStep(null);
    }
  };

  const paintOnly = async () => {
    if (!artPrompt.trim()) { toast.error("Describe the picture you want first."); return; }
    setBlocked(null);
    try {
      await paintArt(artPrompt);
      toast.success("Artwork added behind your words. Drag it, resize it, or send it backward.");
    } catch (e) {
      toast.error(explain(e));
    } finally {
      setStep(null);
    }
  };

  return (
    <div className="space-y-3" data-testid="studio-ai">
      <p className="text-[11px] text-neutral-600">
        Tell SparkPrep about your book and it designs the whole cover: front, spine and back, sized to your book. You can change everything after.
      </p>
      <div>
        <Lbl>Title</Lbl>
        <Input value={words.title} onChange={(e) => setWords({ ...words, title: e.target.value })} className="h-9" data-testid="studio-ai-title" />
      </div>
      <div>
        <Lbl>Author</Lbl>
        <Input value={words.author} onChange={(e) => setWords({ ...words, author: e.target.value })} className="h-9" />
      </div>
      <div>
        <Lbl>Genre</Lbl>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="h-9" data-testid="studio-ai-genre"><SelectValue /></SelectTrigger>
          <SelectContent>{GENRES.map(([k, l]) => <SelectItem key={k} value={k}>{k === "all" ? "Not sure" : l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Lbl>What's it about? (optional)</Lbl>
        <Textarea rows={3} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="A detective in 1920s Chicago hunts a killer who leaves poems at every scene. Dark, rainy, art deco." data-testid="studio-ai-about" />
      </div>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={paint} onChange={(e) => setPaint(e.target.checked)} /> Also paint artwork for the whole cover</label>
      <button onClick={design} disabled={!!step} className="w-full py-3 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-60" data-testid="studio-ai-design">
        <Sparkles className="w-4 h-4" /> {step || "Design my cover"}
      </button>

      {blocked === "login" && (
        <div className="text-xs p-2.5 pill-warn">The AI designer needs a free SparkPrep account. <Link to="/login" className="underline font-semibold">Log in</Link> or <Link to="/register" className="underline font-semibold">sign up</Link>. Templates and every design tool stay free without one.</div>
      )}
      {blocked === "book" && (
        <div className="text-xs p-2.5 pill-warn">The AI designer comes with a SparkPrep book. <Link to="/pricing" className="underline font-semibold">See pricing</Link>. Templates, fonts and every design tool stay free.</div>
      )}

      <div className="pt-3 border-t border-neutral-200">
        <Lbl>Just paint a picture</Lbl>
        <Textarea rows={3} value={artPrompt} onChange={(e) => setArtPrompt(e.target.value)} placeholder="A lone lighthouse on a storm-lit cliff, moody teal and orange, oil painting" data-testid="studio-ai-art-prompt" />
        <button onClick={paintOnly} disabled={!!step} className="mt-2 w-full py-2.5 bg-black text-white font-mono-spec text-xs tracking-widest uppercase btn-industrial flex items-center justify-center gap-2 disabled:opacity-60" data-testid="studio-ai-paint">
          <Wand2 className="w-4 h-4" /> Paint artwork
        </button>
        <p className="text-[10px] text-neutral-500 mt-1.5">The picture covers the whole wrap without any lettering in it. Your title and words stay sharp, editable text.</p>
      </div>
      {!user && <p className="text-[10px] text-neutral-500">You're not logged in. Your design is saved in this browser.</p>}
    </div>
  );
}
