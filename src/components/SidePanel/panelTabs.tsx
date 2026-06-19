import type { PanelTab } from "./SidePanel";
import { OrderBook } from "../OrderBook/OrderBook";
import { TradesTape } from "../Trades/TradesTape";
import { AlertsPanel } from "../Alerts/AlertsPanel";

/** The market side-panel tabs (Order Book | Trades | Alerts) for a symbol. */
export function marketPanelTabs(symbol: string): PanelTab[] {
  return [
    {
      id: "book",
      label: "Order Book",
      render: () => <OrderBook symbol={symbol} />,
    },
    {
      id: "trades",
      label: "Trades",
      render: () => <TradesTape symbol={symbol} />,
    },
    {
      id: "alerts",
      label: "Alerts",
      render: () => <AlertsPanel symbol={symbol} />,
    },
  ];
}
