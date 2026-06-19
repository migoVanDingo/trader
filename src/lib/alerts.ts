export type AlertDirection = "above" | "below";

/** Has `price` crossed the alert threshold in the given direction? */
export function crossed(
  direction: AlertDirection,
  target: number,
  price: number,
): boolean {
  return direction === "above" ? price >= target : price <= target;
}
