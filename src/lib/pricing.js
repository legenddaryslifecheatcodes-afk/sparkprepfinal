import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Every price the app displays comes from GET /api/pricing -- the same config the
// server charges from -- so a shown price and a charged price can't disagree.
let cache = null;
let inflight = null;
const listeners = new Set();

function load() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = api.get("/pricing")
      .then(({ data }) => { cache = data; listeners.forEach((l) => l(data)); return data; })
      .catch(() => null)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function usePricing() {
  const [pricing, setPricing] = useState(cache);
  useEffect(() => {
    if (cache) { setPricing(cache); return undefined; }
    listeners.add(setPricing);
    load();
    return () => listeners.delete(setPricing);
  }, []);
  return pricing;
}

export function money(cents) {
  if (cents == null) return "";
  return `$${(cents / 100).toFixed(2)}`;
}

export const isBookModel = (pricing) => pricing?.model === "book_pass";

// The 99-Day Special line shown next to an audit price, e.g. "99-Day Special · regular price $9.99 from Jan 1".
// Phrased as the price it goes to (not a "was" price the audit never actually sold at).
export function specialNote(pricing, product) {
  const p = pricing?.[product];
  const s = pricing?.special;
  if (!p || !s?.active || !p.regular_cents || p.regular_cents <= p.price_cents) return "";
  // In UTC: the special ends 23:59:59 UTC Dec 31, which is still Dec 31 in US time zones -- the new price starts Jan 1.
  const from = new Date(new Date(s.ends_at).getTime() + 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${s.name} · regular price ${money(p.regular_cents)} from ${from}`;
}

export function savePercent(pricing, product) {
  const p = pricing?.[product];
  if (!p?.regular_cents || !pricing?.special?.active || p.regular_cents <= p.price_cents) return null;
  return Math.round((1 - p.price_cents / p.regular_cents) * 100);
}
