import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Crosshair, X, Wand2 } from "lucide-react";

/**
 * The "next step" pointer (owner, 2026-10-26): wherever there's a next step, nobody should have to hunt for the
 * button. A floating gold card flies over next to it, an arrow points at it, the button itself glows, and clicking
 * the card presses the button for you. The card can be dragged anywhere (it then stays put and keeps pointing),
 * snapped back, or shrunk to a small orb.
 *
 * Pages opt in by marking the ONE button that is the next step:
 *   data-next-step="Click to fix"          headline on the card (required)
 *   data-next-step-label="Fix my cover"    what the button does (defaults to the button's own text)
 *   data-next-step-priority="2"            when several are marked, one on screen wins first, then the highest
 *                                          priority, then the first on the page
 * While a dialog or overlay is open, only buttons inside it count (overlays without a dialog role opt in with
 * data-next-step-scope).
 */

const SCOPES = "[role='dialog'],[role='alertdialog'],[aria-modal='true'],[data-next-step-scope]";
const CARD_W = 264;
const CARD_H = 68;
const EDGE = 12;
const DRAG_KEY = "sp-next-step-pos";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// The part of the page actually on screen: on a phone a page wider than the screen makes window.innerWidth too big.
const viewW = () => Math.min(window.innerWidth, window.visualViewport?.width || Infinity);
const viewH = () => Math.min(window.innerHeight, window.visualViewport?.height || Infinity);

function shown(el) {
  if (!el?.isConnected || el.closest("[aria-hidden='true'],[hidden],[inert]")) return false;
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return false;
  const s = getComputedStyle(el);
  return s.visibility !== "hidden" && s.display !== "none";
}

// True when something else (a sticky header, a panel) sits on top of the button, so it can't really be seen.
function covered(el, r) {
  const x = clamp(r.left + r.width / 2, 1, viewW() - 1);
  const y = clamp(r.top + r.height / 2, 1, viewH() - 1);
  const hit = document.elementsFromPoint(x, y).find((e) => !e.closest("[data-next-step-ui]"));
  return !!hit && hit !== el && !el.contains(hit) && !hit.contains(el);
}

const onScreen = (el, r = el.getBoundingClientRect()) => r.bottom > 0 && r.top < viewH() && r.left < viewW() && !covered(el, r);

function findTarget() {
  const scopes = [...document.querySelectorAll(SCOPES)].filter((s) => shown(s) && !s.closest("[data-next-step-ui]"));
  const scope = scopes[scopes.length - 1] || null;
  const marked = [...(scope || document).querySelectorAll("[data-next-step]")].filter(shown);
  // A button already on screen beats one the user would have to scroll to; then the highest priority wins.
  const rank = (el) => (+el.dataset.nextStepPriority || 0) + (onScreen(el) ? 100 : 0);
  let best = null;
  let bestRank = -Infinity;
  for (const el of marked) {
    const k = rank(el);
    if (k > bestRank) { best = el; bestRank = k; }
  }
  // A form's submit button isn't the next step while a required box is still empty: point at that box first.
  const empty = best?.form && [...best.form.querySelectorAll("input:invalid,textarea:invalid,select:invalid")].find(shown);
  if (empty) return { el: empty, inScope: !!scope, field: true };
  return { el: best, inScope: !!scope };
}

function labelOf(el) {
  const own = el.dataset.nextStepLabel || el.getAttribute("aria-label") || el.innerText || el.value || el.placeholder || "";
  const text = own.replace(/\s+/g, " ").trim();
  return text.length > 42 ? `${text.slice(0, 40)}…` : text;
}

function fieldName(el) {
  const text = ((el.labels?.[0] || el.parentElement?.querySelector("label"))?.innerText || el.getAttribute("aria-label") || el.placeholder || el.name || "").replace(/\s+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "This box";
}

// Where the card parks itself: at the screen edge (pointing the way) when the button is scrolled out of view,
// otherwise on whichever side of the button covers the least of the rest of the page.
const SIDES = ["right", "left", "below", "above"];
const AVOID = "button,a[href],input,select,textarea,label,[role='button'],h1,h2,h3,p,img";

function placeAt(side, r, vw, vh, w, h) {
  const midY = r.top + r.height / 2 - h / 2;
  const midX = r.left + r.width / 2 - w / 2;
  const p = side === "right" ? { x: r.right + 48, y: midY }
    : side === "left" ? { x: r.left - 48 - w, y: midY }
    : side === "below" ? { x: midX, y: r.bottom + 36 }
    : { x: midX, y: r.top - 36 - h };
  return { x: clamp(p.x, EDGE, vw - w - EDGE), y: clamp(p.y, EDGE, vh - h - EDGE) };
}

function area(a, b) {
  const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return x > 0 && y > 0 ? x * y : 0;
}

function bestSide(target, r, vw, vh, w, h, current) {
  const others = [];
  for (const el of document.querySelectorAll(AVOID)) {
    if (el === target || target.contains(el) || el.contains(target) || el.closest("[data-next-step-ui]")) continue;
    const o = el.getBoundingClientRect();
    if (o.width && o.height && o.bottom > 0 && o.top < vh) others.push(o);
  }
  let best = SIDES[0];
  let bestCost = Infinity;
  SIDES.forEach((side, i) => {
    const p = placeAt(side, r, vw, vh, w, h);
    const box = { left: p.x, top: p.y, right: p.x + w, bottom: p.y + h };
    // Covering the button itself is the worst; then anything else on the page; then a mild preference order.
    let cost = area(box, r) * 50 + i * 40;
    for (const o of others) cost += area(box, o);
    if (side === current) cost *= 0.7; // don't hop sides over small differences
    if (cost < bestCost) { bestCost = cost; best = side; }
  });
  return best;
}

function edgeDock(dir, r, vw, vh, w, h) {
  const x = clamp(r.left + r.width / 2 - w / 2, EDGE, vw - w - EDGE);
  return dir === "up" ? { x, y: 76 } : { x, y: vh - h - 20 };
}

function readSavedPos() {
  try { return JSON.parse(sessionStorage.getItem(DRAG_KEY)) || null; } catch { return null; }
}

export default function NextStepPointer() {
  const { pathname } = useLocation();
  const [target, setTarget] = useState(null);
  const [inScope, setInScope] = useState(false);
  const [info, setInfo] = useState({ head: "", label: "", busy: false });
  const [pinned, setPinned] = useState(readSavedPos); // set once the card has been dragged somewhere
  const [small, setSmall] = useState(false);
  const cardRef = useRef(null);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const iconRef = useRef(null);
  const offRef = useRef(null);
  const dragRef = useRef(null);
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;

  // Pick the marked button: whenever the page changes, and on a slow timer as a backstop.
  useEffect(() => {
    let timer = 0;
    const pick = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { el, inScope: scoped, field } = findTarget();
        setTarget((prev) => (prev === el ? prev : el));
        setInScope(scoped);
        if (el) {
          const next = { head: field ? "Fill this in first" : el.dataset.nextStep || "Click here next", label: field ? fieldName(el) : labelOf(el), busy: !!el.disabled || el.getAttribute("aria-busy") === "true" };
          setInfo((p) => (p.head === next.head && p.label === next.label && p.busy === next.busy ? p : next));
        }
      }, 60);
    };
    pick();
    const mo = new MutationObserver(pick);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-next-step", "data-next-step-priority", "disabled", "data-state", "hidden", "aria-hidden", "class"], characterData: true });
    const t = setInterval(pick, 1200);
    document.addEventListener("input", pick, true); // typing fills a box without changing the page's structure
    window.addEventListener("scroll", pick, { capture: true, passive: true }); // what's on screen decides the pick
    window.addEventListener("resize", pick);
    return () => {
      mo.disconnect(); clearInterval(t); clearTimeout(timer);
      document.removeEventListener("input", pick, true);
      window.removeEventListener("scroll", pick, { capture: true });
      window.removeEventListener("resize", pick);
    };
  }, [pathname]);

  // A new next step brings the card back out, even if it was shrunk for the last one.
  useEffect(() => { setSmall(false); }, [target, info.label]);

  // The glow on the button itself.
  useEffect(() => {
    if (!target) return undefined;
    target.classList.add("sp-next-target");
    return () => target.classList.remove("sp-next-target");
  }, [target]);

  // Follow the button every frame: park the card, draw the arrow, turn the card's arrow icon toward it.
  useEffect(() => {
    if (!target) return undefined;
    let raf = 0;
    let last = "";
    let side = null;
    let sideAt = 0;
    let hidden = false;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const card = cardRef.current;
      const path = pathRef.current;
      if (!target.isConnected) return;
      const vw = viewW();
      const vh = viewH();
      const r = target.getBoundingClientRect();
      const w = card?.offsetWidth || CARD_W;
      const h = card?.offsetHeight || CARD_H;
      // Whether the button is covered, and the best side for the card, are re-checked a few times a second, not
      // every frame (they read the whole page).
      if (!sideAt || now - sideAt > 400) {
        hidden = r.bottom > 0 && r.top < vh && covered(target, r);
        if (!pinnedRef.current) side = bestSide(target, r, vw, vh, w, h, side);
        sideAt = now;
      }
      const offscreen = r.bottom < 0 ? "up" : r.top > vh ? "down" : hidden ? (r.top + r.height / 2 < vh / 2 ? "up" : "down") : "";
      const inView = !offscreen;
      if (card && !dragRef.current?.moved) {
        const p = pinnedRef.current
          ? { x: clamp(pinnedRef.current.x, EDGE, vw - w - EDGE), y: clamp(pinnedRef.current.y, EDGE, vh - h - EDGE) }
          : inView ? placeAt(side, r, vw, vh, w, h) : edgeDock(offscreen, r, vw, vh, w, h);
        const tf = `translate3d(${Math.round(p.x)}px,${Math.round(p.y)}px,0)`;
        if (card.style.transform !== tf) card.style.transform = tf;
      }
      if (offRef.current && offRef.current.dataset.dir !== offscreen) {
        offRef.current.dataset.dir = offscreen;
        offRef.current.textContent = offscreen ? `It's just ${offscreen === "up" ? "above" : "below"} — click and I'll take you there` : "";
      }
      if (!path) return;
      // Arrow: from the card's nearest edge to the button's nearest edge (or the screen edge when it's out of view).
      const c = card ? card.getBoundingClientRect() : null;
      const tx = clamp(r.left + r.width / 2, 8, vw - 8);
      const ty = clamp(r.top + r.height / 2, 8, vh - 8);
      let d = "";
      let ex = tx;
      let ey = ty;
      if (c) {
        const cx = c.left + c.width / 2;
        const cy = c.top + c.height / 2;
        const sx = clamp(tx, c.left, c.right);
        const sy = clamp(ty, c.top, c.bottom);
        ex = offscreen ? tx : clamp(cx, r.left - 10, r.right + 10);
        ey = offscreen ? (offscreen === "up" ? 6 : vh - 6) : clamp(cy, r.top - 10, r.bottom + 10);
        const dist = Math.hypot(ex - sx, ey - sy);
        if (dist > 24) {
          const mx = (sx + ex) / 2;
          const my = (sy + ey) / 2;
          const bend = Math.min(60, dist * 0.25);
          const nx = -(ey - sy) / dist;
          const ny = (ex - sx) / dist;
          d = `M${sx.toFixed(1)},${sy.toFixed(1)} Q${(mx + nx * bend).toFixed(1)},${(my + ny * bend).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
        }
        if (iconRef.current) {
          const deg = Math.round((Math.atan2(ty - cy, tx - cx) * 180) / Math.PI);
          iconRef.current.style.transform = `rotate(${deg}deg)`;
        }
      }
      if (d !== last) {
        last = d;
        path.setAttribute("d", d);
        path.style.display = d ? "" : "none";
        if (dotRef.current) {
          dotRef.current.setAttribute("cx", ex.toFixed(1));
          dotRef.current.setAttribute("cy", ey.toFixed(1));
          dotRef.current.style.display = d && !offscreen ? "" : "none";
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, small, inScope]);

  if (!target) return null;

  const press = () => {
    if (!target.isConnected) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target.disabled) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) target.focus({ preventScroll: true });
    target.click();
  };

  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest("[data-no-drag]")) return;
    const c = cardRef.current.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: c.left, oy: c.top, moved: false };
    cardRef.current.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const g = dragRef.current;
    if (!g) return;
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (!g.moved && Math.hypot(dx, dy) < 5) return;
    g.moved = true;
    const card = cardRef.current;
    card.classList.add("sp-next-dragging");
    const x = clamp(g.ox + dx, EDGE, viewW() - card.offsetWidth - EDGE);
    const y = clamp(g.oy + dy, EDGE, viewH() - card.offsetHeight - EDGE);
    g.x = x;
    g.y = y;
    card.style.transform = `translate3d(${x}px,${y}px,0)`;
  };
  const onPointerUp = () => {
    const g = dragRef.current;
    dragRef.current = null;
    if (!g) return;
    cardRef.current?.classList.remove("sp-next-dragging");
    if (g.moved) {
      const pos = { x: g.x, y: g.y };
      try { sessionStorage.setItem(DRAG_KEY, JSON.stringify(pos)); } catch { /* private mode: position just isn't kept */ }
      setPinned(pos);
    } else if (small) {
      setSmall(false);
    } else {
      press();
    }
  };
  const unpin = () => {
    try { sessionStorage.removeItem(DRAG_KEY); } catch { /* nothing kept */ }
    setPinned(null);
  };

  // Inside a dialog the card would count as a click outside it (and close it), so there it's just the glow + arrow.
  const showCard = !inScope;

  return (
    <div data-next-step-ui aria-live="polite">
      <style>{CSS}</style>
      <svg className="sp-next-arrow" width="100%" height="100%" aria-hidden="true">
        <defs>
          <marker id="sp-next-head" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#F5D46B" />
          </marker>
          <linearGradient id="sp-next-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B8902A" />
            <stop offset="1" stopColor="#F5D46B" />
          </linearGradient>
        </defs>
        {(showCard && !small) && <path ref={pathRef} className="sp-next-line" fill="none" stroke="url(#sp-next-grad)" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#sp-next-head)" />}
        {(showCard && !small) && <circle ref={dotRef} r="5" className="sp-next-dot" />}
      </svg>
      {showCard && (
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={`${info.head}: ${info.label}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragRef.current = null; cardRef.current?.classList.remove("sp-next-dragging"); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); small ? setSmall(false) : press(); } }}
          className={`sp-next-card ${small ? "sp-next-small" : ""} ${info.busy ? "sp-next-busy" : ""}`}
          data-testid="next-step-pointer"
          title={small ? "Show the next step" : "Click to do it · drag to move"}
        >
          {small ? (
            <span className="sp-next-orb"><Wand2 className="w-5 h-5" /></span>
          ) : (
            <>
              <span className="sp-next-badge"><span ref={iconRef} className="sp-next-icon"><ArrowRight className="w-4 h-4" /></span></span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono-spec text-[9px] tracking-[0.2em] uppercase text-[#D4AF37]/80">{info.busy ? "Working on it" : "Next step"}</span>
                <span className="block font-display font-bold text-[15px] leading-tight text-white">{info.busy ? "Hang tight…" : info.head}</span>
                {info.label && <span className="block text-[11px] text-neutral-400 truncate">{info.label}</span>}
                <span ref={offRef} className="block text-[10px] text-[#F5D46B] empty:hidden" />
              </span>
              <span className="flex flex-col gap-1 self-start" data-no-drag>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSmall(true); }} className="sp-next-mini" aria-label="Shrink the guide" title="Shrink"><X className="w-3 h-3" /></button>
                {pinned && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); unpin(); }} className="sp-next-mini" aria-label="Move the guide back next to the button" title="Snap back to the button"><Crosshair className="w-3 h-3" /></button>
                )}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const CSS = `
.sp-next-arrow{position:fixed;inset:0;pointer-events:none;z-index:60;overflow:visible}
.sp-next-line{stroke-dasharray:7 7;animation:sp-next-march .9s linear infinite;filter:drop-shadow(0 0 6px rgba(212,175,55,.55))}
@keyframes sp-next-march{to{stroke-dashoffset:-14}}
.sp-next-dot{fill:#F5D46B;animation:sp-next-ping 1.4s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes sp-next-ping{0%{opacity:1;transform:scale(1)}80%,100%{opacity:0;transform:scale(2.6)}}
.sp-next-card{position:fixed;left:0;top:0;z-index:61;width:${CARD_W}px;max-width:calc(100vw - ${EDGE * 2}px);display:flex;align-items:center;gap:12px;padding:12px 12px 12px 12px;
  background:linear-gradient(135deg,rgba(24,20,10,.94),rgba(8,8,8,.96));border:1px solid rgba(212,175,55,.55);border-radius:14px;color:#fff;cursor:pointer;user-select:none;touch-action:none;
  box-shadow:0 18px 40px -12px rgba(0,0,0,.8),0 0 0 1px rgba(212,175,55,.08),0 0 28px -6px rgba(212,175,55,.45);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  transition:transform .55s cubic-bezier(.22,1,.36,1),box-shadow .2s,border-color .2s;will-change:transform;animation:sp-next-in .5s cubic-bezier(.22,1,.36,1)}
.sp-next-card:hover{border-color:#D4AF37;box-shadow:0 18px 40px -12px rgba(0,0,0,.8),0 0 0 1px rgba(212,175,55,.3),0 0 36px -4px rgba(212,175,55,.65)}
.sp-next-card:focus-visible{outline:2px solid #F5D46B;outline-offset:3px}
.sp-next-card.sp-next-dragging{transition:none;cursor:grabbing;box-shadow:0 28px 60px -12px rgba(0,0,0,.9),0 0 40px -4px rgba(212,175,55,.7)}
@keyframes sp-next-in{from{opacity:0}to{opacity:1}}
.sp-next-badge{flex:none;width:38px;height:38px;border-radius:999px;display:flex;align-items:center;justify-content:center;color:#0A0A0A;
  background:radial-gradient(circle at 30% 30%,#FBE7A1,#D4AF37 55%,#9C7A1E);box-shadow:0 0 0 3px rgba(212,175,55,.18),0 0 18px rgba(212,175,55,.6);animation:sp-next-breathe 1.8s ease-in-out infinite}
.sp-next-icon{display:flex;transition:transform .25s ease-out}
@keyframes sp-next-breathe{0%,100%{box-shadow:0 0 0 3px rgba(212,175,55,.18),0 0 14px rgba(212,175,55,.5)}50%{box-shadow:0 0 0 6px rgba(212,175,55,.12),0 0 26px rgba(212,175,55,.8)}}
.sp-next-mini{width:20px;height:20px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#a3a3a3;border:1px solid rgba(255,255,255,.08)}
.sp-next-mini:hover{color:#fff;border-color:rgba(212,175,55,.6)}
.sp-next-card.sp-next-small{width:52px;height:52px;padding:0;justify-content:center;border-radius:999px}
.sp-next-orb{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:999px;color:#0A0A0A;background:radial-gradient(circle at 30% 30%,#FBE7A1,#D4AF37 55%,#9C7A1E);animation:sp-next-breathe 1.8s ease-in-out infinite}
.sp-next-busy .sp-next-badge{animation:sp-next-spin 1.2s linear infinite}
@keyframes sp-next-spin{to{transform:rotate(360deg)}}
.sp-next-target{outline:2px solid #F5D46B!important;outline-offset:3px;animation:sp-next-halo 1.6s ease-in-out infinite!important}
@keyframes sp-next-halo{0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,.0),0 0 14px rgba(212,175,55,.45)}50%{box-shadow:0 0 0 6px rgba(212,175,55,.22),0 0 30px rgba(212,175,55,.8)}}
@media (max-width:640px){.sp-next-card:not(.sp-next-small){width:232px;padding:10px;gap:10px}}
@media (prefers-reduced-motion: reduce){.sp-next-card{transition:none;animation:none}.sp-next-line,.sp-next-dot,.sp-next-badge,.sp-next-orb,.sp-next-target{animation:none!important}}
`;
