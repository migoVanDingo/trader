# 0015 — Polish Backlog

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** polish · **Depends on:** 12.2 needs 0005 (exchangeInfo) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Smaller quality-of-life and accessibility improvements. Each is independent — pull
them forward whenever they're worth it.

## Tasks

- [ ] **1 Keyboard shortcuts** — timeframe hotkeys, symbol quick-switch (open
      0005's search), theme toggle. Centralize in a `useHotkeys` hook.
- [ ] **2 Per-symbol price precision** — use exchangeInfo `tickSize` (from 0005)
      instead of the heuristic in `lib/format.ts`; thread precision to the chart +
      header.
- [ ] **3 Multiple quote currencies** — extend the symbol model beyond USDT (USDC,
      BTC-quoted pairs); update `baseAsset`/labels + favorites.
- [ ] **4 Accessibility pass** — focus states, ARIA on the chart toolbar/menus,
      `prefers-reduced-motion`, color-contrast check on both themes.
- [ ] **5 Drawing tools** — trend lines / horizontal levels via lightweight-charts
      v5 primitives. Largest item; schedule last.

## Key files

`src/hooks/useHotkeys.ts` (new), `src/lib/format.ts`, `src/lib/symbols.ts`,
chart hooks/components, styles. (Item 5 adds a drawing module under `hooks/chart/`.)

## Acceptance

Each shipped item works on both themes and keeps `build`/`lint`/`test` green; no
regressions to existing flows.

## Notes

These are deliberately decoupled — treat the checkboxes as a menu, not a strict
sequence. 12.2 is the only one with a hard dependency (0005). Drawing tools (5) are
substantial; consider splitting into their own plan if they grow.
