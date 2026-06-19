import { useEffect, useRef } from "react";

/**
 * A ref that always holds the latest value. Useful for reading current props
 * inside an effect that should only re-run on a different dependency (e.g. the
 * live-tick effects read the latest candles without re-subscribing each render).
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
