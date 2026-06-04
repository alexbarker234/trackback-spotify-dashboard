/** Linear interpolation; `t` is usually 0–1. */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
