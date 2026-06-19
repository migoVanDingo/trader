# 0011 — E2E + CI

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #11 (remainder) · **Depends on:** nothing (do before deploy) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Lock quality in before shipping: an end-to-end smoke test plus CI that runs the
full gate on every PR and push.

## Tasks

- [ ] **1 Add Playwright** — config + `test:e2e` script; dev-server reuse.
- [ ] **2 Smoke spec** — load app → switch symbol → toggle an indicator → assert
      the chart canvas renders and price header populates. Decide live data vs.
      mocked WS/REST (prefer mocked for determinism).
- [ ] **3 GitHub Actions** — `.github/workflows/ci.yml`: install → `check:size` →
      `lint` → `test` → `build` (→ `test:e2e`) on PRs and `main`.
- [ ] **4 Badge/docs** — note CI in `CLAUDE.md`.

## Key files

`playwright.config.ts` (new), `e2e/*.spec.ts` (new),
`.github/workflows/ci.yml` (new), `package.json` (scripts), `CLAUDE.md`.

## Acceptance

`npm run test:e2e` passes locally; CI is green on a PR running size/lint/unit/
build/e2e.

## Notes

Network flakiness is the main risk — mock Binance REST/WS in the e2e (Playwright
route interception) so CI doesn't depend on the live feed or the region block.
Keep e2e specs out of the Vitest glob.
