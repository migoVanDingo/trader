import { useEffect, useRef } from "react";
import {
  LineSeries,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import { volumeSma, volumeSmaLast, mergeCandle } from "../../lib/indicators";
import { volumeMaLineOptions } from "../../lib/chartOptions";
import { useLatestRef } from "../useLatestRef";
import type { ChartRefs } from "./useChart";

const VOLUME_MA_COLOR = "#facc15";

/** Moving average over volume, drawn on the overlaid volume price scale. */
export function useVolumeMa(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  enabled: boolean,
  period = 20,
) {
  const { chartRef } = refs;
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const candlesRef = useLatestRef(candles);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (!enabled) {
      if (seriesRef.current) {
        chart.removeSeries(seriesRef.current);
        seriesRef.current = null;
      }
      return;
    }
    if (!seriesRef.current) {
      seriesRef.current = chart.addSeries(
        LineSeries,
        volumeMaLineOptions(VOLUME_MA_COLOR),
      );
    }
    seriesRef.current.setData(
      volumeSma(candles, period) as LineData<UTCTimestamp>[],
    );
  }, [candles, enabled, period, chartRef]);

  useEffect(() => {
    if (!update || !seriesRef.current) return;
    const merged = mergeCandle(candlesRef.current, update);
    const v = volumeSmaLast(merged, period);
    if (v != null) {
      seriesRef.current.update({
        time: update.time,
        value: v,
      } as LineData<UTCTimestamp>);
    }
  }, [update, period, candlesRef]);

  useEffect(() => {
    return () => {
      seriesRef.current = null;
    };
  }, []);
}
