# 0013 — PWA / Installable

**Status:** Proposed
**Date:** 2026-06-19
**Roadmap:** #9 · **Depends on:** 0012 (deploy; PWA needs HTTPS) · **Index:** [0003](./0003-feature-roadmap-overview.md)

## Goal

Make the app installable with an offline app shell. Market data stays
network-only.

## Tasks

- [ ] **1 Add `vite-plugin-pwa`** — manifest (name, theme color, icons), service
      worker with app-shell precaching.
- [ ] **2 Icons** — maskable + standard sizes.
- [ ] **3 Mobile polish** — verify the responsive layout and the install prompt;
      tune the theme-color/status bar.
- [ ] **4 Verify** — Lighthouse PWA pass; shell loads offline.

## Key files

`vite.config.ts` (plugin), `public/` (icons, manifest assets),
maybe a small "update available" prompt component.

## Acceptance

The app is installable (add-to-home-screen), passes basic PWA criteria, and the
shell loads offline (data shows the offline/connection badge).

## Notes

Don't cache market data in the SW — it's real-time and would mislead. Theme color
should match the active theme where possible. Requires HTTPS, hence after deploy.
