// Centralized Binance WebSocket manager. Components never touch raw sockets —
// they call subscribeStream() and get a handle back. Each stream owns one
// connection with exponential-backoff reconnect; on a *re*connect (not the
// first connect) the onReconnect callback fires so callers can re-seed REST
// data and avoid gaps from frames missed while disconnected.
//
// Using the US endpoint to match the REST host (api.binance.us / 451 elsewhere).
const WS_BASE = "wss://stream.binance.us:9443/ws";
const WS_COMBINED_BASE = "wss://stream.binance.us:9443/stream?streams=";

export interface StreamHandle {
  close: () => void;
}

export type ConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed";

export interface SubscribeOptions {
  /** Fired after a *re*connect (not the first) so callers can re-seed via REST. */
  onReconnect?: () => void;
  /** Connection lifecycle updates, for surfacing a status badge. */
  onStatus?: (status: ConnectionStatus) => void;
}

// Reconnect tuning. Exponential backoff with full jitter, capped attempts so a
// permanently-down endpoint doesn't retry forever.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;
const RECONNECT_MAX_ATTEMPTS = 10;

/** Live kline frame: `<symbol>@kline_<interval>`. */
export interface KlineMessage {
  e: "kline";
  s: string;
  k: {
    t: number; // candle open time (ms)
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean; // is this candle closed?
  };
}

/** Lightweight per-symbol frame for the watchlist: `<symbol>@miniTicker`. */
export interface MiniTickerMessage {
  e: "24hrMiniTicker";
  s: string;
  c: string; // last price
  o: string; // open price (24h ago) — change% = (c - o) / o
}

/** Live 24h rolling ticker frame: `<symbol>@ticker`. */
export interface TickerMessage {
  e: "24hrTicker";
  s: string;
  c: string; // last price
  P: string; // price change percent
  h: string; // 24h high
  l: string; // 24h low
  q: string; // quote-asset volume
}

/** Core: open a URL with auto-reconnect, routing each parsed frame to onFrame. */
function openSocket(
  url: string,
  onFrame: (data: unknown) => void,
  opts?: SubscribeOptions,
): StreamHandle {
  let ws: WebSocket | null = null;
  let closed = false;
  let hasConnected = false;
  let attempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const connect = () => {
    if (closed) return;
    opts?.onStatus?.(attempts === 0 ? "connecting" : "reconnecting");
    ws = new WebSocket(url);

    ws.onopen = () => {
      attempts = 0;
      opts?.onStatus?.("open");
      if (hasConnected) opts?.onReconnect?.();
      hasConnected = true;
    };

    ws.onmessage = (ev) => {
      try {
        onFrame(JSON.parse(ev.data));
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onerror = () => ws?.close();

    ws.onclose = () => {
      if (closed) return;
      if (attempts >= RECONNECT_MAX_ATTEMPTS) {
        opts?.onStatus?.("closed");
        return;
      }
      // Exponential backoff with full jitter (50–100% of the capped delay).
      const capped = Math.min(
        RECONNECT_BASE_MS * 2 ** attempts,
        RECONNECT_MAX_MS,
      );
      const delay = capped / 2 + Math.random() * (capped / 2);
      attempts++;
      opts?.onStatus?.("reconnecting");
      reconnectTimer = setTimeout(connect, delay);
    };
  };

  connect();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      // Detach handlers so a pending close doesn't schedule a reconnect.
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    },
  };
}

/** Subscribe to a single raw stream, e.g. "btcusdt@kline_1h". */
export function subscribeStream(
  stream: string,
  onMessage: (data: unknown) => void,
  opts?: SubscribeOptions,
): StreamHandle {
  return openSocket(`${WS_BASE}/${stream}`, onMessage, opts);
}

/**
 * Subscribe to multiple streams over one connection (used by the watchlist).
 * The combined endpoint wraps each frame as { stream, data }; we unwrap and
 * pass the inner `data` to onMessage for consistency with subscribeStream.
 */
export function subscribeCombined(
  streams: string[],
  onMessage: (data: unknown) => void,
  opts?: SubscribeOptions,
): StreamHandle {
  const url = `${WS_COMBINED_BASE}${streams.join("/")}`;
  return openSocket(
    url,
    (frame) => {
      const wrapped = frame as { stream?: string; data?: unknown };
      onMessage(wrapped.data ?? frame);
    },
    opts,
  );
}
