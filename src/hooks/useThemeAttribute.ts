import { useEffect } from "react";
import type { ThemeName } from "../theme";

/** Reflect the active theme on <html data-theme> so CSS variables switch. */
export function useThemeAttribute(theme: ThemeName) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}
