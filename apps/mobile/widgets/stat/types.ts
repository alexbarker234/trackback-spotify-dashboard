import type { WidgetFourWeekStats } from "@/lib/types";

export type LayoutMode = "grid" | "column";

export type WidgetSizing = {
  valueFontSize: number;
  valueMaxLines: number;
  gridGap: number;
  cardPadding: number;
  cardInnerGap: number;
  titleFontSize: number;
  stackedHeader: boolean;
};

export type StatWidgetProps = {
  stats?: WidgetFourWeekStats;
  refreshedAt?: string;
  error?: string;
  loading?: boolean;
  needsLogin?: boolean;
  width?: number;
  height?: number;
};
