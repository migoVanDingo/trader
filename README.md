# Trader

A crypto-currency ticker web app — live candlestick charts that feel like a real
trading app. React + Vite + TypeScript, powered by the public **Binance.US**
REST + WebSocket API (no API key needed).

## Features

- **Live candlestick charts** (TradingView lightweight-charts v5) with a volume
  histogram and a crosshair OHLC legend.
- **10 timeframes** — 1m, 5m, 15m, 1H, 4H, 1D, 1W, plus 1M / 1Y / All ranges.
- **Indicators** — SMA/EMA overlays, Bollinger Bands, a volume MA, and RSI + MACD
  (each in its own pane), all toggleable and live.
- **Symbol search** across every USDT pair (`exchangeInfo`); star to add to the
  watchlist.
- **Live watchlist** of your favorite coins and a 24h price header, over WebSocket.
- **Order book** (live depth) and a **recent-trades tape** in a collapsible side
  panel.
- **Light / dark theme** (persisted) and a connection-status badge.
- Preferences (symbol, timeframe, indicators, theme) persist across reloads.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

### Scripts

| Script                            | Does                                       |
| --------------------------------- | ------------------------------------------ |
| `npm run dev`                     | Vite dev server                            |
| `npm run build`                   | size guard + type-check + production build |
| `npm run preview`                 | serve the production build                 |
| `npm test`                        | Vitest (unit + component)                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                          |
| `npm run check:size`              | enforce the 600-line-per-file cap          |

A Husky pre-commit hook runs `check:size && lint && test`.

## Data source

Uses `api.binance.us` / `stream.binance.us` because `api.binance.com` returns
HTTP 451 from the US. The `src/api/` layer isolates this, so swapping exchanges or
adding a proxy is a localized change.

## Docs

- [`CLAUDE.md`](./CLAUDE.md) — repo guide and modularity rules.
- [`_documentation/`](./_documentation/) — architecture, refactoring notes, roadmap.
- [`_plans/`](./_plans/) — phased build & feature plans.

Runs locally for now; CI/deploy are on the roadmap.
