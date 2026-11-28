import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// AI credits (owner's plan, 2026-11-27): the editors are free; their AI helpers run on credits. Free accounts get
// 50 per editor to start plus 10 a month, members 500 a month. The numbers come from GET /api/ai/credits.
let cache = null;
const listeners = new Set();

export function refreshAiCredits() {
  return api.get("/ai/credits")
    .then(({ data }) => { cache = data; listeners.forEach((l) => l(data)); return data; })
    .catch(() => null);
}

export function useAiCredits() {
  const [data, setData] = useState(cache);
  useEffect(() => {
    listeners.add(setData);
    refreshAiCredits();
    return () => listeners.delete(setData);
  }, []);
  return data;
}

export function joinPrice(data) {
  const c = data?.offer?.member_price_cents;
  return c ? `$${(c / 100).toFixed(2)}` : "$9.99";
}
