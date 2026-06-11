import { GRID_MIN_WIDTH } from "../stat/constants";
import {
  LIFETIME_COMPACT_HEIGHT_2X3,
  LIFETIME_COMPACT_HEIGHT_3X2,
  LIFETIME_COMPACT_WIDTH,
  LIFETIME_WIDE_GRID_MIN_WIDTH,
} from "./constants";

export type LifetimeGridLayout = "column" | "grid-2x3" | "grid-3x2";

export type LifetimeLayout = {
  layout: LifetimeGridLayout;
  compact: boolean;
  tiny: boolean;
};

export function getLifetimeLayout(width?: number, height?: number): LifetimeLayout {
  const widgetWidth = width ?? 320;
  const widgetHeight = height ?? 400;

  if (widgetWidth < LIFETIME_COMPACT_WIDTH && widgetHeight < LIFETIME_COMPACT_HEIGHT_3X2) {
    return { layout: "grid-3x2", compact: true, tiny: true };
  }

  if (widgetWidth < LIFETIME_COMPACT_WIDTH && widgetHeight < LIFETIME_COMPACT_HEIGHT_2X3) {
    return { layout: "grid-2x3", compact: true, tiny: false };
  }

  // if (widgetWidth < LIFETIME_COMPACT_WIDTH && widgetHeight < LIFETIME_COMPACT_HEIGHT_3X2) {
  //   return { layout: "grid-3x2", compact: true, tiny: true };
  // }

  if (!width || widgetWidth <= GRID_MIN_WIDTH) {
    return { layout: "column", compact: false, tiny: false };
  }

  if (widgetWidth > LIFETIME_WIDE_GRID_MIN_WIDTH) {
    return { layout: "grid-3x2", compact: false, tiny: false };
  }

  return { layout: "grid-2x3", compact: false, tiny: false };
}
