import type { WidgetFourWeekStats } from "@/lib/types";

export type LayoutMode = "grid" | "column";

export type WidgetSizing = {
  valueFontSize: number;
  valueMaxLines: number;
  imageSize: number;
  imageCornerRadius: number;
  imageBannerWidth: number;
  imageBannerHeight: number;
  stackedImage: boolean;
  gridGap: number;
  cardPadding: number;
  cardInnerGap: number;
  titleFontSize: number;
  showSpacer: boolean;
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
