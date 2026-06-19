import { useRef } from "react";
import type { Candle } from "../../types";
import type { ThemeName } from "../../theme";
import type { IndicatorConfig } from "../../lib/indicators";
import { useChart } from "../../hooks/chart/useChart";
import { useCandleData } from "../../hooks/chart/useCandleData";
import { useMaSeries } from "../../hooks/chart/useMaSeries";
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
  useMaSeries(refs, candles, update, indicators.ma);
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
