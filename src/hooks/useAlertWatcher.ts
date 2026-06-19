import { useEffect } from "react";
import { subscribeCombined, type MiniTickerMessage } from "../api/ws";
import { useAlerts } from "../state/alerts";
import { useToasts } from "../state/toasts";
import { crossed } from "../lib/alerts";
import { fireNotification } from "../lib/notify";
import { baseAsset } from "../lib/symbols";
import { formatPrice } from "../lib/format";
import { useLatestRef } from "./useLatestRef";

/**
 * Watches live prices for symbols with untriggered alerts and fires each alert
 * once when its threshold is crossed (toast + browser notification).
 */
export function useAlertWatcher() {
  const alerts = useAlerts((s) => s.alerts);
  const markTriggered = useAlerts((s) => s.markTriggered);
  const pushToast = useToasts((s) => s.push);
  const alertsRef = useLatestRef(alerts);

  // Distinct symbols that still have a pending alert.
  const symbolsKey = [
    ...new Set(alerts.filter((a) => !a.triggered).map((a) => a.symbol)),
  ]
    .sort()
    .join(",");

  useEffect(() => {
    if (!symbolsKey) return;
    const symbols = symbolsKey.split(",");
    const streams = symbols.map((s) => `${s.toLowerCase()}@miniTicker`);

    const handle = subscribeCombined(streams, (data) => {
      const m = data as MiniTickerMessage;
      if (m.e !== "24hrMiniTicker") return;
      const price = parseFloat(m.c);

      for (const a of alertsRef.current) {
        if (a.triggered || a.symbol !== m.s) continue;
        if (crossed(a.direction, a.price, price)) {
          markTriggered(a.id);
          const arrow = a.direction === "above" ? "↑" : "↓";
          const msg = `${baseAsset(a.symbol)} ${arrow} ${formatPrice(a.price)} (now ${formatPrice(price)})`;
          pushToast(msg, "alert");
          fireNotification("Price alert", msg);
        }
      }
    });

    return () => handle.close();
  }, [symbolsKey, markTriggered, pushToast, alertsRef]);
}
