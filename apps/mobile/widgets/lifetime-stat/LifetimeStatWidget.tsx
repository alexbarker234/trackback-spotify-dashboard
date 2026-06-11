"use no memo";

import { FlexWidget, TextWidget } from "react-native-android-widget";

import { LoginContent } from "../stat/LoginContent";
import { getLifetimeWidgetSizing } from "./sizing";
import { widgetTextFont } from "../stat/typography";
import { WidgetFrame } from "../stat/WidgetFrame";
import { LifetimeStatsContent } from "./LifetimeStatsContent";
import type { LifetimeStatWidgetProps } from "./types";

export function LifetimeStatWidget({
  stats,
  refreshedAt,
  error,
  loading,
  needsLogin,
  width,
  height,
}: LifetimeStatWidgetProps) {
  const sizing = getLifetimeWidgetSizing(width, height);
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
          <TextWidget
            text="Loading stats..."
            style={{ ...widgetTextFont("regular"), fontSize: 14, color: "#a3a3a3" }}
          />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  if (needsLogin) {
    return (
      <WidgetFrame {...frameProps}>
        <LoginContent title="Lifetime" />
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
            text="Lifetime"
            style={{ ...widgetTextFont("bold"), fontSize: 16, color: "#fafafa", marginBottom: 8 }}
          />
          <TextWidget
            text={error}
            style={{ ...widgetTextFont("regular"), fontSize: 12, color: "#f87171" }}
            maxLines={3}
          />
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
          <TextWidget
            text="No stats available"
            style={{ ...widgetTextFont("regular"), fontSize: 14, color: "#a3a3a3" }}
          />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame {...frameProps}>
      <LifetimeStatsContent
        stats={stats}
        sizing={sizing}
        refreshedAt={refreshedAt}
        width={width}
      />
    </WidgetFrame>
  );
}
