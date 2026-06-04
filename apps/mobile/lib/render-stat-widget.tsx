import React from "react";

import { fetchWidgetFourWeekStats } from "./fetch-widget-stats";
import { isWidgetAuthenticated } from "./widget-auth";
import { StatWidget } from "@/widgets/StatWidget";

export type StatWidgetSize = {
  width?: number;
  height?: number;
};

export async function renderStatWidget(size: StatWidgetSize = {}) {
  if (!isWidgetAuthenticated()) {
    return <StatWidget needsLogin {...size} />;
  }

  try {
    const stats = await fetchWidgetFourWeekStats();
    return <StatWidget stats={stats} {...size} />;
  } catch (err) {
    if (err instanceof Error && err.message === "Sign in required") {
      return <StatWidget needsLogin {...size} />;
    }

    return (
      <StatWidget
        error={err instanceof Error ? err.message : "Could not load stats"}
        {...size}
      />
    );
  }
}
