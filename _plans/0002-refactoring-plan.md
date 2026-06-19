# 0002 — Refactoring & Modularity Plan

**Status:** ✅ Complete — all 8 phases implemented (2026-06-19)
**Date:** 2026-06-19
**Phase:** Plan
**Source:** [`_documentation/refactoring.md`](../_documentation/refactoring.md)

> **Implemented.** All phases below are done. Gate (`check:size` + `lint` +
> `test`) runs on every commit via a Husky pre-commit hook. 34 tests pass; build
> clean; no source file exceeds 600 lines (largest is now ~85).

## Goal

Work through every item in `refactoring.md`, broken into small, independently
shippable tasks, while enforcing two standing rules:

1. **No file exceeds 600 lines.** Anything approaching it gets split into modular
   chunks. (Audit below — nothing violates this today; `index.css` is closest.)
2. **The directory tree stays tidy** — one responsibility per file, grouped by
   domain, no dumping grounds, dead files deleted.

These rules are now also recorded in `CLAUDE.md` so all future work follows them.

## Current size audit (2026-06-19)

| File                                   | Lines | Note                                                                              |
| -------------------------------------- | ----- | --------------------------------------------------------------------------------- |
| `src/index.css`                        | 472   | Closest to cap; will cross 600 as features land → **split proactively (Phase 8)** |
| `src/components/Chart/CandleChart.tsx` | 250   | Under cap but too complex → **decompose (Phase 3)**                               |
| everything else                        | < 135 | Healthy                                                                           |

No file is over 600 today. The cap is preventive: it's a forcing function for
modularity, applied as we touch each area.

## Guiding principles for every task

- Each task is small enough to land in one focused commit and leaves the app
  building (`npm run build`) and green (`npm test`, once it exists).
- Pure logic goes in `src/lib/` (no React, no I/O) so it is unit-testable.
- Imperative/stateful glue goes in hooks; components stay presentational.
- After any task, if a touched file is > 600 lines (or CSS > ~450 and growing),
  split it before moving on.

## Phase ordering rationale

Guardrails first (so later work is safe and consistent) → tests (safety net for
the risky decomposition) → the big `CandleChart` decomposition → state, perf,
robustness, polish → finish with the CSS split and a repo-wide size audit.

---

## Phase 1 — Guardrails & quick wins

- [x] **1.1 Dedupe `baseAsset()`** (refactoring #1)
  - Delete the local copy in `components/PriceHeader.tsx`; import from `lib/symbols.ts`.
  - _Done when:_ one definition exists; `grep -c "function baseAsset" src` → 1.
- [x] **1.2 Add ESLint + Prettier** (refactoring #11)
  - Add `eslint`, `@typescript-eslint`, `eslint-plugin-react-hooks`, `prettier`.
  - Add `lint` / `format` npm scripts; fix anything it flags.
  - _Done when:_ `npm run lint` passes with no inline `eslint-disable` left unjustified.
- [x] **1.3 Add a line-count guard**
  - Small script `scripts/check-file-sizes.mjs` failing if any `src/**` file > 600 lines.
  - Add `npm run check:size`.
  - _Done when:_ script runs in `npm run build` (or a `pretest`) and passes.

## Phase 2 — Test foundation (refactoring #3)

- [x] **2.1 Set up Vitest** — add `vitest`, config, `test` script.
- [x] **2.2 Test `lib/indicators.ts`** — `sma`, `ema`, `rsi` against known
      fixtures; edge cases (empty, warmup boundary, flat series).
- [x] **2.3 Test the other pure modules** — `mergeCandle`, `timeframes.getTimeframe`
      (fallback on unknown id), `format.ts`, `symbols.baseAsset`.
- [x] **2.4 First component/hook smoke test** — add React Testing Library; render
      `IndicatorMenu` and assert toggles dispatch to the store.
  - _Done when:_ `npm test` is green and covers all of `lib/`.

## Phase 3 — Decompose `CandleChart` (refactoring #2)

> Do Phase 2 first — the extracted hooks should be covered by the new tests.
> Target: `CandleChart.tsx` becomes thin orchestration; no new file > 600 lines.

- [x] **3.1 Extract chart options/colors** → `lib/chartOptions.ts`
  - Pure functions building the lightweight-charts option objects from a `ChartTheme`.
- [x] **3.2 `hooks/chart/useChart.ts`**
  - Owns create/destroy, `ResizeObserver`, theme application; returns chart + base
    candle/volume series refs.
- [x] **3.3 `hooks/chart/useCandleData.ts`**
  - Seeds candles/volume (`setData` + `fitContent`) and applies live ticks
    (`update`) for candle + volume.
- [x] **3.4 `hooks/chart/useMaSeries.ts`**
  - Reconcile add/remove of MA line series + seed + live tip.
- [x] **3.5 `hooks/chart/useRsiPane.ts`**
  - Pane lifecycle, reference lines, seed + live tip.
- [x] **3.6 Slim `CandleChart.tsx`**
  - Compose the hooks; verify behavior parity (manual + tests) and that every
    file in `hooks/chart/` is small and single-purpose.
  - _Done when:_ `CandleChart.tsx` is orchestration-only and well under 600 lines.

## Phase 4 — State & persistence (refactoring #4)

- [x] **4.1 Adopt Zustand `persist`** — wrap the store; whitelist `symbol`,
      `timeframeId`, `theme`, `ma`, `showRSI`, `rsiPeriod`, `showVolume`.
- [x] **4.2 Remove bespoke `localStorage`** — delete the manual theme code in
      `store.ts`; keep the OS `prefers-color-scheme` default for first load.
  - _Done when:_ reloading preserves symbol/timeframe/indicators/theme.

## Phase 5 — Performance: incremental indicators (refactoring #5)

- [x] **5.1 Rolling SMA last-value helper** in `lib/indicators.ts` (+ tests).
- [x] **5.2 Incremental RSI** carrying Wilder's avg-gain/avg-loss between ticks
      (+ tests proving parity with the full recompute).
- [x] **5.3 Wire into the live-tick path** (`useMaSeries` / `useRsiPane`) so ticks
      are O(1), not O(n).
  - _Done when:_ live tips match full-recompute values; no full recompute per tick.

## Phase 6 — Realtime robustness (refactoring #6, #7, #10-connection)

- [x] **6.1 Expose connection state** from `api/ws.ts` (connecting / open /
      reconnecting) via the stream handle or a callback.
- [x] **6.2 Harden reconnect** — add max-attempt cap and backoff jitter.
- [x] **6.3 Watchlist scaling** (refactoring #6) — switch large lists to
      `!miniTicker@arr` (filter client-side) or shard connections; document the
      practical symbol ceiling.
- [x] **6.4 Connection-status UI badge** — small "reconnecting…/offline" indicator.

## Phase 7 — Consistency & polish (refactoring #8, #9, #10-errors)

- [x] **7.1 Extract magic numbers** to named constants (pane stretch, volume scale
      margin, reconnect bounds, per-timeframe limits) — e.g. `lib/constants.ts`.
- [x] **7.2 Theme single source** (refactoring #9) — generate CSS variables and
      `chartThemes` from one TS definition to remove duplication.
- [x] **7.3 Surface ticker/watchlist errors** — small stale/offline state instead
      of swallowing failures.

## Phase 8 — CSS modularization & repo-wide size audit (cross-cutting)

- [x] **8.1 Split `index.css`** into `src/styles/` by concern: `base.css`,
      `layout.css`, `topbar.css`, `watchlist.css`, `price-header.css`,
      `chart-toolbar.css`, `indicator-menu.css`. Import from one entry (`styles/index.css`).
  - _Done when:_ no stylesheet > ~250 lines and each maps to a clear area.
- [x] **8.2 Repo-wide 600-line audit** — run `check:size`; split any offender that
      emerged during Phases 3–7.
- [x] **8.3 Enforce the guard** — run `check:size` + `lint` + `test` in a
      pre-commit hook (or CI) so regressions can't land.

---

## Out of scope (tracked elsewhere)

Feature work (crosshair legend, symbol search, MACD/Bollinger, order book, alerts,
backend proxy, deploy) lives in [`_documentation/roadmap.md`](../_documentation/roadmap.md),
not here. This plan is purely structural health.

## Proposed execution order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Phases 4–7 are largely independent and can be
reordered after the foundation (1–3) is in place.
