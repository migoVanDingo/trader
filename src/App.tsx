import { useCallback } from "react";
import { useStore } from "./state/store";
import { useKlines } from "./hooks/useKlines";
import { useTicker } from "./hooks/useTicker";
import { useHotkeys } from "./hooks/useHotkeys";
import { useThemeAttribute } from "./hooks/useThemeAttribute";
import { useIndicatorConfig } from "./hooks/useIndicatorConfig";
import { useAlertWatcher } from "./hooks/useAlertWatcher";
import { getTimeframe, TIMEFRAMES } from "./lib/timeframes";
import { CandleChart } from "./components/Chart/CandleChart";
import { TimeframeBar } from "./components/Chart/TimeframeBar";
import { IndicatorMenu } from "./components/Chart/IndicatorMenu";
import { PriceHeader } from "./components/PriceHeader";
import { Watchlist } from "./components/Watchlist/Watchlist";
import { ThemeToggle } from "./components/ThemeToggle";
import { ConnectionBadge } from "./components/ConnectionBadge";
import { SymbolSearch } from "./components/SymbolSearch";
import { SidePanel } from "./components/SidePanel/SidePanel";
import { marketPanelTabs } from "./components/SidePanel/panelTabs";
import { Toasts } from "./components/Toasts";

export default function App() {
  const {
    symbol,
    timeframeId,
    theme,
    favorites,
    setSymbol,
    setTimeframe,
    toggleTheme,
  } = useStore();

  useThemeAttribute(theme);
  useAlertWatcher();

  // Keyboard shortcuts: 1–9/0 pick a timeframe, "t" toggles theme.
  const onTimeframeIndex = useCallback(
    (i: number) => {
      const tf = TIMEFRAMES[i];
      if (tf) setTimeframe(tf.id);
    },
    [setTimeframe],
  );
  useHotkeys({ onTimeframeIndex, onToggleTheme: toggleTheme });

  const tf = getTimeframe(timeframeId);
  const { candles, lastUpdate, loading, error } = useKlines(
    symbol,
    tf.interval,
    tf.limit,
  );
  const ticker = useTicker(symbol);
  const indicators = useIndicatorConfig();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◧</span> Trader
        </div>
        <div className="topbar-controls">
          <SymbolSearch />
          <ConnectionBadge />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="body">
        <Watchlist symbols={favorites} active={symbol} onSelect={setSymbol} />

        <main className="content">
          <PriceHeader symbol={symbol} ticker={ticker} />
          <div className="chart-toolbar">
            <TimeframeBar value={timeframeId} onChange={setTimeframe} />
            <IndicatorMenu />
          </div>

          <div
            className="chart-wrap"
            role="img"
            aria-label={`${symbol} price chart`}
          >
            {error ? (
              <div className="chart-message error">
                <p>Couldn't load chart data.</p>
                <p className="chart-message-detail">{error}</p>
              </div>
            ) : (
              <CandleChart
                candles={candles}
                update={lastUpdate}
                theme={theme}
                indicators={indicators}
              />
            )}
            {loading && !error && (
              <div className="chart-overlay">Loading {symbol}…</div>
            )}
          </div>
        </main>

        <SidePanel tabs={marketPanelTabs(symbol)} />
      </div>

      <Toasts />
    </div>
  );
}
