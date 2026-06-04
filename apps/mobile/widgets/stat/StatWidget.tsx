"use no memo";

import { FlexWidget, TextWidget } from "react-native-android-widget";

import { REFRESH_ACTION } from "./constants";
import { getLayoutMode } from "./layout-mode";
import { LoginContent } from "./LoginContent";
import { getWidgetSizing } from "./sizing";
import { StatsContent } from "./StatsContent";
import type { StatWidgetProps } from "./types";
import { WidgetFrame } from "./WidgetFrame";

export { REFRESH_ACTION };

export function StatWidget({
  stats,
  error,
  loading,
  needsLogin,
  width,
  height,
}: StatWidgetProps) {
  const layout = getLayoutMode(width, height);
  const sizing = getWidgetSizing(width, height, layout);

  if (loading) {
    return (
      <WidgetFrame>
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
      <WidgetFrame>
        <LoginContent />
      </WidgetFrame>
    );
  }

  if (error) {
    return (
      <WidgetFrame>
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
      <WidgetFrame>
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
    <WidgetFrame>
      <StatsContent stats={stats} layout={layout} sizing={sizing} />
    </WidgetFrame>
  );
}
