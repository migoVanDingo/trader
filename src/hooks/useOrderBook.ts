import { useEffect, useState } from "react";
import { subscribeStream } from "../api/ws";
import { statusOptions, clearStatus } from "../state/connection";

export interface Level {
  price: number;
  qty: number;
}

export interface OrderBookData {
  bids: Level[]; // highest price first
  asks: Level[]; // lowest price first
}

const EMPTY: OrderBookData = { bids: [], asks: [] };

interface RawDepth {
  bids?: [string, string][];
  asks?: [string, string][];
}

/**
 * Live order book for a symbol via the partial-book depth stream
 * (`<symbol>@depth20@100ms`) — a snapshot every 100ms, so no REST seed needed.
 */
export function useOrderBook(symbol: string): OrderBookData {
  const [book, setBook] = useState<OrderBookData>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    setBook(EMPTY);

    const handle = subscribeStream(
      `${symbol.toLowerCase()}@depth20@100ms`,
      (data) => {
        const d = data as RawDepth;
        if (!d.bids || !d.asks || cancelled) return;
        setBook({
          bids: d.bids.map(([p, q]) => ({ price: +p, qty: +q })),
          asks: d.asks.map(([p, q]) => ({ price: +p, qty: +q })),
        });
      },
      statusOptions("orderbook"),
    );

    return () => {
      cancelled = true;
      handle.close();
      clearStatus("orderbook");
    };
  }, [symbol]);

  return book;
}
