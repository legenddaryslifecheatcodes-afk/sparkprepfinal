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
