/** Format a price with sensible precision (more decimals for small prices). */
export function formatPrice(value: number): string {
  if (!isFinite(value)) return "—";
  const decimals = value >= 1000 ? 2 : value >= 1 ? 2 : value >= 0.01 ? 4 : 8;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a signed percentage, e.g. "+1.23%" / "-0.45%". */
export function formatPercent(value: number): string {
  if (!isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** Compact large numbers, e.g. 1.2B, 345.6M, 12.3K. */
export function formatCompact(value: number): string {
  if (!isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  });
}
