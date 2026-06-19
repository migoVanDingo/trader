# 0014 — Backend / Caching Proxy (optional)

**Status:** Proposed (optional — needs an infra decision)
**Date:** 2026-06-19
**Roadmap:** #10 · **Depends on:** nothing (gates the proxy part of 0012) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

A thin server to (a) sidestep regional blocks / rate limits, (b) cache klines, and
(c) paginate history beyond the per-request `limit` for true "all-time" depth.

## Tasks

- [ ] **1 Runtime: small Node service in Docker** — containerize the backend with
      **docker compose** (backend only — the frontend stays un-containerized,
      running via Vite locally).
- [ ] **2 Proxy endpoints** — `/klines`, `/ticker`, `/exchangeInfo` with short-TTL
      caching; keep any API key server-side.
- [ ] **3 Kline pagination** — stitch multiple upstream requests for deep history.
- [ ] **4 Frontend switch** — env-configurable API base in `src/api/*`; default to
      direct Binance.US in dev, proxy in prod.
- [ ] **5 (Optional) WS proxy** — only if the host's egress can't reach Binance WS
      directly; otherwise keep WS client-side.

## Key files

`server/` (or `api/` serverless dir, new), `src/api/binance.ts` +
`src/api/ws.ts` (base URL via env), deploy config.

## Acceptance

The app runs through the proxy with cached klines and deeper history; secrets stay
server-side; dev still works against Binance.US directly.

## Notes

This is the one item that introduces backend infra — defer until there's a concrete
need (region/rate limits in the deploy host, or all-time history). Keep the
contract identical to the current REST shapes so `src/api` barely changes.
