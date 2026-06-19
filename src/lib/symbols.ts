/** Trading pairs shown in the watchlist (and the default chart symbol). */
export const WATCHLIST_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "DOTUSDT",
];

/** Strip the USDT quote suffix for display, e.g. "BTCUSDT" -> "BTC". */
export function baseAsset(symbol: string): string {
  return symbol.replace(/USDT$/, "");
}
