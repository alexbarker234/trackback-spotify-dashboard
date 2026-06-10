import {
  HEIGHT_BUFFER,
  LABEL_FONT_SIZE,
  REFRESHED_AT_FONT_SIZE,
  STACKED_HEADER_GAP,
  TITLE_LINE_HEIGHT,
} from "./constants";
import type { LayoutMode, WidgetSizing } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getHeaderHeight(stackedHeader: boolean, titleFontSize: number): number {
  if (stackedHeader) {
    return (
      Math.ceil(titleFontSize * 1.15) +
      STACKED_HEADER_GAP +
      Math.ceil(REFRESHED_AT_FONT_SIZE * 1.15)
    );
  }

  return TITLE_LINE_HEIGHT;
}

function valueBlockHeight(valueFontSize: number, valueMaxLines: number) {
  return valueFontSize * (valueMaxLines > 1 ? 2.15 : 1.15);
}

export function imageCardHeight(
  imageSize: number,
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueBlockHeight(valueFontSize, valueMaxLines);
  const bodyHeight = LABEL_FONT_SIZE + cardInnerGap + Math.max(imageSize, valueHeight);
  return cardPadding * 2 + bodyHeight;
}

export function textCardHeight(
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueBlockHeight(valueFontSize, valueMaxLines);
  return cardPadding * 2 + LABEL_FONT_SIZE + cardInnerGap + valueHeight;
}

export function stackedImageCardHeight(
  bannerHeight: number,
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueBlockHeight(valueFontSize, valueMaxLines);
  return cardPadding * 2 + LABEL_FONT_SIZE + cardInnerGap + bannerHeight + cardInnerGap + valueHeight;
}

export function measureLayoutHeight(
  layout: LayoutMode,
  sizing: Pick<
    WidgetSizing,
    | "stackedImage"
    | "imageSize"
    | "imageBannerHeight"
    | "valueFontSize"
    | "gridGap"
    | "cardPadding"
    | "cardInnerGap"
    | "valueMaxLines"
    | "headerHeight"
  >,
): number {
  const imageRow = sizing.stackedImage
    ? stackedImageCardHeight(
        sizing.imageBannerHeight,
        sizing.valueFontSize,
        sizing.cardPadding,
        sizing.cardInnerGap,
        sizing.valueMaxLines,
      )
    : imageCardHeight(
        sizing.imageSize,
        sizing.valueFontSize,
        sizing.cardPadding,
        sizing.cardInnerGap,
        sizing.valueMaxLines,
      );
  const textRow = textCardHeight(
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );

  if (layout === "column") {
    return (
      sizing.headerHeight +
      sizing.gridGap +
      imageRow +
      sizing.gridGap +
      imageRow +
      sizing.gridGap +
      textRow +
      sizing.gridGap +
      textRow +
      HEIGHT_BUFFER
    );
  }

  return (
    sizing.headerHeight +
    sizing.gridGap +
    imageRow +
    sizing.gridGap +
    textRow +
    HEIGHT_BUFFER
  );
}

export function getCellHeight(
  statsHeight: number,
  layout: LayoutMode,
  gridGap: number,
  headerHeight: number,
): number {
  if (layout === "column") {
    return (statsHeight - headerHeight - gridGap * 3) / 4;
  }

  return (statsHeight - headerHeight - gridGap) / 2;
}

export function getStackedImageRowHeight(
  statsHeight: number,
  layout: LayoutMode,
  sizing: Pick<
    WidgetSizing,
    | "valueFontSize"
    | "cardPadding"
    | "cardInnerGap"
    | "valueMaxLines"
    | "gridGap"
    | "headerHeight"
  >,
): number {
  const textRow = textCardHeight(
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );

  if (layout === "column") {
    return (statsHeight - sizing.headerHeight - sizing.gridGap * 3 - textRow * 2) / 2;
  }

  return statsHeight - sizing.headerHeight - sizing.gridGap * 2 - textRow;
}
