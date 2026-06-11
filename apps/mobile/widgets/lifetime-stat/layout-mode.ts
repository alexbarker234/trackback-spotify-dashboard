import { GRID_MIN_WIDTH } from "../stat/constants";
import { LIFETIME_WIDE_GRID_MIN_WIDTH } from "./constants";

export type LifetimeGridLayout = "column" | "grid-2x3" | "grid-3x2";

export function getLifetimeGridLayout(width?: number): LifetimeGridLayout {
  if (!width || width <= GRID_MIN_WIDTH) {
    return "column";
  }

  if (width > LIFETIME_WIDE_GRID_MIN_WIDTH) {
    return "grid-3x2";
  }

  return "grid-2x3";
}
