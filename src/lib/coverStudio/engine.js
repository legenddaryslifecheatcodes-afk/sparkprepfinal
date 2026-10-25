import {
  Canvas, Rect, Circle, Polygon, Line, Textbox, FabricImage, Gradient, Shadow, filters,
  setFilterBackend, Canvas2dFilterBackend,
} from "fabric";
import { panelsOf, PANEL_LABELS } from "./specs";
import { buildTemplate } from "./templates";
import { fontStack, loadFonts } from "./fonts";

// The Cover Studio's drawing surface: one Fabric canvas holding the whole wrap (back, spine, front and any
// dust-jacket flaps) at PPI pixels per inch. Everything is stored in those units so a design can be re-laid
// onto a new trim size or page count, and exported at 300 DPI by rendering the same objects larger.

export const PPI = 60;
const PRINT_DPI = 300;
const PROPS = ["sp_role", "sp_panel", "sp_upper", "sp_fit", "sp_photo", "sp_ai", "selectable", "evented", "lockMovementX", "lockMovementY", "hasControls"];
const HISTORY_MAX = 60;

// Image filters on big cover photos need the 2D backend; the WebGL one silently crops past 2048px.
try { setFilterBackend(new Canvas2dFilterBackend()); } catch { /* older browsers keep the default */ }

const px = (inches) => inches * PPI;

function fillOf(fill, w, h) {
  if (!fill || typeof fill === "string") return fill || "transparent";
  if (fill.radial) {
    const r = Math.max(w, h) / 2;
    return new Gradient({
      type: "radial", gradientUnits: "pixels",
      coords: { x1: w / 2, y1: h / 2, r1: 0, x2: w / 2, y2: h / 2, r2: r },
      colorStops: [{ offset: 0, color: fill.radial[0] }, { offset: 1, color: fill.radial[1] }],
    });
  }
  const [a, b] = fill.grad;
  const coords = fill.dir === "h" ? { x1: 0, y1: 0, x2: w, y2: 0 }
    : fill.dir === "d" ? { x1: 0, y1: 0, x2: w, y2: h }
      : { x1: 0, y1: 0, x2: 0, y2: h };
  return new Gradient({ type: "linear", gradientUnits: "pixels", coords, colorStops: [{ offset: 0, color: a }, { offset: 1, color: b }] });
}

const WORD_FOR_ROLE = { title: "title", spine_title: "title", subtitle: "subtitle", author: "author", spine_author: "author", tagline: "tagline", blurb: "blurb", flap_blurb: "blurb", bio: "bio" };
export const wordFor = (role) => WORD_FOR_ROLE[role];

export function makeObject(d) {
  const base = { sp_role: d.role || "deco", sp_panel: d.panel || "full", opacity: d.opacity ?? 1 };
  if (d.locked) Object.assign(base, { selectable: false, evented: false, lockMovementX: true, lockMovementY: true, hasControls: false });
  const stroke = d.stroke ? { stroke: d.stroke, strokeWidth: px(d.strokeW || 0.02), strokeUniform: true } : {};
  if (d.type === "rect") {
    const w = px(d.w), h = px(d.h);
    return new Rect({ ...base, ...stroke, left: px(d.x), top: px(d.y), width: w, height: h, rx: px(d.rx || 0), ry: px(d.rx || 0), fill: fillOf(d.fill, w, h), sp_photo: d.role === "photo" });
  }
  if (d.type === "circle") {
    const r = px(d.r);
    return new Circle({ ...base, ...stroke, left: px(d.x), top: px(d.y), radius: r, originX: "center", originY: "center", fill: fillOf(d.fill, r * 2, r * 2) });
  }
  if (d.type === "polygon") {
    const pts = d.points.map(([x, y]) => ({ x: px(x), y: px(y) }));
    return new Polygon(pts, { ...base, ...stroke, fill: fillOf(d.fill, 1, 1) });
  }
  if (d.type === "line") {
    return new Line([px(d.x1), px(d.y1), px(d.x2), px(d.y2)], { ...base, stroke: d.stroke, strokeWidth: px(d.strokeW || 0.02) });
  }
  if (d.type === "text") {
    const tb = new Textbox(d.upper ? (d.text || "").toUpperCase() : (d.text || ""), {
      ...base,
      left: px(d.x), top: px(d.y), width: px(d.w),
      originX: d.originX || "left", originY: d.originY || "top", angle: d.angle || 0,
      fontFamily: d.font, fontSize: px(d.size), fill: d.fill, textAlign: d.align || "center",
      fontWeight: d.weight || "normal", fontStyle: d.italic ? "italic" : "normal",
      charSpacing: d.spacing || 0, lineHeight: d.lineHeight || 1.1,
      sp_upper: !!d.upper, sp_fit: d.maxLines === 1,
      shadow: d.shadow ? new Shadow({ color: "rgba(0,0,0,0.55)", blur: px(0.08), offsetX: 0, offsetY: px(0.02) }) : null,
      splitByGrapheme: false,
    });
    return tb;
  }
  return null;
}

/** Shrinks a one-line text (spine title / author) until it fits on one line. */
export function fitOneLine(tb) {
  if (!tb.sp_fit || !tb.text) return;
  tb.initDimensions?.();
  for (let i = 0; i < 30 && tb.textLines && tb.textLines.length > 1 && tb.fontSize > 4; i++) {
    tb.set("fontSize", tb.fontSize * 0.92);
    tb.initDimensions?.();
  }
}

export class CoverEngine {
  constructor(el, { onSelect, onChange, onWordEdited } = {}) {
    this.canvas = new Canvas(el, {
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
      selectionColor: "rgba(255,106,0,0.08)",
      selectionBorderColor: "#FF6A00",
    });
    this.geo = null;
    this.zoom = 1;
    this.showGuides = true;
    this.history = [];
    this.future = [];
    this.silent = 0;
    this.cb = { onSelect, onChange, onWordEdited };

    const c = this.canvas;
    const sel = () => this.cb.onSelect?.(c.getActiveObject() || null);
    c.on("selection:created", sel);
    c.on("selection:updated", sel);
    c.on("selection:cleared", sel);
    c.on("object:modified", (e) => { this.tagPanel(e.target); this.commit(); sel(); });
    c.on("text:changed", (e) => {
      const t = e.target;
      fitOneLine(t);
      const word = wordFor(t.sp_role);
      if (word) this.cb.onWordEdited?.(word, t.text, t);
    });
    c.on("text:editing:exited", () => this.commit());
  }

  dispose() { this.canvas.dispose(); }

  // ---------- geometry ----------
  get size() {
    const fc = this.geo.full_cover;
    return { w: px(fc.total_width), h: px(fc.total_height) };
  }

  fit(boxW, boxH) {
    if (!this.geo) return;
    const { w, h } = this.size;
    const z = Math.max(0.1, Math.min((boxW - 24) / w, (boxH - 24) / h));
    this.zoom = z;
    this.canvas.setDimensions({ width: Math.round(w * z), height: Math.round(h * z) });
    this.canvas.setZoom(z);
    this.canvas.requestRenderAll();
  }

  panelAt(xIn) {
    const ps = panelsOf(this.geo.full_cover);
    const hit = ps.find((p) => xIn >= p.x && xIn <= p.x + p.w);
    if (hit) return hit.key;
    return xIn < ps[0].x ? ps[0].key : ps[ps.length - 1].key;
  }

  tagPanel(o) {
    if (!o || !this.geo || o.sp_guide || o.sp_role === "bg" || o.sp_panel === "full") return;
    if (o.type === "activeselection" || o.type === "activeSelection") { o.getObjects().forEach((x) => this.tagPanel(x)); return; }
    o.sp_panel = this.panelAt(o.getCenterPoint().x / PPI);
  }

  /**
   * New book size. With `remap`, every object moves to the same spot on its own panel of the new wrap and
   * scales with it, so changing trim size or page count keeps the design instead of starting over.
   */
  setGeometry(geo, { remap = true } = {}) {
    const old = this.geo;
    this.geo = geo;
    if (old && remap) this.remap(old, geo);
    // Below the printer's minimum page count the spine may not carry words at all.
    this.objects().filter((o) => o.sp_role === "spine_title" || o.sp_role === "spine_author")
      .forEach((o) => { o.visible = geo.spine_text_allowed !== false; });
    this.drawGuides();
    this.commit();
  }

  remap(oldGeo, newGeo) {
    const oldP = Object.fromEntries(panelsOf(oldGeo.full_cover).map((p) => [p.key, p]));
    const newP = Object.fromEntries(panelsOf(newGeo.full_cover).map((p) => [p.key, p]));
    const of = oldGeo.full_cover, nf = newGeo.full_cover;
    for (const o of this.objects()) {
      if (o.sp_role === "bg") {
        o.set({ left: 0, top: 0, scaleX: 1, scaleY: 1, width: px(nf.total_width), height: px(nf.total_height) });
        if (o.fill && typeof o.fill === "object") o.set("fill", this.regradient(o.fill, px(nf.total_width), px(nf.total_height)));
        o.setCoords();
        continue;
      }
      const c = o.getCenterPoint();
      const cx = c.x / PPI, cy = c.y / PPI;
      let key = o.sp_panel;
      if (key === "full") {
        const sx = nf.total_width / of.total_width, sy = nf.total_height / of.total_height;
        o.set({ scaleX: o.scaleX * sx, scaleY: o.scaleY * sy });
        o.setPositionByOrigin({ x: px(cx * sx), y: px(cy * sy) }, "center", "center");
        o.setCoords();
        continue;
      }
      if (!oldP[key] || !newP[key]) key = this.panelAt.call({ geo: oldGeo }, cx);
      const a = oldP[key], b = newP[key] || newP.front;
      if (!a || !b) continue;
      const sy = b.h / a.h;
      let nx, ny = b.y + (cy - a.y) * sy;
      if (key === "spine") {
        nx = b.x + b.w / 2;
        if (o.type === "textbox") {
          const room = Math.max(0.06, (b.w - 0.125) / 1.3);
          o.set({ width: o.width * sy, fontSize: Math.min(o.fontSize * sy, px(room)) });
          fitOneLine(o);
        } else {
          o.set({ scaleY: o.scaleY * sy, scaleX: o.scaleX * (b.w / Math.max(0.01, a.w)) });
        }
      } else {
        const sx = b.w / a.w;
        nx = b.x + (cx - a.x) * sx;
        const s = Math.min(sx, sy);
        o.set({ scaleX: o.scaleX * s, scaleY: o.scaleY * s });
      }
      const before = o.getCenterPoint();
      o.setPositionByOrigin({ x: px(nx), y: px(ny) }, "center", "center");
      o.setCoords();
      // A picture in a template's window carries its window with it.
      const clip = o.clipPath;
      if (clip?.absolutePositioned && key !== "spine") {
        const k = Math.min(b.w / a.w, sy);
        clip.set({ left: clip.left + (px(nx) - before.x), top: clip.top + (px(ny) - before.y), scaleX: clip.scaleX * k, scaleY: clip.scaleY * k });
        clip.setCoords();
      }
    }
    this.canvas.requestRenderAll();
  }

  regradient(g, w, h) {
    const stops = g.colorStops || [];
    if (stops.length < 2) return g;
    const dir = g.type === "radial" ? null : (g.coords.x2 > 0 && g.coords.y2 > 0 ? "d" : g.coords.x2 > 0 ? "h" : "v");
    return dir ? fillOf({ grad: [stops[0].color, stops[stops.length - 1].color], dir }, w, h)
      : fillOf({ radial: [stops[0].color, stops[stops.length - 1].color] }, w, h);
  }

  // ---------- guides ----------
  drawGuides() {
    const c = this.canvas;
    c.getObjects().filter((o) => o.sp_guide).forEach((o) => c.remove(o));
    if (!this.geo || !this.showGuides) { c.requestRenderAll(); return; }
    const fc = this.geo.full_cover;
    const s = this.geo.safe_margin || 0.375;
    const g = { selectable: false, evented: false, excludeFromExport: true, sp_guide: true, objectCaching: false };
    const W = px(fc.total_width), H = px(fc.total_height);
    const top = (fc.total_height - fc.panel_height) / 2;
    const out = [];
    // The bleed: everything outside the trim gets cut off. Tinted so authors keep words out of it.
    const tint = "rgba(198,40,40,0.13)";
    out.push(new Rect({ ...g, left: 0, top: 0, width: W, height: px(top), fill: tint }));
    out.push(new Rect({ ...g, left: 0, top: H - px(top), width: W, height: px(top), fill: tint }));
    const ps = panelsOf(fc);
    const firstX = ps[0].x, last = ps[ps.length - 1];
    out.push(new Rect({ ...g, left: 0, top: px(top), width: px(firstX), height: px(fc.panel_height), fill: tint }));
    out.push(new Rect({ ...g, left: px(last.x + last.w), top: px(top), width: W - px(last.x + last.w), height: px(fc.panel_height), fill: tint }));
    const dash = (x1, y1, x2, y2, color, d = [6, 4]) => out.push(new Line([x1, y1, x2, y2], { ...g, stroke: color, strokeWidth: 1, strokeDashArray: d, strokeUniform: true }));
    // Trim box and every fold line.
    dash(px(firstX), px(top), px(last.x + last.w), px(top), "#D4AF37");
    dash(px(firstX), H - px(top), px(last.x + last.w), H - px(top), "#D4AF37");
    ps.forEach((p, i) => {
      dash(px(p.x), px(top), px(p.x), H - px(top), i === 0 ? "#D4AF37" : "#007BFF");
      if (i === ps.length - 1) dash(px(p.x + p.w), px(top), px(p.x + p.w), H - px(top), "#D4AF37");
      // Safe area: keep words and faces inside these lines.
      if (p.key !== "spine") {
        out.push(new Rect({ ...g, left: px(p.x + s), top: px(p.y + s), width: px(p.w - 2 * s), height: px(p.h - 2 * s), fill: "transparent", stroke: "#16A34A", strokeWidth: 1, strokeDashArray: [3, 4], strokeUniform: true }));
      }
      out.push(new Textbox(PANEL_LABELS[p.key].toUpperCase(), { ...g, left: px(p.x + p.w / 2), top: px(top) + 4, originX: "center", width: Math.max(px(p.w), 60), fontSize: 9, fontFamily: "JetBrains Mono, monospace", fill: "rgba(0,123,255,0.85)", textAlign: "center", angle: 0 }));
    });
    // The barcode area: the distributor prints the ISBN barcode here, so nothing important goes under it.
    const back = ps.find((p) => p.key === "back");
    const bz = this.geo.barcode_zone || { w: 2, h: 1.2 };
    const bx = back.x + back.w - s - bz.w, by = back.y + back.h - s - bz.h;
    out.push(new Rect({ ...g, left: px(bx), top: px(by), width: px(bz.w), height: px(bz.h), fill: "rgba(255,255,255,0.75)", stroke: "#22C55E", strokeWidth: 1, strokeDashArray: [4, 3], strokeUniform: true }));
    out.push(new Textbox("BARCODE AREA", { ...g, left: px(bx + bz.w / 2), top: px(by + bz.h / 2), originX: "center", originY: "center", width: px(bz.w), fontSize: 9, fontFamily: "JetBrains Mono, monospace", fill: "#15803D", textAlign: "center" }));
    out.forEach((o) => c.add(o));
    c.requestRenderAll();
  }

  setGuides(on) { this.showGuides = on; this.drawGuides(); }

  keepGuidesOnTop() {
    const c = this.canvas;
    c.getObjects().filter((o) => o.sp_guide).forEach((o) => c.bringObjectToFront(o));
  }

  // ---------- content ----------
  objects() { return this.canvas.getObjects().filter((o) => !o.sp_guide); }

  async applyTemplate(key, words) {
    const { objects, template } = buildTemplate(key, this.geo, words);
    await loadFonts(template.fonts);
    // Keep the author's own pictures: a new template replaces the design, not their photos.
    const keep = this.objects().filter((o) => o.type === "image");
    this.silent++;
    this.objects().forEach((o) => this.canvas.remove(o));
    objects.map(makeObject).filter(Boolean).forEach((o) => { fitOneLine(o); this.canvas.add(o); });
    keep.forEach((o) => this.canvas.add(o));
    this.silent--;
    this.drawGuides();
    this.commit();
    return template;
  }

  /** Puts the book's words into every text box that shows them (title on the front and the spine, ...). */
  setWords(words, except) {
    let changed = false;
    for (const o of this.objects()) {
      const w = wordFor(o.sp_role);
      if (!w || o === except || words[w] === undefined) continue;
      const next = o.sp_upper ? (words[w] || "").toUpperCase() : (words[w] || "");
      if (o.text !== next) {
        o.set("text", next);
        if (o.sp_fit) {
          o.set("fontSize", Math.max(o.fontSize, o.sp_fitMax || o.fontSize));
          fitOneLine(o);
        }
        changed = true;
      }
    }
    if (changed) { this.canvas.requestRenderAll(); this.commitSoon(); }
  }

  centerOf(panelKey = "front") {
    const p = panelsOf(this.geo.full_cover).find((x) => x.key === panelKey) || panelsOf(this.geo.full_cover)[0];
    return { x: px(p.x + p.w / 2), y: px(p.y + p.h / 2), w: px(p.w), panel: p.key };
  }

  async addText(kind = "heading", font = "Playfair Display", panel = "front") {
    await loadFonts([font]);
    const c = this.centerOf(panel);
    const size = { heading: 0.55, subheading: 0.28, body: 0.15 }[kind] || 0.3;
    const label = { heading: "Your Heading", subheading: "A subheading", body: "Add a paragraph of text here." }[kind];
    const tb = new Textbox(label, {
      left: c.x, top: c.y, originX: "center", originY: "center", width: c.w * 0.8,
      fontFamily: font, fontSize: px(size), fill: "#111111", textAlign: "center", lineHeight: 1.15,
      sp_role: "text", sp_panel: c.panel,
    });
    this.addAndSelect(tb);
    return tb;
  }

  addShape(kind, color = "#FF6A00", panel = "front") {
    const c = this.centerOf(panel);
    const d = c.w * 0.3;
    const base = { left: c.x, top: c.y, originX: "center", originY: "center", fill: color, sp_role: "shape", sp_panel: c.panel };
    let o;
    if (kind === "circle") o = new Circle({ ...base, radius: d / 2 });
    else if (kind === "ring") o = new Circle({ ...base, radius: d / 2, fill: "transparent", stroke: color, strokeWidth: px(0.04), strokeUniform: true });
    else if (kind === "rounded") o = new Rect({ ...base, width: d * 1.4, height: d, rx: d * 0.15, ry: d * 0.15 });
    else if (kind === "frame") o = new Rect({ ...base, width: d * 1.4, height: d * 1.8, fill: "transparent", stroke: color, strokeWidth: px(0.03), strokeUniform: true });
    else if (kind === "line") o = new Rect({ ...base, width: c.w * 0.5, height: px(0.03) });
    else if (kind === "band") o = new Rect({ ...base, width: c.w, height: d * 0.6 });
    else if (kind === "triangle") o = new Polygon([{ x: 0, y: d }, { x: d / 2, y: 0 }, { x: d, y: d }], base);
    else if (kind === "star") {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? d * 0.22 : d / 2;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push({ x: d / 2 + r * Math.cos(a), y: d / 2 + r * Math.sin(a) });
      }
      o = new Polygon(pts, base);
    } else if (kind === "diamond") o = new Polygon([{ x: d / 2, y: 0 }, { x: d, y: d / 2 }, { x: d / 2, y: d }, { x: 0, y: d / 2 }], base);
    else o = new Rect({ ...base, width: d * 1.4, height: d });
    this.addAndSelect(o);
    return o;
  }

  /** Adds a picture. `mode`: "front" (sized to the front cover), "wrap" (covers the whole wrap, behind the words). */
  async addImage(url, mode = "front", { ai = false } = {}) {
    const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
    img.set({ sp_role: "image", originX: "center", originY: "center", sp_ai: ai });
    const fc = this.geo.full_cover;
    if (mode === "wrap") {
      const s = Math.max(px(fc.total_width) / img.width, px(fc.total_height) / img.height);
      img.set({ left: px(fc.total_width / 2), top: px(fc.total_height / 2), scaleX: s, scaleY: s, sp_panel: "full" });
      this.canvas.add(img);
      // Just above the background colour, under every word.
      const bgIdx = this.canvas.getObjects().findIndex((o) => o.sp_role === "bg");
      this.canvas.moveObjectTo(img, bgIdx + 1);
      this.canvas.setActiveObject(img);
      this.keepGuidesOnTop();
      this.canvas.requestRenderAll();
      this.commit();
      return img;
    }
    const target = mode === "back" ? "back" : "front";
    const p = panelsOf(fc).find((x) => x.key === target);
    const photo = this.objects().find((o) => o.sp_photo && o.sp_panel === target);
    if (photo) {
      // Drop it into the template's picture window.
      const r = photo.getBoundingRect();
      const bw = r.width, bh = r.height;
      const s = Math.max(bw / img.width, bh / img.height);
      const cp = photo.getCenterPoint();
      img.set({ left: cp.x, top: cp.y, scaleX: s, scaleY: s, sp_panel: target });
      img.clipPath = new Rect({ left: cp.x, top: cp.y, width: bw, height: bh, originX: "center", originY: "center", absolutePositioned: true });
      this.canvas.add(img);
      this.canvas.moveObjectTo(img, this.canvas.getObjects().indexOf(photo) + 1);
    } else {
      // Fill the front cover edge to edge, bleed included, behind the words.
      const bleed = fc.bleed || 0.125;
      const w = px(p.w + (target === "front" ? bleed : 0)), h = px(p.h + 2 * ((fc.total_height - fc.panel_height) / 2));
      const s = Math.max(w / img.width, h / img.height);
      img.set({ left: px(p.x) + w / 2, top: px(fc.total_height / 2), scaleX: s, scaleY: s, sp_panel: target });
      this.canvas.add(img);
      const firstText = this.canvas.getObjects().findIndex((o) => o.type === "textbox" && !o.sp_guide);
      if (firstText > 0) this.canvas.moveObjectTo(img, firstText);
    }
    this.canvas.setActiveObject(img);
    this.keepGuidesOnTop();
    this.canvas.requestRenderAll();
    this.commit();
    return img;
  }

  addAndSelect(o) {
    this.canvas.add(o);
    this.keepGuidesOnTop();
    this.canvas.setActiveObject(o);
    this.canvas.requestRenderAll();
    this.commit();
  }

  background() { return this.objects().find((o) => o.sp_role === "bg"); }

  setBackground(fill) {
    const bg = this.background();
    if (!bg) return;
    bg.set("fill", fillOf(fill, bg.width, bg.height));
    this.canvas.requestRenderAll();
    this.commit();
  }

  // ---------- selection ----------
  active() { return this.canvas.getActiveObject(); }

  async update(props) {
    const o = this.active();
    if (!o) return;
    if (props.fontFamily) await loadFonts([props.fontFamily]);
    if ("fill" in props && o.sp_role === "bg") { this.setBackground(props.fill); return; }
    const apply = (t) => {
      const p = { ...props };
      if (p.shadowOn !== undefined) {
        t.set("shadow", p.shadowOn ? new Shadow({ color: "rgba(0,0,0,0.6)", blur: px(0.08), offsetX: px(0.01), offsetY: px(0.03) }) : null);
        delete p.shadowOn;
      }
      if (p.filters) {
        const f = p.filters;
        t.filters = [
          f.brightness ? new filters.Brightness({ brightness: f.brightness }) : null,
          f.contrast ? new filters.Contrast({ contrast: f.contrast }) : null,
          f.saturation ? new filters.Saturation({ saturation: f.saturation }) : null,
          f.grayscale ? new filters.Grayscale() : null,
          f.blur ? new filters.Blur({ blur: f.blur }) : null,
        ].filter(Boolean);
        t.sp_filters = f;
        t.applyFilters();
        delete p.filters;
      }
      t.set(p);
      if (t.type === "textbox") fitOneLine(t);
      t.setCoords();
    };
    if (o.type === "activeselection" || o.type === "activeSelection") o.getObjects().forEach(apply); else apply(o);
    this.canvas.requestRenderAll();
    this.commitSoon();
  }

  async duplicate() {
    const o = this.active();
    if (!o) return;
    const copy = await o.clone(PROPS);
    copy.set({ left: o.left + px(0.2), top: o.top + px(0.2) });
    this.addAndSelect(copy);
  }

  remove() {
    const o = this.active();
    if (!o || o.isEditing) return;
    const list = o.type === "activeselection" || o.type === "activeSelection" ? o.getObjects() : [o];
    this.canvas.discardActiveObject();
    list.filter((x) => x.sp_role !== "bg").forEach((x) => this.canvas.remove(x));
    this.canvas.requestRenderAll();
    this.commit();
  }

  layer(dir) {
    const o = this.active();
    if (!o) return;
    const c = this.canvas;
    if (dir === "up") c.bringObjectForward(o);
    else if (dir === "down") {
      c.sendObjectBackwards(o);
      // Never under the background colour.
      const bgIdx = c.getObjects().findIndex((x) => x.sp_role === "bg");
      if (c.getObjects().indexOf(o) <= bgIdx) c.moveObjectTo(o, bgIdx + 1);
    } else if (dir === "top") c.bringObjectToFront(o);
    else if (dir === "bottom") c.moveObjectTo(o, c.getObjects().findIndex((x) => x.sp_role === "bg") + 1);
    this.keepGuidesOnTop();
    c.requestRenderAll();
    this.commit();
  }

  toggleLock() {
    const o = this.active();
    if (!o) return;
    const locked = !o.lockMovementX;
    o.set({ lockMovementX: locked, lockMovementY: locked, lockScalingX: locked, lockScalingY: locked, lockRotation: locked, hasControls: !locked });
    this.canvas.requestRenderAll();
    this.commit();
  }

  /** Centers the selection on its own panel: "h" left-to-right, "v" top-to-bottom. */
  centerOnPanel(axis) {
    const o = this.active();
    if (!o) return;
    const key = o.sp_panel && o.sp_panel !== "full" ? o.sp_panel : this.panelAt(o.getCenterPoint().x / PPI);
    const p = panelsOf(this.geo.full_cover).find((x) => x.key === key) || panelsOf(this.geo.full_cover)[0];
    const cp = o.getCenterPoint();
    const next = axis === "h" ? { x: px(p.x + p.w / 2), y: cp.y } : { x: cp.x, y: px(p.y + p.h / 2) };
    o.setPositionByOrigin(next, "center", "center");
    o.setCoords();
    this.canvas.requestRenderAll();
    this.commit();
  }

  /** Effective print resolution of a picture as it sits on the cover now. */
  imageDpi(o) {
    if (!o || o.type !== "image") return null;
    const el = o.getElement();
    const natural = el?.naturalWidth || el?.width || o.width;
    const inches = (o.width * o.scaleX) / PPI;
    return inches > 0 ? Math.round(natural / inches) : null;
  }

  // ---------- history ----------
  snapshot() {
    const json = this.canvas.toObject(PROPS.concat(["sp_filters", "lockScalingX", "lockScalingY", "lockRotation", "sp_guide"]));
    json.objects = json.objects.filter((o) => !o.sp_guide);
    return json;
  }

  commit() {
    if (this.silent || !this.geo) return;
    clearTimeout(this.soon);
    const snap = JSON.stringify(this.snapshot());
    if (this.history[this.history.length - 1] === snap) return;
    this.history.push(snap);
    if (this.history.length > HISTORY_MAX) this.history.shift();
    this.future = [];
    this.cb.onChange?.();
  }

  commitSoon() {
    clearTimeout(this.soon);
    this.soon = setTimeout(() => this.commit(), 400);
  }

  async restore(snap) {
    this.silent++;
    const data = typeof snap === "string" ? JSON.parse(snap) : snap;
    const fontsUsed = (data.objects || []).map((o) => o.fontFamily).filter(Boolean);
    await loadFonts(fontsUsed);
    await this.canvas.loadFromJSON(data);
    this.canvas.getObjects().forEach((o) => { if (o.sp_filters && o.applyFilters) o.applyFilters(); });
    this.silent--;
    this.canvas.setZoom(this.zoom);
    this.drawGuides();
    this.cb.onSelect?.(null);
  }

  canUndo() { return this.history.length > 1; }
  canRedo() { return this.future.length > 0; }

  async undo() {
    if (!this.canUndo()) return;
    this.future.push(this.history.pop());
    await this.restore(this.history[this.history.length - 1]);
    this.cb.onChange?.();
  }

  async redo() {
    if (!this.canRedo()) return;
    const snap = this.future.pop();
    this.history.push(snap);
    await this.restore(snap);
    this.cb.onChange?.();
  }

  // ---------- output ----------
  /** Renders the wrap without guides. `dpi` 300 = print size. */
  async render({ dpi = PRINT_DPI, format = "png", quality = 0.95, maxWidth } = {}) {
    const c = this.canvas;
    await loadFonts(this.objects().map((o) => o.fontFamily));
    const active = c.getActiveObject();
    c.discardActiveObject();
    const guides = c.getObjects().filter((o) => o.sp_guide);
    guides.forEach((o) => { o.visible = false; });
    const prevZoom = this.zoom;
    const { w, h } = this.size;
    c.setDimensions({ width: w, height: h });
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    let mult = dpi / PPI;
    if (maxWidth) mult = Math.min(mult, maxWidth / w);
    let url;
    try {
      url = c.toDataURL({ format, quality, multiplier: mult, enableRetinaScaling: false });
    } finally {
      guides.forEach((o) => { o.visible = true; });
      c.setDimensions({ width: Math.round(w * prevZoom), height: Math.round(h * prevZoom) });
      c.setZoom(prevZoom);
      if (active) c.setActiveObject(active);
      c.requestRenderAll();
    }
    if (!url || url.length < 100) throw new Error("This device couldn't draw the cover at print size. Try a desktop browser.");
    return { url, widthPx: Math.round(w * mult), heightPx: Math.round(h * mult) };
  }

  /** Words on the cover that sit outside the safe area or in the barcode area: what a printer would reject. */
  problems() {
    const out = [];
    if (!this.geo) return out;
    const fc = this.geo.full_cover;
    const s = this.geo.safe_margin || 0.375;
    const ps = panelsOf(fc);
    const back = ps.find((p) => p.key === "back");
    const bz = this.geo.barcode_zone || { w: 2, h: 1.2 };
    const barcode = { x: back.x + back.w - s - bz.w, y: back.y + back.h - s - bz.h, w: bz.w, h: bz.h };
    for (const o of this.objects()) {
      if (o.type !== "textbox" || !o.text?.trim() || !o.visible) continue;
      // Scene units (zoom-independent), so straight to inches.
      const r = o.getBoundingRect();
      const box = { x: r.left / PPI, y: r.top / PPI, w: r.width / PPI, h: r.height / PPI };
      const cx = box.x + box.w / 2;
      const p = ps.find((q) => cx >= q.x && cx <= q.x + q.w) || ps[0];
      const label = `"${o.text.trim().slice(0, 24)}${o.text.trim().length > 24 ? "…" : ""}"`;
      const m = p.key === "spine" ? 0.0625 : s;
      const tol = 0.03; // a text box's outline adds a pixel; that never prints
      if (box.x < p.x + m - tol || box.x + box.w > p.x + p.w - m + tol || box.y < p.y + s - tol || box.y + box.h > p.y + p.h - s + tol) {
        out.push({ obj: o, msg: p.key === "spine" ? `${label} runs past the spine's edge, so it could wrap onto the cover.` : `${label} is outside the safe area on the ${PANEL_LABELS[p.key].toLowerCase()}, so the printer could trim it.` });
      } else if (p.key === "back" && box.x < barcode.x + barcode.w && box.x + box.w > barcode.x && box.y < barcode.y + barcode.h && box.y + box.h > barcode.y) {
        out.push({ obj: o, msg: `${label} is under the barcode area on the back cover.` });
      }
    }
    for (const o of this.objects()) {
      const dpi = this.imageDpi(o);
      if (dpi && dpi < 200) {
        out.push({ obj: o, msg: o.sp_ai
          ? `The AI artwork is about ${dpi} DPI and gets enlarged to print size, so it will look a little soft up close. Fine for most covers; for a crisper print, use a bigger picture.`
          : `A picture will print at about ${dpi} DPI. Printers want 300, so it may look soft or blocky.` });
      }
    }
    return out;
  }
}

export { fontStack };
