import { GRID_MIN_WIDTH, NARROW_TITLE_FONT_SIZE, NARROW_WIDGET_MAX_WIDTH } from "../stat/constants";
import type { WidgetSizing } from "../stat/types";

export type LifetimeGridLayout = "column" | "grid-2x3" | "grid-3x2";

export type LifetimeBreakpoint = {
  id: string;
  match: (width: number, height: number) => boolean;
  layout: LifetimeGridLayout;
  labelFontSize: number;
  valueFontSize: number;
  titleFontSize: number;
  gridGap: number;
  cardPadding: number;
  cardInnerGap: number;
  shortLabels: boolean;
};

const W = {
  compact: 300,
  narrow: GRID_MIN_WIDTH,
  wide: 350,
} as const;

const H = {
  tiny: 230,
  compact: 330,
  columnTall: 450,
} as const;

export const LIFETIME_BREAKPOINTS: LifetimeBreakpoint[] = [
  {
    id: "tiny-3x2",
    match: (width, height) => width < W.compact && height < H.tiny,
    layout: "grid-3x2",
    labelFontSize: 8,
    valueFontSize: 9,
    titleFontSize: NARROW_TITLE_FONT_SIZE,
    gridGap: 4,
    cardPadding: 5,
    cardInnerGap: 2,
    shortLabels: true,
  },
  {
    id: "compact-2x3",
    match: (width, height) => width < W.compact && height < H.compact,
    layout: "grid-2x3",
    labelFontSize: 10,
    valueFontSize: 11,
    titleFontSize: NARROW_TITLE_FONT_SIZE,
    gridGap: 4,
    cardPadding: 5,
    cardInnerGap: 2,
    shortLabels: true,
  },
  {
    id: "column-tall",
    match: (width, height) => width <= W.narrow && height > H.columnTall,
    layout: "column",
    labelFontSize: 11,
    valueFontSize: 22,
    titleFontSize: NARROW_TITLE_FONT_SIZE,
    gridGap: 8,
    cardPadding: 8,
    cardInnerGap: 4,
    shortLabels: false,
  },
  {
    id: "column",
    match: (width) => width <= W.narrow,
    layout: "column",
    labelFontSize: 11,
    valueFontSize: 11,
    titleFontSize: NARROW_TITLE_FONT_SIZE,
    gridGap: 8,
    cardPadding: 8,
    cardInnerGap: 4,
    shortLabels: false,
  },
  {
    id: "wide-short-3x2",
    match: (width, height) => width > W.wide && height < H.tiny,
    layout: "grid-3x2",
    labelFontSize: 9,
    valueFontSize: 18,
    titleFontSize: 16,
    gridGap: 8,
    cardPadding: 10,
    cardInnerGap: 4,
    shortLabels: false,
  },
  {
    id: "wide-3x2",
    match: (width) => width > W.wide,
    layout: "grid-3x2",
    labelFontSize: 9,
    valueFontSize: 28,
    titleFontSize: 16,
    gridGap: 8,
    cardPadding: 10,
    cardInnerGap: 4,
    shortLabels: false,
  },
  {
    id: "default-2x3",
    match: () => true,
    layout: "grid-2x3",
    labelFontSize: 11,
    valueFontSize: 22,
    titleFontSize: 16,
    gridGap: 8,
    cardPadding: 10,
    cardInnerGap: 4,
    shortLabels: false,
  },
];

const DEFAULT_BREAKPOINT = LIFETIME_BREAKPOINTS[LIFETIME_BREAKPOINTS.length - 1]!;

export function resolveLifetimeBreakpoint(
  width?: number,
  height?: number,
): LifetimeBreakpoint {
  const widgetWidth = width ?? 320;
  const widgetHeight = height ?? 400;

  return (
    LIFETIME_BREAKPOINTS.find((breakpoint) => breakpoint.match(widgetWidth, widgetHeight)) ??
    DEFAULT_BREAKPOINT
  );
}

export function getLifetimeWidgetSizing(width?: number, height?: number): WidgetSizing {
  const widgetWidth = width ?? 320;
  const breakpoint = resolveLifetimeBreakpoint(width, height);
  const stackedHeader = widgetWidth <= NARROW_WIDGET_MAX_WIDTH;

  return {
    primaryValueFontSize: breakpoint.valueFontSize,
    secondaryValueFontSize: breakpoint.valueFontSize - 2,
    singleValueFontSize: breakpoint.valueFontSize,
    valueMaxLines: 1,
    gridGap: breakpoint.gridGap,
    cardPadding: breakpoint.cardPadding,
    cardInnerGap: breakpoint.cardInnerGap,
    cardLabelFontSize: breakpoint.labelFontSize,
    titleFontSize: stackedHeader ? breakpoint.titleFontSize : 16,
    maxImageWidth: 0,
    stackedHeader,
  };
}
