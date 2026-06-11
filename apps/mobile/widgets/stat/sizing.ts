import {
  GRID_GAP,
  NARROW_TITLE_FONT_SIZE,
  NARROW_WIDGET_MAX_WIDTH,
  SECONDARY_VALUE_FONT_MAX,
  SECONDARY_VALUE_FONT_MIN,
  VALUE_FONT_MAX,
  VALUE_FONT_MIN,
} from "./constants";
import type { WidgetSizing } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getWidgetSizing(width?: number, height?: number): WidgetSizing {
  const widgetWidth = width ?? 320;
  // ValueFontSize only starts scaling down below 230px
  var scaleBreakpoint = 230;
  const narrowScale = clamp(widgetWidth / scaleBreakpoint, 0.7, 1); // 1 at 230px, 0.7 at ~161px
  let valueFontSize: number;
  let secondaryValueFontSize: number;
  if (widgetWidth >= scaleBreakpoint) {
    valueFontSize = VALUE_FONT_MAX;
    secondaryValueFontSize = SECONDARY_VALUE_FONT_MAX;
  } else {
    valueFontSize = clamp(Math.round(16 * narrowScale), VALUE_FONT_MIN, VALUE_FONT_MAX);
    secondaryValueFontSize = clamp(
      Math.round(16 * narrowScale),
      SECONDARY_VALUE_FONT_MIN,
      SECONDARY_VALUE_FONT_MAX,
    );
  }

  const scale = clamp(widgetWidth / 320, 0.7, 1.2);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    valueFontSize,
    secondaryValueFontSize,
    singleValueFontSize: clamp(Math.round(16 * scale), VALUE_FONT_MIN, VALUE_FONT_MAX),
    valueMaxLines: 2,
    gridGap: GRID_GAP,
    cardPadding: 10,
    cardInnerGap: 6,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    stackedHeader,
  };
}
