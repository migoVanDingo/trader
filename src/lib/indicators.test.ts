import { describe, it, expect } from "vitest";
import type { UTCTimestamp } from "lightweight-charts";
import type { Candle } from "../types";
import {
  sma,
  ema,
  rsi,
  mergeCandle,
  smaLast,
  rsiState,
  rsiAdvance,
  bollinger,
  volumeSma,
  volumeSmaLast,
} from "./indicators";

/** Build candles from a list of closes (OHLC flattened to the close). */
function candles(closes: number[]): Candle[] {
  return closes.map((c, i) => ({
    time: (i * 60) as UTCTimestamp,
    open: c,
    high: c,
    low: c,
    close: c,
    volume: 1,
  }));
}

/** Build candles from a list of volumes (close fixed). */
function candlesWithVolume(vols: number[]): Candle[] {
  return vols.map((v, i) => ({
    time: (i * 60) as UTCTimestamp,
    open: 1,
    high: 1,
    low: 1,
    close: 1,
    volume: v,
  }));
}

describe("sma", () => {
  it("returns empty when not enough data", () => {
    expect(sma([], 3)).toEqual([]);
    expect(sma(candles([1, 2]), 3)).toEqual([]);
  });

  it("emits points only once warmed up", () => {
    const out = sma(candles([1, 2, 3, 4, 5]), 3);
    expect(out.map((p) => p.value)).toEqual([2, 3, 4]);
    // First point aligns with the 3rd candle (index 2 → time 120).
    expect(out[0].time).toBe(120);
  });

  it("is flat for constant input", () => {
    const out = sma(candles([7, 7, 7, 7]), 2);
    expect(out.every((p) => p.value === 7)).toBe(true);
  });
});

describe("ema", () => {
  it("seeds with the SMA then applies the smoothing factor", () => {
    // closes [2,4,6,8], period 2: seed=(2+4)/2=3, k=2/3
    const out = ema(candles([2, 4, 6, 8]), 2);
    expect(out).toHaveLength(3);
    expect(out[0].value).toBeCloseTo(3, 6);
    expect(out[1].value).toBeCloseTo(5, 6);
    expect(out[2].value).toBeCloseTo(7, 6);
  });

  it("returns empty when not enough data", () => {
    expect(ema(candles([1]), 5)).toEqual([]);
  });
});

describe("rsi", () => {
  it("returns empty when length <= period", () => {
    expect(rsi(candles([1, 2, 3]), 14)).toEqual([]);
  });

  it("is 100 for a monotonically rising series", () => {
    const closes = Array.from({ length: 20 }, (_, i) => i + 1);
    const out = rsi(candles(closes), 14);
    expect(out).toHaveLength(20 - 14);
    expect(out.every((p) => p.value === 100)).toBe(true);
  });

  it("is 0 for a monotonically falling series", () => {
    const closes = Array.from({ length: 20 }, (_, i) => 20 - i);
    const out = rsi(candles(closes), 14);
    expect(out.every((p) => p.value === 0)).toBe(true);
  });
});

describe("smaLast", () => {
  it("matches the final value of the full sma()", () => {
    const closes = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    const c = candles(closes);
    for (const period of [2, 3, 5]) {
      const full = sma(c, period);
      expect(smaLast(c, period)).toBeCloseTo(full[full.length - 1].value, 10);
    }
  });

  it("returns null when not enough data", () => {
    expect(smaLast(candles([1, 2]), 3)).toBeNull();
  });
});

describe("rsiState / rsiAdvance (incremental parity)", () => {
  const closes = [
    44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08,
    45.89, 46.03, 45.61, 46.28, 46.28, 46.0, 46.03, 46.41, 46.22, 45.64,
  ];
  const c = candles(closes);
  const period = 14;

  it("rsiAdvance from committed state reproduces the full rsi() tip", () => {
    const full = rsi(c, period);
    const expectedLast = full[full.length - 1].value;

    // Committed state up to the penultimate candle, then advance by the last.
    const committed = rsiState(c.slice(0, -1), period);
    expect(committed).not.toBeNull();
    const { value } = rsiAdvance(committed!, c[c.length - 1].close, period);
    expect(value).toBeCloseTo(expectedLast, 8);
  });

  it("stepping candle-by-candle matches the full series", () => {
    const full = rsi(c, period);
    // Seed committed state at the first emitted RSI point (index `period`).
    let state = rsiState(c.slice(0, period + 1), period)!;
    // full[0] corresponds to candle index `period`; full[1] to period+1, etc.
    for (let i = period + 1; i < c.length; i++) {
      const { value, state: next } = rsiAdvance(state, c[i].close, period);
      expect(value).toBeCloseTo(full[i - period].value, 8);
      state = next;
    }
  });
});

describe("mergeCandle", () => {
  const base = candles([1, 2, 3]); // times 0, 60, 120

  it("appends when the live candle is newer", () => {
    const live: Candle = { ...base[0], time: 180 as UTCTimestamp, close: 9 };
    const out = mergeCandle(base, live);
    expect(out).toHaveLength(4);
    expect(out[3].close).toBe(9);
  });

  it("replaces the forming candle when times match", () => {
    const live: Candle = { ...base[2], close: 99 };
    const out = mergeCandle(base, live);
    expect(out).toHaveLength(3);
    expect(out[2].close).toBe(99);
    expect(out).not.toBe(base); // immutable
    expect(base[2].close).toBe(3); // original untouched
  });

  it("ignores stale (older) live candles", () => {
    const live: Candle = { ...base[0], time: -60 as UTCTimestamp };
    expect(mergeCandle(base, live)).toBe(base);
  });

  it("handles an empty seed", () => {
    const live = candles([5])[0];
    expect(mergeCandle([], live)).toEqual([live]);
  });
});

describe("bollinger", () => {
  it("returns empty when not enough data", () => {
    expect(bollinger(candles([1, 2]), 3)).toEqual({
      middle: [],
      upper: [],
      lower: [],
    });
  });

  it("computes mean ± k·σ per window", () => {
    const b = bollinger(candles([2, 4, 6, 8]), 2, 2);
    expect(b.middle.map((p) => p.value)).toEqual([3, 5, 7]);
    expect(b.upper.map((p) => p.value)).toEqual([5, 7, 9]);
    expect(b.lower.map((p) => p.value)).toEqual([1, 3, 5]);
  });

  it("collapses to the mean for constant input", () => {
    const b = bollinger(candles([5, 5, 5, 5]), 2, 2);
    expect(b.upper).toEqual(b.middle);
    expect(b.lower).toEqual(b.middle);
  });
});

describe("volumeSma", () => {
  it("averages volume over the window", () => {
    const out = volumeSma(candlesWithVolume([2, 4, 6, 8]), 2);
    expect(out.map((p) => p.value)).toEqual([3, 5, 7]);
  });

  it("volumeSmaLast matches the final volumeSma value", () => {
    const c = candlesWithVolume([1, 3, 5, 7, 9]);
    const full = volumeSma(c, 3);
    expect(volumeSmaLast(c, 3)).toBeCloseTo(full[full.length - 1].value, 10);
  });
});
