import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeName } from "../theme";
import { DEFAULT_TIMEFRAME_ID } from "../lib/timeframes";
import { WATCHLIST_SYMBOLS } from "../lib/symbols";

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
  ema: number[]; // active EMA periods
  showBollinger: boolean;
  showRSI: boolean;
  rsiPeriod: number;
  showVolume: boolean;
  showVolumeMa: boolean;
  // Watchlist:
  favorites: string[];
  setSymbol: (symbol: string) => void;
  setTimeframe: (id: string) => void;
  toggleTheme: () => void;
  toggleMA: (period: number) => void;
  toggleEMA: (period: number) => void;
  toggleBollinger: () => void;
  toggleRSI: () => void;
  toggleVolume: () => void;
  toggleVolumeMa: () => void;
  toggleFavorite: (symbol: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      symbol: "BTCUSDT",
      timeframeId: DEFAULT_TIMEFRAME_ID,
      theme: defaultTheme(),
      ma: [20, 50],
      ema: [],
      showBollinger: false,
      showRSI: false,
      rsiPeriod: 14,
      showVolume: true,
      showVolumeMa: false,
      favorites: WATCHLIST_SYMBOLS,
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
      toggleEMA: (period) =>
        set((s) => ({
          ema: s.ema.includes(period)
            ? s.ema.filter((p) => p !== period)
            : [...s.ema, period].sort((a, b) => a - b),
        })),
      toggleBollinger: () => set((s) => ({ showBollinger: !s.showBollinger })),
      toggleRSI: () => set((s) => ({ showRSI: !s.showRSI })),
      toggleVolume: () => set((s) => ({ showVolume: !s.showVolume })),
      toggleVolumeMa: () => set((s) => ({ showVolumeMa: !s.showVolumeMa })),
      toggleFavorite: (symbol) =>
        set((s) => ({
          favorites: s.favorites.includes(symbol)
            ? s.favorites.filter((f) => f !== symbol)
            : [...s.favorites, symbol],
        })),
    }),
    {
      name: "trader-store",
      // Persist preferences only — not the action functions.
      partialize: (s) => ({
        symbol: s.symbol,
        timeframeId: s.timeframeId,
        theme: s.theme,
        ma: s.ma,
        ema: s.ema,
        showBollinger: s.showBollinger,
        showRSI: s.showRSI,
        rsiPeriod: s.rsiPeriod,
        showVolume: s.showVolume,
        showVolumeMa: s.showVolumeMa,
        favorites: s.favorites,
      }),
    },
  ),
);
