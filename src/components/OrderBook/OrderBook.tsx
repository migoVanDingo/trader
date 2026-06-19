import { useOrderBook, type Level } from "../../hooks/useOrderBook";
import { formatPrice, formatAmount } from "../../lib/format";

const ROWS = 12;

interface RowProps {
  level: Level;
  cum: number;
  maxCum: number;
  side: "ask" | "bid";
}

function Row({ level, cum, maxCum, side }: RowProps) {
  const width = `${(cum / maxCum) * 100}%`;
  return (
    <div className={`ob-row ${side}`}>
      <span className="ob-depth" style={{ width }} />
      <span className="ob-price">{formatPrice(level.price)}</span>
      <span className="ob-qty">{formatAmount(level.qty)}</span>
    </div>
  );
}

export function OrderBook({ symbol }: { symbol: string }) {
  const { bids, asks } = useOrderBook(symbol);

  if (asks.length === 0 && bids.length === 0) {
    return <div className="ob-empty">Loading order book…</div>;
  }

  const topAsks = asks.slice(0, ROWS); // lowest first
  const topBids = bids.slice(0, ROWS); // highest first

  let c = 0;
  const askCum = topAsks.map((l) => (c += l.qty));
  c = 0;
  const bidCum = topBids.map((l) => (c += l.qty));
  const maxCum = Math.max(
    askCum[askCum.length - 1] ?? 0,
    bidCum[bidCum.length - 1] ?? 0,
    1,
  );

  const bestAsk = topAsks[0]?.price ?? 0;
  const bestBid = topBids[0]?.price ?? 0;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;
  const spreadPct = bestAsk ? (spread / bestAsk) * 100 : 0;

  return (
    <div className="order-book">
      <div className="ob-side asks">
        {/* lowest ask nearest the spread → render reversed */}
        {topAsks
          .map((level, i) => ({ level, cum: askCum[i] }))
          .reverse()
          .map(({ level, cum }) => (
            <Row
              key={level.price}
              level={level}
              cum={cum}
              maxCum={maxCum}
              side="ask"
            />
          ))}
      </div>

      <div className="ob-spread">
        <span>{formatPrice(spread)}</span>
        <span className="ob-spread-pct">{spreadPct.toFixed(3)}%</span>
      </div>

      <div className="ob-side bids">
        {topBids.map((level, i) => (
          <Row
            key={level.price}
            level={level}
            cum={bidCum[i]}
            maxCum={maxCum}
            side="bid"
          />
        ))}
      </div>
    </div>
  );
}
