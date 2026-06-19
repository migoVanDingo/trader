import type { UTCTimestamp } from "lightweight-charts";

/** A single OHLCV candle, with time in UNIX *seconds* (Lightweight Charts format). */
export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** A tradable market (from exchangeInfo), used by symbol search. */
export interface Market {
  symbol: string; // e.g. BTCUSDT
  base: string; // e.g. BTC
  tickSize: number; // price increment (for precision)
}

/** 24h rolling statistics for the price header. */
export interface Ticker24h {
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  quoteVolume: number;
}

/** Binance-native candle intervals (all live-streamable). */
export type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w" | "1M";
