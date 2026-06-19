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

- ✅ **Order book panel** (plan 0007) — `…@depth20@100ms` in a collapsible side panel.
- ✅ **Recent trades tape** (plan 0008) — `…@aggTrade` tab in the side panel.
- ✅ **Watchlist sparklines** (plan 0009) — 24h trend line per row.

## Alerts & engagement

- ✅ **Price alerts** (plan 0010) — per-symbol thresholds → toast + browser
  notification when crossed.

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

- ✅ Connection-status badge (plan 0002).
- ✅ Keyboard shortcuts — 1–9/0 timeframes, `t` theme (plan 0015). _Remaining:_
  symbol quick-switch.
- ✅ Accessibility first pass — focus-visible outlines, reduced-motion, chart
  aria-label (plan 0015). _Remaining:_ full ARIA on toolbar/menus.
- Drawing tools (trend lines, horizontal levels). _(larger — own plan when picked up)_
- Multiple quote currencies (USDC, BTC-quoted pairs).
- Per-symbol price precision from `exchangeInfo` tick size (instead of the
  heuristic in `format.ts`) — `tickSize` is already fetched in `useMarkets`.

## Suggested sequence

A natural order that compounds: **(1) crosshair legend → (2) persist prefs →
(3) symbol search → (4) MACD/Bollinger → (5) order book.** Each is self-contained,
shippable on its own, and builds toward a credible trading UI. Do the
`CandleChart` hook extraction (refactoring #2) before #4 so adding indicators is
clean.
