# 0012 — Deploy

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #12 · **Depends on:** 0011 (green CI); optionally 0014 (proxy) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Get the app live as a static site, built from `main`.

## Tasks

- [ ] **1 Pick a host** — Vercel / Netlify / GitHub Pages (decision needed).
- [ ] **2 Build config** — SPA fallback/routing, base path if Pages, output `dist`.
- [ ] **3 CI-driven deploy** — deploy on push to `main` after the gate passes
      (extend the 0011 workflow or add a deploy job).
- [ ] **4 Prod API base** — env-configurable Binance/proxy base URL; verify the
      region constraint from the chosen host's egress (may require 0014).
- [ ] **5 Smoke the live URL** — load, switch symbol, toggle an indicator.

## Key files

Host config (e.g. `vercel.json` / `netlify.toml` / Pages workflow),
`vite.config.ts` (base), `src/api/binance.ts` + `src/api/ws.ts` (env base URL),
CI workflow.

## Acceptance

A live URL serves the app, builds automatically from `main`, and loads market data.

## Notes

**Region risk:** the app uses `api.binance.us` because `api.binance.com` is 451 in
the US — confirm the host's servers/CDN region can reach the chosen endpoint. If
not, land 0014 (proxy) first and point the app at it.
