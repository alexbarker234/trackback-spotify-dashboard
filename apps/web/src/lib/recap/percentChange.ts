export type PercentChangeDirection = "up" | "down" | "flat" | "new";

export type PercentChange = {
  direction: PercentChangeDirection;
  label: string;
};

export function getPercentChange(current: number, previous: number): PercentChange {
  if (previous === 0 && current === 0) {
    return { direction: "flat", label: "0%" };
  }

  if (previous === 0) {
    return { direction: "new", label: "New" };
  }

  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) {
    return { direction: "flat", label: "0%" };
  }

  const direction: PercentChangeDirection = pct > 0 ? "up" : "down";
  const absolute = Math.abs(pct);
  const rounded = absolute >= 100 ? Math.round(absolute).toLocaleString() : absolute.toFixed(1);
  return { direction, label: `${rounded}%` };
}
