import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlertDirection } from "../lib/alerts";

export interface AlertRule {
  id: string;
  symbol: string;
  price: number;
  direction: AlertDirection;
  triggered: boolean;
}

interface AlertsState {
  alerts: AlertRule[];
  addAlert: (symbol: string, price: number, direction: AlertDirection) => void;
  removeAlert: (id: string) => void;
  markTriggered: (id: string) => void;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.round(Math.random() * 1e6).toString(36)}`;
}

export const useAlerts = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],
      addAlert: (symbol, price, direction) =>
        set((s) => ({
          alerts: [
            ...s.alerts,
            { id: newId(), symbol, price, direction, triggered: false },
          ],
        })),
      removeAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      markTriggered: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true } : a,
          ),
        })),
    }),
    { name: "trader-alerts" },
  ),
);
