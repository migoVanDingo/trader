import { useEffect } from "react";
import { useStore } from "./state/store";
import { useKlines } from "./hooks/useKlines";
import { useTicker } from "./hooks/useTicker";
import { getTimeframe } from "./lib/timeframes";
import { CandleChart } from "./components/Chart/CandleChart";
import { TimeframeBar } from "./components/Chart/TimeframeBar";
import { IndicatorMenu } from "./components/Chart/IndicatorMenu";
import { PriceHeader } from "./components/PriceHeader";
import { Watchlist } from "./components/Watchlist/Watchlist";
import { ThemeToggle } from "./components/ThemeToggle";
import { ConnectionBadge } from "./components/ConnectionBadge";
import { SymbolSearch } from "./components/SymbolSearch";
import type { IndicatorConfig } from "./lib/indicators";

export default function App() {
  const {
    symbol,
    timeframeId,
    theme,
    ma,
    ema,
    showBollinger,
    showRSI,
    rsiPeriod,
    showVolume,
    showVolumeMa,
    favorites,
    setSymbol,
    setTimeframe,
    toggleTheme,
  } = useStore();

  // Reflect the theme on <html> so CSS variables switch.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const tf = getTimeframe(timeframeId);
  const { candles, lastUpdate, loading, error } = useKlines(
    symbol,
    tf.interval,
    tf.limit,
  );
  const ticker = useTicker(symbol);

  const indicators: IndicatorConfig = {
    ma,
    ema,
    bollinger: showBollinger,
    rsi: showRSI,
    rsiPeriod,
    volume: showVolume,
    volumeMa: showVolumeMa,
  };

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

          <div className="chart-wrap">
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
      </div>
    </div>
  );
}
