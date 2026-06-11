import * as SecureStore from "expo-secure-store";

import type { WidgetLifetimeStats } from "./types";

const CACHE_KEY = "widget-lifetime-stats-cache";

export type WidgetLifetimeStatsCache = {
  stats: WidgetLifetimeStats;
  refreshedAt: string;
};

export async function getWidgetLifetimeStatsCache(): Promise<WidgetLifetimeStatsCache | null> {
  const raw = await SecureStore.getItemAsync(CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WidgetLifetimeStatsCache;
  } catch {
    return null;
  }
}

export async function setWidgetLifetimeStatsCache(
  stats: WidgetLifetimeStats,
  refreshedAt: string,
): Promise<void> {
  await SecureStore.setItemAsync(
    CACHE_KEY,
    JSON.stringify({ stats, refreshedAt } satisfies WidgetLifetimeStatsCache),
  );
}
