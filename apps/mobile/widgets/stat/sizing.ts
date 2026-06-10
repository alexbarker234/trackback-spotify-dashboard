import {
  GRID_GAP,
  GRID_MIN_HEIGHT,
  IMAGE_CORNER_RADIUS,
  LABEL_FONT_SIZE,
  NARROW_TITLE_FONT_SIZE,
  NARROW_WIDGET_MAX_WIDTH,
  REFRESHED_AT_FONT_SIZE,
  SHELL_OVERHEAD,
  STACKED_HEADER_GAP,
  TITLE_LINE_HEIGHT,
  VALUE_FONT_MAX,
  VALUE_FONT_MIN,
} from "./constants";
import type { LayoutMode, WidgetSizing } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function valueBlockHeight(valueFontSize: number, valueMaxLines: number) {
  return valueFontSize * (valueMaxLines > 1 ? 2.15 : 1.15);
}

function textCardHeight(
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
) {
  return (
    cardPadding * 2 + LABEL_FONT_SIZE + cardInnerGap + valueBlockHeight(valueFontSize, valueMaxLines)
  );
}

function fillImageCardChrome(
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
) {
  const labelHeight = LABEL_FONT_SIZE * 1.15;
  const valueHeight = valueBlockHeight(valueFontSize, valueMaxLines);
  return cardPadding * 2 + labelHeight + valueHeight + cardInnerGap * 2;
}

function headerHeight(stackedHeader: boolean) {
  if (stackedHeader) {
    return (
      Math.ceil(NARROW_TITLE_FONT_SIZE * 1.15) +
      STACKED_HEADER_GAP +
      Math.ceil(REFRESHED_AT_FONT_SIZE * 1.15)
    );
  }

  return TITLE_LINE_HEIGHT;
}

function computeFillImageSize(
  width: number,
  height: number,
  sizing: Pick<
    WidgetSizing,
    | "valueFontSize"
    | "valueMaxLines"
    | "cardPadding"
    | "cardInnerGap"
    | "gridGap"
    | "stackedHeader"
  >,
): number {
  const contentWidth = width - 24;
  const cellWidth = (contentWidth - GRID_GAP) / 2;
  const statsHeight = height - SHELL_OVERHEAD;
  const bottomRowHeight = textCardHeight(
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );
  const topRowHeight =
    statsHeight - headerHeight(sizing.stackedHeader) - sizing.gridGap * 2 - bottomRowHeight;
  const chrome = fillImageCardChrome(
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );
  const maxByHeight = topRowHeight - chrome;
  const maxByWidth = cellWidth - sizing.cardPadding * 2;

  return clamp(Math.round(Math.min(maxByHeight, maxByWidth)), 28, 160);
}

export function getWidgetSizing(
  width?: number,
  height?: number,
  layout?: LayoutMode,
): WidgetSizing {
  const widgetWidth = width ?? 320;
  const widgetHeight = height ?? 260;
  const scale = clamp(widgetWidth / 320, 0.7, 1.2);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;
  const imageSize = clamp(Math.round(40 * scale), 28, 72);

  const sizing: WidgetSizing = {
    valueFontSize: clamp(Math.round(16 * scale), VALUE_FONT_MIN, VALUE_FONT_MAX),
    valueMaxLines: 2,
    imageSize,
    fillImageSize: imageSize,
    imageCornerRadius: clamp(Math.round(IMAGE_CORNER_RADIUS * scale), 6, 12),
    gridGap: GRID_GAP,
    cardPadding: 10,
    cardInnerGap: 6,
    titleFontSize: stackedHeader ? NARROW_TITLE_FONT_SIZE : 16,
    stackedHeader,
  };

  if (
    layout === "grid" &&
    height !== undefined &&
    height >= GRID_MIN_HEIGHT
  ) {
    sizing.fillImageSize = computeFillImageSize(widgetWidth, widgetHeight, sizing);
  }

  return sizing;
}
