import * as SecureStore from "expo-secure-store";

import type { WidgetFourWeekStats } from "./types";

const CACHE_KEY = "widget-stats-cache";

export type WidgetStatsCache = {
  stats: WidgetFourWeekStats;
  refreshedAt: string;
};

export async function getWidgetStatsCache(): Promise<WidgetStatsCache | null> {
  const raw = await SecureStore.getItemAsync(CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WidgetStatsCache;
  } catch {
    return null;
  }
}

export async function setWidgetStatsCache(
  stats: WidgetFourWeekStats,
  refreshedAt: string,
): Promise<void> {
  await SecureStore.setItemAsync(
    CACHE_KEY,
    JSON.stringify({ stats, refreshedAt } satisfies WidgetStatsCache),
  );
}
