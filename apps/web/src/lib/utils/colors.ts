/**
 * Central color palette for JS/TS usage (charts, exports, inline styles).
 * Prefer Tailwind classes for UI; use these for SVG/canvas/Recharts fills.
 * Keep matching CSS variables in `app/globals.css` in sync when changing brand colors.
 */
export const colors = {
  white: "#ffffff",
  black: "#000000",

  // Neutrals
  gray400: "#9CA3AF",
  gray700: "#374151",
  gray900: "#111827",

  // Brand / surfaces
  theme: "#121327",
  modal: "#1f193c",
  evolutionRow: "#312f49",

  // Accents
  purple: "#a855f7",
  purpleDark: "#9333ea",
  violet: "#8b5cf6",
  pink: "#ec4899",
  pinkLight: "#f472b6",
  pinkDark: "#db2777",
  red: "#ef4444",
  redDark: "#dc2626",
  orange: "#f97316",
  sunset: "#eb7a2d",
  amber: "#f59e0b",
  yellow: "#eab308",
  emerald: "#10b981",
  blue: "#3b82f6",
  chartDefault: "#8884d8",

  // Alpha
  white10: "rgba(255, 255, 255, 0.1)",
  white20: "rgba(255, 255, 255, 0.2)",
  black20: "rgba(0, 0, 0, 0.2)",
  pink20: "rgba(236, 72, 153, 0.2)",
  purple20: "rgba(168, 85, 247, 0.2)",
  purple30: "rgba(168, 85, 247, 0.3)",
  purple50: "rgba(168, 85, 247, 0.5)"
} as const;

export type ColorName = keyof typeof colors;

/** Shared chart axis / tick stroke */
export const chartAxis = colors.gray400;

/** Shared chart grid stroke */
export const chartGrid = colors.white10;

/** Palette for top-items pie/bubble charts */
export const topItemsChartColors: string[] = [
  colors.purple,
  colors.violet,
  colors.pink,
  colors.pinkLight,
  colors.red,
  colors.redDark,
  colors.orange,
  colors.yellow
];
