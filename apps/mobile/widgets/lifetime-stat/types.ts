import type { WidgetLifetimeStats } from "@/lib/types";

export type LifetimeStatWidgetProps = {
  stats?: WidgetLifetimeStats;
  refreshedAt?: string;
  error?: string;
  loading?: boolean;
  needsLogin?: boolean;
  width?: number;
  height?: number;
};
