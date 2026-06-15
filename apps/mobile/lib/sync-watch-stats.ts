import { syncStats } from "trackback-wear-sync";

import type { WidgetFourWeekStats } from "./types";
import { isWidgetAuthenticated } from "./widget-auth";
import { getWidgetStatsCache } from "./widget-stats-cache";

export type WatchSyncPayload = {
  authenticated: boolean;
  stats?: WidgetFourWeekStats | null;
  refreshedAt?: string | null;
};

async function pushWatchPayload(payload: WatchSyncPayload): Promise<void> {
  try {
    await syncStats(JSON.stringify(payload));
    console.log("Synced stats to watch");
  } catch (error) {
    console.warn("Failed to sync stats to watch", error);
  }
}

export async function syncWatchStatsFromCache(): Promise<void> {
  if (!isWidgetAuthenticated()) {
    await pushWatchPayload({ authenticated: false });
    return;
  }

  const cached = await getWidgetStatsCache();
  await pushWatchPayload({
    authenticated: true,
    stats: cached?.stats ?? null,
    refreshedAt: cached?.refreshedAt ?? null,
  });
}

export async function syncWatchStats(
  stats: WidgetFourWeekStats,
  refreshedAt: string,
): Promise<void> {
  await pushWatchPayload({
    authenticated: true,
    stats,
    refreshedAt,
  });
}

export async function syncWatchLoggedOut(): Promise<void> {
  await pushWatchPayload({ authenticated: false });
}
