import { lerp } from "@/lib/lerp";

import {
  CELL_HEIGHT_FOR_MAX_FONT,
  CELL_HEIGHT_FOR_MIN_FONT,
  GRID_GAP,
  IMAGE_CORNER_RADIUS,
  LABEL_FONT_SIZE,
  MIN_STACKED_BANNER_HEIGHT,
  SHELL_OVERHEAD,
  VALUE_FONT_MAX,
  VALUE_FONT_MIN,
} from "./constants";
import {
  clamp,
  getCellHeight,
  getStackedImageRowHeight,
  measureLayoutHeight,
  stackedImageCardHeight,
} from "./measure";
import type { LayoutMode, WidgetSizing } from "./types";

function valueFontSizeForCellHeight(cellHeight: number): number {
  const t = clamp(
    (cellHeight - CELL_HEIGHT_FOR_MIN_FONT) / (CELL_HEIGHT_FOR_MAX_FONT - CELL_HEIGHT_FOR_MIN_FONT),
    0,
    1,
  );
  return Math.round(lerp(VALUE_FONT_MIN, VALUE_FONT_MAX, t));
}

function prefersStackedImage(
  imageRowHeight: number,
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): boolean {
  return (
    imageRowHeight >=
    stackedImageCardHeight(
      MIN_STACKED_BANNER_HEIGHT,
      valueFontSize,
      cardPadding,
      cardInnerGap,
      valueMaxLines,
    )
  );
}

function stackedBannerSize(
  imageRowHeight: number,
  maxWidth: number,
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueFontSize * (valueMaxLines > 1 ? 2.15 : 1.15);
  const chrome = cardPadding * 2 + LABEL_FONT_SIZE + cardInnerGap * 2 + valueHeight;
  const maxSquare = imageRowHeight - chrome;

  return clamp(
    Math.min(maxWidth, Math.round(maxSquare)),
    MIN_STACKED_BANNER_HEIGHT,
    maxWidth,
  );
}

function applyStackedBannerSize(
  sizing: WidgetSizing,
  imageRowHeight: number,
  maxBannerWidth: number,
) {
  const size = stackedBannerSize(
    imageRowHeight,
    maxBannerWidth,
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );
  sizing.imageBannerWidth = size;
  sizing.imageBannerHeight = size;
}

function shrinkToFitStatsHeight(
  layout: LayoutMode,
  sizing: WidgetSizing,
  statsHeight: number,
) {
  while (measureLayoutHeight(layout, sizing) > statsHeight) {
    if (sizing.valueFontSize > VALUE_FONT_MIN) {
      sizing.valueFontSize -= 1;
      continue;
    }
    if (sizing.imageSize > 22) {
      sizing.imageSize -= 2;
      continue;
    }
    if (sizing.gridGap > 4) {
      sizing.gridGap -= 2;
      continue;
    }
    if (sizing.cardPadding > 6) {
      sizing.cardPadding -= 2;
      continue;
    }
    if (sizing.cardInnerGap > 4) {
      sizing.cardInnerGap -= 1;
      continue;
    }
    if (sizing.valueMaxLines > 1) {
      sizing.valueMaxLines = 1;
      continue;
    }
    if (sizing.titleFontSize > 14) {
      sizing.titleFontSize = 14;
      continue;
    }
    break;
  }
}

function shrinkStackedBanner(
  layout: LayoutMode,
  sizing: WidgetSizing,
  statsHeight: number,
) {
  while (measureLayoutHeight(layout, sizing) > statsHeight) {
    if (sizing.stackedImage && sizing.imageBannerHeight > MIN_STACKED_BANNER_HEIGHT) {
      const next = sizing.imageBannerHeight - 4;
      sizing.imageBannerWidth = next;
      sizing.imageBannerHeight = next;
      continue;
    }
    if (sizing.stackedImage) {
      sizing.stackedImage = false;
      continue;
    }
    if (sizing.imageSize > 20) {
      sizing.imageSize -= 2;
      continue;
    }
    break;
  }
}

export function getWidgetSizing(
  width: number | undefined,
  height: number | undefined,
  layout: LayoutMode,
): WidgetSizing {
  const widgetWidth = width ?? 320;
  const widgetHeight = height ?? 260;
  const statsHeight = widgetHeight - SHELL_OVERHEAD;
  const contentWidth = widgetWidth - 24;

  const imageCellWidth =
    layout === "column" ? contentWidth : (contentWidth - GRID_GAP) / 2;
  const scale = clamp(imageCellWidth / 140, 0.9, 1.85);
  const cellHeight = getCellHeight(statsHeight, layout, GRID_GAP);
  const cardPadding = 10;
  const maxStackedBannerWidth = Math.max(
    Math.round(imageCellWidth - cardPadding * 2),
    MIN_STACKED_BANNER_HEIGHT,
  );

  const sizing: WidgetSizing = {
    valueFontSize: valueFontSizeForCellHeight(cellHeight),
    valueMaxLines: 2,
    imageSize: clamp(Math.round(34 * scale), 30, 72),
    imageCornerRadius: clamp(Math.round(IMAGE_CORNER_RADIUS * scale), 6, 12),
    imageBannerWidth: maxStackedBannerWidth,
    imageBannerHeight: 0,
    stackedImage: false,
    gridGap: GRID_GAP,
    cardPadding,
    cardInnerGap: 6,
    titleFontSize: 16,
    showSpacer: true,
  };

  const applyStackedIfPreferred = () => {
    const imageRowHeight = getStackedImageRowHeight(statsHeight, layout, sizing);
    sizing.stackedImage = prefersStackedImage(
      imageRowHeight,
      sizing.valueFontSize,
      sizing.cardPadding,
      sizing.cardInnerGap,
      sizing.valueMaxLines,
    );
    if (sizing.stackedImage) {
      applyStackedBannerSize(sizing, imageRowHeight, maxStackedBannerWidth);
    }
  };

  applyStackedIfPreferred();
  shrinkToFitStatsHeight(layout, sizing, statsHeight);
  applyStackedIfPreferred();
  shrinkStackedBanner(layout, sizing, statsHeight);

  if (sizing.stackedImage) {
    applyStackedBannerSize(
      sizing,
      getStackedImageRowHeight(statsHeight, layout, sizing),
      maxStackedBannerWidth,
    );
    shrinkStackedBanner(layout, sizing, statsHeight);
  }

  sizing.showSpacer = statsHeight - measureLayoutHeight(layout, sizing) > 24;

  return sizing;
}
