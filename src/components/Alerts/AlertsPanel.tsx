import { useState } from "react";
import { useAlerts } from "../../state/alerts";
import type { AlertDirection } from "../../lib/alerts";
import {
  ensureNotificationPermission,
  notificationPermission,
} from "../../lib/notify";
import { baseAsset } from "../../lib/symbols";
import { formatPrice } from "../../lib/format";

export function AlertsPanel({ symbol }: { symbol: string }) {
  const alerts = useAlerts((s) => s.alerts);
  const addAlert = useAlerts((s) => s.addAlert);
  const removeAlert = useAlerts((s) => s.removeAlert);

  const [price, setPrice] = useState("");
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [perm, setPerm] = useState(notificationPermission());

  const submit = () => {
    const p = parseFloat(price);
    if (!isFinite(p) || p <= 0) return;
    addAlert(symbol, p, direction);
    setPrice("");
  };

  return (
    <div className="alerts-panel">
      <div className="alerts-form">
        <div className="alerts-symbol">{baseAsset(symbol)} / USDT</div>
        <div className="alerts-inputs">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as AlertDirection)}
            aria-label="Alert direction"
          >
            <option value="above">↑ above</option>
            <option value="below">↓ below</option>
          </select>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button onClick={submit}>Add</button>
        </div>
        {perm !== "granted" && perm !== "unsupported" && (
          <button
            className="alerts-perm"
            onClick={async () => {
              await ensureNotificationPermission();
              setPerm(notificationPermission());
            }}
          >
            Enable browser notifications
          </button>
        )}
      </div>

      <ul className="alerts-list">
        {alerts.length === 0 && (
          <li className="alerts-empty">No alerts yet.</li>
        )}
        {alerts.map((a) => (
          <li
            key={a.id}
            className={`alert-row${a.triggered ? " triggered" : ""}`}
          >
            <span className="alert-sym">{baseAsset(a.symbol)}</span>
            <span className="alert-cond">
              {a.direction === "above" ? "↑" : "↓"} {formatPrice(a.price)}
            </span>
            {a.triggered && <span className="alert-badge">hit</span>}
            <button
              className="alert-remove"
              onClick={() => removeAlert(a.id)}
              aria-label="Remove alert"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
