import { useEffect, useState } from "react";
import { fetchTickers, type SymbolQuote } from "../api/binance";
import {
  subscribeCombined,
  subscribeStream,
  type MiniTickerMessage,
  type StreamHandle,
  type SubscribeOptions,
} from "../api/ws";
import { useConnection } from "../state/connection";

export type WatchlistQuotes = Record<string, SymbolQuote>;

// Above this many symbols, a per-symbol combined stream would push the URL and
// per-connection stream limits, so we switch to the all-market !miniTicker@arr
// stream and filter client-side. (Practical combined ceiling is a few hundred;
// 50 keeps us comfortably clear while avoiding the heavy all-market firehose.)
const COMBINED_MAX = 50;

function quoteFromMini(m: MiniTickerMessage): SymbolQuote {
  const last = parseFloat(m.c);
  const open = parseFloat(m.o);
  return {
    lastPrice: last,
    changePercent: open ? ((last - open) / open) * 100 : 0,
  };
}

/**
 * Live quotes for a set of symbols. Seeds all symbols with one batch REST call,
 * then keeps them current over a single WebSocket — a combined per-symbol stream
 * for small lists, or the all-market stream (filtered) for large ones.
 */
export function useWatchlist(symbols: string[]): WatchlistQuotes {
  const [quotes, setQuotes] = useState<WatchlistQuotes>({});

  // Re-run only when the set of symbols actually changes.
  const key = symbols.join(",");

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes({});
      return;
    }
    let cancelled = false;

    const seed = () => {
      fetchTickers(symbols)
        .then((q) => {
          if (!cancelled) setQuotes(q);
        })
        .catch(() => {
          /* WS will populate shortly */
        });
    };

    seed();

    const opts: SubscribeOptions = {
      onReconnect: () => seed(),
      onStatus: (s) => useConnection.getState().setStatus("watchlist", s),
    };

    let handle: StreamHandle;
    if (symbols.length > COMBINED_MAX) {
      const wanted = new Set(symbols);
      handle = subscribeStream(
        "!miniTicker@arr",
        (data) => {
          if (!Array.isArray(data) || cancelled) return;
          setQuotes((prev) => {
            const next = { ...prev };
            for (const raw of data as MiniTickerMessage[]) {
              if (wanted.has(raw.s)) next[raw.s] = quoteFromMini(raw);
            }
            return next;
          });
        },
        opts,
      );
    } else {
      const streams = symbols.map((s) => `${s.toLowerCase()}@miniTicker`);
      handle = subscribeCombined(
        streams,
        (data) => {
          const m = data as MiniTickerMessage;
          if (m.e !== "24hrMiniTicker" || cancelled) return;
          setQuotes((prev) => ({ ...prev, [m.s]: quoteFromMini(m) }));
        },
        opts,
      );
    }

    return () => {
      cancelled = true;
      handle.close();
      useConnection.getState().clear("watchlist");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return quotes;
}
