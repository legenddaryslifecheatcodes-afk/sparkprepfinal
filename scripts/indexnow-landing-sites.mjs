// Tells Bing (and other IndexNow engines) about every page on the SparkPrep topic sites.
// Run after the topic sites deploy:  npm run indexnow-landing
// Each site serves the same key file (sites/<key>/<KEY>.txt), written by build-landing-sites.mjs.
import { readFileSync } from "node:fs";
import { SITES } from "../content/landing-sites/shared.mjs";

const KEY = "ab609d74f8251ec3";
let failed = 0;
for (const s of SITES) {
  const sitemap = readFileSync(new URL(`../sites/${s.key}/sitemap.xml`, import.meta.url), "utf8");
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: s.host, key: KEY, keyLocation: `https://${s.host}/${KEY}.txt`, urlList }),
    });
    console.log(`IndexNow ${s.host}: HTTP ${res.status} for ${urlList.length} URLs`);
    if (res.status !== 200 && res.status !== 202) { failed++; console.log(await res.text()); }
  } catch (e) {
    failed++;
    console.log(`IndexNow ${s.host}: ${e.message}`);
  }
}
// A site whose DNS isn't set up yet fails here; that's expected until the subdomain is live.
if (failed) process.exitCode = 1;
