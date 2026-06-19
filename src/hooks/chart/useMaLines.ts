import { useEffect, useRef } from "react";
import {
  LineSeries,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import { mergeCandle, type LinePoint } from "../../lib/indicators";
import { maLineOptions } from "../../lib/chartOptions";
import { useLatestRef } from "../useLatestRef";
import type { ChartRefs } from "./useChart";

export interface MaLineSpec {
  periods: number[];
  color: (period: number) => string;
  compute: (candles: Candle[], period: number) => LinePoint[];
  computeLast: (merged: Candle[], period: number) => number | null;
}

/**
 * Reconciles a set of moving-average overlay lines to `spec.periods`, seeds each,
 * and pushes the live tip. Generic over the average kind (SMA, EMA, …) via spec.
 */
export function useMaLines(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  spec: MaLineSpec,
) {
  const { chartRef } = refs;
  const { periods, color, compute, computeLast } = spec;
  const seriesRef = useRef<Map<number, ISeriesApi<"Line">>>(new Map());
  const candlesRef = useLatestRef(candles);

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
        s = chart.addSeries(LineSeries, maLineOptions(color(period)));
        series.set(period, s);
      }
      s.setData(compute(candles, period) as LineData<UTCTimestamp>[]);
    }
  }, [candles, periods, chartRef, color, compute]);

  useEffect(() => {
    if (!update) return;
    const merged = mergeCandle(candlesRef.current, update);
    seriesRef.current.forEach((s, period) => {
      const value = computeLast(merged, period);
      if (value != null) {
        s.update({ time: update.time, value } as LineData<UTCTimestamp>);
      }
    });
  }, [update, candlesRef, computeLast]);

  useEffect(() => {
    const series = seriesRef.current;
    return () => series.clear();
  }, []);
}
