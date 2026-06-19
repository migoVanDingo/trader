# 0016 — Refactoring & Modularity Pass (round 2)

**Status:** ✅ Implemented (#1–4, #6, #8); #5 declined; #7 not triggered
**Date:** 2026-06-19
**Phase:** Plan

## Context

A health pass after shipping the feature roadmap (0004–0010, 0015). **Nothing is
broken and no file exceeds the 600-line cap** (largest source file is
`indicators.ts` at ~289). These are pattern-level cleanups to keep the codebase
tidy as it grows — none are urgent; skip any that feel forced.

## Size snapshot (2026-06-19)

| File                | Lines | Note                                                   |
| ------------------- | ----- | ------------------------------------------------------ |
| `lib/indicators.ts` | ~289  | Cohesive; **watch** — split if it passes ~400          |
| `api/ws.ts`         | ~174  | Fine                                                   |
| `App.tsx`           | ~150  | Orchestrator; some inline assembly could move to hooks |
| everything else     | < 130 | Healthy                                                |

---

## High payoff (clear, low-risk wins)

- [x] **1 Extract `useClickOutside` (or `usePopover`) hook.**
      `SymbolSearch` and `IndicatorMenu` both hand-roll open-state + a `mousedown`
      outside listener. Extract one hook (`useClickOutside(ref, onClose)` or a small
      `usePopover()` returning `{ open, setOpen, ref }`).
  - _Done when:_ both components use it; the duplicated effect is gone.

- [x] **2 Move `formatQty` into `lib/format.ts`.**
      Defined identically in `OrderBook` and `TradesTape`. One shared `formatQty`
      (or `formatAmount`) in `lib/format.ts` with a test.
  - _Done when:_ one definition, imported by both.

- [x] **3 Use selectors in `IndicatorMenu`.**
      It calls `useStore()` (whole-store subscribe → re-renders on any state change).
      Select only what it needs (or split the indicator slice). Small perf/pattern fix.
  - _Done when:_ no bare `useStore()` whole-store reads in components.

## Medium payoff (reduce boilerplate; weigh abstraction cost)

- [x] **4 Extract a stream-subscription helper for data hooks.**
      `useKlines / useTicker / useWatchlist / useOrderBook / useTrades` all repeat
      "reset state → subscribe → report status under a key → close + clear on
      cleanup." Extract a small `useStream(streamOrStreams, onMessage, { key, onReconnect })`
      (or a `subscribeWithStatus` wrapper) that owns the status-key + teardown.
  - _Caution:_ keep it thin — don't force every hook through it if it obscures
    their seeding logic.
  - _Done when:_ the status/cleanup boilerplate lives in one place.

- [x] **5 Consider a chart-series lifecycle helper.**
      `useBollingerBands / useVolumeMa / useRsiPane / useMacdPane` share: create on
      enable → seed on candles/theme → live tip on update → null refs on unmount.
      A `useChartSeries({ enabled, create, seed, tick, deps })` helper could absorb
      the create/destroy/unmount-null scaffolding, leaving each hook its
      series-specific bits.
  - _Caution:_ the series shapes differ (1 line / 3 lines / line+pricelines /
    histogram+2 lines). **Only do this if the helper stays genuinely simpler than
    the duplication** — otherwise leave them explicit and skip.
  - _Done when:_ either a clean helper is in use, or this is consciously declined
    with a one-line note here.
  - **DECLINED:** the four hooks differ too much (1 line / 3 lines /
    line+price-lines / histogram+2-lines, plus dynamic pane index and
    theme-recreate). A generic helper would need so many callbacks it wouldn't be
    simpler than the explicit hooks. Left as-is.

- [x] **6 Thin `App.tsx`.**
      Extract the indicator-config assembly into `useIndicatorConfig()` (a selector
      hook returning the `IndicatorConfig`), and move the side-panel `tabs` array into
      a small builder/const. Optionally a `useThemeAttribute(theme)` for the
      `document.documentElement.dataset.theme` effect.
  - _Done when:_ `App` reads as layout + a few hook calls.

## Low payoff / watch

- [ ] **7 `indicators.ts` split (only if it grows).** Not triggered — still ~310
      lines. If it crosses ~400, split into `lib/indicators/` (`movingAverages.ts`,
      `bands.ts`, `oscillators.ts`, `macd.ts`, `merge.ts`) with a barrel `index.ts`.
- [x] **8 Store toggle helpers (optional).**
      `toggleMA`/`toggleEMA` are identical array-toggle logic; `toggleX` booleans
      repeat. A tiny `toggleInArray` helper would DRY it. Minor.

## Guardrails (unchanged)

Respect the layers, keep files < 600 lines, add/extend tests for any moved pure
logic, and keep `build`/`lint`/`test` green (pre-commit enforces it).

## Suggested order

2 → 1 → 3 (quick wins) → 6 (App) → 4 (stream helper) → 5 (chart helper, only if it
pays off). 7 and 8 are watch-items, do when triggered.
