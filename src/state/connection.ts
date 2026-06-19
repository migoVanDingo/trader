import { create } from "zustand";
import type { ConnectionStatus } from "../api/ws";

// Tracks the status of each named WebSocket connection (klines / ticker /
// watchlist) so the UI can show one combined connectivity badge.
interface ConnectionState {
  statuses: Record<string, ConnectionStatus>;
  setStatus: (key: string, status: ConnectionStatus) => void;
  clear: (key: string) => void;
}

export const useConnection = create<ConnectionState>((set) => ({
  statuses: {},
  setStatus: (key, status) =>
    set((s) => ({ statuses: { ...s.statuses, [key]: status } })),
  clear: (key) =>
    set((s) => {
      const next = { ...s.statuses };
      delete next[key];
      return { statuses: next };
    }),
}));

/** Worst-of all connections — what the badge displays. */
export function overallStatus(
  statuses: Record<string, ConnectionStatus>,
): ConnectionStatus {
  const values = Object.values(statuses);
  if (values.length === 0) return "open";
  if (values.includes("closed")) return "closed";
  if (values.includes("reconnecting")) return "reconnecting";
  if (values.includes("connecting")) return "connecting";
  return "open";
}
