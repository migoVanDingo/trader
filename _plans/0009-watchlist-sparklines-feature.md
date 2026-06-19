# 0009 — Watchlist Sparklines

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #7 · **Depends on:** nothing (nicer with 0005 favorites) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

A tiny 24h trend line per watchlist row, colored by net change.

## Tasks

- [ ] **1 `lib/sparkline.ts`** — pure: `values[] → SVG path` over a normalized
      `viewBox`. Unit tests (flat, rising, single point, empty).
- [ ] **2 `hooks/useSparklines.ts`** — batch-fetch ~24h of klines per watchlist
      symbol (e.g. `1h × 24`), rate-limit aware; refresh occasionally; cache.
- [ ] **3 `components/Watchlist/Sparkline.tsx`** — inline SVG, stroke colored by
      net change (pos/neg); add to each `watch-row`.
- [ ] **4 Styles** — sparkline rules in `src/styles/watchlist.css`.

## Key files

`src/lib/sparkline.ts` (+ test, new), `src/hooks/useSparklines.ts` (new),
`src/components/Watchlist/Sparkline.tsx` (new),
`src/components/Watchlist/Watchlist.tsx`, `src/styles/watchlist.css`.

## Acceptance

Each row shows a 24h trend line colored by direction; adding/removing watchlist
symbols fetches/drops sparklines without janking the list.

## Notes

Use a hand-rolled SVG sparkline (lightweight-charts is overkill per row). Be
mindful of REST rate limits with many favorites — batch and stagger, refresh on a
slow interval, and reuse the watchlist's existing change% for the color.
