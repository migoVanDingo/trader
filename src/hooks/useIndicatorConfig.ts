import { useShallow } from "zustand/react/shallow";
import { useStore } from "../state/store";
import type { IndicatorConfig } from "../lib/indicators";

/** Assemble the active IndicatorConfig from the store (shallow-stable). */
export function useIndicatorConfig(): IndicatorConfig {
  return useStore(
    useShallow(
      (s): IndicatorConfig => ({
        ma: s.ma,
        ema: s.ema,
        bollinger: s.showBollinger,
        rsi: s.showRSI,
        rsiPeriod: s.rsiPeriod,
        volume: s.showVolume,
        volumeMa: s.showVolumeMa,
        macd: s.showMACD,
      }),
    ),
  );
}
