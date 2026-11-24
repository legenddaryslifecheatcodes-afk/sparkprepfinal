import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Wand2, Check, X, Upload } from "lucide-react";

// Problems SparkPrep can't safely decide alone, but can try (backend suggested_fixes.py).
// The customer sees before and after, then keeps it, says no, or uploads their own fix.
export const SUGGESTED_FIX_IDS = ["cover_size", "cover_template_leftovers", "cover_spine_text_forbidden", "cover_isbn_mismatch"];

const TITLES = {
  cover_size: "Fit my cover to the right size",
  cover_template_leftovers: "Remove the template's guide marks",
  cover_spine_text_forbidden: "Clear the text off my spine",
  cover_isbn_mismatch: "Put this book's barcode on",
};

// Previews need the sign-in, so they're fetched as files rather than linked.
function usePreview(url) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!url) return undefined;
    let objectUrl = null;
    let alive = true;
    api.get(url.replace(/^\/api/, ""), { responseType: "blob" })
      .then(({ data }) => { if (alive) { objectUrl = URL.createObjectURL(data); setSrc(objectUrl); } })
      .catch(() => setSrc(null));
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);
  return src;
}

export default function SuggestedFixDialog({ open, onOpenChange, projectId, slot, issueId, onAccepted, onUploadOwn }) {
  const [state, setState] = useState({ loading: false, fix: null, reason: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !issueId) return;
    setState({ loading: true, fix: null, reason: null });
    api.post(`/projects/${projectId}/suggested-fix`, { slot, issue_id: issueId })
      .then(({ data }) => setState({ loading: false, fix: data.offered ? data : null, reason: data.offered ? null : data.reason }))
      .catch((e) => setState({ loading: false, fix: null, reason: fmtErr(e.response?.data?.detail) }));
  }, [open, issueId, projectId, slot]);

  const before = usePreview(state.fix?.before_url);
  const after = usePreview(state.fix?.after_url);

  const decline = async () => {
    if (state.fix) await api.post(`/projects/${projectId}/suggested-fix/${state.fix.fix_id}/decline`).catch(() => {});
  };
  const close = async () => { await decline(); onOpenChange(false); };
  const keep = async () => {
    setSaving(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/suggested-fix/${state.fix.fix_id}/accept`);
      onAccepted?.(data);
      toast.success("Fix kept. SparkPrep checked your cover again.");
      onOpenChange(false);
    } catch (e) {
      toast.error(fmtErr(e.response?.data?.detail));
    } finally { setSaving(false); }
  };
  const uploadOwn = async () => { await decline(); onOpenChange(false); onUploadOwn?.(); };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="max-w-4xl" data-testid="suggested-fix-dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl tracking-tighter flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#D4AF37]" /> {TITLES[issueId] || "Suggested fix"}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            SparkPrep's best try. You decide: keep it, or upload your own fix. Either way, we check your cover again.
          </DialogDescription>
        </DialogHeader>

        {state.loading && (
          <div className="flex items-center gap-2 text-sm text-neutral-300 py-10 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Making your fix…
          </div>
        )}

        {!state.loading && state.reason && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-200" data-testid="suggested-fix-reason">{state.reason}</p>
            <button onClick={uploadOwn} data-next-step="Click to fix" data-next-step-priority={1}
              className="btn-gold px-4 py-2 text-[11px] font-mono-spec tracking-widest uppercase inline-flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload my own fix
            </button>
          </div>
        )}

        {!state.loading && state.fix && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {[["Before", before], ["After", after]].map(([label, src]) => (
                <figure key={label} className="border border-neutral-800 bg-black/40 p-2">
                  <figcaption className="font-mono-spec text-[10px] tracking-widest uppercase text-[#D4AF37] mb-1">{label}</figcaption>
                  {src ? <img src={src} alt={`${label} the fix`} className="w-full h-auto" />
                    : <div className="h-40 flex items-center justify-center text-neutral-600"><Loader2 className="w-4 h-4 animate-spin" /></div>}
                </figure>
              ))}
            </div>
            <p className="text-sm text-neutral-200" data-testid="suggested-fix-summary">{state.fix.summary}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={keep} disabled={saving} data-testid="suggested-fix-keep"
                data-next-step="Click to fix" data-next-step-priority={1}
                className="btn-gold px-4 py-2 text-[11px] font-mono-spec tracking-widest uppercase inline-flex items-center gap-1.5 disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Keep this fix
              </button>
              <button onClick={uploadOwn} data-testid="suggested-fix-upload"
                className="px-4 py-2 text-[11px] font-mono-spec tracking-widest uppercase border border-neutral-700 text-neutral-200 inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Upload my own fix
              </button>
              <button onClick={close} data-testid="suggested-fix-no"
                className="px-4 py-2 text-[11px] font-mono-spec tracking-widest uppercase text-neutral-400 inline-flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> No thanks
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
