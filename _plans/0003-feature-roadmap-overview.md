# 0003 — Feature Roadmap Overview (index)

**Status:** Proposed (awaiting review)
**Date:** 2026-06-19
**Source:** [`_documentation/roadmap.md`](../_documentation/roadmap.md)

The roadmap, broken into one focused plan per feature, listed in the order I'd
implement them. Each phase is self-contained and independently shippable; the
numbering encodes the sequence.

## Already shipped (plan 0002 — not re-planned)

- Persist user preferences · Connection-status badge · Unit/RTL tests ·
  `CandleChart` hook extraction.

## Current working mode (local-only)

Running locally for now: **commit straight to `main`** (no PRs), **no CI/deploy**.
Phases **0011 (CI)**, **0012 (deploy)**, and **0013 (PWA)** are **deferred** — kept
on the list for later. When the backend (**0014**) is built it runs in **docker
compose** (backend only; frontend stays on Vite). Active build order:
**0004 → 0005 → 0006 → 0007 → 0008 → 0009 → 0010 → 0015**.

## Phases in implementation order

| #    | Plan                                                                       | Why here                                            |
| ---- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| 0004 | [Crosshair OHLC legend](./0004-crosshair-legend-feature.md)                | Quick, high-impact, pure UI on the existing chart.  |
| 0005 | [Symbol search & dynamic markets](./0005-symbol-search-feature.md)         | Unlocks all pairs; provides exchangeInfo for later. |
| 0006 | [More indicators (EMA/Bollinger/VolMA/MACD)](./0006-indicators-feature.md) | Builds on the proven indicator + pane pattern.      |
| 0007 | [Order book panel](./0007-order-book-feature.md)                           | Adds the reusable side-panel container.             |
| 0008 | [Recent trades tape](./0008-trades-tape-feature.md)                        | Reuses the Phase 0007 panel.                        |
| 0009 | [Watchlist sparklines](./0009-watchlist-sparklines-feature.md)             | Self-contained watchlist polish.                    |
| 0010 | [Price alerts](./0010-price-alerts-feature.md)                             | Rules store + Notifications.                        |
| 0011 | [E2E + CI](./0011-ci-e2e-feature.md)                                       | Lock quality in before shipping.                    |
| 0012 | [Deploy](./0012-deploy-feature.md)                                         | Get it live (static).                               |
| 0013 | [PWA / installable](./0013-pwa-feature.md)                                 | Installability once it's deployed.                  |
| 0014 | [Backend / caching proxy](./0014-backend-proxy-feature.md)                 | Optional, larger; needs an infra decision.          |
| 0015 | [Polish backlog](./0015-polish-backlog-feature.md)                         | Shortcuts, precision, a11y, drawing tools.          |

## Ordering rationale

1. **Legend → Search** front-load the highest value-per-effort and unlock the
   market early; `exchangeInfo` from 0005 is reused by 0015 (precision).
2. **Indicators → Order book → Trades** deepen the trading UI; 0007 builds the
   side-panel that 0008 reuses.
3. **Sparklines → Alerts** round out engagement features.
4. **CI → Deploy** lock quality, then ship; **PWA** follows deploy.
5. **Backend proxy** is optional (infra decision) and only gates the proxy part of
   deploy; **Polish** is continuous and scheduled last.

## Standing rules (all phases)

Respect the layers (`api`/`hooks`/`lib`/`state`/`components`), keep every file
under 600 lines, add tests for new `lib/` math, and keep
`build`/`lint`/`test` green (enforced by the pre-commit gate).
