export function clampInBounds(
  x: number,
  y: number,
  tooltipRect: { width: number; height: number },
  containerRect: { width: number; height: number }
): { x: number; y: number } {
  // Keep the tooltip within the right and bottom bounds of the container
  if (x + tooltipRect.width > containerRect.width) {
    x = containerRect.width - tooltipRect.width;
  }
  if (y + tooltipRect.height > containerRect.height) {
    y = containerRect.height - tooltipRect.height;
  }

  // Keep the tooltip within the top and left bounds of the container
  x = Math.max(0, x);
  y = Math.max(0, y);

  return { x, y };
}
