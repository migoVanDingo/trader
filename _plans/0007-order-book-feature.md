# 0007 — Order Book Panel

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #5 · **Depends on:** nothing (introduces the side-panel reused by 0008) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

A live bids/asks order book for the active symbol — a classic exchange view — plus
the reusable side-panel/tab container that the trades tape (0008) will share.

## Tasks

- [ ] **1 `hooks/useOrderBook.ts`** — subscribe to `<sym>@depth20@100ms` (partial
      book; no REST seed needed). Returns `{ bids, asks }` capped to 20 levels.
- [ ] **2 `components/OrderBook/OrderBook.tsx`** — bids/asks rows with cumulative
      depth bars and the spread; buy/sell colored; tabular-nums.
- [ ] **3 Side-panel container** — a collapsible right rail (or tabbed panel)
      hosting the order book. Responsive: stack/hide on narrow screens.
- [ ] **4 Wire into `App`** + report WS status under a `connection.ts` key.
- [ ] **5 Styles** — `src/styles/order-book.css` (+ panel styles), imported from
      `styles/index.css`.

## Key files

`src/hooks/useOrderBook.ts` (new), `src/components/OrderBook/OrderBook.tsx` (new),
a side-panel component (new), `src/App.tsx`, `src/state/connection.ts`,
`src/styles/order-book.css` (new).

## Acceptance

Live depth renders and updates for the active symbol; switching symbol re-subscribes
cleanly; the panel collapses and is responsive.

## Notes

`@depth20@100ms` is the simple path (snapshot-free). If precision/L2 accuracy
matters later, switch to the diff `@depth` stream + REST snapshot seed (more code).
Build the side-panel generic so 0008 adds a tab without refactoring.
