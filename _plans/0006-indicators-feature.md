# 0006 — More Indicators (EMA / Bollinger / Volume MA / MACD)

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #4 · **Depends on:** nothing (uses 0002 hook/pane pattern) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Add the next common indicators. Each follows the established pattern: pure math in
`lib/indicators.ts` (+ tests) → store toggle → menu entry → a rendering hook.

## Tasks

- [ ] **1 EMA overlay** — reuse `ema()`; generalize the MA hook (or add
      `useEmaSeries`) so EMA periods render like SMA. Store toggles + menu.
- [ ] **2 Bollinger Bands** — `bollinger()` (SMA ± k·σ) in `lib/indicators.ts`;
      three overlay line series via `hooks/chart/useBollingerBands.ts`. Tests.
- [ ] **3 Volume MA** — a moving-average line over volume (nearly free with `sma`).
- [ ] **4 MACD** — `macd()` (EMA12−EMA26, signal EMA9, histogram) +
      `hooks/chart/useMacdPane.ts` in **pane index 2**. Tests. Centralize pane
      stretch factors so price/RSI/MACD share sensible heights.
- [ ] **5 Indicator registry (if needed)** — if the menu/store grow unwieldy,
      define indicators declaratively and render the menu from the list.

## Key files

`src/lib/indicators.ts` (+ `indicators.test.ts`), `src/hooks/chart/*` (new hooks),
`src/components/Chart/IndicatorMenu.tsx`, `src/state/store.ts`,
`src/lib/chartConstants.ts` (pane stretch).

## Acceptance

Each indicator toggles independently, updates on live ticks, and its math is unit-
tested (including incremental tips where applicable). No file exceeds 600 lines.

## Notes

MACD reuses the multi-pane path RSI proved. Watch the growing pane count — keep
stretch factors in `chartConstants.ts`. If the menu balloons, do task 5 to keep it
tidy rather than hard-coding every toggle.
