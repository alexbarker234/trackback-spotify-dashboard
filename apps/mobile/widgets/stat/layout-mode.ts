import { GRID_MIN_WIDTH } from "./constants";
import type { LayoutMode } from "./types";

export function getLayoutMode(width?: number): LayoutMode {
  if (!width || width <= GRID_MIN_WIDTH) {
    return "column";
  }

  return "grid";
}
