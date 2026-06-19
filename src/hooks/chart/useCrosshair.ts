import { useEffect, useState } from "react";
import type {
  MouseEventParams,
  CandlestickData,
  HistogramData,
  UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import type { ChartRefs } from "./useChart";

export type HoveredCandle = Pick<
  Candle,
  "open" | "high" | "low" | "close" | "volume"
>;

/**
 * Tracks the candle under the crosshair. Returns `null` when the cursor isn't
 * over a bar, so callers can fall back to the latest/live candle.
 */
export function useCrosshair(refs: ChartRefs): HoveredCandle | null {
  const { chartRef, candleSeriesRef, volumeSeriesRef } = refs;
  const [hovered, setHovered] = useState<HoveredCandle | null>(null);

  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!chart || !candleSeries) return;

    const handler = (param: MouseEventParams) => {
      if (param.time === undefined) {
        setHovered(null);
        return;
      }
      const c = param.seriesData.get(candleSeries) as
        | CandlestickData<UTCTimestamp>
        | undefined;
      if (!c) {
        setHovered(null);
        return;
      }
      const volumeSeries = volumeSeriesRef.current;
      const v = volumeSeries
        ? (param.seriesData.get(volumeSeries) as
            | HistogramData<UTCTimestamp>
            | undefined)
        : undefined;
      setHovered({
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: v?.value ?? 0,
      });
    };

    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, [chartRef, candleSeriesRef, volumeSeriesRef]);

  return hovered;
}
