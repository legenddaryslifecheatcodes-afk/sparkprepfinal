import { api } from "@/lib/api";

// Book specs for the Cover Studio. Every measurement comes from the backend's own spine calculator
// (/specs/spine), the same numbers the Editor checks and exports with, so a cover designed here fits the
// book it's sent to. The local fallback below is only for when the backend can't be reached: it's a plain
// paperback page/PPI estimate and is always labelled as one.

export const DEFAULT_SPECS = {
  platform: "kdp",
  binding: "paperback",
  trim_size: "6x9",
  paper_type: "white_50lb",
  page_count: 200,
};

const FALLBACK_TRIMS = {
  "5x8": { label: "5\" x 8\"", w: 5, h: 8 },
  "5.25x8": { label: "5.25\" x 8\"", w: 5.25, h: 8 },
  "5.5x8.5": { label: "5.5\" x 8.5\"", w: 5.5, h: 8.5 },
  "6x9": { label: "6\" x 9\" (Most Common)", w: 6, h: 9 },
  "6.14x9.21": { label: "6.14\" x 9.21\"", w: 6.14, h: 9.21 },
  "7x10": { label: "7\" x 10\"", w: 7, h: 10 },
  "7.5x9.25": { label: "7.5\" x 9.25\"", w: 7.5, h: 9.25 },
  "8x10": { label: "8\" x 10\"", w: 8, h: 10 },
  "8.5x11": { label: "8.5\" x 11\" (Letter)", w: 8.5, h: 11 },
  "8.25x10.75": { label: "8.25\" x 10.75\"", w: 8.25, h: 10.75 },
};

const FALLBACK_SPECS = {
  platforms: {
    kdp: { name: "Amazon KDP", barcode_zone: { w: 2, h: 1.2 }, spine_text_min_pages: 79 },
    ingramspark: { name: "IngramSpark", barcode_zone: { w: 1.75, h: 1 }, spine_text_min_pages: 48 },
    barnes_noble: { name: "Barnes & Noble Press", barcode_zone: { w: 2, h: 1.2 }, spine_text_min_pages: 100 },
    lulu: { name: "Lulu", barcode_zone: { w: 2, h: 1.2 }, spine_text_min_pages: 100 },
  },
  trim_sizes: FALLBACK_TRIMS,
  paper_types: {
    white_50lb: { label: "50lb White (Standard B&W)", ppi: 444 },
    cream_50lb: { label: "50lb Cream (Fiction)", ppi: 434 },
    white_60lb: { label: "60lb White (Premium)", ppi: 400 },
    color_60lb_standard: { label: "60lb Color Standard", ppi: 460 },
    color_60lb_premium: { label: "60lb Color Premium", ppi: 426 },
    groundwood_38lb: { label: "38lb Groundwood (Novel)", ppi: 512 },
  },
  binding_types: {
    paperback: { label: "Paperback (Perfect Bound)", bleed: 0.125, safe_margin: 0.375 },
    hardcover_case: { label: "Hardcover Case Laminate", bleed: 0.625, safe_margin: 0.5 },
    hardcover_jacket: { label: "Hardcover with Dust Jacket", bleed: 0.125, safe_margin: 0.5 },
  },
};

let specsPromise = null;

/** The trim / paper / binding / platform lists. Cached for the page's lifetime. */
export function loadSpecLists() {
  if (!specsPromise) {
    specsPromise = api.get("/specs")
      .then(({ data }) => ({ ...data, offline: false }))
      .catch(() => ({ ...FALLBACK_SPECS, offline: true }));
  }
  return specsPromise;
}

function localPaperbackGeometry(specs, lists) {
  const trim = lists.trim_sizes[specs.trim_size] || FALLBACK_TRIMS["6x9"];
  const ppi = lists.paper_types[specs.paper_type]?.ppi || 444;
  const pages = Math.max(0, Math.round(Number(specs.page_count) || 0));
  const spine = Math.round((pages / ppi) * 10000) / 10000;
  const bleed = 0.125;
  return {
    spine_width: spine,
    spine_is_estimate: true,
    offline: true,
    trim,
    bleed,
    spine_text_allowed: pages >= (lists.platforms[specs.platform]?.spine_text_min_pages || 100),
    full_cover: {
      total_width: Math.round((trim.w * 2 + spine + bleed * 2) * 10000) / 10000,
      total_height: trim.h + bleed * 2,
      spine_width: spine,
      panel_width: trim.w,
      panel_height: trim.h,
      bleed,
      gutter_hinge: 0, flap_width: 0, wrap_fold: 0,
      back_flap_x: null, front_flap_x: null,
      back_x: bleed,
      spine_x: bleed + trim.w,
      front_x: bleed + trim.w + spine,
    },
  };
}

/**
 * Full cover geometry for these specs, in inches: the wrap's total size and where the back, spine and front
 * panels (and a dust jacket's flaps) start. Adds the safe margin and barcode zone the guides draw.
 */
export async function loadGeometry(specs) {
  const lists = await loadSpecLists();
  let g;
  try {
    const { data } = await api.post("/specs/spine", {
      page_count: Number(specs.page_count) || 0,
      paper_type: specs.paper_type,
      trim_size: specs.trim_size,
      binding: specs.binding,
      platform: specs.platform,
      ...(specs.spine_width_override ? { spine_width_override: Number(specs.spine_width_override) } : {}),
    });
    g = { ...data, offline: false };
  } catch {
    if (specs.binding !== "paperback") {
      throw new Error("SparkPrep's spine calculator couldn't be reached, and hardcover sizes can't be guessed. Try again in a moment.");
    }
    g = localPaperbackGeometry(specs, lists);
  }
  const binding = lists.binding_types[specs.binding] || FALLBACK_SPECS.binding_types.paperback;
  const platform = lists.platforms[specs.platform] || FALLBACK_SPECS.platforms.kdp;
  return {
    ...g,
    safe_margin: g.safe_margin ?? binding.safe_margin ?? 0.375,
    barcode_zone: g.barcode_zone || platform.barcode_zone || { w: 2, h: 1.2 },
    specs: { ...specs },
  };
}

/** The panels of a wrap as rectangles in inches, from left to right. */
export function panelsOf(fc) {
  const top = (fc.total_height - fc.panel_height) / 2;
  const out = [];
  if (fc.flap_width && fc.back_flap_x != null) out.push({ key: "back_flap", x: fc.back_flap_x, y: top, w: fc.flap_width, h: fc.panel_height });
  out.push({ key: "back", x: fc.back_x, y: top, w: fc.panel_width, h: fc.panel_height });
  out.push({ key: "spine", x: fc.spine_x, y: top, w: fc.spine_width, h: fc.panel_height });
  out.push({ key: "front", x: fc.front_x, y: top, w: fc.panel_width, h: fc.panel_height });
  if (fc.flap_width && fc.front_flap_x != null) out.push({ key: "front_flap", x: fc.front_flap_x, y: top, w: fc.flap_width, h: fc.panel_height });
  return out;
}

export const PANEL_LABELS = { back_flap: "Back flap", back: "Back cover", spine: "Spine", front: "Front cover", front_flap: "Front flap" };

export function fmtIn(v) {
  return `${(Math.round(v * 1000) / 1000).toString()}"`;
}
