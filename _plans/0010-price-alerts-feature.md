# 0010 — Price Alerts

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #8 · **Depends on:** nothing (live prices already available) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Let the user set per-symbol price thresholds and get a browser notification when
crossed.

## Tasks

- [ ] **1 `state/alerts.ts`** — persisted rules `{ id, symbol, price, direction }`
      with add / remove / clear; (`zustand` + `persist`).
- [ ] **2 `hooks/useAlertWatcher.ts`** — evaluate rules against live prices (reuse
      the watchlist/ticker streams); fire once per crossing, then mark fired
      (de-dupe) until reset.
- [ ] **3 Notifications** — request permission on first alert; fire a browser
      `Notification` on crossing; fall back to an in-app toast if denied.
- [ ] **4 `components/Alerts/AlertsPanel.tsx`** — add / list / remove rules, with
      the active symbol prefilled.
- [ ] **5 Styles** — `src/styles/alerts.css`, imported from `styles/index.css`.

## Key files

`src/state/alerts.ts` (new), `src/hooks/useAlertWatcher.ts` (new),
`src/components/Alerts/AlertsPanel.tsx` (new), a small toast component (new),
`src/styles/alerts.css` (new).

## Acceptance

A set threshold fires exactly once when crossed (browser notification, or toast if
permission denied); rules persist across reloads; removing a rule stops it.

## Notes

Watching alerts needs live prices for _all_ alerted symbols, not just the active
one — the watchlist `miniTicker` stream covers favorites; alerts on non-favorite
symbols may need their own lightweight subscription. Keep crossing detection in a
pure, tested helper.
