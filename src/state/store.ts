import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeName } from "../theme";
import { DEFAULT_TIMEFRAME_ID } from "../lib/timeframes";

/** Theme for the very first visit (before anything is persisted). */
function defaultTheme(): ThemeName {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

interface AppState {
  symbol: string;
  timeframeId: string;
  theme: ThemeName;
  // Indicators:
  ma: number[]; // active SMA periods
  showRSI: boolean;
  rsiPeriod: number;
  showVolume: boolean;
  setSymbol: (symbol: string) => void;
  setTimeframe: (id: string) => void;
  toggleTheme: () => void;
  toggleMA: (period: number) => void;
  toggleRSI: () => void;
  toggleVolume: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      symbol: "BTCUSDT",
      timeframeId: DEFAULT_TIMEFRAME_ID,
      theme: defaultTheme(),
      ma: [20, 50],
      showRSI: false,
      rsiPeriod: 14,
      showVolume: true,
      setSymbol: (symbol) => set({ symbol }),
      setTimeframe: (timeframeId) => set({ timeframeId }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      toggleMA: (period) =>
        set((s) => ({
          ma: s.ma.includes(period)
            ? s.ma.filter((p) => p !== period)
            : [...s.ma, period].sort((a, b) => a - b),
        })),
      toggleRSI: () => set((s) => ({ showRSI: !s.showRSI })),
      toggleVolume: () => set((s) => ({ showVolume: !s.showVolume })),
    }),
    {
      name: "trader-store",
      // Persist preferences only — not the action functions.
      partialize: (s) => ({
        symbol: s.symbol,
        timeframeId: s.timeframeId,
        theme: s.theme,
        ma: s.ma,
        showRSI: s.showRSI,
        rsiPeriod: s.rsiPeriod,
        showVolume: s.showVolume,
      }),
    },
  ),
);
