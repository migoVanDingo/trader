import { useConnection, overallStatus } from "../state/connection";

const LABELS: Record<string, string> = {
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  closed: "Disconnected",
};

/** Shows a small badge whenever any live connection isn't healthy. */
export function ConnectionBadge() {
  const status = useConnection((s) => overallStatus(s.statuses));
  if (status === "open") return null;

  return <span className={`conn-badge ${status}`}>{LABELS[status]}</span>;
}
