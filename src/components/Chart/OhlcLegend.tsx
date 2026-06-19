import type { HoveredCandle } from "../../hooks/chart/useCrosshair";
import { formatPrice, formatPercent, formatCompact } from "../../lib/format";

interface Props {
  candle: HoveredCandle | null;
}

/** Top-left chart overlay: O/H/L/C, intra-candle change %, and volume. */
export function OhlcLegend({ candle }: Props) {
  if (!candle) return null;
  const up = candle.close >= candle.open;
  const changePct = candle.open
    ? ((candle.close - candle.open) / candle.open) * 100
    : 0;

  return (
    <div className="ohlc-legend">
      <span>
        O <b>{formatPrice(candle.open)}</b>
      </span>
      <span>
        H <b>{formatPrice(candle.high)}</b>
      </span>
      <span>
        L <b>{formatPrice(candle.low)}</b>
      </span>
      <span>
        C <b>{formatPrice(candle.close)}</b>
      </span>
      <span className={up ? "pos" : "neg"}>{formatPercent(changePct)}</span>
      <span className="ohlc-vol">
        Vol <b>{formatCompact(candle.volume)}</b>
      </span>
    </div>
  );
}
