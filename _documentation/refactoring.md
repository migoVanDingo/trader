# Refactoring notes

> **Status (2026-06-19): all items below resolved** in
> [`_plans/0002-refactoring-plan.md`](../_plans/0002-refactoring-plan.md).
> Tooling (ESLint/Prettier/Vitest/Husky) and a 600-line size guard are now in
> place. This file is kept as a record of the original assessment; consult the
> plan for what was done in each area.

Honest assessment of the rough edges as they stood before the cleanup, ranked by
payoff vs. effort. None were bugs — these were maintainability and robustness
improvements.

## High payoff

### 1. Duplicate `baseAsset()`

`PriceHeader.tsx` defines its own local `baseAsset()` while `lib/symbols.ts`
exports an identical one (used by `Watchlist`). **Fix:** delete the local copy in
`PriceHeader.tsx` and import from `lib/symbols.ts`. Trivial, removes drift risk.

### 2. `CandleChart.tsx` is doing too much

~250 lines mixing chart creation, theming, seeding, MA reconcile, RSI pane
lifecycle, and live ticks across seven effects. It works, but it's the riskiest
file to change. **Fix:** extract custom hooks that encapsulate the imperative
lightweight-charts calls, e.g.:

- `useChart(containerRef, theme)` → returns the chart instance + base series.
- `useMaSeries(chart, candles, periods)` → owns the reconcile loop.
- `useRsiPane(chart, candles, enabled, period, theme)` → owns pane lifecycle.

The component then becomes orchestration only. This also makes the indicator
logic unit-testable without a DOM.

### 3. No tests

There is no test runner. The pure logic in `lib/` is the highest-value, lowest-
friction place to start. **Fix:** add Vitest and cover `indicators.ts` (sma/ema/
rsi against known fixtures), `mergeCandle`, `timeframes.getTimeframe`, and
`format.ts`. Then React Testing Library for hooks/components.

## Medium payoff

### 4. Persist more than just theme

Only `theme` survives a reload; `symbol`, `timeframeId`, and indicator toggles
reset. **Fix:** wrap the store in Zustand's `persist` middleware and whitelist the
preference fields. Removes the bespoke `localStorage` code in `store.ts`.

### 5. Live indicator recompute is O(n) per tick

The tick effect rebuilds `merged` and recomputes the **entire** SMA/RSI array
just to read the last point. Fine at ≤1000 candles and a few ticks/sec, but
wasteful. **Fix:** incremental "last value" helpers (rolling SMA sum; carry
Wilder's avg-gain/avg-loss between ticks).

### 6. Watchlist scaling limits

`subscribeCombined` puts every symbol in one URL. Binance caps streams-per-
connection and URL length, so a large watchlist will eventually break. **Fix:**
for big lists use the `!miniTicker@arr` all-market stream and filter client-side,
or shard across connections. Document the current practical ceiling (~tens).

### 7. Reconnect hardening

`openSocket` retries forever with no jitter and no "disconnected" signal to the
UI. **Fix:** add a max-attempt cap and backoff jitter, and expose connection
state so the UI can show a "reconnecting…" badge.

## Low payoff / nice-to-have

### 8. Magic numbers

Pane stretch factors (`3` / `1`), volume scale margin (`0.8`), reconnect bounds
(`1000`, `15000`), and per-timeframe limits are inline. Pull into named constants.

### 9. Theme color duplication

Colors live in both `index.css` (CSS vars) and `theme.ts` (canvas). This is
unavoidable (canvas can't read CSS vars) but could be generated from one TS source
that emits both a stylesheet and the `chartThemes` object at build time.

### 10. Swallowed errors

`useTicker`/`useWatchlist` silently ignore failures. Acceptable, but a small
surfaced state (stale/offline indicator) would improve UX.

### 11. Tooling

No ESLint/Prettier config is committed. Adding them (with the React Hooks plugin)
would catch effect-dependency mistakes that currently rely on inline
`eslint-disable` comments.
