// Adds the Cloudflare Web Analytics beacon to every .html page in a built folder.
// Why: legenddary.com's DNS is at Namecheap, so Cloudflare's one-click "Enable Web Analytics"
// on a Pages project never injects the beacon on our custom domains -- Metrics showed zero.
// The manual JS snippet works on any domain. Tokens live in analytics.json (one per hostname,
// or "default"). No token = nothing is added, so this is safe to run before one is pasted.
// Usage: node scripts/inject-analytics.mjs <folder> <hostname>
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const [dir, host] = process.argv.slice(2);
if (!dir || !host) { console.error("usage: inject-analytics.mjs <folder> <hostname>"); process.exit(1); }

const cfg = JSON.parse(readFileSync(new URL("../analytics.json", import.meta.url), "utf8"));
const token = (cfg[host] || cfg.default || "").trim();
if (!token) { console.log(`analytics: no token for ${host}, skipped`); process.exit(0); }
if (!/^[A-Za-z0-9]{16,64}$/.test(token)) { console.error(`analytics: token for ${host} doesn't look right, skipped`); process.exit(0); }

const tag = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${token}"}'></script>`;
let n = 0;
(function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!name.endsWith(".html")) continue;
    const html = readFileSync(p, "utf8");
    if (html.includes("cloudflareinsights.com/beacon") || !html.includes("</body>")) continue;
    writeFileSync(p, html.replace(/<\/body>(?![\s\S]*<\/body>)/, `${tag}</body>`));
    n++;
  }
})(dir);
console.log(`analytics: beacon added to ${n} page(s) for ${host}`);
