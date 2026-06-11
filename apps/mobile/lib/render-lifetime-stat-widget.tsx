import React from "react";

import { fetchWidgetLifetimeStats } from "./fetch-widget-lifetime-stats";
import { isWidgetAuthenticated } from "./widget-auth";
import {
  getWidgetLifetimeStatsCache,
  setWidgetLifetimeStatsCache,
} from "./widget-lifetime-stats-cache";
import { LifetimeStatWidget } from "@/widgets/LifetimeStatWidget";

export type LifetimeStatWidgetSize = {
  width?: number;
  height?: number;
};

export async function renderLifetimeStatWidget(size: LifetimeStatWidgetSize = {}) {
  if (!isWidgetAuthenticated()) {
    return <LifetimeStatWidget needsLogin {...size} />;
  }

  const cached = await getWidgetLifetimeStatsCache();

  try {
    const stats = await fetchWidgetLifetimeStats();
    const refreshedAt = new Date().toISOString();
    await setWidgetLifetimeStatsCache(stats, refreshedAt);
    return <LifetimeStatWidget stats={stats} refreshedAt={refreshedAt} {...size} />;
  } catch (err) {
    if (err instanceof Error && err.message === "Sign in required") {
      return <LifetimeStatWidget needsLogin {...size} />;
    }

    if (cached) {
      return (
        <LifetimeStatWidget stats={cached.stats} refreshedAt={cached.refreshedAt} {...size} />
      );
    }

    return (
      <LifetimeStatWidget
        error={err instanceof Error ? err.message : "Could not load stats"}
        {...size}
      />
    );
  }
}
