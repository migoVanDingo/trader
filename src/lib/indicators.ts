import type { UTCTimestamp } from "lightweight-charts";
import type { Candle } from "../types";

export interface LinePoint {
  time: UTCTimestamp;
  value: number;
}

/** Which indicators are active, driven by the store + IndicatorMenu. */
export interface IndicatorConfig {
  ma: number[]; // active SMA periods
  ema: number[]; // active EMA periods
  bollinger: boolean;
  volume: boolean;
  volumeMa: boolean;
  rsi: boolean;
  rsiPeriod: number;
  macd: boolean;
}

/** MA periods offered in the menu, with stable (theme-independent) colors. */
export const MA_PERIODS = [20, 50, 100, 200];
export const EMA_PERIODS = [9, 21, 50];

const MA_COLORS: Record<number, string> = {
  20: "#f0b90b",
  50: "#2962ff",
  100: "#e040fb",
  200: "#00bcd4",
};

const EMA_COLORS: Record<number, string> = {
  9: "#ff9800",
  21: "#ab47bc",
  50: "#26c6da",
};

export function maColor(period: number): string {
  return MA_COLORS[period] ?? "#888888";
}

export function emaColor(period: number): string {
  return EMA_COLORS[period] ?? "#888888";
}

/** Last value of an array of points, or null. */
function last(points: LinePoint[]): number | null {
  return points.length ? points[points.length - 1].value : null;
}

/** Final EMA value (O(n) but no array kept) — for live ticks. */
export function emaLast(candles: Candle[], period: number): number | null {
  return last(ema(candles, period));
}

/** Bollinger Bands: SMA(period) ± k·σ over closes. */
export interface Bands {
  middle: LinePoint[];
  upper: LinePoint[];
  lower: LinePoint[];
}

export function bollinger(candles: Candle[], period = 20, k = 2): Bands {
  const middle: LinePoint[] = [];
  const upper: LinePoint[] = [];
  const lower: LinePoint[] = [];
  if (candles.length < period) return { middle, upper, lower };
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    const mean = sum / period;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = candles[j].close - mean;
      variance += d * d;
    }
    const sd = Math.sqrt(variance / period);
    const time = candles[i].time;
    middle.push({ time, value: mean });
    upper.push({ time, value: mean + k * sd });
    lower.push({ time, value: mean - k * sd });
  }
  return { middle, upper, lower };
}

/** SMA over volume (for the volume MA line). */
export function volumeSma(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) return [];
  const out: LinePoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].volume;
    if (i >= period) sum -= candles[i - period].volume;
    if (i >= period - 1)
      out.push({ time: candles[i].time, value: sum / period });
  }
  return out;
}

export function volumeSmaLast(
  candles: Candle[],
  period: number,
): number | null {
  const n = candles.length;
  if (period <= 0 || n < period) return null;
  let sum = 0;
  for (let i = n - period; i < n; i++) sum += candles[i].volume;
  return sum / period;
}

/** Simple moving average of closes; emits points once warmed up (i >= period-1). */
export function sma(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) return [];
  const out: LinePoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) {
      out.push({ time: candles[i].time, value: sum / period });
    }
  }
  return out;
}

/** Exponential moving average (available for future use). */
export function ema(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) return [];
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += candles[i].close;
  prev /= period;
  const out: LinePoint[] = [{ time: candles[period - 1].time, value: prev }];
  for (let i = period; i < candles.length; i++) {
    prev = candles[i].close * k + prev * (1 - k);
    out.push({ time: candles[i].time, value: prev });
  }
  return out;
}

/** EMA over an arbitrary point series (used for the MACD signal line). */
function emaOverPoints(points: LinePoint[], period: number): LinePoint[] {
  if (period <= 0 || points.length < period) return [];
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += points[i].value;
  prev /= period;
  const out: LinePoint[] = [{ time: points[period - 1].time, value: prev }];
  for (let i = period; i < points.length; i++) {
    prev = points[i].value * k + prev * (1 - k);
    out.push({ time: points[i].time, value: prev });
  }
  return out;
}

export interface MacdResult {
  macd: LinePoint[];
  signal: LinePoint[];
  histogram: LinePoint[];
}

/**
 * MACD: EMA(fast) − EMA(slow); signal = EMA(signalPeriod) of the MACD line;
 * histogram = MACD − signal. Series are aligned by time.
 */
export function macd(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdResult {
  const closes: LinePoint[] = candles.map((c) => ({
    time: c.time,
    value: c.close,
  }));
  const emaFast = emaOverPoints(closes, fast);
  const emaSlow = emaOverPoints(closes, slow);
  const slowMap = new Map(emaSlow.map((p) => [p.time, p.value]));

  const macdLine: LinePoint[] = [];
  for (const p of emaFast) {
    const s = slowMap.get(p.time);
    if (s !== undefined) macdLine.push({ time: p.time, value: p.value - s });
  }
  const signal = emaOverPoints(macdLine, signalPeriod);
  const sigMap = new Map(signal.map((p) => [p.time, p.value]));

  const histogram: LinePoint[] = [];
  for (const p of macdLine) {
    const sg = sigMap.get(p.time);
    if (sg !== undefined) histogram.push({ time: p.time, value: p.value - sg });
  }
  return { macd: macdLine, signal, histogram };
}

/**
 * SMA of just the last `period` closes — O(period), no array allocation.
 * Equivalent to the final value of `sma(candles, period)`. Used for live ticks.
 */
export function smaLast(candles: Candle[], period: number): number | null {
  const n = candles.length;
  if (period <= 0 || n < period) return null;
  let sum = 0;
  for (let i = n - period; i < n; i++) sum += candles[i].close;
  return sum / period;
}

/** Carried Wilder RSI averages, so live ticks are O(1) instead of O(n). */
export interface RsiState {
  avgGain: number;
  avgLoss: number;
  prevClose: number;
}

/** Committed Wilder state after the final candle of a (closed) series. */
export function rsiState(candles: Candle[], period = 14): RsiState | null {
  if (candles.length <= period) return null;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = candles[i].close - candles[i - 1].close;
    if (ch >= 0) avgGain += ch;
    else avgLoss -= ch;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period + 1; i < candles.length; i++) {
    const ch = candles[i].close - candles[i - 1].close;
    avgGain = (avgGain * (period - 1) + (ch > 0 ? ch : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (ch < 0 ? -ch : 0)) / period;
  }
  return { avgGain, avgLoss, prevClose: candles[candles.length - 1].close };
}

/** One Wilder step from a committed state to `close`; returns value + next state. */
export function rsiAdvance(
  state: RsiState,
  close: number,
  period = 14,
): { value: number; state: RsiState } {
  const ch = close - state.prevClose;
  const avgGain = (state.avgGain * (period - 1) + (ch > 0 ? ch : 0)) / period;
  const avgLoss = (state.avgLoss * (period - 1) + (ch < 0 ? -ch : 0)) / period;
  const value = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  return { value, state: { avgGain, avgLoss, prevClose: close } };
}

/** Wilder's RSI over closes (0–100). */
export function rsi(candles: Candle[], period = 14): LinePoint[] {
  if (candles.length <= period) return [];
  const rsiVal = (g: number, l: number) =>
    l === 0 ? 100 : 100 - 100 / (1 + g / l);

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const ch = candles[i].close - candles[i - 1].close;
    if (ch >= 0) avgGain += ch;
    else avgLoss -= ch;
  }
  avgGain /= period;
  avgLoss /= period;

  const out: LinePoint[] = [
    { time: candles[period].time, value: rsiVal(avgGain, avgLoss) },
  ];
  for (let i = period + 1; i < candles.length; i++) {
    const ch = candles[i].close - candles[i - 1].close;
    const gain = ch >= 0 ? ch : 0;
    const loss = ch < 0 ? -ch : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out.push({ time: candles[i].time, value: rsiVal(avgGain, avgLoss) });
  }
  return out;
}

/** Apply a live candle onto the seed array (replace the forming bar or append). */
export function mergeCandle(candles: Candle[], live: Candle): Candle[] {
  if (candles.length === 0) return [live];
  const last = candles[candles.length - 1];
  if (live.time === last.time) {
    const copy = candles.slice();
    copy[copy.length - 1] = live;
    return copy;
  }
  if (live.time > last.time) return [...candles, live];
  return candles;
}
