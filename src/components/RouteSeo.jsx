import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PAGES from "@/lib/seoPages.json";

// Per-page title, description and canonical for search engines. index.html only
// carries the homepage's, so without this every route looked like a copy of "/".
const SITE = "https://sparkprep.legenddary.com";

// Titles and descriptions live in seoPages.json so the build step (scripts/prerender-seo.mjs)
// can bake the same ones into each page's HTML for crawlers that don't run JavaScript.

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
      setMeta('meta[name="twitter:title"]', "content", page.title);
      setMeta('meta[name="twitter:description"]', "content", page.description);
      setMeta('link[rel="canonical"]', "href", SITE + pathname);
    }
    setMeta('meta[name="robots"]', "content", NOINDEX.test(pathname) ? "noindex, nofollow" : "index, follow");
  }, [pathname]);

  return null;
}
