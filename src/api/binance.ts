import type { UTCTimestamp } from "lightweight-charts";
import type { Candle, Interval, Ticker24h } from "../types";

// Public Binance market-data endpoints — no API key required.
// Using the US endpoint since api.binance.com returns HTTP 451 (region block)
// from this location. Both expose identical /api/v3 shapes.
const BASE = "https://api.binance.us";

// Raw kline tuple shape from Binance:
// [ openTime, open, high, low, close, volume, closeTime, ... ]
type RawKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  ...unknown[],
];

/**
 * Fetch historical candles for a symbol/interval.
 * Times are converted from milliseconds (Binance) to seconds (Lightweight Charts).
 */
export async function fetchKlines(
  symbol: string,
  interval: Interval,
  limit = 500,
): Promise<Candle[]> {
  const url = `${BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance klines ${res.status}: ${await res.text()}`);
  }
  const raw = (await res.json()) as RawKline[];
  return raw.map((k) => ({
    time: (k[0] / 1000) as UTCTimestamp,
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

/** A compact quote used by the watchlist. */
export interface SymbolQuote {
  lastPrice: number;
  changePercent: number;
}

/**
 * Fetch 24h quotes for many symbols in a single request (watchlist seed).
 * Returns a map keyed by symbol.
 */
export async function fetchTickers(
  symbols: string[],
): Promise<Record<string, SymbolQuote>> {
  const param = encodeURIComponent(JSON.stringify(symbols));
  const url = `${BASE}/api/v3/ticker/24hr?symbols=${param}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance batch 24hr ${res.status}: ${await res.text()}`);
  }
  const arr = (await res.json()) as Record<string, string>[];
  const out: Record<string, SymbolQuote> = {};
  for (const d of arr) {
    out[d.symbol] = {
      lastPrice: parseFloat(d.lastPrice),
      changePercent: parseFloat(d.priceChangePercent),
    };
  }
  return out;
}

/** Fetch 24h rolling stats for the price header. */
export async function fetchTicker24h(symbol: string): Promise<Ticker24h> {
  const url = `${BASE}/api/v3/ticker/24hr?symbol=${symbol}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance 24hr ${res.status}: ${await res.text()}`);
  }
  const d = (await res.json()) as Record<string, string>;
  return {
    lastPrice: parseFloat(d.lastPrice),
    priceChangePercent: parseFloat(d.priceChangePercent),
    highPrice: parseFloat(d.highPrice),
    lowPrice: parseFloat(d.lowPrice),
    quoteVolume: parseFloat(d.quoteVolume),
  };
}
