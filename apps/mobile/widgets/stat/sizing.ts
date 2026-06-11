import { lerp } from "@/lib/lerp";

import {
  FONT_SCALE_MAX_WIDTH,
  FONT_SCALE_MIN_WIDTH,
  GRID_GAP,
  NARROW_TITLE_FONT_SIZE,
  NARROW_WIDGET_MAX_WIDTH,
  PRIMARY_VALUE_FONT_MAX,
  PRIMARY_VALUE_FONT_MIN,
  SECONDARY_VALUE_FONT_MAX,
  SECONDARY_VALUE_FONT_MIN,
  SINGLE_VALUE_FONT_MAX,
  SINGLE_VALUE_FONT_MIN,
} from "./constants";
import type { WidgetSizing } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fontSizeForWidth(min: number, max: number, widgetWidth: number) {
  const t = clamp(
    (widgetWidth - FONT_SCALE_MIN_WIDTH) / (FONT_SCALE_MAX_WIDTH - FONT_SCALE_MIN_WIDTH),
    0,
    1,
  );
  return Math.round(lerp(min, max, t));
}

export function getWidgetSizing(width?: number, height?: number): WidgetSizing {
  const widgetWidth = width ?? 320;

  const primaryValueFontSize = fontSizeForWidth(PRIMARY_VALUE_FONT_MIN, PRIMARY_VALUE_FONT_MAX, widgetWidth);
  const secondaryValueFontSize = fontSizeForWidth(
    SECONDARY_VALUE_FONT_MIN,
    SECONDARY_VALUE_FONT_MAX,
    widgetWidth,
  );
  const singleValueFontSize = fontSizeForWidth(SINGLE_VALUE_FONT_MIN, SINGLE_VALUE_FONT_MAX, widgetWidth);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    primaryValueFontSize,
    secondaryValueFontSize,
    singleValueFontSize,
    valueMaxLines: 2,
    gridGap: GRID_GAP,
    cardPadding: 10,
    cardInnerGap: 6,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    stackedHeader,
  };
}
