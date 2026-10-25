// The free Cover Studio download: sharp enough to enjoy and share, but marked so no printer will take it.
// Instead of a big watermark across the art, small "SparkPrep Preview" tags sit exactly where KDP, IngramSpark,
// B&N Press and Lulu all reject a cover: text crossing the trim line into the bleed (outside the safe area) and
// text crossing the spine folds. The file is also 150 DPI, half the 300 DPI every one of them asks for.
// The print-ready file comes with the book.
import { panelsOf } from "./specs";

export const PREVIEW_DPI = 150;
const LABEL = "SPARKPREP PREVIEW";

/** Draws one small tag centred on (x, y) px, rotated by `angle` radians, readable on light or dark art. */
function tag(ctx, x, y, angle, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.font = `800 ${size}px sans-serif`;
  const w = ctx.measureText(LABEL).width + size * 0.9;
  const h = size * 1.5;
  ctx.fillStyle = "rgba(13,13,13,0.72)";
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#D4AF37";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(LABEL, 0, size * 0.06);
  ctx.restore();
}

/**
 * Stamps the preview tags on a rendered full wrap. `url` is the wrap at PREVIEW_DPI; `fc` is geometry.full_cover
 * (inches, same origin as the image). Returns a JPEG data URL.
 */
export function markPreview(url, fc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const px = c.width / fc.total_width;
      const size = Math.max(9, Math.round(0.09 * px));   // about 0.09" tall: small, but there on every edge
      const ps = panelsOf(fc);
      const first = ps[0];
      const last = ps[ps.length - 1];
      const top = first.y;
      const bottom = first.y + first.h;
      const covers = ps.filter((p) => p.key === "back" || p.key === "front");

      // Across the top and bottom trim lines of the back and front covers: half in the bleed, half on the cover.
      for (const p of covers) {
        for (const f of [0.3, 0.7]) {
          tag(ctx, (p.x + p.w * f) * px, top * px, 0, size);
          tag(ctx, (p.x + p.w * f) * px, bottom * px, 0, size);
        }
      }
      // Across the outer side trim lines.
      for (const f of [0.25, 0.5, 0.75]) {
        tag(ctx, first.x * px, (top + first.h * f) * px, -Math.PI / 2, size);
        tag(ctx, (last.x + last.w) * px, (top + last.h * f) * px, Math.PI / 2, size);
      }
      // Across both spine folds (and flap folds), near the top and bottom so they stay off the spine title.
      const folds = ps.slice(1).map((p) => p.x);
      for (const x of folds) {
        for (const f of [0.12, 0.88]) tag(ctx, x * px, (top + first.h * f) * px, -Math.PI / 2, size);
      }
      resolve(c.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => reject(new Error("Couldn't draw the preview."));
    img.src = url;
  });
}
