import type { LayoutMode } from "./types";

export function getLayoutMode(width?: number, height?: number): LayoutMode {
  if (!width) {
    return "grid";
  }

  if (width < 300) {
    return "column";
  }

  if (height && height > width && width < 360) {
    return "column";
  }

  return "grid";
}
