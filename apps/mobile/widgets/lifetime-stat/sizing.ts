import { GRID_MIN_WIDTH } from "../stat/constants";
import type { WidgetSizing } from "../stat/types";
import {
  GRID_GAP,
  LIFETIME_LABEL_FONT_DEFAULT,
  LIFETIME_LABEL_FONT_WIDE,
  LIFETIME_VALUE_FONT_MEDIUM,
  LIFETIME_VALUE_FONT_NARROW,
  LIFETIME_VALUE_FONT_WIDE,
  LIFETIME_WIDE_GRID_MIN_WIDTH,
  NARROW_TITLE_FONT_SIZE,
  NARROW_WIDGET_MAX_WIDTH,
} from "./constants";

function getLifetimeCardLabelFontSize(width: number): number {
  if (width > LIFETIME_WIDE_GRID_MIN_WIDTH) {
    return LIFETIME_LABEL_FONT_WIDE;
  }

  return LIFETIME_LABEL_FONT_DEFAULT;
}

function getLifetimeSingleValueFontSize(width: number, height?: number): number {
  if (width <= GRID_MIN_WIDTH) {
    if (height && height > 450) return LIFETIME_VALUE_FONT_MEDIUM
    return LIFETIME_VALUE_FONT_NARROW;
  }

  if (width <= LIFETIME_WIDE_GRID_MIN_WIDTH) {
    return LIFETIME_VALUE_FONT_MEDIUM;
  }

  if (height && height < 230) return 18;
  return LIFETIME_VALUE_FONT_WIDE;
}

export function getLifetimeWidgetSizing(width?: number, height?: number): WidgetSizing {
  const widgetWidth = width ?? 320;
  const singleValueFontSize = getLifetimeSingleValueFontSize(widgetWidth, height);
  const cardLabelFontSize = getLifetimeCardLabelFontSize(widgetWidth);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    primaryValueFontSize: singleValueFontSize,
    secondaryValueFontSize: singleValueFontSize - 2,
    singleValueFontSize,
    valueMaxLines: 1,
    gridGap: GRID_GAP,
    cardPadding: widgetWidth <= GRID_MIN_WIDTH ? 8 : 10,
    cardInnerGap: 4,
    cardLabelFontSize,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    maxImageWidth: 0,
    stackedHeader,
  };
}
