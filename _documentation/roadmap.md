# Roadmap

Where the app goes next. The core (chart, timeframes, live WS, watchlist,
indicators) and the first feature wave are shipped; this tracks what's deferred
and a menu of ideas for extending it.

## Shipped

- ✅ Live candlestick charts, 10 timeframes, volume, live watchlist, themes (0001)
- ✅ Refactor/tooling: tests, ESLint/Prettier, Husky, 600-line guard (0002)
- ✅ Persisted preferences + connection-status badge (0002)
- ✅ Crosshair OHLC legend (0004)
- ✅ Symbol search / dynamic markets + favorites (0005)
- ✅ Indicators: SMA, EMA, Bollinger, volume MA, RSI, MACD (0006)
- ✅ Order book panel + collapsible side panel (0007)
- ✅ Recent trades tape (0008)
- ✅ Watchlist sparklines (0009)
- ✅ Price alerts → toast + browser notification (0010)
- ✅ Keyboard shortcuts + accessibility first pass (0015)

## Deferred (planned, picked up later)

- **PWA / installable** (plan 0013) — offline shell, add-to-home-screen.
- **Backend / caching proxy** (plan 0014) — region/rate-limit relief, deeper
  history, server-side keys. Backend runs in docker-compose; frontend stays local.
- **E2E + CI** (plan 0011) — Playwright smoke + GitHub Actions.
- **Deploy** (plan 0012) — static host (+ proxy if 0014 lands).

## Polish backlog

- Symbol quick-switch hotkey (open search); full ARIA on toolbar/menus.
- Drawing tools (trend lines, horizontal levels) — _larger; own plan when picked up._
- Multiple quote currencies (USDC, BTC-quoted pairs).
- Per-symbol price precision from `exchangeInfo` `tickSize` (already in `useMarkets`).

---

# Extensions & ideas

A menu (not a commitment) of where we could take what exists. Grouped by how far
they reach from today's code.

## Extend what we have (build on existing pieces)

- **Configurable indicators.** A settings popover per indicator (periods, σ, MACD
  fast/slow/signal) instead of fixed presets — the math already takes params.
- **More indicators.** VWAP, ATR, Stochastic, Ichimoku — all slot into the
  `lib/indicators` + chart-hook pattern; oscillators reuse the pane mechanism.
- **Depth chart.** A cumulative bid/ask depth curve from the order-book data we
  already stream.
- **Candle-close countdown.** Time-to-next-candle in the price header (derived
  from the active interval).
- **Compare symbols.** Overlay a second symbol's line on the chart (normalized %).
- **Multi-chart grid.** 2×2 layout, each cell its own symbol/timeframe.
- **Alert conditions beyond price.** % change, volume spike, or indicator crosses
  (e.g. RSI > 70, MACD cross) — extends the `crossed()`/watcher design.
- **Watchlist groups.** Multiple named watchlists; reorder/drag favorites.

## New features (new surfaces)

- **Paper-trading / portfolio.** Track simulated holdings and P&L against live
  prices; a positions panel. (Pure client-side first.)
- **Market screener.** Sort/filter all pairs by gainers/losers/volume/volatility.
- **Market overview / heatmap.** Grid of top pairs colored by 24h change.
- **Historical replay & backtest.** Step candles forward to replay; evaluate a
  simple indicator strategy over history.
- **CSV / image export.** Export klines to CSV; export a chart snapshot to PNG.
- **Symbol info panel.** 24h stats, supply, links — per selected market.

## Integrations (external systems)

- **Multiple exchanges.** Coinbase / Kraken behind the existing `api/` boundary,
  with an exchange selector — the layering is already set up for this.
- **Read-only account sync.** Pull real balances via exchange API keys (through
  the 0014 backend so keys stay server-side) → a real portfolio view.
- **Push notifications.** Service-worker push so alerts fire when the tab is
  closed (pairs with the PWA work).
- **Alert delivery to chat.** Telegram / Discord / email via the backend.
- **News & events.** Per-symbol news feed and an economic-calendar strip.
- **Cross-device sync + auth.** Persist favorites/alerts/layout to an account
  (needs the backend).
- **AI assist (Claude API).** Natural-language summaries ("how's BTC trending on
  the 4h?"), alert suggestions, or pattern call-outs — via the backend so the API
  key stays server-side.
