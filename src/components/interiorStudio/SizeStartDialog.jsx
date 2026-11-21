import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

// First thing the Interior Studio asks (Trey, 2026-11-20): where the book is being published and what size it
// is, so nobody writes a whole book at 6 x 9 without knowing they had a choice. Asked once per browser; the
// Book size tab can change it any time. Books opened from the Editor already know their size and skip this.
export default function SizeStartDialog({ open, lists, specs, onDone }) {
  const [platform, setPlatform] = useState(specs.platform);
  const [trim, setTrim] = useState(specs.trim_size);

  useEffect(() => {
    if (open) { setPlatform(specs.platform); setTrim(specs.trim_size); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lists) return null;
  const platforms = Object.entries(lists.platforms || {});
  const trims = Object.entries(lists.trim_sizes || {});

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDone({ platform, trim_size: trim }); }}>
      <DialogContent className="max-w-md" data-testid="interior-size-start">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl tracking-tighter flex items-center gap-2">
            <Ruler className="w-6 h-6" /> Let's set up your book
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            Two quick questions. Your pages get laid out to fit this size and this printer's own rules.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <div className="font-semibold text-sm mb-1">Where are you publishing?</div>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full h-10 px-2 border border-neutral-300 bg-white text-sm" data-testid="interior-start-platform">
              {platforms.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">What size is your book?</div>
            <select value={trim} onChange={(e) => setTrim(e.target.value)} className="w-full h-10 px-2 border border-neutral-300 bg-white text-sm" data-testid="interior-start-trim">
              {trims.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <p className="text-[11px] text-neutral-500 mt-1">Not sure? 6 x 9 is the most popular size. You can change it later under Book size.</p>
          </div>
          <button onClick={() => onDone({ platform, trim_size: trim })} className="w-full py-3 btn-gold font-mono-spec text-xs tracking-widest uppercase btn-industrial" data-testid="interior-start-go" data-next-step="Click to start">
            Start my book
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
