// Single source of truth for all theme colors. The chrome tokens are emitted as
// CSS custom properties (see themeStyleSheet, injected in main.tsx) and the chart
// tokens are exposed as `chartThemes` for Lightweight Charts, which renders to
// <canvas> and can't read CSS variables.

export type ThemeName = "light" | "dark";

interface ThemeTokens {
  // App chrome → CSS variables
  bg: string;
  bgElevated: string;
  bgInput: string;
  border: string;
  text: string;
  textDim: string;
  accent: string;
  pos: string;
  neg: string;
  activeBg: string;
  // Chart canvas → chartThemes
  chartBg: string;
  chartText: string;
  chartGrid: string;
  chartBorder: string;
  up: string;
  down: string;
  volumeUp: string;
  volumeDown: string;
}

const tokens: Record<ThemeName, ThemeTokens> = {
  dark: {
    bg: "#0e1117",
    bgElevated: "#151a23",
    bgInput: "#1c2230",
    border: "#2a3245",
    text: "#e6e9ef",
    textDim: "#8b93a4",
    accent: "#3b82f6",
    pos: "#26a69a",
    neg: "#ef5350",
    activeBg: "#2a3245",
    chartBg: "#0e1117",
    chartText: "#b3b9c5",
    chartGrid: "#1c2230",
    chartBorder: "#2a3245",
    up: "#26a69a",
    down: "#ef5350",
    volumeUp: "rgba(38, 166, 154, 0.5)",
    volumeDown: "rgba(239, 83, 80, 0.5)",
  },
  light: {
    bg: "#f7f8fa",
    bgElevated: "#ffffff",
    bgInput: "#ffffff",
    border: "#d7dce5",
    text: "#1a1f2b",
    textDim: "#6b7383",
    accent: "#2563eb",
    pos: "#089981",
    neg: "#e23645",
    activeBg: "#eaeef5",
    chartBg: "#ffffff",
    chartText: "#3a4151",
    chartGrid: "#eceff4",
    chartBorder: "#d7dce5",
    up: "#089981",
    down: "#e23645",
    volumeUp: "rgba(8, 153, 129, 0.5)",
    volumeDown: "rgba(226, 54, 69, 0.5)",
  },
};

export interface ChartTheme {
  background: string;
  textColor: string;
  gridColor: string;
  borderColor: string;
  upColor: string;
  downColor: string;
  volumeUp: string;
  volumeDown: string;
}

function toChartTheme(t: ThemeTokens): ChartTheme {
  return {
    background: t.chartBg,
    textColor: t.chartText,
    gridColor: t.chartGrid,
    borderColor: t.chartBorder,
    upColor: t.up,
    downColor: t.down,
    volumeUp: t.volumeUp,
    volumeDown: t.volumeDown,
  };
}

export const chartThemes: Record<ThemeName, ChartTheme> = {
  dark: toChartTheme(tokens.dark),
  light: toChartTheme(tokens.light),
};

// Chrome token → CSS variable name.
const CSS_VARS: [keyof ThemeTokens, string][] = [
  ["bg", "--bg"],
  ["bgElevated", "--bg-elevated"],
  ["bgInput", "--bg-input"],
  ["border", "--border"],
  ["text", "--text"],
  ["textDim", "--text-dim"],
  ["accent", "--accent"],
  ["pos", "--pos"],
  ["neg", "--neg"],
  ["activeBg", "--active-bg"],
];

function varsBlock(t: ThemeTokens): string {
  return CSS_VARS.map(([key, name]) => `  ${name}: ${t[key]};`).join("\n");
}

/** CSS that defines the chrome variables per theme (injected once at startup). */
export function themeStyleSheet(): string {
  return [
    `:root,\n[data-theme="dark"] {\n${varsBlock(tokens.dark)}\n}`,
    `[data-theme="light"] {\n${varsBlock(tokens.light)}\n}`,
  ].join("\n");
}
