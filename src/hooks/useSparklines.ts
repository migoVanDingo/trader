import { useEffect, useState } from "react";
import { fetchKlines } from "../api/binance";

// Session cache of 24h close series per symbol (sparklines change slowly).
const cache = new Map<string, number[]>();

const SPARK_INTERVAL = "1h" as const;
const SPARK_BARS = 24;

/** ~24h close series per symbol for watchlist sparklines (fetched once, cached). */
export function useSparklines(symbols: string[]): Record<string, number[]> {
  const [data, setData] = useState<Record<string, number[]>>({});
  const key = symbols.join(",");

  useEffect(() => {
    let cancelled = false;

    // Paint anything already cached immediately.
    const seeded: Record<string, number[]> = {};
    for (const s of symbols) {
      const c = cache.get(s);
      if (c) seeded[s] = c;
    }
    if (Object.keys(seeded).length) {
      setData((prev) => ({ ...prev, ...seeded }));
    }

    const missing = symbols.filter((s) => !cache.has(s));
    Promise.all(
      missing.map((s) =>
        fetchKlines(s, SPARK_INTERVAL, SPARK_BARS)
          .then((candles) => {
            const closes = candles.map((c) => c.close);
            cache.set(s, closes);
            return [s, closes] as const;
          })
          .catch(() => null),
      ),
    ).then((results) => {
      if (cancelled) return;
      const updates: Record<string, number[]> = {};
      for (const r of results) if (r) updates[r[0]] = r[1];
      if (Object.keys(updates).length) {
        setData((prev) => ({ ...prev, ...updates }));
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return data;
}
