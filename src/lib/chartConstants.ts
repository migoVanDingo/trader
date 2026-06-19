// Chart rendering constants kept out of the hooks (no inline magic numbers).
// (Reconnect bounds live in api/ws.ts; per-timeframe limits in lib/timeframes.ts.)

/** Overlaid price scale id used for the volume histogram. */
export const VOLUME_PRICE_SCALE_ID = "volume";
/** Volume occupies the bottom 20% of the price pane. */
export const VOLUME_SCALE_MARGIN_TOP = 0.8;

/** RSI line + its own pane below the price. */
export const RSI_COLOR = "#9c6ade";
export const RSI_PANE_INDEX = 1;
export const RSI_LEVELS = [70, 30];

/** Relative heights of the price pane vs. the RSI pane. */
export const PRICE_PANE_STRETCH = 3;
export const RSI_PANE_STRETCH = 1;
