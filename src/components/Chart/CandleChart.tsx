import { useRef } from "react";
import type { Candle } from "../../types";
import type { ThemeName } from "../../theme";
import {
  sma,
  smaLast,
  ema,
  emaLast,
  maColor,
  emaColor,
  type IndicatorConfig,
} from "../../lib/indicators";
import { useChart } from "../../hooks/chart/useChart";
import { useCandleData } from "../../hooks/chart/useCandleData";
import { useMaLines } from "../../hooks/chart/useMaLines";
import { useBollingerBands } from "../../hooks/chart/useBollingerBands";
import { useVolumeMa } from "../../hooks/chart/useVolumeMa";
import { useRsiPane } from "../../hooks/chart/useRsiPane";
import { useCrosshair } from "../../hooks/chart/useCrosshair";
import { OhlcLegend } from "./OhlcLegend";

interface Props {
  candles: Candle[];
  update?: Candle | null;
  theme: ThemeName;
  indicators: IndicatorConfig;
}

export function CandleChart({ candles, update, theme, indicators }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const refs = useChart(containerRef, theme);
  useCandleData(refs, candles, update, theme, indicators.volume);
  useMaLines(refs, candles, update, {
    periods: indicators.ma,
    color: maColor,
    compute: sma,
    computeLast: smaLast,
  });
  useMaLines(refs, candles, update, {
    periods: indicators.ema,
    color: emaColor,
    compute: ema,
    computeLast: emaLast,
  });
  useBollingerBands(refs, candles, update, indicators.bollinger);
  useVolumeMa(refs, candles, update, indicators.volumeMa);
  useRsiPane(
    refs,
    candles,
    update,
    indicators.rsi,
    indicators.rsiPeriod,
    theme,
  );
  const hovered = useCrosshair(refs);

  // Hovered bar, else the live/forming candle, else the latest seeded candle.
  const legendCandle = hovered ?? update ?? candles[candles.length - 1] ?? null;

  return (
    <div className="candle-chart">
      <OhlcLegend candle={legendCandle} />
      <div ref={containerRef} className="candle-chart-canvas" />
    </div>
  );
}
