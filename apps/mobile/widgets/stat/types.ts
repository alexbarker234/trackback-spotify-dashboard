import type { WidgetFourWeekStats } from "@/lib/types";

export type LayoutMode = "grid" | "column";

export type WidgetSizing = {
  primaryValueFontSize: number;
  secondaryValueFontSize: number;
  singleValueFontSize: number;
  valueMaxLines: number;
  gridGap: number;
  cardPadding: number;
  cardInnerGap: number;
  cardLabelFontSize: number;
  titleFontSize: number;
  maxImageWidth: number;
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
