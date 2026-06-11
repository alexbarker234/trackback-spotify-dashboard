import { GRID_MIN_WIDTH } from "../stat/constants";
import type { WidgetSizing } from "../stat/types";
import {
  LIFETIME_CARD_INNER_GAP,
  LIFETIME_CARD_INNER_GAP_COMPACT,
  LIFETIME_CARD_PADDING,
  LIFETIME_CARD_PADDING_COMPACT,
  LIFETIME_GRID_GAP,
  LIFETIME_GRID_GAP_COMPACT,
  LIFETIME_LABEL_FONT_DEFAULT,
  LIFETIME_LABEL_FONT_TINY,
  LIFETIME_LABEL_FONT_WIDE,
  LIFETIME_VALUE_FONT_MEDIUM,
  LIFETIME_VALUE_FONT_NARROW,
  LIFETIME_VALUE_FONT_TINY,
  LIFETIME_VALUE_FONT_WIDE,
  LIFETIME_WIDE_GRID_MIN_WIDTH,
  NARROW_TITLE_FONT_SIZE,
  NARROW_WIDGET_MAX_WIDTH,
} from "./constants";
import { getLifetimeLayout } from "./layout-mode";

function getLifetimeCardLabelFontSize(
  width: number,
  tiny: boolean,
): number {
  if (tiny) {
    return LIFETIME_LABEL_FONT_TINY;
  }

  if (width > LIFETIME_WIDE_GRID_MIN_WIDTH) {
    return LIFETIME_LABEL_FONT_WIDE;
  }

  return LIFETIME_LABEL_FONT_DEFAULT;
}

function getLifetimeSingleValueFontSize(
  width: number,
  height?: number,
  tiny?: boolean,
): number {
  if (tiny ?? false) {
    return LIFETIME_VALUE_FONT_TINY;
  }

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
  const { compact, tiny } = getLifetimeLayout(width, height);
  const singleValueFontSize = getLifetimeSingleValueFontSize(widgetWidth, height, tiny);
  const cardLabelFontSize = getLifetimeCardLabelFontSize(widgetWidth, tiny);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    primaryValueFontSize: singleValueFontSize,
    secondaryValueFontSize: singleValueFontSize - 2,
    singleValueFontSize,
    valueMaxLines: 1,
    gridGap: compact ? LIFETIME_GRID_GAP_COMPACT : LIFETIME_GRID_GAP,
    cardPadding: compact ? LIFETIME_CARD_PADDING_COMPACT : LIFETIME_CARD_PADDING,
    cardInnerGap: compact ? LIFETIME_CARD_INNER_GAP_COMPACT : LIFETIME_CARD_INNER_GAP,
    cardLabelFontSize,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    maxImageWidth: 0,
    stackedHeader,
  };
}
