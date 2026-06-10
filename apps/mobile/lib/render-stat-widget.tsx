import React from "react";

import { fetchWidgetFourWeekStats } from "./fetch-widget-stats";
import { isWidgetAuthenticated } from "./widget-auth";
import { getWidgetStatsCache, setWidgetStatsCache } from "./widget-stats-cache";
import { StatWidget } from "@/widgets/StatWidget";

export type StatWidgetSize = {
  width?: number;
  height?: number;
};

export async function renderStatWidget(size: StatWidgetSize = {}) {
  if (!isWidgetAuthenticated()) {
    return <StatWidget needsLogin {...size} />;
  }

  const cached = await getWidgetStatsCache();

  try {
    const stats = await fetchWidgetFourWeekStats();
    const refreshedAt = new Date().toISOString();
    await setWidgetStatsCache(stats, refreshedAt);
    return <StatWidget stats={stats} refreshedAt={refreshedAt} {...size} />;
  } catch (err) {
    if (err instanceof Error && err.message === "Sign in required") {
      return <StatWidget needsLogin {...size} />;
    }

    if (cached) {
      return (
        <StatWidget stats={cached.stats} refreshedAt={cached.refreshedAt} {...size} />
      );
    }

    return (
      <StatWidget
        error={err instanceof Error ? err.message : "Could not load stats"}
        {...size}
      />
    );
  }
}
