import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Trey's own explanation of SparkPrep (2026-11-21, from his write-up), cleaned up into plain English.
// Every step matches a real feature: Interior Studio size lock, Cover Studio (224 templates + AI cover),
// the print checks, the full-book scan, Auto-Fix with independent verification, and the final check.
const STEPS = [
  {
    title: "Write and format your pages",
    body: "Tell SparkPrep which printer you're using, like Amazon KDP or IngramSpark. It locks in that printer's rules, so your page size and margins are right from the start. AI helpers are there at every step.",
    link: { to: "/interior-studio", label: "Open Interior Studio (free)" },
  },
  {
    title: "Make your cover",
    body: "Describe your idea and let the AI cover designer make it, or pick from 224 free templates. Enter your page count, paper type, and whether it's a paperback or hardcover (with or without a dust jacket), and SparkPrep sizes the full cover for you.",
    link: { to: "/cover-studio", label: "Open Cover Studio (free)" },
  },
  {
    title: "Print rules, checked as you go",
    body: "Pictures at 300 DPI. CMYK color, not RGB. Layers flattened. Ink under 240%. Proper bleed. Plus every other rule your printer has.",
  },
  {
    title: "One last full-book scan",
    body: "A final scan checks your whole book, inside and out, to catch anything the other checks missed.",
    link: { to: "/audit", label: "Check my book file" },
  },
  {
    title: "Fixed, double-checked, ready to print",
    body: "A separate system fixes the problems it finds, then a second check confirms each fix worked before you download your print-ready files.",
  },
];

export default function HowSparkPrepWorks() {
  return (
    <section className="border-t border-neutral-900" aria-labelledby="how-it-works" data-testid="how-sparkprep-works">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <span className="font-mono-spec text-xs tracking-widest uppercase text-[#D4AF37]">[ From finished manuscript to print-ready book ]</span>
        <h2 id="how-it-works" className="font-display font-black text-4xl md:text-5xl tracking-tighter mt-3">How Legenddary SparkPrep works</h2>
        <p className="mt-5 text-lg text-neutral-300 max-w-3xl leading-relaxed">
          Legenddary SparkPrep is the self-publishing industry's first{" "}
          <a href="/automated-publishing-production-system/" className="text-white underline decoration-[#D4AF37]/60 underline-offset-2 hover:text-[#D4AF37]">A.P.P.S. (Automated Publishing Production System)</a>.
          It handles your book from start to finish.
        </p>
        <ol className="mt-10 grid md:grid-cols-2 gap-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border border-neutral-800 bg-white/[0.02] p-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-black text-3xl text-[#D4AF37]">{i + 1}</span>
                <h3 className="font-display font-bold text-xl text-white tracking-tight">{s.title}</h3>
              </div>
              <p className="mt-3 text-neutral-300 leading-relaxed">{s.body}</p>
              {s.link && (
                <Link to={s.link.to} className="mt-4 inline-flex items-center gap-2 text-[#D4AF37] hover:text-white font-mono-spec text-xs tracking-widest uppercase">
                  {s.link.label} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-10 max-w-3xl border-l-2 border-[#D4AF37] bg-[#D4AF37]/[0.06] px-5 py-4" data-testid="how-it-works-story">
          <h3 className="font-display font-bold text-lg text-white tracking-tight">Why we built it</h3>
          <p className="mt-2 text-neutral-300 leading-relaxed">
            Our founder's book was rejected by the printer 18 times, and he almost quit. That's why Legenddary SparkPrep exists: so no other author has to go through that. (The story in our video is acted out with AI, but it really happened.)
          </p>
          <p className="mt-3 text-neutral-300 leading-relaxed">
            Don't worry about the confusing printing terms. SparkPrep learned them so you can focus on what matters: publishing your book. Congratulations on finishing it. We promise to make getting it print-ready painless.
          </p>
          <p className="mt-3 font-display font-bold italic text-[#D4AF37]">The evolution of self-publishing. Power without complexity.</p>
        </div>
      </div>
    </section>
  );
}
