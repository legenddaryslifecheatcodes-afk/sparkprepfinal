import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";

// Homepage top banner for the free book check (2026-11-24, Trey: the hero sells SparkPrep, the free audit
// gets its own banner across the top). Still, not scrolling: moving text gets ignored and is hard to read on
// a phone. Shown only while the server says the free audit is running; otherwise nothing renders.
export default function FreeCheckBanner({ pricing }) {
  const active = pricing ? !!pricing.free_audit?.active : true;
  if (!active) return null;
  return (
    <div className="text-black" style={{ background: "linear-gradient(180deg, #F3DC8A, #D4AF37 60%, #B8933E)" }} data-testid="free-check-banner">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-x-4 gap-y-2 flex-wrap text-center">
        <span className="font-display font-black text-sm md:text-base tracking-tight">
          Free book check through Dec 31. <span className="font-semibold">See what could get your book rejected by KDP or IngramSpark. No sign-up, no card.</span>
        </span>
        <Link to="/audit" className="inline-flex items-center gap-2 bg-black text-[#F3DC8A] rounded-full px-4 py-1.5 font-display font-black text-xs md:text-sm uppercase tracking-wide hover:bg-neutral-900" data-testid="free-check-banner-cta">
          <Search className="w-4 h-4" strokeWidth={3} /> Check my book free <ArrowRight className="w-4 h-4" strokeWidth={3} />
        </Link>
      </div>
    </div>
  );
}
