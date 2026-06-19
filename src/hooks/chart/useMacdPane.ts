import { useEffect, useRef } from "react";
import {
  LineSeries,
  HistogramSeries,
  type ISeriesApi,
  type LineData,
  type HistogramData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import { chartThemes, type ThemeName } from "../../theme";
import { macd, mergeCandle, type LinePoint } from "../../lib/indicators";
import {
  MACD_LINE_COLOR,
  MACD_SIGNAL_COLOR,
  PRICE_PANE_STRETCH,
  MACD_PANE_STRETCH,
} from "../../lib/chartConstants";
import { rsiLineOptions } from "../../lib/chartOptions";
import { useLatestRef } from "../useLatestRef";
import type { ChartRefs } from "./useChart";

type MacdSeries = {
  hist: ISeriesApi<"Histogram">;
  macd: ISeriesApi<"Line">;
  signal: ISeriesApi<"Line">;
};

function histData(
  points: LinePoint[],
  up: string,
  down: string,
): HistogramData<UTCTimestamp>[] {
  return points.map((p) => ({
    time: p.time,
    value: p.value,
    color: p.value >= 0 ? up : down,
  }));
}

/**
 * MACD in its own pane below the price (and below RSI when that's also on).
 * Pane index is dynamic so there's never an empty pane: RSI takes pane 1, so
 * MACD takes pane 2 when RSI is on, else pane 1.
 */
export function useMacdPane(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  enabled: boolean,
  rsiEnabled: boolean,
  theme: ThemeName,
) {
  const { chartRef } = refs;
  const seriesRef = useRef<MacdSeries | null>(null);
  const candlesRef = useLatestRef(candles);
  const paneIndex = rsiEnabled ? 2 : 1;

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current.hist);
      chart.removeSeries(seriesRef.current.macd);
      chart.removeSeries(seriesRef.current.signal);
      seriesRef.current = null;
    }
    if (!enabled) return;

    const t = chartThemes[theme];
    const hist = chart.addSeries(
      HistogramSeries,
      { priceLineVisible: false, lastValueVisible: false },
      paneIndex,
    );
    const macdLine = chart.addSeries(
      LineSeries,
      rsiLineOptions(MACD_LINE_COLOR),
      paneIndex,
    );
    const signalLine = chart.addSeries(
      LineSeries,
      rsiLineOptions(MACD_SIGNAL_COLOR),
      paneIndex,
    );

    const r = macd(candles);
    hist.setData(histData(r.histogram, t.volumeUp, t.volumeDown));
    macdLine.setData(r.macd as LineData<UTCTimestamp>[]);
    signalLine.setData(r.signal as LineData<UTCTimestamp>[]);
    seriesRef.current = { hist, macd: macdLine, signal: signalLine };

    const panes = chart.panes();
    if (panes.length > paneIndex) {
      panes[0].setStretchFactor(PRICE_PANE_STRETCH);
      panes[paneIndex].setStretchFactor(MACD_PANE_STRETCH);
    }
  }, [candles, enabled, paneIndex, theme, chartRef]);

  useEffect(() => {
    if (!update || !seriesRef.current) return;
    const t = chartThemes[theme];
    const merged = mergeCandle(candlesRef.current, update);
    const r = macd(merged);
    const h = r.histogram[r.histogram.length - 1];
    const m = r.macd[r.macd.length - 1];
    const sig = r.signal[r.signal.length - 1];
    if (h) {
      seriesRef.current.hist.update({
        time: h.time,
        value: h.value,
        color: h.value >= 0 ? t.volumeUp : t.volumeDown,
      });
    }
    if (m) seriesRef.current.macd.update(m as LineData<UTCTimestamp>);
    if (sig) seriesRef.current.signal.update(sig as LineData<UTCTimestamp>);
  }, [update, theme, candlesRef]);

  useEffect(() => {
    return () => {
      seriesRef.current = null;
    };
  }, []);
}
