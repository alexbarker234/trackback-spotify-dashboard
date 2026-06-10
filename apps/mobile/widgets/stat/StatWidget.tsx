"use no memo";

import { FlexWidget, TextWidget } from "react-native-android-widget";

import { getLayoutMode } from "./layout-mode";
import { LoginContent } from "./LoginContent";
import { getWidgetSizing } from "./sizing";
import { StatsContent } from "./StatsContent";
import type { StatWidgetProps } from "./types";
import { WidgetFrame } from "./WidgetFrame";

export function StatWidget({
  stats,
  refreshedAt,
  error,
  loading,
  needsLogin,
  width,
  height,
}: StatWidgetProps) {
  const layout = getLayoutMode(width);
  const sizing = getWidgetSizing(width);

  const frameProps = { width, height };

  if (loading) {
    return (
      <WidgetFrame {...frameProps}>
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="Loading stats..." style={{ fontSize: 14, color: "#a3a3a3" }} />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  if (needsLogin) {
    return (
      <WidgetFrame {...frameProps}>
        <LoginContent />
      </WidgetFrame>
    );
  }

  if (error) {
    return (
      <WidgetFrame {...frameProps}>
        <FlexWidget
          clickAction="OPEN_APP"
          style={{
            flex: 1,
            width: "match_parent",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text="Last 4 weeks"
            style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa", marginBottom: 8 }}
          />
          <TextWidget text={error} style={{ fontSize: 12, color: "#f87171" }} maxLines={3} />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  if (!stats) {
    return (
      <WidgetFrame {...frameProps}>
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="No stats available" style={{ fontSize: 14, color: "#a3a3a3" }} />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame {...frameProps}>
      <StatsContent stats={stats} layout={layout} sizing={sizing} refreshedAt={refreshedAt} />
    </WidgetFrame>
  );
}
