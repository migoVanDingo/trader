# 0001 — Crypto Currency Ticker — Design

**Status:** Planned
**Date:** 2026-06-19
**Phase:** Design / Architecture

## Goal

Build a crypto currency ticker web app that displays candlestick charts for
multiple time periods, similar to a real trading app. Includes a watchlist of
multiple coins, technical indicators, and live real-time price updates.

## Chosen Stack & Scope

- **Frontend:** React + Vite + TypeScript
- **Scope (v1):** Single chart + Watchlist + Indicators (full-featured)
- **Live data:** Live WebSocket (current candle animates in real time)
- **Charting:** TradingView Lightweight Charts (purpose-built for financial candles, ~45KB, free)
- **Data source:** Binance public REST + WebSocket API (no API key needed for market data)
- **State:** Zustand (active symbol, interval, enabled indicators)

## Architecture

```
Binance REST (klines)  ──seed──►  ┌──────────────┐
                                  │  Chart state  │──► Lightweight Charts
Binance WS (kline/ticker) ─live─► └──────────────┘    (candles + volume + MA/RSI)
        ▲
        │ watchlist subscribes to !miniTicker / per-symbol tickers
```

**Two data channels per chart:**

- **REST seed** — on symbol/interval change, fetch ~500–1000 historical candles to fill the view.
  - `GET /api/v3/klines` returns OHLCV for any interval: `1m, 5m, 15m, 1h, 4h, 1d, 1w, 1M`.
- **WebSocket** — `<symbol>@kline_<interval>` updates the forming candle live; when a candle
  closes it is committed and a new one starts.

**Watchlist** uses a single combined ticker stream (`!miniTicker@arr` or per-symbol `@ticker`)
for last price + 24h % across all listed coins — avoids one socket per coin.

## Data Flow

```
[interval button click]
      → fetch historical klines (REST)  → seed the chart
      → open WebSocket for that symbol+interval → update last candle live
[symbol change] → close old socket, repeat
```

## Project Structure

```
src/
  api/
    binance.ts          # REST: fetchKlines(symbol, interval, limit)
    ws.ts               # WebSocket manager: subscribe/unsubscribe, reconnect
  hooks/
    useKlines.ts        # seed + live merge → candle array
    useTicker.ts        # live price/24h% for header + watchlist
  components/
    Chart/
      CandleChart.tsx   # Lightweight Charts wrapper (candles + volume pane)
      IntervalBar.tsx   # 1m 5m 15m 1h 4h 1D 1W buttons
      IndicatorMenu.tsx # toggle MA(20/50), RSI, volume
    Watchlist/
      Watchlist.tsx     # list of symbols, live mini-prices, click to select
    PriceHeader.tsx     # symbol, last price, 24h change, high/low
  lib/
    indicators.ts       # sma(), ema(), rsi() — pure functions over candles
    format.ts           # price/number/time formatting
  state/
    store.ts            # active symbol, interval, enabled indicators (Zustand)
  App.tsx
```

## Key Technical Decisions

- **`lightweight-charts`** for the chart. Candles on the main pane, **volume** as a histogram
  overlay, **MA** lines as additional line series on the same pane, **RSI** in a separate pane below.
- **Indicators computed client-side** (`lib/indicators.ts`) as pure functions over the candle
  array — recompute whenever candles update so MA/RSI track the live candle too.
- **WebSocket lifecycle** (trickiest part): on symbol/interval switch, tear down the old kline
  subscription and open the new one, with auto-reconnect + re-seed on reconnect to avoid gaps.
  Centralized in `api/ws.ts` so components never touch raw sockets.
- **State** with Zustand — active symbol, interval, which indicators are on.
- **Time handling:** Lightweight Charts wants UNIX seconds; Binance gives ms — convert at the API boundary.

## Known Gotcha

Binance restricts some endpoints by region (US IPs may get HTTP 451). Drop-in fixes:
`api.binance.us`, or swap to Coinbase/Kraken. The `api/` layer isolates this so the rest of
the app does not care.

## Build Order

1. ✅ Scaffold Vite + TS + React. (+ light/dark theme toggle)
2. ✅ REST klines → static candle chart with interval buttons + price header + volume.
3. ✅ Add WebSocket live updates (centralized ws.ts manager w/ reconnect + re-seed;
   live candle merge via series.update(); live 24h ticker).
4. ✅ Watchlist (sidebar, batch REST seed + single combined miniTicker WS).
   Also added Month/Year/All timeframes via a Timeframe preset model
   (interval + limit); ranges visually separated from candle-interval buttons.
5. ✅ Indicators (MA overlays, RSI in its own pane, volume toggle) via an
   IndicatorMenu dropdown. Pure math in `src/lib/indicators.ts`; live tips
   updated per tick. **Upgraded lightweight-charts v4 → v5** for native panes
   (RSI below the price). Series creation now uses the v5 `addSeries(Def, ...)`
   API; RSI pane via paneIndex + `setStretchFactor`.

## Timeframe model (added in step 4)

`src/lib/timeframes.ts` defines each button as `{ id, label, interval, limit, group }`.
Binance has no native "year"/"all-time" candle, so:

- 1m–1W: candle intervals (limit 500).
- 1M: monthly candles (`1M`, limit 240).
- 1Y: 1 year of daily candles (`1d`, limit 365).
- All: full history weekly (`1w`, limit 1000).
  Live updates stream on each timeframe's underlying `interval`.

## Notes

- **Region block confirmed:** `api.binance.com` returns HTTP 451 from this
  location. Switched `src/api/binance.ts` BASE to `https://api.binance.us`
  (identical `/api/v3` shapes). Revisit if deploying elsewhere.
