# SparkPrep — project guide for Claude

_Last updated: 2026-10-31. Keep this file current: whenever something ships, breaks, or a decision changes, update the matching section in the same session and commit it._

Facts here were true when written. Before acting on a status line (deployed / broken / open), re-check it against the real code and live site — never claim something works because this file says so.

---

## 1. What SparkPrep is

- **One line:** SparkPrep checks a self-published author's book **cover and interior** against the exact print rules of **Amazon KDP, IngramSpark, Barnes & Noble Press and Lulu**, explains every problem in plain English, **fixes** it (bleed, trim, spine width, safety margins, 240% ink limit, CMYK, DPI, fonts, template leftovers, ISBN mismatch), and exports print-ready **PDF/X-1a** files.
- **Owner / creator:** Joshua Davis (brand: **Legenddary**). Non-technical — talk in plain language, simple decisions, no jargon.
- **Origin story (core to the brand):** his own book *"Legenddary Mindset: The Awakening"* failed to print **18 times**; he built SparkPrep to fix it, then realised every self-published author has the same problem. The AI assistant and marketing should be able to tell this story.
- **Motto:** **"Power without complexity."** Real, powerful work under the hood; one obvious next step on screen. Never fake a capability to look impressive.
- **Major goal:** make **"SparkPrep Certified"** the industry's trusted seal. The report every finished book gets is named exactly **"The SparkPrep Certified Complete Publisher Preflight Report."** Only books whose final files pass *every* check (cover + every interior page) get it; everything else gets a plainer "SparkPrep Preflight Report." Never overclaim what was checked.
- **Live site:** https://sparkprep.legenddary.com

## 2. Owner's working rules (follow every time)

1. **Finish every assignment fully** — build, verify on the real site, deploy/publish, commit + push — unless told otherwise. If a session is cut off, pick the task up next session and finish it. (Incident: on 2026-10-12, SEO pages were found built but never published.)
2. **Verify before claiming.** Check real code / live systems / a distributor's own documents before saying something works or what a distributor requires. Show evidence (real numbers, the live page).
3. **Each distributor uses ONLY its own numbers** (from its own template or official spec sheet). Never borrow another distributor's figure.
4. **Never suggest two-step login (2FA)** — a 2FA lockout once devastated the owner. Suggest lockout-free protections only.
5. **The audit is a detector only.** It shows what's wrong and where; it never repairs. Fixing requires buying the book.
6. **Stripe is LIVE.** Never run a real purchase without the owner's explicit go-ahead.
7. **Never force-push.** Run backend tests (pytest) and see them pass before shipping backend changes.
8. **Honesty in marketing:** ads are dramatizations (FTC rule — no fake testimonials); label AI-generated actors.
9. **The next step is always right there (2026-10-26).** Every page marks its ONE next-step button with `data-next-step="Click to fix"` (see `components/NextStepPointer.jsx`): a floating gold card flies next to it, an arrow points at it, the button glows, and clicking the card presses it. Fix buttons sit next to the problem they fix, not only in the step guide. New pages and new steps must be tagged too.
10. **SparkPrep fixes what it can itself.** Only ask the customer for a new upload when a fix would damage the art (e.g. wrong-shaped art that would have to be stretched).

## 3. How it's set up — where everything lives

| Piece | Where the code is | Where it runs | How to deploy |
|---|---|---|---|
| **Frontend** (this folder, React / CRA + craco + Tailwind) | `C:\Users\legen\Downloads\sparkprep-frontend` — git repo `sparkprepfinal`, working branch **`sparkprep-logo-and-ai-gating`** | Cloudflare Pages project **`sparkprep-live`** → https://sparkprep.legenddary.com (also https://sparkprep-live.pages.dev) | **Automatic (since 2026-10-26):** every push/merge to `sparkprep-logo-and-ai-gating` runs GitHub Actions `.github/workflows/deploy.yml` (npm ci, build, `wrangler pages deploy` to `sparkprep-live`, `npm run indexnow`). Secrets `CLOUDFLARE_API_TOKEN` (custom token: Account / Cloudflare Pages / Edit) + `CLOUDFLARE_ACCOUNT_ID` are in the repo. `.npmrc` sets `legacy-peer-deps=true` (`@ai-sdk/react` vs react 19.0.0 clash). Manual fallback: `npm run build`, then `npx wrangler pages deploy build --project-name=sparkprep-live --branch=main --commit-dirty=true`, then `npm run indexnow`. |
| **Backend** (FastAPI, Python) | `C:\SparkPrepApp\backend` — GitHub `legenddaryslifecheatcodes-afk/sparkprep`, branch `main` | Render service `srv-dagtfh1t0dsc73fo44ig` (workspace `tea-da93as942hec73eivmt0`), https://sparkprep-v9fp.onrender.com, 1 CPU / 2 GB, disk at `/var/data` (raised 1 GB → 10 GB on 2026-10-19 before the Open House; it was 82% full) | Pushing to `main` **auto-deploys** to real customers. Run pytest first. |
| **AI Assistant** (chat widget) | `C:\Users\legen\Downloads\sparkprep-assistant\src\index.ts` (system prompt + CHANGELOG live here) | Cloudflare Worker `sparkprep-assistant` (Agents SDK, Durable Object `SparkPrepChat`, WebSocket) | `npx wrangler deploy` from that folder. Test via the real widget in a browser (not curl). Chat history auto-expires 24h after it starts. |
| **The Legenddary** (separate free app) | Built on Emergent (app "ebook-roadmap") | Emergent | — |

**Do NOT deploy** `C:\SparkPrepApp\frontend` — it is an old copy (no assistant, old 3D viewer). A Claude Code "safety guard" mod blocks that, plus force-pushes and backend ships before tests pass.

**Domain / DNS:** `legenddary.com` DNS is at **Namecheap** (not Cloudflare). Record: CNAME `sparkprep` → `sparkprep-live.pages.dev`, and the hostname is attached under Cloudflare → Workers & Pages → sparkprep-live → Custom domains. **Never move the nameservers to Cloudflare** — legenddary.com email forwarding lives at Namecheap. The real API URL is the onrender.com one; `api.sparkprep.legenddary.com` does not exist.

**Accounts:** everything logs in with the owner's Google email; Cloudflare account id starts `0d66da78`. (An old, locked Cloudflare account `84d4ccc5…` no longer matters.)

**Local dev gotchas:**
- Bash PATH can be broken in a fresh session — prepend `/c/Program Files/nodejs:/c/Program Files/Git/cmd:/c/Program Files/Git/usr/bin`.
- `gh` is not installed and the GitHub MCP fails auth — PRs to `main` must be opened in the browser (owner clicks Create).
- `craco.config.js` loads `.env` explicitly, so `.env.development.local` does NOT override the backend URL.
- `.claude/launch.json` has preview configs: `seo-build` (serves `build/` on :8766), `start` (dev server :3000), `start-local-backend`, backend helpers.
- The owner's PC is slow; `npm run build` takes ~6–7 minutes — run it in the background.
- `three` / `@react-three/*` are still in package.json (unused, not bundled); removing them hits an npm peer conflict.

### Frontend map (this repo)
- `src/App.js` — routes: `/`, `/login`, `/register`, `/pricing`, `/specs`, `/audit`, `/audit/:id/preview|report`, `/dashboard`, `/editor/:id`, `/account`, `/payment/*`, `/beta/*`, `/admin/beta`.
- `src/pages/Editor.jsx` + `components/StepGuide.jsx` — the guided editor (Book details → Upload → Fix → Final check → Export & certify; one glowing button for the next action; "Next:" pop-up after every step; "Re-scan my book" always visible).
- `components/NextStepPointer.jsx` — the floating "Click to fix" guide, mounted once in `App.js`. Picks the marked button (on screen first, then `data-next-step-priority`; inside an open dialog only that dialog's; a form's empty required box before its submit button), parks beside it on the side that covers the least, draws an animated arrow, glows the button; draggable (position kept for the session), snap-back, shrink-to-orb. Editor tags: step-guide button (1), section "Auto-Fix All Issues" / final-check buttons (2), title/spine boxes and the empty upload box (3). "Upload a new cover/interior" now opens the file picker straight away.
- `components/RepairBay.jsx` — live "broken → repaired → confirmed" Auto-Fix screen (backend 4-agent pipeline).
- `components/BookMockup.jsx` — CSS-3D book preview (replaced the broken WebGL one).
- `pages/CoverStudio.jsx` (`/cover-studio`, public, lazy-loaded) — the **Cover Studio**, step 1 of the "one-stop shop" plan: a Canva-style full-wrap cover designer (Fabric.js 6). `lib/coverStudio/`: `engine.js` (canvas, guides, re-layout on spec change, undo, 300 DPI render, print check), `templates.js` (14 layouts x 16 styles = 224 free templates, all built against the real panels in inches), `fonts.js` (333 Google Fonts, all open-licensed, loaded on demand), `specs.js` (geometry from `/specs/spine`; paperback-only offline estimate). Panels in `components/coverStudio/`. "Send to my book" uploads a 300 DPI JPG to `slot-upload/full_wrap` and opens the Editor; the Editor has a "Cover Studio" button (`/cover-studio?book=<id>`). AI designer uses backend `POST /api/ai/cover-plan` (Claude) + `POST /api/ai/cover-art` (OpenAI image), gated like AI Blurb (included with a book). Templates, fonts and tools are free forever (owner's rule).
- `pages/InteriorStudio.jsx` (`/interior-studio`, public, lazy-loaded) — the **Interior Studio**, step 2 of the one-stop shop: a Word-style editor (TipTap 3) for the inside pages with a live preview of the real printed pages beside it. Import Word (.docx) runs in the browser (`lib/interiorStudio/importWord.js`, mammoth): headings, bold/italic, lists, quotes, page breaks and `***` scene breaks carry over; Word's Title/Subtitle fill the title page; pictures are dropped (not supported yet, the author is told). Pages are typeset by the backend (`interior_studio.py`): 11 book styles, 11 embedded OFL fonts, margins never below the distributor's own table for the page count nor SparkPrep's 0.5" safe margin. Preview = `POST /api/interior/preview` + page JPEGs (free, no sign-in); "Send to my book" = `POST /api/projects/{id}/interior-studio` (typesets into the interior slot, keeps the document so the Editor's "Interior Studio" button reopens it). Same rule as covers: designing is free, the print PDF's download is part of the book. **Writing help** tab (`components/interiorStudio/WritingHelpPanel.jsx`, `lib/interiorStudio/writingHelp.js`): free browser spell check (red underlines, on/off), plus AI "Fix spelling & grammar" and "Improve my wording" for the chapter, a selection or the whole book (in ~8,000-character parts). Backend `POST /api/ai/writing-help` (`writing_help.py`, Claude) returns exact find/replace suggestions, each verified against the paragraph; the editor underlines them (decorations, not saved in the book) and the author accepts or skips each, one undo step per accept. Gated like the other AI tools (included with a book) with a 400,000-character daily allowance per account.
- `components/AssistantWidget.jsx` — chat widget (mascot art at `public/brand/sparkprep-mascot.png`).
- `components/RouteSeo.jsx` — per-page title / description / canonical; `noindex` for private pages. Titles/descriptions live in `lib/seoPages.json`; after `craco build`, `scripts/prerender-seo.mjs` writes `build/cover-studio.html`, `interior-studio.html`, `specs.html`, `audit.html`, `pricing.html` with that page's own head tags, JSON-LD (SoftwareApplication + breadcrumbs) and a readable summary, so crawlers that don't run JavaScript no longer see the homepage's head on every route (2026-10-28). New public routes: add them to `seoPages.json` and `EXTRA` in the script.
- **Guides (blog) — `/guides/` (2026-10-28, mission: 20,000 visitors/month by 2026-12-31):** static pages built by `scripts/build-guides.mjs` (`npm run guides`) from `content/guides/<slug>.json`. Every guide follows Trey's 4-step format: 1 the error (quoted verbatim only when it's a real message, else `errorNote` says paraphrased), 2 why, 3 DIY fix (Word/Acrobat/InDesign/Canva steps), 4 automated fix (CTA + button). Categories: cover, interior, color, platform. `npm run build` runs the guides script first, so a guide dated in the future goes live on the first deploy on/after its date; a daily scheduled task re-runs the deploy workflow so one goes live each day. Output in `public/guides/` and the GUIDES block of `sitemap.xml` is generated — edit the JSON, not the HTML. Facts must come from each distributor's own numbers (print_specs.py / interior_studio.py / the existing tool pages). Every guide also gets a "What it costs" table (freelancer price from Reedsy's own published figures, `REEDSY` in the script, vs SparkPrep's book price read live from `/api/pricing` with a computed "about N times"); a `compare` category holds SparkPrep-vs pages (Reedsy, freelancers, Vellum/Atticus) whose guides use `body` instead of error/why/diy.
- `lib/pricing.js` — every price shown comes from the backend `GET /api/pricing`. **Never hard-code prices in the frontend.**
- `public/` static SEO pages (plain HTML, not React): `/tools/`, `/kdp-cover-calculator/`, `/book-spine-width-calculator/`, `/book-cover-dimensions/`, `/ingramspark-cover-template/`, `/ingramspark-rejection-fixes/` (+ `public/tools/cover-calc.js`, `tools.css`). Also `sitemap.xml`, `robots.txt`, IndexNow key file `ab609d74f8251ec3.txt`.
- **SEO link magnets (2026-10-31):** three more free tools, hand-written HTML: `/book-margin-calculator/` (KDP margin table by page count, IngramSpark 0.5" safe area, bleed page size), `/image-dpi-checker/` (reads the picture in the browser, nothing uploaded), `/book-page-count-calculator/` (word count to pages, labelled an estimate); logic in `public/tools/more-tools.js`. Every tool has a `.next-step` box right under its result pointing to `/audit` (or Interior Studio), and `public/tools/next-step.js` makes it glow once after first use. Tools load `cover-calc.js` too, so the email box (Oct 28 decision) covers them. `scripts/build-seo-pages.mjs` (`npm run seo-pages`, also run by `npm run build`, fail-soft) writes `/templates/` + 12 genre pages `/templates/<genre>-book-covers/` (counts, fonts and colors read from `src/lib/coverStudio/templates.js`; previews are real Cover Studio thumbnails in `public/templates/img/<layout>-<style>.jpg`), `/free-book-formatting-guide/`, `/free-manuscript-checklist/`, `/free-indie-author-templates/`, and the SEO-PAGES block of `sitemap.xml`. Cover Studio opens a genre with `/cover-studio?genre=<key>`. `public/_redirects` sends `/free-spine-calculator`, `/free-isbn-margin-checker` and `/templates/thriller-book-cover-design` to the real pages. Guides: H2s now repeat the error's words (`errorShort` for long errors), optional `aka` list of other wordings, and a soft "fix it by hand or let SparkPrep do it" box after the manual steps. Real template count is **224** (14 layouts x 16 styles), not 270.

### Backend highlights (`C:\SparkPrepApp\backend`)
- `server.py` — main API; `pdfx_validator.py` — compliance checks; `file_processor.py` — export / CMYK / ink clamp / cover assembly; `print_specs.py` — distributor specs.
- `book_pass/config.py` — **the single source of every price** (served at `GET /api/pricing`). Env `SPARKPREP_PRICING_MODEL=book_pass` is ON in production.
- `autofix_agents/` — 4-agent verified Auto-Fix (triage → repair → independent verify → supervisor).
- `image_upscale_engine.py` — **the owner's own upscale algorithm** (Lanczos-3 + adaptive edge sharpening, keeps CMYK, non-generative). Don't call it a "normal" upscale.
- Export runs as a background job (`POST /projects/{id}/export-jobs`) because long requests hit Render's ~100s edge limit.
- Nightly database backups (keep 7) + admin "Download backup now"; restore tool `tools/restore_backup.py`.
- Tests: `backend/tests/` (205 passing as of 2026-10-08).

## 4. Pricing

**Live today (book-pass model):** $1.99 audit special (regular $9.99; checks the whole cover + page 1 of the interior), Advanced Audit (every page up to 300) $9.99 special / $19.99 regular, **$74.99 per book** (cover, interior or both; 7 days of unlimited exports), $49.99/month subscription = 1 book/month. Audit fees are credited toward the book. The "99-Day Special" ends 2027-01-01.

**NEW model the owner announced 2026-10-16 — NOT built yet:** membership **$9.99/month or $89.99/year** (fee waived during October 2026); per book **$49.99 for members / $74.99 for non-members**. Confirm with the owner before building, then change `book_pass/config.py` only (one source of truth) and re-check every page.

**Funnel:** free demo scan (honest count only, details locked) → **$1.99 audit** ("See My Results", what + where, never how to fix) → **the book** (Repair Bay, fixes, Certified export). Every audit result carries a "SparkPrep can fix this now" CTA.

**The Legenddary app** stays 100% free (export included, no watermark, no sign-up). At the end it shows an honest "What's next?" screen with 3 options: hire freelancers, cheapest DIY combo (must say plainly that a rookie can't safely fix the 240% ink limit or bleed by hand), or SparkPrep (prices pulled from `/api/pricing`).

## 5. What's done (highlights)

- Launched 2026-09-23. Domain live with HTTPS; Render health check `/api/health` set.
- Book-pass pricing live; Stripe live webhook set and signature-checked; prices server-decided (client can't tamper); a test pins displayed price == charged price.
- Guided Editor redesign, Repair Bay, CSS-3D preview, "your book is ready" celebration, per-file downloads with plain names.
- Real fixes driven by the owner's actual IngramSpark rejections — all 4 reasons are now caught: interior outside safety area / wrong page size (auto-fit + re-center), RGB/rich-black ink over 240% (K-only text + grayscale B&W export), template leftovers on covers, ISBN mismatch, spine text too wide (reads sideways spine text), text on jacket flap folds.
- Correct hardcover geometry: dust-jacket books need **3 files** (case, jacket, interior); jacket panel = trim +0.4375" wide, +0.25" tall; case matches IngramSpark's table; submit covers at bleed size.
- Separate front/spine/back cover pieces are really assembled (paperback).
- **Cover Studio (LIVE 2026-10-26, verified on the site + sitemap):** `/cover-studio`, backend adds `/ai/cover-plan`, `/ai/cover-art`, `safe_margin`/`barcode_zone` on `/specs/spine`. **Designing is free; the print-ready file is paid** (owner's decision 2026-10-25): the free download is a 150 DPI JPG (`lib/coverStudio/previewMarks.js`) with small "SPARKPREP PREVIEW" tags only across the trim lines and spine/flap folds (exactly where printers reject). Covers sent with `source=cover_studio` are flagged `made_in_cover_studio`; their previews are capped at 1600 px and the full-size original needs the book (402 `book_required`). Tests: backend `tests/test_cover_studio_download.py`.
- **Interior Studio LIVE (2026-10-26):** https://sparkprep.legenddary.com/interior-studio (backend PR #10, frontend PR #8; verified: `/api/interior/styles` lists 11 styles, sitemap lists the page).
- **AI Writing Help (step 3) LIVE 2026-10-26** (backend PR #11, frontend PR #9; verified: `/api/ai/writing-help` in the live API, the live chunk has the Writing help panel).
- **Studios → book → export (step 4, built 2026-10-26, PRs open):** backend + frontend branches `claude/studio-export` (backend first). Cover Studio designs are saved with the book (`GET/PUT /api/projects/{id}/cover-studio`, a JSON file `uploads/{id}_cover_design.json`, deleted with the book); a studio cover remembers the spine it was made for (`made_for_spine_width`), and `cover_refit` on every project says when a new page count changed the spine. The Editor shows a "Re-fit my cover" banner (opens `/cover-studio?book=<id>&refit=1`, which reopens the saved design on any device and remaps it onto the new spine) and Cover/Interior Studio cards when a part is missing; the Dashboard has "Design a cover" / "Write the inside pages" shortcuts and flags books whose cover needs re-fitting.
- SparkPrep Certified report on every export (certified only when final files pass everything).
- Login cool-down (never a lockout), 8-char minimum passwords, bcrypt.
- **Open House (deployed 2026-10-19):** 24 hours free, no sign-up (guest accounts + "Keep my work"), Mon Oct 19 12 PM PT → Tue Oct 20 12 PM PT. Backend `open_house.py` decides when it's on (admin off switch: `POST /api/admin/open-house`); frontend `OpenHouseBanner.jsx` shows only while `GET /api/open-house` says active. Promo banners + live script: `Downloads\SparkPrep_OpenHouse_Promo\`. After the window ends, unkept guest accounts (no email added) and their books, plus window audit files, are deleted automatically (backend PR #8).
- **SEO (2026-10-12):** 6 free tool pages live, new homepage title, per-page titles/canonicals, private pages `noindex`, footer tool links, Organization schema. Sitemap submitted to Google Search Console (status Success, 10 pages) and to IndexNow. **Bing (2026-10-23):** site was never added to Bing Webmaster Tools, so Bing had nothing to show. Owner to add it via "Import from Google Search Console" at bing.com/webmasters, then submit the sitemap there. `npm run indexnow` after each deploy keeps Bing updated.

## 6. What's broken / open / risky

- **Why the Editor got harder to use (found 2026-10-26):** the per-card fix buttons (Sep 19, `c4bbddd`) and the Sep 17–19 interior-check work were committed to `main`, but the live site has deployed from `sparkprep-logo-and-ai-gating` since it forked on Sep 16 — they never reached the site. Then the Oct 5 redesign (`c648874`) moved every action into the top step guide and the cards said "the step guide at the top shows what to press". A fix (`claude/fix-buttons-in-place`) was made Oct 26 but never merged. All restored on `claude/next-step-pointer`. Lesson: only `sparkprep-logo-and-ai-gating` is live — never land work on `main` alone. Still on `main` only: `17392aa` (Advanced Interior Check UI rebuild) and `9f639b9` (SPA fallback) — check before reusing.
- **Editor is wider than a phone screen** (header buttons overflow, ~640px) — sideways scrolling on mobile.

- **Colour interiors:** no ink (TAC) clamp for colour-paper PDF interiors; margin check doesn't measure headers/footers/page numbers/images on colour interiors (IngramSpark's colour rule). `white_60lb` not treated as B&W.
- **Front-cover-only upload** gets stretched into a full wrap at export — not addressed.
- **Jacket books:** celebration may never fire if the case cover has an RGB warning.
- **Cover OCR safety check fails open** (no tesseract / error = silently "no finding").
- **Memory risk:** CMYK conversion needs ~1.5 GB on the 2 GB Render box. Final Review ~16–17s (cover OCR re-run each time; idea: cache by file hash).
- **Deploys cause a brief 502** (Render disk service stops the old instance first) — don't deploy during live customer/publisher sessions.
- **Anonymous audit uploads are never deleted** — retention not decided.
- **No real card purchase proven end to end** on the live hosted checkout yet.
- **Traffic is tiny** (week of Oct 6–12: ~0 Google clicks, a handful of real visitors). **Cloudflare Web Analytics is OFF** — owner needs to enable it (Workers & Pages → sparkprep-live → Metrics → Enable Web Analytics) before visitor counts exist.
- **Semrush** is connected but out of API units.
- **Frontend `main` branch:** work lives on `sparkprep-logo-and-ai-gating`; a PR to `main` still needs the owner to click Create in GitHub.
- **The Legenddary app:** left sidebar partly covered in preview; fix unfinished (Emergent credits ran out 2026-10-15).

## 7. What's next

1. **California sales tax:** CA taxes SaaS from **2027-01-01** (SB 122). Add Stripe Tax to checkout before then; owner registers with CDTFA and confirms with an accountant (not tax advice).
2. **Build the new membership pricing** (§4) once the owner confirms.
3. Owner's rebuilt dust jacket for his own book (`Downloads\Legenddary Mindset - FIXED JACKET\`) — waiting for his visual OK, then he uploads to IngramSpark.
4. Turn on Cloudflare Web Analytics; re-check Google Search Console around Oct 19 – Nov 9 for the SEO pages to start ranking.
5. **Video ads ("ad factory"):** owner wants 10 short ads every 3 days (18–22s+, 3–4 shots: problem → turn → real SparkPrep screen → payoff; captions narrate). Post each video once per network, label dramatizations/AI actors. Emergent prompt for Ad 11 "Between Shifts" is written (2026-10-14): `Downloads\SparkPrep Ad 11 - Between Shifts\EMERGENT PROMPT - Between Shifts.txt` — no music, no logo/end card, motto included. Waiting for the owner to bring back Emergent's video; then add theme song, logo end card and the real SparkPrep screen clip (~20–24 s). Deliver videos as H.264 Constrained Baseline / mp42 / 48 kHz (other formats don't play on his device).
6. Lockout-proofing: owner to create `sparkprep@legenddary.com` (Namecheap forwarder), copy the USB backup + a database backup to a USB stick, keep a paper sheet of services/recovery info.
7. Future subscription tiers and the "SparkPrep Certified" partner path (IBPA / ALLi → Ingram).
8. Smaller UX: guided first screen for New Project; the Standard Check overlaps export's every-page check.

## 8. Reference files on the owner's PC

- Real distributor templates & spec sheets (IngramSpark case/jacket templates, `Paper_Specs_Spark.pdf`, PDF checklist, Lulu and B&N jacket templates) — in `Downloads`.
- Owner's real IngramSpark rejection emails — `Downloads\special templates\` (`error.pdf`, `inkinkink.pdf`, `check1.pdf`, `check2.pdf`, `ingram bullshit.pdf`).
- Demo files + script — `Downloads\SparkPrep_Demo_Files`.
- USB backup bundle — `Downloads\SparkPrep_USB_Backup_2026-09-29.zip`.
- Market numbers (verified): Bowker 3.53M self-published titles in 2025 (+38.7%). "$100B by 2034" is NOT sourced — don't use it.

## 9. Outside contacts

- **Lonnie, Pubconnections (pubconnections.com, contacted 2026-10-14):** one-person directory + newsletter for *website* publishers monetising with ads (Mediavine, Ezoic…) — not book authors. Earns from a paid "Partner Visibility Program." Advice given: don't pay for placement; a free CEO-Spotlight interview (backlink + story) is the only worthwhile trade.
