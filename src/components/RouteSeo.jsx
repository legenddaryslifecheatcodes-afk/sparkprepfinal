import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Per-page title, description and canonical for search engines. index.html only
// carries the homepage's, so without this every route looked like a copy of "/".
const SITE = "https://sparkprep.legenddary.com";

const PAGES = {
  "/": {
    title: "SparkPrep: Fix KDP & IngramSpark Book File Rejections",
    description: "SparkPrep checks your book cover and interior against the exact rules KDP, IngramSpark, Barnes & Noble and Lulu use to reject print files, explains every problem in plain English, and fixes it before you upload.",
  },
  "/pricing": {
    title: "Pricing: One Price Per Book, Cover and Interior | SparkPrep",
    description: "SparkPrep pricing: start free, run a low-cost Print Failure Audit, or get your cover and interior fixed and exported print-ready for KDP, IngramSpark, Barnes & Noble and Lulu.",
  },
  "/specs": {
    title: "Print Specs Library: KDP, IngramSpark, Barnes & Noble, Lulu | SparkPrep",
    description: "Trim sizes, bleed, spine width, safety margins and file rules for Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu print books, side by side.",
  },
  "/cover-studio": {
    title: "Free Book Cover Maker: Front, Spine & Back, Print-Ready | SparkPrep Cover Studio",
    description: "Design a full book cover (front, spine and back) sized exactly for KDP, IngramSpark, Barnes & Noble or Lulu. Hundreds of free templates and fonts, print guides, an AI cover designer and a 3D preview.",
  },
  "/interior-studio": {
    title: "Free Book Interior Formatter: Write or Import Word, Print-Ready Pages | SparkPrep Interior Studio",
    description: "Write or import your Word manuscript and watch real printed pages build beside you: 11 book styles, drop caps, chapters on the right-hand page, and margins set to KDP, IngramSpark, Barnes & Noble or Lulu's own rules.",
  },
  "/audit": {
    title: "Print Failure Audit: Find Why Your Book File Will Be Rejected | SparkPrep",
    description: "Upload your book cover or interior and see every problem KDP or IngramSpark would reject it for: bleed, trim, spine, safety margins, ink coverage, image resolution, fonts and more.",
  },
  "/register": {
    title: "Create Your Free SparkPrep Account | SparkPrep",
    description: "Create a free SparkPrep account to check your book cover and interior files against KDP and IngramSpark print rules.",
  },
};

// Private or one-off pages that should never show up in search results.
const NOINDEX = /^\/(login|dashboard|editor|account|admin|beta|payment|audit\/[^/]+\/)/;

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/);
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGES[pathname];
    if (page) {
      document.title = page.title;
      setMeta('meta[name="description"]', "content", page.description);
      setMeta('meta[property="og:title"]', "content", page.title);
      setMeta('meta[property="og:description"]', "content", page.description);
      setMeta('meta[property="og:url"]', "content", SITE + pathname);
      setMeta('link[rel="canonical"]', "href", SITE + pathname);
    }
    setMeta('meta[name="robots"]', "content", NOINDEX.test(pathname) ? "noindex, nofollow" : "index, follow");
  }, [pathname]);

  return null;
}
