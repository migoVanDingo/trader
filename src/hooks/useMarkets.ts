import { useEffect, useState } from "react";
import { fetchExchangeInfo } from "../api/binance";
import type { Market } from "../types";

// Module-level cache — exchangeInfo is large and rarely changes, so fetch once
// and share the promise across all consumers for the session.
let cache: Promise<Market[]> | null = null;

/** All tradable USDT markets (for symbol search). Loaded once and cached. */
export function useMarkets(): Market[] {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!cache) cache = fetchExchangeInfo();
    cache
      .then((m) => {
        if (!cancelled) setMarkets(m);
      })
      .catch(() => {
        cache = null; // allow a retry on next mount
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return markets;
}
