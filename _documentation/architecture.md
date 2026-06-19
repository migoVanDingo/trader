# Architecture

How Trader is put together and how each piece works.

## 1. Overview

Trader is a **client-only React SPA**. There is no backend — the browser talks
directly to Binance.US for market data. State lives in memory (Zustand) plus a
single persisted preference (theme). The app's job is:

1. Pull historical candles (REST) and stream live updates (WebSocket).
2. Render them as a candlestick chart with volume + indicators.
3. Let the user switch symbol, timeframe, indicators, and theme.

```
┌──────────────────────────────────────────────────────────────┐
│                          React UI                              │
│  App ─ Watchlist ─ PriceHeader ─ TimeframeBar ─ IndicatorMenu  │
│                         CandleChart                            │
└───────────────┬───────────────────────────┬──────────────────┘
                │ hooks                       │ Zustand store
        ┌───────▼────────┐           ┌────────▼────────┐
        │ useKlines      │           │ symbol          │
        │ useTicker      │           │ timeframeId     │
        │ useWatchlist   │           │ theme           │
        └───────┬────────┘           │ ma/rsi/volume   │
                │ api layer          └─────────────────┘
        ┌───────▼─────────────────────────┐
        │ api/binance.ts (REST)           │
        │ api/ws.ts (WebSocket manager)   │
        └───────┬─────────────────────────┘
                │
        Binance.US  REST: api.binance.us   WS: stream.binance.us:9443
```

## 2. Layers and responsibilities

The codebase is deliberately layered so each concern is isolated and testable.

### `src/api/` — the network boundary

- **`binance.ts`** — REST calls. Converts raw Binance JSON into app types and,
  crucially, converts timestamps from **milliseconds → seconds** here so nothing
  downstream has to think about it.
  - `fetchKlines(symbol, interval, limit)` → `Candle[]`
  - `fetchTicker24h(symbol)` → `Ticker24h` (price header)
  - `fetchTickers(symbols[])` → `Record<symbol, SymbolQuote>` (watchlist seed,
    one batched request via the `symbols=[...]` param)
- **`ws.ts`** — a small WebSocket manager. Components never open sockets; they
  call one of two functions and get back a `{ close() }` handle:
  - `subscribeStream(stream, onMessage, opts?)` — one raw stream
    (e.g. `btcusdt@kline_1h`).
  - `subscribeCombined(streams[], onMessage, opts?)` — many streams over one
    connection (the watchlist), unwrapping Binance's `{ stream, data }` envelope.
  - `opts` is `{ onReconnect?, onStatus? }`. Both share `openSocket()`, which
    handles **exponential backoff with full jitter** (capped delay and a
    max-attempt cap), fires `onReconnect` on a *re*connect (not the first) so
    callers can re-seed and fill gaps, and reports lifecycle via `onStatus`.

This is the only layer that knows the data source is Binance.US. Swapping
exchanges or routing through a backend is a change here only.

### `src/hooks/` — data lifecycle

Each hook owns "fetch + subscribe + clean up" for one concern and exposes plain
React state. This is where REST seeds and live streams are merged.

- **`useKlines(symbol, interval, limit)`** → `{ candles, lastUpdate, loading, error }`
  - On change: sets loading, REST-seeds `candles`, opens `…@kline_…`.
  - Each live frame is surfaced as `lastUpdate` (a single `Candle`) — **not**
    merged into `candles` — so the chart can apply it incrementally.
  - Re-seeds via REST on socket reconnect.
- **`useTicker(symbol)`** → `Ticker24h | null`
  - REST snapshot for instant first paint, then live `…@ticker` updates.
- **`useWatchlist(symbols[])`** → `Record<symbol, SymbolQuote>`
  - One batched REST seed for all symbols, then a single combined
    `…@miniTicker` stream. Change % is derived as `(last - open) / open`.

### `src/lib/` — pure logic & config (no React, no I/O)

- **`indicators.ts`** — `sma`, `ema`, Wilder's `rsi` (full-series), plus the
  O(1)/O(period) live helpers `smaLast`, `rsiState`, `rsiAdvance`, and
  `mergeCandle`. Has unit tests, including incremental-vs-full parity.
- **`timeframes.ts`** — the `TIMEFRAMES` table. Each button = `{ interval, limit,
group }`. See §5.
- **`symbols.ts`** — `WATCHLIST_SYMBOLS` and `baseAsset()`.
- **`format.ts`** — price / percent / compact number formatting.
- **`chartOptions.ts`** — pure builders for lightweight-charts option objects
  from a `ChartTheme`. **`chartConstants.ts`** — chart magic numbers (pane sizes,
  volume margin, RSI levels/color).

Most `lib/` modules have colocated `*.test.ts` files (Vitest).

### `src/state/` — UI state (Zustand)

- **`store.ts`** — `symbol`, `timeframeId`, `theme`, and indicator toggles
  (`ma[]`, `showRSI`, `rsiPeriod`, `showVolume`). Wrapped in the `persist`
  middleware: all of those preferences survive a reload; theme defaults to the OS
  `prefers-color-scheme` on first visit.
- **`connection.ts`** — tracks each live socket's status (klines / ticker /
  watchlist) and exposes the worst-of overall status for the badge.

### `src/components/` — presentation

Components read the store and render. They receive data via props/hooks and never
touch the network. `CandleChart` is the exception to "purely declarative" — it
orchestrates the imperative chart hooks (see §4).

## 3. End-to-end data flow

**Switching symbol or timeframe:**

```
user clicks coin / timeframe
  → store updates (symbol | timeframeId)
  → App resolves timeframe → (interval, limit)
  → useKlines effect re-runs:
        lastUpdate = null
        REST fetchKlines → candles        → CandleChart.setData + fitContent
        open …@kline_… stream
  → each WS frame → lastUpdate = Candle    → CandleChart.update (no view reset)
```

**Live tick path (the important optimization):** seed data uses `setData`
(replaces the dataset, fits the view); live ticks use `series.update()` (replaces
the forming candle or appends a new one) so the user's zoom/pan/crosshair is
preserved and only the latest candle redraws.

## 4. The chart (`CandleChart.tsx` + `hooks/chart/`)

`CandleChart` bridges React's declarative world to lightweight-charts' imperative
one. Rather than one large component, it's **orchestration only** (~30 lines) that
composes four focused hooks, each owning one concern of the chart:

- **`useChart(containerRef, theme)`** — creates/destroys the chart, the base
  candle + volume series, the `ResizeObserver`, and applies theme colors. Returns
  refs to the chart and base series (`ChartRefs`).
- **`useCandleData(refs, candles, update, theme, showVolume)`** — seeds candle &
  volume data (`setData` + `fitContent`), volume visibility, and live ticks for
  candle + volume.
- **`useMaSeries(refs, candles, update, periods)`** — reconciles MA line series to
  the active set, seeds each, and pushes the live tip.
- **`useRsiPane(refs, candles, update, enabled, period, theme)`** — the RSI line
  in **pane index 1** (a real second pane, a v5 feature) with dashed 70/30
  reference lines sized via `setStretchFactor`; create/destroy + live tip.
- **`useCrosshair(refs)`** — subscribes to `subscribeCrosshairMove` and returns the
  hovered candle's OHLCV (or `null`); `OhlcLegend` renders it, falling back to the
  live/latest candle when not hovering.

**Seed vs. live:** seed data uses `setData` (+ `fitContent`); live ticks use
`series.update()` so the user's zoom/pan/crosshair is preserved. The MA tip uses
`smaLast` (O(period)) and the RSI tip uses carried Wilder state (`rsiState` /
`rsiAdvance`, O(1)) — neither recomputes the whole series per tick.
`useLatestRef` lets the tick effects read current props without re-subscribing.

> **Why v5:** RSI "in its own pane below the price" needs true multi-pane
> support, which arrived in lightweight-charts v5. Step 5 upgraded v4 → v5; the
> series API changed from `chart.addCandlestickSeries()` to
> `chart.addSeries(CandlestickSeries, …)`.

## 5. Timeframes

Binance only offers candle intervals up to `1M` (monthly) — there is no native
"year" or "all-time" candle. So `timeframes.ts` models each button as a candle
`interval` plus a `limit`:

| Button | Group    | interval      | limit | Span shown                    |
| ------ | -------- | ------------- | ----- | ----------------------------- |
| 1m–4h  | interval | that interval | 500   | intraday                      |
| 1D, 1W | interval | `1d`, `1w`    | 500   | months–years                  |
| 1M     | range    | `1M`          | 240   | ~20 years (monthly candles)   |
| 1Y     | range    | `1d`          | 365   | 1 year (daily candles)        |
| All    | range    | `1w`          | 1000  | full history (weekly candles) |

Live updates always stream on the underlying `interval`. The UI separates the
"range" presets from the candle-interval buttons with a divider.

## 6. Theming

**One source of truth: `src/theme.ts`.** It defines every color token (chrome +
chart) once, then:

- derives `chartThemes` for the canvas (lightweight-charts can't read CSS vars), and
- emits the chrome tokens as CSS custom properties via `themeStyleSheet()`, which
  `main.tsx` injects into a `<style>` at startup (before first paint, so no FOUC).

`App` writes `document.documentElement.dataset.theme`, which switches between the
injected `[data-theme]` blocks. Styles themselves live in `src/styles/` split by
area. Theme choice is persisted and defaults to the OS `prefers-color-scheme`.

## 7. Reliability notes

- **Reconnect:** sockets auto-reconnect with exponential backoff **+ full jitter**
  and re-seed on reconnect, capped at `RECONNECT_MAX_ATTEMPTS` (then status goes
  `closed`). Each subscription reports lifecycle via `onStatus`.
- **Connection badge:** `connection.ts` aggregates all socket statuses;
  `ConnectionBadge` shows "Connecting/Reconnecting/Disconnected" whenever the
  combined status isn't healthy. This is the surfaced offline signal — REST seed
  failures for ticker/watchlist degrade gracefully because the WS backfills.
- **Errors:** chart load errors are surfaced in the chart area.
- **Sandbox data:** in some network environments the Binance.US feed serves
  slow/replayed data, so live movement looks calmer than production.

## 8. Tooling & guardrails

- **ESLint + Prettier** (`npm run lint` / `format`).
- **Vitest** unit tests (`npm test`) covering `lib/` and a component smoke test.
- **`scripts/check-file-sizes.mjs`** enforces the 600-line cap (`npm run
check:size`, also in `prebuild`).
- **Husky pre-commit** runs `check:size && lint && test`.
