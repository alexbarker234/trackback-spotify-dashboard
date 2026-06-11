import { lerp } from "@/lib/lerp";

import {
  CARD_LABEL_FONT_MAX,
  CARD_LABEL_FONT_MIN,
  FONT_SCALE_MAX_WIDTH,
  FONT_SCALE_MIN_WIDTH,
  GRID_GAP,
  INLINE_IMAGE_MAX_WIDTH,
  INLINE_IMAGE_MIN_WIDTH,
  INLINE_IMAGE_SCALE_MAX_WIDTH,
  INLINE_IMAGE_SCALE_MIN_WIDTH,
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

function valueForScale(
  min: number,
  max: number,
  widgetWidth: number,
  scaleMinWidth: number,
  scaleMaxWidth: number,
) {
  const t = clamp((widgetWidth - scaleMinWidth) / (scaleMaxWidth - scaleMinWidth), 0, 1);
  return Math.round(lerp(min, max, t));
}

function fontSizeForWidth(min: number, max: number, widgetWidth: number) {
  return valueForScale(min, max, widgetWidth, FONT_SCALE_MIN_WIDTH, FONT_SCALE_MAX_WIDTH);
}

// Oh my lordy lordy lord this is a mess
export function getWidgetSizing(width?: number, height?: number): WidgetSizing {
  const widgetWidth = width ?? 320;

  var primaryValueFontSize = fontSizeForWidth(PRIMARY_VALUE_FONT_MIN, PRIMARY_VALUE_FONT_MAX, widgetWidth);
  var secondaryValueFontSize = fontSizeForWidth(SECONDARY_VALUE_FONT_MIN, SECONDARY_VALUE_FONT_MAX, widgetWidth);
  if (height && height < 450) {
    primaryValueFontSize = Math.min(primaryValueFontSize, valueForScale(8, 12, height, 200, 450));
    secondaryValueFontSize = Math.min(secondaryValueFontSize, valueForScale(10, 12, height, 200, 450));
  }

  var singleValueFontSize = fontSizeForWidth(SINGLE_VALUE_FONT_MIN, SINGLE_VALUE_FONT_MAX, widgetWidth);
  // Larger font for thin but tall widgets
  if (height && height > 400) {
    singleValueFontSize = valueForScale(SINGLE_VALUE_FONT_MIN, 34, height, 400, 500);
  }

  var maxImageWidth = valueForScale(
    INLINE_IMAGE_MIN_WIDTH,
    INLINE_IMAGE_MAX_WIDTH,
    widgetWidth,
    INLINE_IMAGE_SCALE_MIN_WIDTH,
    INLINE_IMAGE_SCALE_MAX_WIDTH,
  );
  if (height && height < 450) {
    maxImageWidth = valueForScale(20, 30, height, 200, 450);
  }
  const cardLabelFontSize = fontSizeForWidth(CARD_LABEL_FONT_MIN, CARD_LABEL_FONT_MAX, widgetWidth);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    primaryValueFontSize,
    secondaryValueFontSize,
    singleValueFontSize,
    valueMaxLines: 2,
    gridGap: GRID_GAP,
    cardPadding: 10,
    cardInnerGap: 6,
    cardLabelFontSize,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    maxImageWidth,
    stackedHeader,
  };
}
