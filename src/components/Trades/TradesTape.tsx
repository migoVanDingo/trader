import { useTrades } from "../../hooks/useTrades";
import { formatPrice, formatTime } from "../../lib/format";

function formatQty(qty: number): string {
  return qty.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function TradesTape({ symbol }: { symbol: string }) {
  const trades = useTrades(symbol);

  if (trades.length === 0) {
    return <div className="trades-empty">Waiting for trades…</div>;
  }

  return (
    <div className="trades-tape">
      <div className="trades-head">
        <span>Price</span>
        <span>Size</span>
        <span>Time</span>
      </div>
      <div className="trades-rows">
        {trades.map((t) => (
          <div
            key={t.id}
            className={`trade-row ${t.buyerMaker ? "sell" : "buy"}`}
          >
            <span className="trade-price">{formatPrice(t.price)}</span>
            <span className="trade-qty">{formatQty(t.qty)}</span>
            <span className="trade-time">{formatTime(t.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
