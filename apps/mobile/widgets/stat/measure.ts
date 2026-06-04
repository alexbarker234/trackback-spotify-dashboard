import {
  HEIGHT_BUFFER,
  LABEL_FONT_SIZE,
  TITLE_LINE_HEIGHT,
} from "./constants";
import type { LayoutMode, WidgetSizing } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
      TITLE_LINE_HEIGHT +
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
    TITLE_LINE_HEIGHT +
    sizing.gridGap +
    imageRow +
    sizing.gridGap +
    textRow +
    HEIGHT_BUFFER
  );
}

export function getCellHeight(statsHeight: number, layout: LayoutMode, gridGap: number): number {
  if (layout === "column") {
    return (statsHeight - TITLE_LINE_HEIGHT - gridGap * 3) / 4;
  }

  return (statsHeight - TITLE_LINE_HEIGHT - gridGap) / 2;
}

export function getStackedImageRowHeight(
  statsHeight: number,
  layout: LayoutMode,
  sizing: Pick<
    WidgetSizing,
    "valueFontSize" | "cardPadding" | "cardInnerGap" | "valueMaxLines" | "gridGap"
  >,
): number {
  const textRow = textCardHeight(
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );

  if (layout === "column") {
    return (statsHeight - TITLE_LINE_HEIGHT - sizing.gridGap * 3 - textRow * 2) / 2;
  }

  return statsHeight - TITLE_LINE_HEIGHT - sizing.gridGap * 2 - textRow;
}
