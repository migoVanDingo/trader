# 0017 — Trading Data Platform — Design

**Status:** Design (awaiting review) — **build deferred until bbv2 is steady**
**Date:** 2026-06-19
**Phase:** Design

## Goal

Turn the trader app into the front end of a **research data platform**: collect
crypto market data + news features, time-align and label them, and produce a
clean dataset for ML research (swing horizon, hours–days). **Primary goal is the
dataset + learning to build/evaluate a model honestly** — a monetizable edge is
upside, not the bar for success.

Decisions locked (see discussion): **crypto-first**, **swing horizon (hours–
days)**, **Python backend**, **data platform before any trading**.

## Scope & non-goals

- **In:** historical + live OHLCV collection; news features (from bbv2); a
  time-aligned, labeled dataset; a dashboard view of signals/data.
- **Out (for now):** live trading, tick/order-book microstructure data, equities/
  forex (added later behind the same `api/` boundary), the arbitrage bot
  (separate track).

## Architecture

```
              trader/ (this repo)
┌──────────────────────────┐      ┌──────────────────────────────┐
│ React dashboard (Vite)    │◄────►│ backend/ (Python, docker)     │
│ — charts + signal views   │ API  │  collectors/ klines (REST+WS) │──► market db (OHLCV)
└──────────────────────────┘      │  features/ technical + news   │──◄ bbv2 API (service acct)
                                   │  dataset/ align + label       │──► dataset.parquet
                                   └──────────────────────────────┘
        Blackwell box (batch): rsync dataset → train/eval → export model + metrics
```

- **`backend/`** is a Python service in **docker-compose** (frontend stays on
  Vite, not containerized — per project convention).
- **bbv2 is an external dependency.** Trader is a **read-only consumer** of bbv2
  via a service-account API token, subscribed to `crypto` / `markets` /
  `geopolitics` topics. Trader does *trading-specific* feature extraction; bbv2
  stays a generic news platform.

## Components

1. **Kline collector** — backfill historical OHLCV (paginated Binance REST) for
   tracked symbols at a **1m base** timeframe, then append live; resample up
   (5m/1h/…) as needed. *This is the "start accumulating now" piece — but
   deferred until bbv2 is steady.*
2. **Feature builders** —
   - *technical:* returns, volatility, the indicators we already compute (SMA/EMA/
     RSI/MACD/Bollinger) over closed bars.
   - *news:* pull bbv2 items for subscribed topics; aggregate per time window into
     counts, sentiment, and event tags (macro / regulation / war / politics).
     Strictly **published-before-t** only (no lookahead).
3. **Dataset builder** — join market bars + news features on time and attach the
   **label**: forward return over horizon **H = 24h**, classed up `>+1%` /
   down `<−1%` / flat (deadband). All configurable. Export Parquet.

## Storage & compute

- **Volume is small** for swing OHLCV + news: OHLCV 1m × ~10 symbols ≈ a few
  hundred MB/yr; news ≈ tens of GB/yr. Lives easily on the **home server (3.5TB)**.
  **Do not collect tick/order-book data** (that's the only TB-scale path; not
  needed for swing).
- **Storage:** SQLite to start (mirrors briefbot); Postgres/TimescaleDB if/when
  multiple services contend. Parquet for the exported ML dataset.
- **Compute topology:** home **server** = always-on collectors + DB + API;
  **MacBook** = dev; **Blackwell box** = batch train/eval (rsync dataset → run →
  export artifacts); **GCS** = backup + cloud-training handoff (deferred); cloud
  GPUs = overflow (deferred).
- **Modeling starts CPU-only / classical** (LightGBM/XGBoost on tabular features);
  GPU only when we reach sequence models.

## Honesty instrumentation (non-negotiable)

Walk-forward validation (no lookahead), fees + slippage in every backtest, and
paper trading before any real capital. The win condition is *"we understand
whether an edge exists and why,"* not a P&L number.

## Phased build order (later)

1. Kline collector + market DB (accumulate data).
2. bbv2 consumer client (auth, pull items by topic since t).
3. Technical + news feature builders.
4. Dataset/label builder → Parquet.
5. Baseline model + walk-forward backtest (Blackwell).
6. Dashboard signal view.

## Dependency

Blocked on **bbv2** reaching a steady state (topics → sources → ingestion →
consumer API). See the bbv2 repo's `_plans`. Per current direction we **build
bbv2 first**, then return here starting with the kline collector.
