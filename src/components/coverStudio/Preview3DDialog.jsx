import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BookMockup from "@/components/BookMockup";

// The cover on a real book: the same 3D book the Editor uses, cut at this book's exact trim and fold lines.
export default function Preview3DDialog({ open, onOpenChange, engine, geo }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || !engine) return;
    setUrl(null);
    setFailed(false);
    engine.render({ dpi: 150, maxWidth: 2600, format: "jpeg", quality: 0.9 })
      .then(({ url: u }) => setUrl(u))
      .catch(() => setFailed(true));
  }, [open, engine]);

  if (!geo) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" data-testid="studio-3d-dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl tracking-tighter">Your book in 3D</DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">Drag to turn it. The spine and back show exactly what will print there.</DialogDescription>
        </DialogHeader>
        <div className="h-[460px] max-h-[65vh]">
          <BookMockup
            imageUrl={url}
            crop={geo.full_cover}
            trim={geo.trim}
            spineWidth={geo.full_cover.spine_width}
            hasCover
            imageFailed={failed}
            spineTextAllowed={geo.spine_text_allowed}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
