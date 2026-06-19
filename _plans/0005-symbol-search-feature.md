# 0005 — Symbol Search & Dynamic Markets

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #3 · **Depends on:** nothing (unblocks 0015 precision) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Replace the 10 hard-coded coins with search over all tradable USDT pairs, plus a
persisted "favorites" set that drives the watchlist.

## Tasks

- [ ] **1 `api/binance.ts: fetchExchangeInfo()`** — return tradable USDT pairs
      (status `TRADING`) with `tickSize`/`stepSize` for later precision use.
- [ ] **2 `hooks/useMarkets.ts`** — load + module-level cache of exchangeInfo
      (refresh rarely); expose the searchable list.
- [ ] **3 Favorites in the store** — `favorites: string[]` (persisted; seeded with
      today's default list) + `addFavorite` / `removeFavorite` / `isFavorite`.
- [ ] **4 `components/SymbolSearch.tsx`** — combobox/modal filtering all pairs;
      keyboard-navigable; selecting sets the active symbol; a star toggles favorite.
- [ ] **5 Watchlist from favorites** — source `Watchlist` from `favorites` instead
      of `WATCHLIST_SYMBOLS`; add/remove reflects live.

## Key files

`src/api/binance.ts`, `src/hooks/useMarkets.ts` (new),
`src/components/SymbolSearch.tsx` (new), `src/state/store.ts`,
`src/lib/symbols.ts` (defaults), `src/components/Watchlist/Watchlist.tsx`.

## Acceptance

Any USDT pair is searchable and loads a chart; favorites persist across reloads
and populate the watchlist; the watchlist still seeds + streams correctly.

## Notes

Keep the default list in `lib/symbols.ts` as the favorites seed. exchangeInfo is
large — fetch once and cache. Watchlist scaling (`!miniTicker@arr` past 50) from
0002 already handles big favorite sets.
