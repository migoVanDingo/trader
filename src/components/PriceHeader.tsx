import type { Ticker24h } from "../types";
import { formatPrice, formatPercent, formatCompact } from "../lib/format";
import { baseAsset } from "../lib/symbols";

interface Props {
  symbol: string;
  ticker: Ticker24h | null;
}

export function PriceHeader({ symbol, ticker }: Props) {
  const up = (ticker?.priceChangePercent ?? 0) >= 0;

  return (
    <div className="price-header">
      <div className="price-symbol">
        <span className="price-base">{baseAsset(symbol)}</span>
        <span className="price-quote">/ USDT</span>
      </div>

      <div className="price-main">
        <span className="price-last">
          {ticker ? formatPrice(ticker.lastPrice) : "—"}
        </span>
        <span className={`price-change ${up ? "pos" : "neg"}`}>
          {ticker ? formatPercent(ticker.priceChangePercent) : ""}
        </span>
      </div>

      <div className="price-stats">
        <Stat
          label="24h High"
          value={ticker ? formatPrice(ticker.highPrice) : "—"}
        />
        <Stat
          label="24h Low"
          value={ticker ? formatPrice(ticker.lowPrice) : "—"}
        />
        <Stat
          label="24h Volume"
          value={ticker ? formatCompact(ticker.quoteVolume) : "—"}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
