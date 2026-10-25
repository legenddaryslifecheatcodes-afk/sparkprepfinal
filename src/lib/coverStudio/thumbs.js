import { StaticCanvas } from "fabric";
import { makeObject, fitOneLine, PPI } from "./engine";
import { buildTemplate } from "./templates";
import { loadFonts } from "./fonts";
import { panelsOf } from "./specs";

// Front-cover thumbnails for the template picker, drawn with the same code as the real cover, for the
// author's own book size and words. One off-screen canvas, one thumbnail at a time.

const cache = new Map();
let surface = null;
let queue = Promise.resolve();

export function thumbKey(key, geo, words) {
  const fc = geo.full_cover;
  return `${key}|${fc.total_width}x${fc.total_height}|${words.title}|${words.author}|${words.subtitle}`;
}

export function renderThumb(key, geo, words, width = 150) {
  const id = thumbKey(key, geo, words);
  if (cache.has(id)) return Promise.resolve(cache.get(id));
  const job = queue.then(async () => {
    if (cache.has(id)) return cache.get(id);
    const { objects, template } = buildTemplate(key, geo, words);
    await loadFonts(template.fonts);
    const fc = geo.full_cover;
    if (!surface) surface = new StaticCanvas(document.createElement("canvas"), { renderOnAddRemove: false, enableRetinaScaling: false });
    surface.clear();
    surface.setDimensions({ width: fc.total_width * PPI, height: fc.total_height * PPI });
    objects.map(makeObject).filter(Boolean).forEach((o) => { fitOneLine(o); surface.add(o); });
    surface.renderAll();
    const F = panelsOf(fc).find((p) => p.key === "front");
    const url = surface.toDataURL({
      format: "jpeg", quality: 0.85, enableRetinaScaling: false,
      left: F.x * PPI, top: F.y * PPI, width: F.w * PPI, height: F.h * PPI,
      multiplier: width / (F.w * PPI),
    });
    cache.set(id, url);
    return url;
  });
  queue = job.catch(() => {});
  return job;
}
