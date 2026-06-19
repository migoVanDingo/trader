import { useEffect, useState } from "react";
import { fetchTicker24h } from "../api/binance";
import { subscribeStream, type TickerMessage } from "../api/ws";
import { useConnection } from "../state/connection";
import type { Ticker24h } from "../types";

/**
 * REST snapshot for an instant first paint, then live 24h ticker updates over
 * WebSocket so the price header tracks the market in real time.
 */
export function useTicker(symbol: string): Ticker24h | null {
  const [ticker, setTicker] = useState<Ticker24h | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTicker(null);

    fetchTicker24h(symbol)
      .then((t) => {
        if (!cancelled) setTicker(t);
      })
      .catch(() => {
        /* WS will populate it shortly */
      });

    const handle = subscribeStream(
      `${symbol.toLowerCase()}@ticker`,
      (data) => {
        const m = data as TickerMessage;
        if (m.e !== "24hrTicker") return;
        if (!cancelled) {
          setTicker({
            lastPrice: parseFloat(m.c),
            priceChangePercent: parseFloat(m.P),
            highPrice: parseFloat(m.h),
            lowPrice: parseFloat(m.l),
            quoteVolume: parseFloat(m.q),
          });
        }
      },
      { onStatus: (s) => useConnection.getState().setStatus("ticker", s) },
    );

    return () => {
      cancelled = true;
      handle.close();
      useConnection.getState().clear("ticker");
    };
  }, [symbol]);

  return ticker;
}
