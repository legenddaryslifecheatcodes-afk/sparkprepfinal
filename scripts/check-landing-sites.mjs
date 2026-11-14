// Checks the five SparkPrep topic sites' sitemaps, robots.txt, canonicals and internal links.
//
//   node scripts/check-landing-sites.mjs          checks the built files in sites/ (run the build first)
//   node scripts/check-landing-sites.mjs --live   checks the live sites over HTTPS (used after each deploy)
//
// Fails (exit 1) on: a sitemap that is missing or not valid XML, a duplicate or non-HTTPS sitemap URL,
// a sitemap URL on the wrong host, a page left out of the sitemap, a canonical that doesn't match its
// sitemap URL, a noindex page in the sitemap, robots.txt not pointing at the sitemap, a broken link
// between pages of the topic sites, or a page no other page links to.
// No dependencies: plain Node 20.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITES, MAIN } from "../content/landing-sites/shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIVE = process.argv.includes("--live");
const problems = [];
const bad = (msg) => problems.push(msg);
const HOSTS = new Map(SITES.map((s) => [s.host, s]));

// ---- fetch a path from a site (built files or live HTTPS) ----
async function get(host, path) {
  if (LIVE) {
    const url = `https://${host}${path}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fetch(url, { redirect: "manual", headers: { "User-Agent": "SparkPrep-sitemap-check/1.0" } });
        return { status: r.status, type: r.headers.get("content-type") || "", location: r.headers.get("location"), body: await r.text() };
      } catch (e) {
        if (attempt === 3) return { status: 0, type: "", body: "", error: String(e) };
        await new Promise((res) => setTimeout(res, 2000 * attempt));
      }
    }
  }
  const s = HOSTS.get(host);
  const dir = join(ROOT, "sites", s.key);
  let file = join(dir, path);
  if (path.endsWith("/")) file = join(file, "index.html");
  if (!existsSync(file) || statSync(file).isDirectory()) return { status: 404, type: "", body: "" };
  const type = file.endsWith(".xml") ? "application/xml" : file.endsWith(".txt") ? "text/plain" : "text/html";
  return { status: 200, type, body: readFileSync(file, "utf8") };
}

const attr = (html, re) => (html.match(re) || [])[1];
const canonicalOf = (html) => attr(html, /<link rel="canonical" href="([^"]+)"/i);
const robotsMetaOf = (html) => attr(html, /<meta name="robots" content="([^"]+)"/i) || "";

// Every link on a page that points at one of the topic sites (relative, or absolute to a topic host).
function topicLinks(html, host) {
  const out = [];
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const m of clean.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) continue;
    let u;
    try { u = new URL(href, `https://${host}/`); } catch { out.push({ bad: href }); continue; }
    if (!HOSTS.has(u.host)) continue;
    out.push({ host: u.host, path: u.pathname, protocol: u.protocol, href });
  }
  return out;
}

const sitemapUrls = new Map(); // host -> [urls]
const pageHtml = new Map(); // full url -> html
const builtPages = new Map(); // host -> [paths] (offline only: every index.html on disk)

for (const s of SITES) {
  // robots.txt
  const robots = await get(s.host, "/robots.txt");
  if (robots.status !== 200) bad(`${s.host}/robots.txt: HTTP ${robots.status}`);
  else {
    const want = `https://${s.host}/sitemap.xml`;
    const lines = robots.body.split(/\r?\n/).map((l) => l.trim());
    if (!lines.some((l) => l.toLowerCase() === `sitemap: ${want}`.toLowerCase())) bad(`${s.host}/robots.txt: no "Sitemap: ${want}" line`);
    if (lines.some((l) => /^disallow:\s*\/\s*$/i.test(l))) bad(`${s.host}/robots.txt: blocks the whole site`);
  }

  // sitemap.xml
  const sm = await get(s.host, "/sitemap.xml");
  if (sm.status !== 200) { bad(`${s.host}/sitemap.xml: HTTP ${sm.status}`); continue; }
  if (LIVE && !/xml/i.test(sm.type)) bad(`${s.host}/sitemap.xml: served as "${sm.type}", not XML`);
  const xml = sm.body.trim();
  if (!xml.startsWith("<?xml")) bad(`${s.host}/sitemap.xml: missing XML declaration`);
  if (!/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(xml)) bad(`${s.host}/sitemap.xml: missing sitemaps.org urlset`);
  const opens = (xml.match(/<url>/g) || []).length, closes = (xml.match(/<\/url>/g) || []).length;
  if (opens !== closes || !xml.endsWith("</urlset>")) bad(`${s.host}/sitemap.xml: XML is not well formed`);
  if (/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml)) bad(`${s.host}/sitemap.xml: unescaped &`);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1])) bad(`${s.host}/sitemap.xml: bad lastmod ${m[1]}`);
  if (!locs.length) bad(`${s.host}/sitemap.xml: no URLs`);
  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) bad(`${s.host}/sitemap.xml: duplicate ${loc}`);
    seen.add(loc);
    let u;
    try { u = new URL(loc); } catch { bad(`${s.host}/sitemap.xml: not a URL: ${loc}`); continue; }
    if (u.protocol !== "https:") bad(`${s.host}/sitemap.xml: not HTTPS: ${loc}`);
    if (u.host !== s.host) bad(`${s.host}/sitemap.xml: URL on another host: ${loc}`);
    if (u.search || u.hash) bad(`${s.host}/sitemap.xml: URL has ?query or #hash: ${loc}`);
    if (!u.pathname.endsWith("/")) bad(`${s.host}/sitemap.xml: URL without trailing slash (would redirect): ${loc}`);
  }
  sitemapUrls.set(s.host, locs);

  // every sitemap URL must load (200, no redirect), be indexable, and declare itself as canonical
  for (const loc of locs) {
    const u = new URL(loc);
    const r = await get(s.host, u.pathname);
    if (r.status !== 200) { bad(`${loc}: HTTP ${r.status}${r.location ? ` -> ${r.location}` : ""}${r.error ? ` (${r.error})` : ""}`); continue; }
    pageHtml.set(loc, r.body);
    const canon = canonicalOf(r.body);
    if (!canon) bad(`${loc}: no canonical tag`);
    else if (canon !== loc) bad(`${loc}: canonical points to ${canon}`);
    if (/noindex/i.test(robotsMetaOf(r.body))) bad(`${loc}: in the sitemap but marked noindex`);
  }

  // offline: every built page must be in the sitemap (live: we can't list files, the link crawl covers it)
  if (!LIVE) {
    const dir = join(ROOT, "sites", s.key);
    const paths = [];
    (function walk(d, rel) {
      for (const f of readdirSync(d)) {
        const full = join(d, f);
        if (statSync(full).isDirectory()) walk(full, `${rel}${f}/`);
        else if (f === "index.html") paths.push(rel);
      }
    })(dir, "/");
    builtPages.set(s.host, paths);
    for (const p of paths) if (!seen.has(`https://${s.host}${p}`)) bad(`https://${s.host}${p}: built page missing from the sitemap`);
  }
}

// ---- internal links: no broken links between topic pages, and no orphan pages ----
const allSitemap = new Set([...sitemapUrls.values()].flat());
const inbound = new Map([...allSitemap].map((u) => [u, 0]));
const checkedTargets = new Map();
for (const [from, html] of pageHtml) {
  const fromHost = new URL(from).host;
  for (const l of topicLinks(html, fromHost)) {
    if (l.bad) { bad(`${from}: unparseable link ${l.bad}`); continue; }
    if (l.protocol !== "https:") bad(`${from}: link uses ${l.protocol} not https: ${l.href}`);
    const target = `https://${l.host}${l.path}`;
    if (target !== from && inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
    if (allSitemap.has(target)) continue;
    // not a sitemap page: it must at least exist (e.g. a link without a trailing slash would redirect)
    if (!checkedTargets.has(target)) checkedTargets.set(target, (await get(l.host, l.path)).status);
    const st = checkedTargets.get(target);
    if (st !== 200) bad(`${from}: broken link to ${target} (HTTP ${st})`);
    else bad(`${from}: links to ${target}, which is not in that site's sitemap`);
  }
}
for (const [url, n] of inbound) if (n === 0) bad(`${url}: orphan page (no other page links to it)`);

// ---- links to the main site: live mode checks that they load ----
if (LIVE) {
  const mainLinks = new Set();
  for (const html of pageHtml.values())
    for (const m of html.matchAll(/href="(https:\/\/sparkprep\.legenddary\.com[^"#?]*)/g)) mainLinks.add(m[1]);
  for (const link of mainLinks) {
    try {
      const r = await fetch(link, { redirect: "follow", headers: { "User-Agent": "SparkPrep-sitemap-check/1.0" } });
      if (r.status >= 400) bad(`main-site link broken: ${link} (HTTP ${r.status})`);
    } catch (e) { bad(`main-site link failed: ${link} (${e})`); }
  }
  console.log(`Checked ${mainLinks.size} links to ${MAIN}.`);
}

for (const s of SITES) console.log(`${LIVE ? "LIVE " : ""}https://${s.host}/sitemap.xml: ${(sitemapUrls.get(s.host) || []).length} URLs`);
console.log(`${allSitemap.size} pages, ${pageHtml.size} loaded, ${[...inbound.values()].reduce((a, b) => a + b, 0)} internal links between topic pages.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("All sitemap, robots.txt, canonical and internal-link checks passed.");
