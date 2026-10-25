import { panelsOf } from "./specs";

// Free cover templates. Each one is a layout (where things sit) paired with a style (colours + a font pair +
// the genres it suits). Layouts are written against the book's real panels, in inches, so every template
// fits any trim size, page count, binding and distributor: the front stays on the front, the spine text stays
// inside the spine, nothing is placed in the barcode area, and text stays inside the safe margin.

export const GENRES = [
  ["all", "All genres"],
  ["thriller", "Thriller & Mystery"],
  ["romance", "Romance"],
  ["fantasy", "Fantasy"],
  ["scifi", "Sci-Fi"],
  ["horror", "Horror"],
  ["literary", "Literary Fiction"],
  ["memoir", "Memoir & Biography"],
  ["nonfiction", "Non-fiction & Business"],
  ["selfhelp", "Self-help & Faith"],
  ["children", "Children's"],
  ["poetry", "Poetry"],
  ["western", "Western & Historical"],
];

export const PALETTES = {
  noir: { name: "Noir", bg: "#0d0d0f", bg2: "#1f232b", ink: "#f5f1e8", sub: "#b8b2a7", accent: "#c8102e" },
  ember: { name: "Ember", bg: "#1a0b06", bg2: "#5a1a0a", ink: "#ffd9a0", sub: "#f2a65a", accent: "#ff6a00" },
  royal: { name: "Royal", bg: "#1d1442", bg2: "#3b2a7a", ink: "#f4e9c9", sub: "#c9b98a", accent: "#d4af37" },
  blush: { name: "Blush", bg: "#f7e1dc", bg2: "#efbcb8", ink: "#5a2a36", sub: "#8a5a64", accent: "#c2476a" },
  neon: { name: "Neon", bg: "#07071a", bg2: "#1d0a33", ink: "#5ff3ff", sub: "#ff7ad9", accent: "#ff3ec8" },
  crimson: { name: "Crimson", bg: "#3a070c", bg2: "#8e1b24", ink: "#fff4e6", sub: "#f0c9a8", accent: "#f6d27a" },
  sand: { name: "Sand", bg: "#efe6d2", bg2: "#dccaa3", ink: "#2b2622", sub: "#6b5f52", accent: "#a4552c" },
  mono: { name: "Mono", bg: "#f4f4f2", bg2: "#e2e2dd", ink: "#111111", sub: "#555555", accent: "#111111" },
  ocean: { name: "Ocean", bg: "#0b2a3c", bg2: "#1b5f80", ink: "#e8f4f8", sub: "#9cc9d9", accent: "#f2c14e" },
  forest: { name: "Forest", bg: "#14261c", bg2: "#365a43", ink: "#f1ead8", sub: "#c8bf9e", accent: "#d4a24c" },
  meadow: { name: "Meadow", bg: "#fff6d6", bg2: "#ffd77a", ink: "#24448a", sub: "#d9472b", accent: "#31a36b" },
  gold: { name: "Gold", bg: "#0e0e0e", bg2: "#2a2214", ink: "#e5c158", sub: "#bfa25a", accent: "#d4af37" },
  sunset: { name: "Sunset", bg: "#ff7e5f", bg2: "#feb47b", ink: "#2d1b33", sub: "#4a2c40", accent: "#ffffff" },
  ice: { name: "Ice", bg: "#eaf2f8", bg2: "#c3d8ea", ink: "#10324a", sub: "#3e6a88", accent: "#2f8fd1" },
  dust: { name: "Dust", bg: "#c98e5a", bg2: "#7a4a2a", ink: "#2a1a10", sub: "#3d2616", accent: "#f3e2c3" },
  plum: { name: "Plum", bg: "#2a0f2e", bg2: "#5e2a63", ink: "#fbe7f0", sub: "#e0b3cf", accent: "#f7a8c8" },
};

const STYLES = [
  { key: "noir", palette: "noir", title: "Bebas Neue", body: "Oswald", genres: ["thriller"] },
  { key: "ember", palette: "ember", title: "Cinzel", body: "Cormorant Garamond", genres: ["fantasy", "thriller"] },
  { key: "royal", palette: "royal", title: "Cinzel Decorative", body: "Alegreya", genres: ["fantasy"] },
  { key: "blush", palette: "blush", title: "Great Vibes", body: "Lora", genres: ["romance"] },
  { key: "neon", palette: "neon", title: "Orbitron", body: "Exo 2", genres: ["scifi"] },
  { key: "crimson", palette: "crimson", title: "Creepster", body: "Oswald", genres: ["horror"] },
  { key: "sand", palette: "sand", title: "DM Serif Display", body: "Libre Baskerville", genres: ["literary", "poetry", "memoir"] },
  { key: "mono", palette: "mono", title: "Archivo Black", body: "Work Sans", genres: ["nonfiction", "selfhelp"] },
  { key: "ocean", palette: "ocean", title: "Cormorant Garamond", body: "EB Garamond", genres: ["literary", "selfhelp", "poetry"] },
  { key: "forest", palette: "forest", title: "Fraunces", body: "Source Serif 4", genres: ["memoir", "literary"] },
  { key: "meadow", palette: "meadow", title: "Fredoka", body: "Nunito", genres: ["children"] },
  { key: "gold", palette: "gold", title: "Playfair Display", body: "Lato", genres: ["nonfiction", "selfhelp", "thriller"] },
  { key: "sunset", palette: "sunset", title: "Montserrat", body: "Raleway", genres: ["selfhelp", "nonfiction"] },
  { key: "ice", palette: "ice", title: "Space Grotesk", body: "Inter", genres: ["nonfiction", "scifi"] },
  { key: "dust", palette: "dust", title: "Rye", body: "Bitter", genres: ["western"] },
  { key: "plum", palette: "plum", title: "Playfair Display", body: "Raleway", genres: ["romance", "poetry", "memoir"] },
];

export const DEFAULT_TEXT = {
  title: "Your Book Title",
  subtitle: "",
  author: "Author Name",
  tagline: "",
  blurb: "Write the back-cover description here. Two or three short paragraphs that hook a reader and make them want to open the book.",
  bio: "",
};

// ---- helpers (all inches) ----
const grad = (a, b, dir = "v") => ({ grad: [a, b], dir });

function frame(geo) {
  const fc = geo.full_cover;
  const P = Object.fromEntries(panelsOf(fc).map((p) => [p.key, p]));
  const s = geo.safe_margin || 0.375;
  const inner = (p) => ({ x: p.x + s, y: p.y + s, w: p.w - 2 * s, h: p.h - 2 * s });
  return { fc, P, s, F: P.front, B: P.back, S: P.spine, fi: inner(P.front), bi: inner(P.back) };
}

const text = (role, panel, o) => ({ type: "text", role, panel, align: "center", lineHeight: 1.05, ...o });

// The full-bleed background every template starts from.
function background(fc, pal, dir = "v") {
  return { type: "rect", role: "bg", panel: "full", x: 0, y: 0, w: fc.total_width, h: fc.total_height, fill: grad(pal.bg, pal.bg2, dir), locked: true };
}

function spine(geo, t, st, pal, opt = {}) {
  const { S } = frame(geo);
  const out = [];
  if (opt.band) out.push({ type: "rect", role: "deco", panel: "spine", x: S.x, y: 0, w: S.w, h: geo.full_cover.total_height, fill: opt.band });
  if (geo.spine_text_allowed === false || S.w < 0.2) return out;
  // Spine text runs top-to-bottom (the US / UK convention all four distributors expect), kept 1/16" off
  // each fold line.
  const size = Math.min(0.32, Math.max(0.06, (S.w - 0.125) / 1.3));
  const cx = S.x + S.w / 2;
  out.push(text("spine_title", "spine", {
    x: cx, y: S.y + S.h * 0.36, w: S.h * 0.56, originX: "center", originY: "center", angle: 90,
    text: t.title, font: st.title, size, fill: opt.ink || pal.ink, upper: opt.upper, spacing: opt.upper ? 80 : 0, maxLines: 1,
  }));
  out.push(text("spine_author", "spine", {
    x: cx, y: S.y + S.h * 0.8, w: S.h * 0.24, originX: "center", originY: "center", angle: 90,
    text: t.author, font: st.body, size: size * 0.72, fill: opt.sub || pal.sub, upper: true, spacing: 120, maxLines: 1,
  }));
  return out;
}

function back(geo, t, st, pal, opt = {}) {
  const { bi, P } = frame(geo);
  const out = [];
  if (opt.panelFill) {
    const b = P.back;
    out.push({ type: "rect", role: "deco", panel: "back", x: b.x + 0.2, y: b.y + 0.2, w: b.w - 0.4, h: b.h - 0.4, fill: opt.panelFill, opacity: opt.panelOpacity ?? 1 });
  }
  const ink = opt.ink || pal.ink;
  let y = bi.y + 0.15;
  out.push(text("tagline", "back", { x: bi.x, y, w: bi.w, text: t.tagline || "", font: st.title, size: 0.24, fill: opt.accent || pal.accent, lineHeight: 1.1 }));
  y += 0.75;
  out.push(text("blurb", "back", { x: bi.x + 0.1, y, w: bi.w - 0.2, text: t.blurb, font: st.body, size: 0.15, fill: ink, align: "left", lineHeight: 1.4 }));
  // Bio sits on the back flap when the book has one (dust jacket), otherwise under the blurb.
  const flap = P.back_flap;
  const s = geo.safe_margin || 0.375;
  if (flap) {
    out.push(text("bio", "back_flap", { x: flap.x + s * 0.6, y: flap.y + flap.h * 0.45, w: flap.w - s * 1.2, text: t.bio || "", font: st.body, size: 0.13, fill: ink, align: "left", lineHeight: 1.4 }));
  } else {
    out.push(text("bio", "back", { x: bi.x + 0.1, y: bi.y + bi.h * 0.62, w: bi.w * 0.55, text: t.bio || "", font: st.body, size: 0.12, fill: opt.sub || pal.sub, align: "left", lineHeight: 1.35 }));
  }
  return out;
}

function frontFlap(geo, t, st, pal) {
  const { P } = frame(geo);
  const flap = P.front_flap;
  if (!flap) return [];
  const s = geo.safe_margin || 0.375;
  return [text("flap_blurb", "front_flap", { x: flap.x + s * 0.6, y: flap.y + s + 0.3, w: flap.w - s * 1.2, text: t.blurb, font: st.body, size: 0.13, fill: pal.ink, align: "left", lineHeight: 1.4 })];
}

// ---- front-cover layouts ----
// Each returns the front objects plus how the spine and back should look for that layout.
const LAYOUTS = {
  classic: { name: "Classic", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    return { front: [
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.16, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.13, fill: pal.ink }),
      { type: "rect", role: "deco", panel: "front", x: fi.x + fi.w * 0.38, y: fi.y + fi.h * 0.5, w: fi.w * 0.24, h: 0.03, fill: pal.accent },
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.54, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub, italic: true }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.88, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.055, fill: pal.ink, upper: true, spacing: 200 }),
    ] };
  } },
  block: { name: "Color Block", build: (g, t, st, pal) => {
    const { fi, F, fc } = frame(g);
    return { front: [
      { type: "rect", role: "deco", panel: "front", x: F.x, y: 0, w: fc.total_width - F.x, h: F.y + F.h * 0.6, fill: pal.accent },
      text("title", "front", { x: fi.x, y: F.y + F.h * 0.28, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.14, fill: pal.bg, align: "left" }),
      text("subtitle", "front", { x: fi.x, y: F.y + F.h * 0.64, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub, align: "left" }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.9, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.ink, align: "left", upper: true, spacing: 150 }),
    ], spine: { band: pal.accent, ink: pal.bg, sub: pal.bg } };
  } },
  frame: { name: "Framed", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    return { front: [
      { type: "rect", role: "deco", panel: "front", x: fi.x - 0.1, y: fi.y - 0.1, w: fi.w + 0.2, h: fi.h + 0.2, fill: "transparent", stroke: pal.accent, strokeW: 0.03 },
      { type: "rect", role: "deco", panel: "front", x: fi.x + 0.02, y: fi.y + 0.02, w: fi.w - 0.04, h: fi.h - 0.04, fill: "transparent", stroke: pal.accent, strokeW: 0.01 },
      text("title", "front", { x: fi.x + 0.2, y: fi.y + fi.h * 0.3, w: fi.w - 0.4, text: t.title, font: st.title, size: fi.w * 0.115, fill: pal.ink, upper: true, spacing: 60 }),
      text("subtitle", "front", { x: fi.x + 0.2, y: fi.y + fi.h * 0.6, w: fi.w - 0.4, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub, italic: true }),
      text("author", "front", { x: fi.x + 0.2, y: fi.y + fi.h * 0.85, w: fi.w - 0.4, text: t.author, font: st.body, size: fi.w * 0.05, fill: pal.accent, upper: true, spacing: 250 }),
    ], back: { panelFill: "transparent" } };
  } },
  diagonal: { name: "Diagonal", build: (g, t, st, pal) => {
    const { fi, F, fc } = frame(g);
    const r = fc.total_width, b = fc.total_height;
    return { front: [
      { type: "polygon", role: "deco", panel: "front", points: [[F.x, F.y + F.h * 0.62], [r, F.y + F.h * 0.42], [r, b], [F.x, b]], fill: pal.accent, opacity: 0.92 },
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.06, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.14, fill: pal.ink, align: "left" }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.42, w: fi.w * 0.8, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub, align: "left" }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.88, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.bg, align: "right", upper: true, spacing: 120 }),
    ] };
  } },
  bigtype: { name: "Big Type", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    return { front: [
      text("author", "front", { x: fi.x, y: fi.y + 0.05, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.05, fill: pal.accent, upper: true, spacing: 300 }),
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.18, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.21, fill: pal.ink, upper: true, lineHeight: 0.92 }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.86, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub }),
    ], spine: { upper: true } };
  } },
  band: { name: "Band", build: (g, t, st, pal) => {
    const { fi, F, fc } = frame(g);
    return { front: [
      { type: "rect", role: "deco", panel: "full", x: 0, y: F.y + F.h * 0.38, w: fc.total_width, h: F.h * 0.24, fill: pal.accent, opacity: 0.95 },
      text("title", "front", { x: fi.x, y: F.y + F.h * 0.415, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.1, fill: pal.bg, upper: true, spacing: 40 }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.66, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.1, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.055, fill: pal.ink, upper: true, spacing: 220 }),
    ] };
  } },
  emblem: { name: "Emblem", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    const cx = fi.x + fi.w / 2, cy = fi.y + fi.h * 0.3, r = fi.w * 0.28;
    return { front: [
      { type: "circle", role: "deco", panel: "front", x: cx, y: cy, r, fill: "transparent", stroke: pal.accent, strokeW: 0.04 },
      { type: "circle", role: "deco", panel: "front", x: cx, y: cy, r: r * 0.82, fill: pal.accent, opacity: 0.18 },
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.58, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.115, fill: pal.ink }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.77, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub, italic: true }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.9, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.05, fill: pal.accent, upper: true, spacing: 200 }),
    ] };
  } },
  glow: { name: "Glow", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    return { front: [
      { type: "circle", role: "deco", panel: "front", x: fi.x + fi.w / 2, y: fi.y + fi.h * 0.5, r: fi.w * 0.6, fill: { radial: [pal.accent, "rgba(0,0,0,0)"] }, opacity: 0.55 },
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.05, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.13, fill: pal.ink, shadow: true }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.36, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.9, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.ink, upper: true, spacing: 200, shadow: true }),
    ] };
  } },
  stripe: { name: "Side Stripe", build: (g, t, st, pal) => {
    const { fi, F, fc } = frame(g);
    return { front: [
      { type: "rect", role: "deco", panel: "front", x: F.x + 0.3, y: 0, w: F.w * 0.06, h: fc.total_height, fill: pal.accent },
      text("title", "front", { x: fi.x + F.w * 0.12, y: fi.y + fi.h * 0.2, w: fi.w - F.w * 0.12, text: t.title, font: st.title, size: fi.w * 0.12, fill: pal.ink, align: "left" }),
      text("subtitle", "front", { x: fi.x + F.w * 0.12, y: fi.y + fi.h * 0.55, w: fi.w - F.w * 0.12, text: t.subtitle, font: st.body, size: fi.w * 0.045, fill: pal.sub, align: "left" }),
      text("author", "front", { x: fi.x + F.w * 0.12, y: fi.y + fi.h * 0.88, w: fi.w - F.w * 0.12, text: t.author, font: st.body, size: fi.w * 0.055, fill: pal.ink, align: "left", upper: true, spacing: 150 }),
    ] };
  } },
  bottom: { name: "Bottom Heavy", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    return { front: [
      text("author", "front", { x: fi.x, y: fi.y + 0.05, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.ink, upper: true, spacing: 250 }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.12, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.042, fill: pal.sub, italic: true }),
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.62, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.16, fill: pal.ink, upper: true, lineHeight: 0.95 }),
      { type: "rect", role: "deco", panel: "front", x: fi.x, y: fi.y + fi.h - 0.04, w: fi.w, h: 0.04, fill: pal.accent },
    ], spine: { upper: true } };
  } },
  script: { name: "Script", build: (g, t, st, pal) => {
    const { fi } = frame(g);
    return { front: [
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.32, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.17, fill: pal.ink }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.66, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.042, fill: pal.sub, upper: true, spacing: 300 }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.9, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.accent, upper: true, spacing: 200 }),
    ] };
  } },
  stack: { name: "Stacked", build: (g, t, st, pal) => {
    const { fi, F, fc } = frame(g);
    const barY = F.y + F.h * 0.82;
    return { front: [
      text("title", "front", { x: fi.x, y: fi.y + 0.1, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.13, fill: pal.ink, align: "left" }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.42, w: fi.w * 0.85, text: t.subtitle, font: st.body, size: fi.w * 0.05, fill: pal.sub, align: "left" }),
      { type: "rect", role: "deco", panel: "front", x: F.x, y: barY, w: fc.total_width - F.x, h: fc.total_height - barY, fill: pal.accent },
      text("author", "front", { x: fi.x, y: barY + (F.y + F.h - barY) * 0.32, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.bg, align: "left", upper: true, spacing: 150 }),
    ] };
  } },
  bubbles: { name: "Bubbles", build: (g, t, st, pal) => {
    const { fi, F } = frame(g);
    const dots = [[0.15, 0.62, 0.16], [0.82, 0.55, 0.12], [0.5, 0.72, 0.22], [0.2, 0.86, 0.09], [0.86, 0.82, 0.14]];
    return { front: [
      ...dots.map(([dx, dy, dr], i) => ({ type: "circle", role: "deco", panel: "front", x: F.x + F.w * dx, y: F.y + F.h * dy, r: F.w * dr, fill: i % 2 ? pal.sub : pal.accent, opacity: 0.85 })),
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.06, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.15, fill: pal.ink }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.4, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.05, fill: pal.sub }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.93, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.06, fill: pal.ink }),
    ] };
  } },
  window: { name: "Picture Window", build: (g, t, st, pal) => {
    const { fi, F } = frame(g);
    return { front: [
      { type: "rect", role: "photo", panel: "front", x: F.x + F.w * 0.1, y: F.y + F.h * 0.08, w: F.w * 0.8, h: F.h * 0.52, fill: grad(pal.bg2, pal.accent, "d"), stroke: pal.accent, strokeW: 0.02 },
      text("title", "front", { x: fi.x, y: fi.y + fi.h * 0.64, w: fi.w, text: t.title, font: st.title, size: fi.w * 0.11, fill: pal.ink }),
      text("subtitle", "front", { x: fi.x, y: fi.y + fi.h * 0.8, w: fi.w, text: t.subtitle, font: st.body, size: fi.w * 0.042, fill: pal.sub, italic: true }),
      text("author", "front", { x: fi.x, y: fi.y + fi.h * 0.91, w: fi.w, text: t.author, font: st.body, size: fi.w * 0.05, fill: pal.ink, upper: true, spacing: 200 }),
    ] };
  } },
};

export const LAYOUT_KEYS = Object.keys(LAYOUTS);

export const TEMPLATES = [];
for (const st of STYLES) {
  for (const lk of LAYOUT_KEYS) {
    TEMPLATES.push({
      key: `${lk}-${st.key}`,
      name: `${LAYOUTS[lk].name} · ${PALETTES[st.palette].name}`,
      layout: lk,
      style: st.key,
      genres: st.genres,
      fonts: [st.title, st.body],
    });
  }
}

const STYLE_BY_KEY = Object.fromEntries(STYLES.map((s) => [s.key, s]));
export const STYLE_KEYS = STYLES.map((s) => s.key);

/** Build a template's objects (inches, absolute on the wrap) for this book and these words. */
export function buildTemplate(templateKey, geo, words) {
  const tpl = TEMPLATES.find((x) => x.key === templateKey) || TEMPLATES[0];
  const st = STYLE_BY_KEY[tpl.style];
  const pal = PALETTES[st.palette];
  const t = { ...DEFAULT_TEXT, ...words };
  const parts = LAYOUTS[tpl.layout].build(geo, t, st, pal);
  return {
    template: tpl,
    palette: pal,
    objects: [
      background(geo.full_cover, pal, tpl.layout === "glow" ? "v" : "v"),
      ...back(geo, t, st, pal, parts.back),
      ...frontFlap(geo, t, st, pal),
      ...spine(geo, t, st, pal, parts.spine),
      ...parts.front,
    ],
  };
}

/** Templates to show first for a genre, then everything else. */
export function templatesFor(genre) {
  if (!genre || genre === "all") return TEMPLATES;
  return TEMPLATES.filter((t) => t.genres.includes(genre));
}

export function styleFor(key) {
  return STYLE_BY_KEY[key];
}
