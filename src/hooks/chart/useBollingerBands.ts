import { useEffect, useRef } from "react";
import {
  LineSeries,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import { bollinger, mergeCandle } from "../../lib/indicators";
import { bandLineOptions } from "../../lib/chartOptions";
import { useLatestRef } from "../useLatestRef";
import type { ChartRefs } from "./useChart";

// Distinct hues so the three bands are easy to tell apart.
const BAND_UPPER = "#ec407a"; // pink
const BAND_MIDDLE = "#5c6bc0"; // indigo
const BAND_LOWER = "#26c6da"; // cyan

type BandSeries = {
  middle: ISeriesApi<"Line">;
  upper: ISeriesApi<"Line">;
  lower: ISeriesApi<"Line">;
};

/** Bollinger Bands overlay (SMA ± k·σ): three lines on the price pane. */
export function useBollingerBands(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  enabled: boolean,
  period = 20,
  k = 2,
) {
  const { chartRef } = refs;
  const seriesRef = useRef<BandSeries | null>(null);
  const candlesRef = useLatestRef(candles);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!enabled) {
      if (seriesRef.current) {
        chart.removeSeries(seriesRef.current.middle);
        chart.removeSeries(seriesRef.current.upper);
        chart.removeSeries(seriesRef.current.lower);
        seriesRef.current = null;
      }
      return;
    }
    if (!seriesRef.current) {
      seriesRef.current = {
        middle: chart.addSeries(
          LineSeries,
          bandLineOptions(BAND_MIDDLE, false),
        ),
        upper: chart.addSeries(LineSeries, bandLineOptions(BAND_UPPER, true)),
        lower: chart.addSeries(LineSeries, bandLineOptions(BAND_LOWER, true)),
      };
    }
    const b = bollinger(candles, period, k);
    seriesRef.current.middle.setData(b.middle as LineData<UTCTimestamp>[]);
    seriesRef.current.upper.setData(b.upper as LineData<UTCTimestamp>[]);
    seriesRef.current.lower.setData(b.lower as LineData<UTCTimestamp>[]);
  }, [candles, enabled, period, k, chartRef]);

  useEffect(() => {
    if (!update || !seriesRef.current) return;
    const merged = mergeCandle(candlesRef.current, update);
    const b = bollinger(merged, period, k);
    const m = b.middle[b.middle.length - 1];
    const u = b.upper[b.upper.length - 1];
    const l = b.lower[b.lower.length - 1];
    if (m) seriesRef.current.middle.update(m as LineData<UTCTimestamp>);
    if (u) seriesRef.current.upper.update(u as LineData<UTCTimestamp>);
    if (l) seriesRef.current.lower.update(l as LineData<UTCTimestamp>);
  }, [update, period, k, candlesRef]);

  useEffect(() => {
    return () => {
      seriesRef.current = null;
    };
  }, []);
}
