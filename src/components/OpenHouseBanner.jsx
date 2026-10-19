import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PartyPopper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * 24-hour Open House banner (backend open_house.py decides when it's on).
 * Everyone: "it's free, no sign-up" + a start button.
 * Guests:   "keep your work" -> add an email + password to the same account.
 */
function endsLabel(iso) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      timeZone: "America/Los_Angeles", timeZoneName: "short",
    });
  } catch {
    return "";
  }
}

function KeepWorkDialog({ open, onOpenChange }) {
  const { claimGuest, fmtErr } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await claimGuest(email, pw, name);
      toast.success("Saved. Your books are now on your account.");
      onOpenChange(false);
    } catch (err) {
      toast.error(fmtErr(err.response?.data?.detail) || err.message);
    } finally { setBusy(false); }
  };

  const field = "mt-2 w-full bg-transparent border border-neutral-700 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="open-house-keep-dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl tracking-tighter">Keep your work.</DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            Add an email and password so you can come back to your books after the open house.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={field} />
          </div>
          <div>
            <label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={field} data-testid="open-house-keep-email" />
          </div>
          <div>
            <label className="font-mono-spec text-[10px] tracking-widest uppercase text-neutral-500">Password (8+ characters)</label>
            <input type="password" required minLength={8} value={pw} onChange={e => setPw(e.target.value)} className={field} data-testid="open-house-keep-password" />
          </div>
          <button type="submit" disabled={busy} className="w-full btn-gold py-3.5 font-mono-spec text-xs tracking-widest uppercase disabled:opacity-50 btn-industrial">
            {busy ? "Saving…" : "Save my work"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OpenHouseBanner() {
  const { user, openHouse } = useAuth();
  const [keepOpen, setKeepOpen] = useState(false);
  if (!openHouse?.active) return null;
  const isGuest = Boolean(user && user.is_guest);

  return (
    <div className="text-black" style={{ background: "var(--brand-gold)" }} data-testid="open-house-banner">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <PartyPopper className="w-4 h-4 shrink-0" />
          <div className="font-mono-spec text-[10px] md:text-xs tracking-widest uppercase">
            <span className="font-bold">Free open house</span>
            <span className="opacity-80"> · Everything in SparkPrep is free, no sign-up, until {endsLabel(openHouse.ends_at)}</span>
          </div>
        </div>
        {isGuest ? (
          <button onClick={() => setKeepOpen(true)} className="bg-black text-white px-4 py-1.5 font-mono-spec text-[10px] tracking-widest uppercase" data-testid="open-house-keep">
            Keep my work
          </button>
        ) : !user ? (
          <Link to="/dashboard" className="bg-black text-white px-4 py-1.5 font-mono-spec text-[10px] tracking-widest uppercase" data-testid="open-house-start">
            Start a book free
          </Link>
        ) : null}
      </div>
      {isGuest && <KeepWorkDialog open={keepOpen} onOpenChange={setKeepOpen} />}
    </div>
  );
}
