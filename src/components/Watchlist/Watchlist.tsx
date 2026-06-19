import { useWatchlist } from "../../hooks/useWatchlist";
import { useSparklines } from "../../hooks/useSparklines";
import { baseAsset } from "../../lib/symbols";
import { formatPrice, formatPercent } from "../../lib/format";
import { Sparkline } from "./Sparkline";

interface Props {
  symbols: string[];
  active: string;
  onSelect: (symbol: string) => void;
}

export function Watchlist({ symbols, active, onSelect }: Props) {
  const quotes = useWatchlist(symbols);
  const sparklines = useSparklines(symbols);

  return (
    <aside className="watchlist">
      <div className="watchlist-head">Markets</div>
      <ul className="watchlist-rows">
        {symbols.map((symbol) => {
          const q = quotes[symbol];
          const up = (q?.changePercent ?? 0) >= 0;
          return (
            <li key={symbol}>
              <button
                className={`watch-row${symbol === active ? " active" : ""}`}
                onClick={() => onSelect(symbol)}
                aria-pressed={symbol === active}
              >
                <span className="watch-sym">{baseAsset(symbol)}</span>
                <span className="watch-price">
                  {q ? formatPrice(q.lastPrice) : "—"}
                </span>
                <span className="watch-spark">
                  <Sparkline values={sparklines[symbol]} />
                </span>
                <span className={`watch-chg ${up ? "pos" : "neg"}`}>
                  {q ? formatPercent(q.changePercent) : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
