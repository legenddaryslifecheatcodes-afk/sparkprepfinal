import { useEffect, useRef, useState } from "react";

/**
 * A book built from the author's real cover file, cut at the printer's trim lines.
 *
 * Plain DOM faces in CSS 3D (no WebGL): works on every device, can't render black, loads instantly.
 * For a full-wrap upload, each face shows its own panel of the file (back / spine / front) using the same
 * geometry the backend prints from (`crop` = spine calculator's full_cover, all in inches), so what the
 * author sees on the spine is exactly what will print on the spine.
 */

const VIEWS = {
  angled: { x: -8, y: 28 },
  front: { x: 0, y: 0 },
  spine: { x: 0, y: 90 },
  back: { x: 0, y: 180 },
};

const PAGE_EDGE = "repeating-linear-gradient(90deg, #f3ecdd 0px, #f3ecdd 1px, #e2d8c3 1px, #e2d8c3 2px)";
const PAGE_EDGE_H = "repeating-linear-gradient(0deg, #f3ecdd 0px, #f3ecdd 1px, #e2d8c3 1px, #e2d8c3 2px)";

export default function BookMockup({ imageUrl, crop, trim, spineWidth, hasCover, spineTextAllowed = true }) {
  const boxRef = useRef(null);
  const [box, setBox] = useState({ w: 360, h: 420 });
  const [rot, setRot] = useState(VIEWS.angled);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const trimW = trim?.w || 6;
  const trimH = trim?.h || 9;
  const spineIn = Math.max(0.02, spineWidth || 0.5);
  // Fit the book (and its spine when turned) inside the stage with room to rotate.
  const H = Math.max(120, Math.min(box.h * 0.72, (box.w * 0.62) * (trimH / trimW)));
  const W = H * (trimW / trimH);
  const D = Math.max(3, H * (spineIn / trimH));

  const full = crop && crop.total_width && crop.panel_width ? crop : null;
  const scale = full ? H / full.panel_height : 0;                        // px per inch
  const y0 = full ? (full.total_height - full.panel_height) / 2 : 0;     // top trim line, inches
  const panelBg = (xIn) => (full && imageUrl ? {
    backgroundImage: `url("${imageUrl}")`,
    backgroundSize: `${full.total_width * scale}px ${full.total_height * scale}px`,
    backgroundPosition: `${-xIn * scale}px ${-y0 * scale}px`,
    backgroundRepeat: "no-repeat",
  } : null);

  const frontStyle = full ? panelBg(full.front_x) : imageUrl ? {
    backgroundImage: `url("${imageUrl}")`, backgroundSize: "cover", backgroundPosition: "center",
  } : null;
  const spineStyle = full ? panelBg(full.spine_x) : null;
  const backStyle = full ? panelBg(full.back_x) : null;

  const face = (w, h, transform, extra) => ({
    position: "absolute", left: (W - w) / 2, top: (H - h) / 2, width: w, height: h,
    transform, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", ...extra,
  });

  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, rot };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setRot({ y: drag.current.rot.y + dx * 0.5, x: Math.max(-35, Math.min(35, drag.current.rot.x - dy * 0.3)) });
  };
  const onUp = () => { drag.current = null; setDragging(false); };

  const active = Object.entries(VIEWS).find(([, v]) => v.x === rot.x && v.y === rot.y)?.[0];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#F1EEE8]" data-testid="book-mockup">
      <div
        ref={boxRef}
        className={`relative flex-1 min-h-0 flex items-center justify-center select-none touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ perspective: `${Math.max(900, H * 4)}px` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        data-testid="book-mockup-stage"
      >
        {/* soft floor shadow */}
        <div className="absolute rounded-[50%] bg-black/25 blur-xl pointer-events-none"
          style={{ width: W * 1.1, height: Math.max(10, H * 0.06), top: `calc(50% + ${H / 2 + 6}px)` }} />
        <div
          style={{
            position: "relative", width: W, height: H, transformStyle: "preserve-3d",
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: dragging ? "none" : "transform 600ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {/* front cover */}
          <div data-testid="face-front" style={face(W, H, `translateZ(${D / 2}px)`, {
            background: "#39424e", ...frontStyle, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)",
          })}>
            {!hasCover && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-white/80">
                <div className="font-mono-spec text-[10px] tracking-widest uppercase">No cover yet</div>
                <div className="text-[11px] mt-1 text-white/60">Upload your cover to see it on a real book</div>
              </div>
            )}
            {hasCover && !imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center font-mono-spec text-[10px] tracking-widest uppercase text-white/70">Loading cover…</div>
            )}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(105deg, rgba(0,0,0,.18) 0%, rgba(255,255,255,.10) 6%, rgba(255,255,255,0) 18%, rgba(0,0,0,0) 80%, rgba(0,0,0,.08) 100%)" }} />
          </div>
          {/* back cover */}
          <div data-testid="face-back" style={face(W, H, `rotateY(180deg) translateZ(${D / 2}px)`, { background: "#2b2f36", ...backStyle })}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(255deg, rgba(0,0,0,.16) 0%, rgba(0,0,0,0) 20%)" }} />
          </div>
          {/* spine (left edge when looking at the front) */}
          <div data-testid="face-spine" style={face(D, H, `rotateY(-90deg) translateZ(${W / 2}px)`, { background: "#23272d", ...spineStyle })}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.25), rgba(255,255,255,.06) 50%, rgba(0,0,0,.25))" }} />
          </div>
          {/* page block: fore-edge, top, bottom */}
          <div style={face(D, H, `rotateY(90deg) translateZ(${W / 2}px)`, { background: PAGE_EDGE, width: D - 1 })} />
          <div style={face(W, D, `rotateX(90deg) translateZ(${H / 2}px)`, { background: PAGE_EDGE_H })} />
          <div style={face(W, D, `rotateX(-90deg) translateZ(${H / 2}px)`, { background: PAGE_EDGE_H, filter: "brightness(.8)" })} />
        </div>
      </div>

      <div className="px-3 pb-3 pt-1 space-y-2">
        <div className="flex flex-wrap gap-1.5" data-testid="book-mockup-views">
          {[["angled", "Angled"], ["front", "Front"], ["spine", "Spine"], ["back", "Back"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRot(VIEWS[k])}
              className={`px-2.5 py-1 font-mono-spec text-[10px] tracking-widest uppercase border transition-colors ${active === k ? "bg-black text-white border-black" : "bg-white border-neutral-300 hover:border-black text-neutral-700"}`}
              data-testid={`view-${k}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] leading-snug text-neutral-600" data-testid="book-mockup-note">
          {full
            ? "Your file, cut at the printer's trim lines — what's on this spine and back is exactly what will print there. Drag to turn the book."
            : hasCover
              ? "Front cover only. Upload a full wrap (back + spine + front) to see the spine and back. Drag to turn the book."
              : "Drag to turn the book."}
          {full && spineTextAllowed === false && (
            <span className="block mt-1 text-amber-700">This book is too thin for spine text at its page count — keep the spine free of text.</span>
          )}
        </p>
      </div>
    </div>
  );
}
