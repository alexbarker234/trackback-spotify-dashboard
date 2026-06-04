import React from "react";

import { fetchWidgetFourWeekStats } from "./fetch-widget-stats";
import { isWidgetAuthenticated } from "./widget-auth";
import { StatWidget } from "@/widgets/StatWidget";

export async function renderStatWidget() {
  if (!isWidgetAuthenticated()) {
    return <StatWidget needsLogin />;
  }

  try {
    const stats = await fetchWidgetFourWeekStats();
    return <StatWidget stats={stats} />;
  } catch (err) {
    if (err instanceof Error && err.message === "Sign in required") {
      return <StatWidget needsLogin />;
    }

    return (
      <StatWidget
        error={err instanceof Error ? err.message : "Could not load stats"}
      />
    );
  }
}
