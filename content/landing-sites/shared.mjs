// Shared settings for the SparkPrep topic sites (one small static site per subdomain).
// Edit prices HERE only: every page reads them from this file.
// The main site's own prices come from the backend (/api/pricing); keep these in step with it.

export const MAIN = "https://sparkprep.legenddary.com";
export const UPDATED = "2026-11-01";

export const PRICES = {
  audit: "$1.99",            // full cover + page 1 of the interior
  auditLater: "$3.99",       // from January 1, 2027
  auditChangeDate: "January 1",
  advanced: "$9.99",         // every interior page, up to 300 pages
  book: "$74.99",            // fix + print-ready export of one book (cover, interior or both)
};

// The ONE line every page uses to explain the price. Plain English.
export const PRICE_LINE =
  `The scan is free and shows how many problems your files have. ` +
  `To see every problem and where it is, the audit is ${PRICES.audit} (${PRICES.auditLater} after ${PRICES.auditChangeDate}). ` +
  `The Advanced Audit checks every page, up to 300, for ${PRICES.advanced}.`;

// Every topic site. "host" is the subdomain, "project" is the Cloudflare Pages project name.
export const SITES = [
  {
    key: "landing",
    host: "sparkpreplanding.legenddary.com",
    project: "sparkprep-landing",
    name: "Book Preflight, Explained",
    short: "What is preflight?",
    blurb: "What book preflight is, who needs it and what gets checked before KDP or IngramSpark prints your book.",
    accent: "#d4af37",
  },
  {
    key: "fix",
    host: "sparkpreplandingfix.legenddary.com",
    project: "sparkprep-landing-fix",
    name: "Print File Fixes",
    short: "How to fix it",
    blurb: "Step-by-step fixes for bleed, margins, fonts, transparency, picture quality, color and spine problems.",
    accent: "#4cc38a",
  },
  {
    key: "covers",
    host: "sparkpreplandingcovers.legenddary.com",
    project: "sparkprep-landing-covers",
    name: "Print Cover Sizes",
    short: "Cover sizes & spines",
    blurb: "Full cover size charts, spine widths, barcode space and hardcover rules for KDP and IngramSpark.",
    accent: "#6fa8ff",
  },
  {
    key: "errors",
    host: "sparkpreplandingerrors.legenddary.com",
    project: "sparkprep-landing-errors",
    name: "Rejection Messages Decoded",
    short: "Rejection messages",
    blurb: "What KDP and IngramSpark rejection messages really mean, in plain English, and what to do next.",
    accent: "#e0574f",
  },
  {
    key: "newauthor",
    host: "sparkpreplandingnewauthor.legenddary.com",
    project: "sparkprep-landing-new-author",
    name: "First Book Guide",
    short: "First-time authors",
    blurb: "Your first print book, step by step: costs, timeline, words to know and the mistakes to skip.",
    accent: "#c38cff",
  },
];

// Links into the main site that pages can use.
export const MAIN_LINKS = {
  audit: `${MAIN}/audit`,
  home: `${MAIN}/`,
  pricing: `${MAIN}/pricing`,
  coverStudio: `${MAIN}/cover-studio`,
  interiorStudio: `${MAIN}/interior-studio`,
  tools: `${MAIN}/tools/`,
  guides: `${MAIN}/guides/`,
  specs: `${MAIN}/specs`,
  templates: `${MAIN}/templates/`,
  kdpCalc: `${MAIN}/kdp-cover-calculator/`,
  spineCalc: `${MAIN}/book-spine-width-calculator/`,
  marginCalc: `${MAIN}/book-margin-calculator/`,
  dpiChecker: `${MAIN}/image-dpi-checker/`,
  pageCount: `${MAIN}/book-page-count-calculator/`,
  coverDims: `${MAIN}/book-cover-dimensions/`,
  ingramTemplate: `${MAIN}/ingramspark-cover-template/`,
  ingramFixes: `${MAIN}/ingramspark-rejection-fixes/`,
  guide: (slug) => `${MAIN}/guides/${slug}/`,
};

// Link to a page on one of the topic sites, e.g. site("fix", "/bleed/").
export function site(key, path = "/") {
  const s = SITES.find((x) => x.key === key);
  if (!s) throw new Error(`unknown site ${key}`);
  return `https://${s.host}${path}`;
}
