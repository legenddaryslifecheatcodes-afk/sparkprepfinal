import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

// Same deadline as the backend's AUDIT_SEASON_START (server.py) -- Sept 23
// is both when founding pricing locks and when the 99-Day Audit Season
// begins, so this stays in sync with that instead of a second hardcoded date.
const DEADLINE = new Date("2026-09-23T00:00:00Z");
const FOUNDERS_URL = "https://sparkprep-founders.pages.dev";

function getTimeLeft() {
  const diff = DEADLINE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

// Big, top-of-page banner for the public Landing page -- distinct from the
// smaller FoundersBanner shown inside the logged-in Dashboard. Deliberately
// not dismissible: this is a limited-spots offer meant to stay visible to
// every visitor, not a one-time notice. Renders nothing once the deadline
// passes rather than showing an expired countdown.
export default function FoundersLaunchBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft()), 60000);
    return () => clearInterval(t);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="bg-gradient-to-r from-black via-[#1a1408] to-black border-b border-[#D4AF37]/40" data-testid="founders-launch-banner">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono-spec text-[10px] tracking-widest uppercase bg-[#D4AF37] text-black px-2.5 py-1 flex items-center gap-1.5 font-bold shrink-0">
            <Sparkles className="w-3 h-3" /> Available Now
          </span>
          <span className="text-white text-sm md:text-base font-semibold">
            Founders Launch — only 50 founding spots, ever. Lock in your pricing for life.
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 font-mono-spec text-[10px] md:text-xs tracking-widest uppercase text-[#D4AF37]" data-testid="founders-countdown">
            <span className="border border-[#D4AF37]/50 px-2 py-1">{timeLeft.days}d</span>
            <span className="border border-[#D4AF37]/50 px-2 py-1">{timeLeft.hours}h</span>
            <span className="border border-[#D4AF37]/50 px-2 py-1">{timeLeft.minutes}m</span>
            <span className="text-neutral-500 normal-case tracking-normal whitespace-nowrap">left to lock in</span>
          </div>
          <a
            href={FOUNDERS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-5 py-2.5 font-mono-spec text-[10px] tracking-widest uppercase btn-industrial flex items-center gap-1.5 whitespace-nowrap"
            data-testid="founders-launch-cta"
          >
            Claim Founding Pricing <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
