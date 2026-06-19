import { useEffect } from "react";

interface Handlers {
  /** Digit keys 1–9, 0 → timeframe by index (0-based; 0 maps to the 10th). */
  onTimeframeIndex: (index: number) => void;
  onToggleTheme: () => void;
}

function isTypingTarget(el: EventTarget | null): boolean {
  const tag = (el as HTMLElement | null)?.tagName;
  return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
}

/** Global keyboard shortcuts. Ignored while typing in a field or with modifiers. */
export function useHotkeys({ onTimeframeIndex, onToggleTheme }: Handlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      if (e.key >= "1" && e.key <= "9") {
        onTimeframeIndex(Number(e.key) - 1);
      } else if (e.key === "0") {
        onTimeframeIndex(9);
      } else if (e.key === "t" || e.key === "T") {
        onToggleTheme();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTimeframeIndex, onToggleTheme]);
}
