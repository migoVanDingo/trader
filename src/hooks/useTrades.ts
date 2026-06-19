import { useEffect, useState } from "react";
import { subscribeStream, type AggTradeMessage } from "../api/ws";
import { useConnection } from "../state/connection";

export interface Trade {
  id: number;
  price: number;
  qty: number;
  time: number; // ms
  buyerMaker: boolean; // true → sell-side (red), false → buy-side (green)
}

const MAX_TRADES = 60;

/** Live recent-trades tape via the `<symbol>@aggTrade` stream (capped list). */
export function useTrades(symbol: string): Trade[] {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    let cancelled = false;
    setTrades([]);

    const handle = subscribeStream(
      `${symbol.toLowerCase()}@aggTrade`,
      (data) => {
        const m = data as AggTradeMessage;
        if (m.e !== "aggTrade" || cancelled) return;
        const trade: Trade = {
          id: m.a,
          price: parseFloat(m.p),
          qty: parseFloat(m.q),
          time: m.T,
          buyerMaker: m.m,
        };
        setTrades((prev) => [trade, ...prev].slice(0, MAX_TRADES));
      },
      { onStatus: (s) => useConnection.getState().setStatus("trades", s) },
    );

    return () => {
      cancelled = true;
      handle.close();
      useConnection.getState().clear("trades");
    };
  }, [symbol]);

  return trades;
}
