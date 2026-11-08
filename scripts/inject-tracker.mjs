// Adds SparkPrep's own traffic counter (/track.js -> backend /api/pv) to every .html page in a built folder.
// Works on the main site and the topic subdomain sites (the script is loaded from the main site by full URL).
// Usage: node scripts/inject-tracker.mjs <folder>
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const [dir] = process.argv.slice(2);
if (!dir) { console.error("usage: inject-tracker.mjs <folder>"); process.exit(1); }
const tag = `<script defer src="https://sparkprep.legenddary.com/track.js"></script>`;
let n = 0;
(function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!name.endsWith(".html")) continue;
    const html = readFileSync(p, "utf8");
    if (html.includes("/track.js\"") || !html.includes("</body>")) continue;
    writeFileSync(p, html.replace(/<\/body>(?![\s\S]*<\/body>)/, `${tag}</body>`));
    n++;
  }
})(dir);
console.log(`tracker: added to ${n} page(s) in ${dir}`);
