// Tells Bing (and Yandex, Seznam, Naver) that our pages changed, via IndexNow.
// Run after every Cloudflare deploy:  npm run indexnow
// Reads the URL list from public/sitemap.xml so new pages are picked up automatically.
import { readFileSync } from "node:fs";

const HOST = "sparkprep.legenddary.com";
const KEY = "ab609d74f8251ec3"; // must match public/<KEY>.txt, which is deployed with the site

const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});

// 200 = accepted, 202 = accepted and key check pending. Anything else is a problem.
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.log(await res.text());
  process.exit(1);
}
