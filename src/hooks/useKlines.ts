import { useEffect, useState } from "react";
import type { UTCTimestamp } from "lightweight-charts";
import { fetchKlines } from "../api/binance";
import { subscribeStream, type KlineMessage } from "../api/ws";
import { useConnection } from "../state/connection";
import type { Candle, Interval } from "../types";

interface KlinesState {
  candles: Candle[];
  loading: boolean;
  error: string | null;
}

interface UseKlines extends KlinesState {
  /** Latest live candle from the WebSocket; applied incrementally by the chart. */
  lastUpdate: Candle | null;
}

/**
 * REST seed + live WebSocket merge. On symbol/interval change we fetch the
 * historical candles (the `candles` array) and open a kline stream. Each live
 * frame is surfaced via `lastUpdate` so the chart can call series.update()
 * incrementally rather than re-setting the whole dataset on every tick.
 */
export function useKlines(
  symbol: string,
  interval: Interval,
  limit: number,
): UseKlines {
  const [state, setState] = useState<KlinesState>({
    candles: [],
    loading: true,
    error: null,
  });
  const [lastUpdate, setLastUpdate] = useState<Candle | null>(null);

  useEffect(() => {
    let cancelled = false;

    const seed = () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      return fetchKlines(symbol, interval, limit)
        .then((candles) => {
          if (!cancelled) setState({ candles, loading: false, error: null });
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setState({
              candles: [],
              loading: false,
              error:
                err instanceof Error ? err.message : "Failed to load candles",
            });
          }
        });
    };

    setLastUpdate(null);
    seed();

    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    const handle = subscribeStream(
      stream,
      (data) => {
        const msg = data as KlineMessage;
        if (msg.e !== "kline" || !msg.k) return;
        const k = msg.k;
        if (!cancelled) {
          setLastUpdate({
            time: (k.t / 1000) as UTCTimestamp,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
          });
        }
      },
      {
        // Re-seed after a dropped connection to fill any gap.
        onReconnect: () => seed(),
        onStatus: (s) => useConnection.getState().setStatus("klines", s),
      },
    );

    return () => {
      cancelled = true;
      handle.close();
      useConnection.getState().clear("klines");
    };
  }, [symbol, interval, limit]);

  return { ...state, lastUpdate };
}
