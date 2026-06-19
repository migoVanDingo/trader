// Pure builders for lightweight-charts option objects, derived from a ChartTheme.
// No chart instance here — these just produce plain config the hooks apply.
import {
  CrosshairMode,
  type DeepPartial,
  type ChartOptions,
  type CandlestickSeriesPartialOptions,
  type LineSeriesPartialOptions,
  type HistogramData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { ChartTheme } from "../theme";
import type { Candle } from "../types";

export function createChartOptions(
  width: number,
  height: number,
): DeepPartial<ChartOptions> {
  return {
    width,
    height,
    crosshair: { mode: CrosshairMode.Normal },
    timeScale: { timeVisible: true, secondsVisible: false },
  };
}

export function themeChartOptions(t: ChartTheme): DeepPartial<ChartOptions> {
  return {
    layout: { background: { color: t.background }, textColor: t.textColor },
    grid: {
      vertLines: { color: t.gridColor },
      horzLines: { color: t.gridColor },
    },
    timeScale: { borderColor: t.borderColor },
    rightPriceScale: { borderColor: t.borderColor },
  };
}

export function candleColorOptions(
  t: ChartTheme,
): CandlestickSeriesPartialOptions {
  return {
    upColor: t.upColor,
    downColor: t.downColor,
    borderUpColor: t.upColor,
    borderDownColor: t.downColor,
    wickUpColor: t.upColor,
    wickDownColor: t.downColor,
  };
}

export function maLineOptions(color: string): LineSeriesPartialOptions {
  return {
    color,
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: false,
    crosshairMarkerVisible: false,
  };
}

export function rsiLineOptions(color: string): LineSeriesPartialOptions {
  return {
    color,
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: false,
  };
}

export function toVolumeData(
  candles: Candle[],
  t: ChartTheme,
): HistogramData<UTCTimestamp>[] {
  return candles.map((c) => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? t.volumeUp : t.volumeDown,
  }));
}
