import { useEffect, useRef } from "react";
import {
  LineSeries,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import { sma, smaLast, maColor, mergeCandle } from "../../lib/indicators";
import { maLineOptions } from "../../lib/chartOptions";
import { useLatestRef } from "../useLatestRef";
import type { ChartRefs } from "./useChart";

/** Reconciles MA overlay line series to the active period set; seeds + live tip. */
export function useMaSeries(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  periods: number[],
) {
  const { chartRef } = refs;
  const seriesRef = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  const candlesRef = useLatestRef(candles);

  // Add/remove series to match `periods`, then (re)seed their data.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const series = seriesRef.current;
    const want = new Set(periods);

    for (const [period, s] of series) {
      if (!want.has(period)) {
        chart.removeSeries(s);
        series.delete(period);
      }
    }
    for (const period of periods) {
      let s = series.get(period);
      if (!s) {
        s = chart.addSeries(LineSeries, maLineOptions(maColor(period)));
        series.set(period, s);
      }
      s.setData(sma(candles, period) as LineData<UTCTimestamp>[]);
    }
  }, [candles, periods, chartRef]);

  // Live tip per active MA — O(period) via smaLast, no full recompute.
  useEffect(() => {
    if (!update) return;
    const merged = mergeCandle(candlesRef.current, update);
    seriesRef.current.forEach((s, period) => {
      const value = smaLast(merged, period);
      if (value != null) {
        s.update({ time: update.time, value } as LineData<UTCTimestamp>);
      }
    });
  }, [update, candlesRef]);

  // On unmount, drop references (chart.remove() disposes the series themselves).
  useEffect(() => {
    const series = seriesRef.current;
    return () => series.clear();
  }, []);
}
