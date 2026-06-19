# 0008 — Recent Trades Tape

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #6 · **Depends on:** 0007 (side-panel container) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

A live scrolling tape of recent trades for the active symbol, added as a second
tab in the side panel built in 0007.

## Tasks

- [ ] **1 `hooks/useTrades.ts`** — subscribe to `<sym>@aggTrade`; keep a capped
      rolling list (e.g. last 50, newest first); report WS status.
- [ ] **2 `components/Trades/TradesTape.tsx`** — rows of price / size / time,
      buy/sell colored (taker side); tabular-nums; auto-scroll to newest.
- [ ] **3 Add as a tab** — "Order Book | Trades" in the 0007 side panel.
- [ ] **4 Styles** — `src/styles/trades.css`, imported from `styles/index.css`.

## Key files

`src/hooks/useTrades.ts` (new), `src/components/Trades/TradesTape.tsx` (new),
the side-panel/tab component from 0007, `src/styles/trades.css` (new),
`src/state/connection.ts`.

## Acceptance

Trades stream in live; the tape caps its length (no unbounded growth); switching
tabs/symbol re-subscribes cleanly.

## Notes

Cap the list to avoid memory growth and re-render churn. Format time with
`lib/format.ts` (add a time helper if needed). Reuse the panel from 0007 — don't
fork a second container.
