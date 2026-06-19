import { useEffect, useRef, type RefObject } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { chartThemes, type ThemeName } from "../../theme";
import {
  createChartOptions,
  themeChartOptions,
  candleColorOptions,
} from "../../lib/chartOptions";
import {
  VOLUME_PRICE_SCALE_ID,
  VOLUME_SCALE_MARGIN_TOP,
} from "../../lib/chartConstants";

export interface ChartRefs {
  chartRef: RefObject<IChartApi | null>;
  candleSeriesRef: RefObject<ISeriesApi<"Candlestick"> | null>;
  volumeSeriesRef: RefObject<ISeriesApi<"Histogram"> | null>;
}

/** Owns the chart instance, base candle + volume series, resize, and theming. */
export function useChart(
  containerRef: RefObject<HTMLDivElement | null>,
  theme: ThemeName,
): ChartRefs {
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(
      container,
      createChartOptions(container.clientWidth, container.clientHeight),
    );
    const candleSeries = chart.addSeries(CandlestickSeries);
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: VOLUME_PRICE_SCALE_ID,
    });
    chart.priceScale(VOLUME_PRICE_SCALE_ID).applyOptions({
      scaleMargins: { top: VOLUME_SCALE_MARGIN_TOP, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const resize = () =>
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [containerRef]);

  useEffect(() => {
    const chart = chartRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return;
    const t = chartThemes[theme];
    chart.applyOptions(themeChartOptions(t));
    candle.applyOptions(candleColorOptions(t));
  }, [theme]);

  return { chartRef, candleSeriesRef, volumeSeriesRef };
}
