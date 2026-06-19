import { useEffect, useRef } from "react";
import {
  LineSeries,
  LineStyle,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Candle } from "../../types";
import { chartThemes, type ThemeName } from "../../theme";
import { rsi, rsiState, rsiAdvance, type RsiState } from "../../lib/indicators";
import { rsiLineOptions } from "../../lib/chartOptions";
import {
  RSI_COLOR,
  RSI_PANE_INDEX,
  RSI_LEVELS,
  PRICE_PANE_STRETCH,
  RSI_PANE_STRETCH,
} from "../../lib/chartConstants";
import { useLatestRef } from "../useLatestRef";
import type { ChartRefs } from "./useChart";

interface Forming {
  time: UTCTimestamp;
  close: number;
}

/** Manages the RSI line in its own pane: create/destroy, reference lines, live tip. */
export function useRsiPane(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  enabled: boolean,
  period: number,
  theme: ThemeName,
) {
  const { chartRef } = refs;
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const periodRef = useLatestRef(period);
  // Carried Wilder state up to the last *closed* candle, plus the forming bar.
  const committedRef = useRef<RsiState | null>(null);
  const formingRef = useRef<Forming | null>(null);

  // Create/destroy the pane and (re)seed. Recreated on theme change so the
  // reference lines pick up the new colors.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    if (!enabled) return;

    const t = chartThemes[theme];
    const series = chart.addSeries(
      LineSeries,
      rsiLineOptions(RSI_COLOR),
      RSI_PANE_INDEX,
    );
    for (const level of RSI_LEVELS) {
      series.createPriceLine({
        price: level,
        color: t.borderColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: String(level),
      });
    }
    series.setData(rsi(candles, period) as LineData<UTCTimestamp>[]);
    seriesRef.current = series;

    // Seed incremental state: committed = up to the penultimate candle; the
    // last candle is treated as the forming bar.
    committedRef.current = rsiState(candles.slice(0, -1), period);
    const last = candles[candles.length - 1];
    formingRef.current = last ? { time: last.time, close: last.close } : null;

    const panes = chart.panes();
    if (panes.length > 1) {
      panes[0].setStretchFactor(PRICE_PANE_STRETCH);
      panes[1].setStretchFactor(RSI_PANE_STRETCH);
    }
  }, [candles, enabled, period, theme, chartRef]);

  // Live tip — O(1) Wilder step, committing the forming bar when a new one opens.
  useEffect(() => {
    const series = seriesRef.current;
    if (!update || !series) return;
    let committed = committedRef.current;
    const forming = formingRef.current;
    if (!committed || !forming) return;

    if (update.time > forming.time) {
      // Previous bar closed at its last close — fold it into committed state.
      committed = rsiAdvance(committed, forming.close, periodRef.current).state;
      committedRef.current = committed;
      formingRef.current = { time: update.time, close: update.close };
    } else if (update.time === forming.time) {
      formingRef.current = { time: forming.time, close: update.close };
    } else {
      return; // stale frame
    }

    const { value } = rsiAdvance(committed, update.close, periodRef.current);
    series.update({ time: update.time, value } as LineData<UTCTimestamp>);
  }, [update, periodRef]);

  // On unmount, drop the reference (chart.remove() disposes the series).
  useEffect(
    () => () => {
      seriesRef.current = null;
    },
    [],
  );
}
