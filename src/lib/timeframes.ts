import type { Interval } from "../types";

// A timeframe is one selectable button. Each maps to a Binance candle
// `interval` plus how many candles to load (`limit`).
//
// Binance only offers candle intervals up to 1M (monthly) — there is no native
// "year" or "all-time" candle. So the short buttons (1m–1W) pick a candle size
// directly, while the longer ranges (1Y, All) pick a sensible granularity and a
// wider window. Live updates stream on each timeframe's underlying `interval`.
export interface Timeframe {
  id: string;
  label: string;
  interval: Interval;
  limit: number;
  group: "interval" | "range";
}

export const TIMEFRAMES: Timeframe[] = [
  { id: "1m", label: "1m", interval: "1m", limit: 500, group: "interval" },
  { id: "5m", label: "5m", interval: "5m", limit: 500, group: "interval" },
  { id: "15m", label: "15m", interval: "15m", limit: 500, group: "interval" },
  { id: "1h", label: "1H", interval: "1h", limit: 500, group: "interval" },
  { id: "4h", label: "4H", interval: "4h", limit: 500, group: "interval" },
  { id: "1d", label: "1D", interval: "1d", limit: 500, group: "interval" },
  { id: "1w", label: "1W", interval: "1w", limit: 500, group: "interval" },
  // Ranges:
  { id: "1M", label: "1M", interval: "1M", limit: 240, group: "range" }, // monthly candles (~20y)
  { id: "1Y", label: "1Y", interval: "1d", limit: 365, group: "range" }, // 1 year of daily candles
  { id: "ALL", label: "All", interval: "1w", limit: 1000, group: "range" }, // full history, weekly
];

export const DEFAULT_TIMEFRAME_ID = "1h";

export function getTimeframe(id: string): Timeframe {
  return (
    TIMEFRAMES.find((t) => t.id === id) ??
    TIMEFRAMES.find((t) => t.id === DEFAULT_TIMEFRAME_ID)!
  );
}
