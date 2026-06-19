# CLAUDE.md

Guidance for working in this repo. For deep architecture, see `_documentation/`.

## What this is

**Trader** — a crypto-currency ticker web app: live candlestick charts with
multiple timeframes, a live watchlist, technical indicators (MA / RSI / volume),
and a light/dark theme. Client-only SPA; no backend. Market data comes from the
public **Binance.US** REST + WebSocket API (no API key needed).

## Stack

- React 18 + TypeScript + Vite
- [lightweight-charts](https://github.com/tradingview/lightweight-charts) **v5** (candles, panes)
- Zustand for state
- No CSS framework — plain CSS with variables (`src/index.css`)

## Commands

```bash
npm install        # install deps
npm run dev        # dev server at http://localhost:5173
npm run build      # check:size (prebuild) + tsc type-check + vite build
npm run preview    # serve the production build
npm test           # Vitest (run once); test:watch for watch mode
npm run lint       # ESLint
npm run format     # Prettier (format:check to verify only)
npm run check:size # fail if any src file exceeds the 600-line cap
```

A Husky **pre-commit** hook runs `check:size && lint && test` on every commit.

## Important gotcha: data source region

`api.binance.com` returns **HTTP 451** (region block) from the US. The app uses
`api.binance.us` instead (REST in `src/api/binance.ts`, WS in `src/api/ws.ts`).
If you deploy elsewhere or it breaks, swap those base URLs (Coinbase / Kraken
are fallbacks — the `api/` layer isolates this).

## Project layout

```
src/
  api/          binance.ts (REST), ws.ts (WebSocket manager + connection status)
  hooks/        useKlines, useTicker, useWatchlist, useLatestRef
    chart/      useChart, useCandleData, useMaSeries, useRsiPane (imperative glue)
  lib/          indicators, timeframes, symbols, format,
                chartOptions, chartConstants  (pure logic + config)  + *.test.ts
  components/   Chart/ (CandleChart, TimeframeBar, IndicatorMenu), PriceHeader,
                ThemeToggle, ConnectionBadge, Watchlist/
  state/        store.ts (Zustand persist), connection.ts (live status)
  styles/       index.css + per-area files (base, topbar, watchlist, …)
  theme.ts      single source for all colors → chartThemes + injected CSS vars
  test/setup.ts Vitest + jest-dom setup
  types.ts      Candle, Ticker24h, Interval
scripts/        check-file-sizes.mjs (600-line guard)
```

## Where to make common changes

- **Add a timeframe** → `src/lib/timeframes.ts` (`TIMEFRAMES` array). Each entry
  maps a button to a Binance candle `interval` + `limit`.
- **Add a watchlist coin** → `src/lib/symbols.ts` (`WATCHLIST_SYMBOLS`).
- **Add an indicator** → math in `src/lib/indicators.ts` (+ a test), a toggle in
  the store (`src/state/store.ts`), a menu entry in `IndicatorMenu.tsx`, and a
  rendering hook in `src/hooks/chart/` wired from `CandleChart.tsx`.
- **Change theme colors** → `src/theme.ts` only (single source). It feeds both
  `chartThemes` (canvas) and the CSS variables injected by `main.tsx`.
- **Add/adjust styles** → the matching file in `src/styles/` (imported from
  `src/styles/index.css`).
- **Tune reconnect / chart magic numbers** → `src/api/ws.ts` (reconnect bounds)
  and `src/lib/chartConstants.ts` (pane sizes, volume margin, RSI levels).

## Code organization & modularity (always follow)

Build tidy and modular by default. These are hard rules, not suggestions:

- **600-line hard cap per file** (code or CSS). No file in `src/**` may exceed
  600 lines. When a file approaches ~500 lines, stop and split it before adding
  more. Run `npm run check:size` to verify (also enforced on every commit).
- **One responsibility per file/module.** A file should have a single clear
  reason to change. If you're adding a second concern, make a second file.
- **Respect the layers.** Pure logic → `src/lib/` (no React, no I/O, so it's
  unit-testable). Data lifecycle (fetch/subscribe/cleanup) → `src/hooks/`.
  Network → `src/api/`. UI state → `src/state/`. Presentation → `src/components/`.
  Don't fetch in a component or put business logic in a hook that belongs in `lib/`.
- **Prefer extracting hooks** for imperative/stateful glue (e.g. the
  lightweight-charts wiring) so components stay declarative and thin.
- **Keep the directory tree tidy.** Group related files in domain folders
  (`components/Chart/`, `hooks/chart/`, `styles/`). Colocate. No catch-all
  `utils.ts` dumping ground. Delete dead files immediately — don't leave unused
  code behind.
- **Split CSS by concern** (target layout: a `src/styles/` folder per area),
  don't let one stylesheet sprawl.
- When a task makes a file cross the cap or muddies the tree, the cleanup is part
  of that task — not a future TODO.

## Conventions

- Binance returns times in **milliseconds**; lightweight-charts wants **seconds**.
  Convert at the API boundary only (in `src/api/`). Everywhere downstream, a
  `Candle.time` is already UNIX seconds (`UTCTimestamp`).
- Hooks own the data lifecycle (fetch + subscribe + cleanup). Components stay
  presentational and never touch sockets directly.
- The chart is imperative; React effects in `CandleChart.tsx` bridge prop changes
  to lightweight-charts calls. Seed data uses `setData`; live ticks use `update`.
- Match the existing plain-CSS style (BEM-ish class names, CSS variables for color).

## Plans & docs

- `_plans/` — phased build plan (design + per-step status).
- `_documentation/` — architecture, data flow, refactoring notes, roadmap.
