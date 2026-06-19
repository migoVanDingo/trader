# Roadmap

What to build next, grouped by theme and roughly prioritized. The five core build
steps (chart → timeframes → live WS → watchlist → indicators) are done; this is
where the app goes from "works" to "feels like a real trading app."

## Shipped

- ✅ **Crosshair OHLC legend** (plan 0004) — `useCrosshair` + `OhlcLegend`.
- ✅ **Symbol search / dynamic markets** (plan 0005) — `exchangeInfo` + favorites.
- ✅ **More indicators** (plan 0006) — EMA, Bollinger Bands, volume MA, MACD pane.
- ✅ **Persist user preferences** (plan 0002) — Zustand `persist`.

## Market depth & activity

5. **Order book panel.** Live bids/asks via the `…@depth` stream with a REST
   snapshot seed — a classic exchange view.
6. **Recent trades tape.** `…@aggTrade` stream rendered as a scrolling list.
7. **Watchlist sparklines.** A tiny 24h line per row (one extra kline fetch per
   symbol, or reuse `1d`/`1h` data).

## Alerts & engagement

8. **Price alerts.** Let the user set a threshold per symbol; fire a browser
   notification when crossed. Needs the Notifications API + a small rules store.
9. **PWA / installable.** Offline shell, add-to-homescreen, mobile polish.

## Platform & quality

10. **Optional backend / caching proxy.** A thin server to (a) sidestep regional
    blocks and rate limits, (b) cache klines, (c) paginate history beyond the
    per-request `limit` for true "all-time" depth. Keeps an API key server-side.
11. **Tests + CI.** Vitest for `lib/`, RTL for hooks/components, Playwright for a
    smoke e2e (load → switch symbol → toggle indicator). Wire to CI.
12. **Deploy.** Static host (Vercel/Netlify/Pages); add the backend proxy if #10
    lands.

## Polish backlog

- Connection-status badge (reconnecting / offline).
- Keyboard shortcuts (timeframe hotkeys, symbol quick-switch).
- Drawing tools (trend lines, horizontal levels).
- Multiple quote currencies (USDC, BTC-quoted pairs).
- Accessibility pass (focus states, ARIA on the chart toolbar, reduced-motion).
- Per-symbol price precision from `exchangeInfo` tick size (instead of the
  heuristic in `format.ts`).

## Suggested sequence

A natural order that compounds: **(1) crosshair legend → (2) persist prefs →
(3) symbol search → (4) MACD/Bollinger → (5) order book.** Each is self-contained,
shippable on its own, and builds toward a credible trading UI. Do the
`CandleChart` hook extraction (refactoring #2) before #4 so adding indicators is
clean.
