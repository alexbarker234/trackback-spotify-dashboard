import {
  GRID_GAP,
  NARROW_TITLE_FONT_SIZE,
  NARROW_WIDGET_MAX_WIDTH,
  VALUE_FONT_MAX,
  VALUE_FONT_MIN,
} from "./constants";
import type { WidgetSizing } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getWidgetSizing(width?: number): WidgetSizing {
  const widgetWidth = width ?? 320;
  const scale = clamp(widgetWidth / 320, 0.7, 1.2);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    valueFontSize: clamp(Math.round(16 * scale), VALUE_FONT_MIN, VALUE_FONT_MAX),
    valueMaxLines: 2,
    gridGap: GRID_GAP,
    cardPadding: 10,
    cardInnerGap: 6,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    stackedHeader,
  };
}
