import { useEffect } from "react";
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";
import type { Candle } from "../../types";
import { chartThemes, type ThemeName } from "../../theme";
import { toVolumeData } from "../../lib/chartOptions";
import type { ChartRefs } from "./useChart";

/** Seeds candle/volume data, handles volume visibility, and applies live ticks. */
export function useCandleData(
  refs: ChartRefs,
  candles: Candle[],
  update: Candle | null | undefined,
  theme: ThemeName,
  showVolume: boolean,
) {
  const { chartRef, candleSeriesRef, volumeSeriesRef } = refs;

  // Seed candles on symbol/interval change.
  useEffect(() => {
    const candle = candleSeriesRef.current;
    const chart = chartRef.current;
    if (!candle || !chart) return;
    candle.setData(candles as CandlestickData<UTCTimestamp>[]);
    chart.timeScale().fitContent();
  }, [candles, candleSeriesRef, chartRef]);

  // Volume data (re-colored when the theme changes, since color is per-bar).
  useEffect(() => {
    const volume = volumeSeriesRef.current;
    if (!volume) return;
    volume.setData(toVolumeData(candles, chartThemes[theme]));
  }, [candles, theme, volumeSeriesRef]);

  // Volume visibility toggle.
  useEffect(() => {
    volumeSeriesRef.current?.applyOptions({ visible: showVolume });
  }, [showVolume, volumeSeriesRef]);

  // Live tick: forming candle + its volume bar.
  useEffect(() => {
    const candle = candleSeriesRef.current;
    const volume = volumeSeriesRef.current;
    if (!candle || !volume || !update) return;
    const t = chartThemes[theme];
    candle.update(update as CandlestickData<UTCTimestamp>);
    if (showVolume) {
      volume.update({
        time: update.time,
        value: update.volume,
        color: update.close >= update.open ? t.volumeUp : t.volumeDown,
      });
    }
  }, [update, theme, showVolume, candleSeriesRef, volumeSeriesRef]);
}
