# 0004 — Crosshair OHLC Legend

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #1 · **Depends on:** nothing · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Show O/H/L/C, change %, and volume for the candle under the cursor (and the live
candle when not hovering). The single biggest "feels real" upgrade — mostly UI.

## Tasks

- [ ] **1 `hooks/chart/useCrosshair.ts`** — subscribe to the chart's
      `subscribeCrosshairMove`; expose the hovered candle's OHLCV (or `null` when
      the cursor leaves the chart). Unsubscribe on cleanup.
- [ ] **2 `components/Chart/OhlcLegend.tsx`** — top-left overlay rendering O/H/L/C,
      Δ%, and volume; falls back to the latest candle when not hovering; colored
      up/down via theme classes.
- [ ] **3 Wire into `CandleChart`** — pass `candles` + the hovered point; render
      the legend inside `.chart-wrap`.
- [ ] **4 Styles** — add `.ohlc-legend` rules to `src/styles/chart.css`.

## Key files

`src/hooks/chart/useCrosshair.ts` (new), `src/components/Chart/OhlcLegend.tsx`
(new), `src/components/Chart/CandleChart.tsx`, `src/styles/chart.css`.

## Acceptance

Hovering any bar shows that bar's values; moving off shows the live candle;
colors track up/down; no measurable lag on hover.

## Notes

The legend needs the candle array to resolve a hovered time → OHLCV. Keep the
`useCrosshair` hook presentation-free (returns data only); formatting lives in the
component via `lib/format.ts`.
