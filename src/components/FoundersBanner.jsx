import { useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "founders_banner_dismissed";
const FOUNDERS_URL = "https://sparkprep-founders.pages.dev";

export default function FoundersBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="bg-black text-white px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37] px-2 py-1">
          Founders Launch
        </span>
        <span className="text-sm">
          Only 50 founding spots, ever. Lock in your pricing for life before September 23rd.
        </span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href={FOUNDERS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono-spec text-[10px] tracking-widest uppercase bg-[#D4AF37] text-black px-4 py-2"
        >
          See Founding Pricing
        </a>
        <button onClick={dismiss} aria-label="Dismiss" className="text-neutral-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
