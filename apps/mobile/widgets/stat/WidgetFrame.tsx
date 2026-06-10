import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, TextWidget } from "react-native-android-widget";

import { formatRefreshedAt } from "@/lib/format-refreshed-at";

const shellStyle: FlexWidgetStyle = {
  height: "match_parent",
  width: "match_parent",
  backgroundColor: "#0a0a0a",
  paddingHorizontal: 12,
  paddingTop: 12,
  paddingBottom: 6,
  flexDirection: "column",
};

type WidgetFrameProps = {
  children: ReactNode;
  refreshedAt?: string;
};

export function WidgetFrame({ children, refreshedAt }: WidgetFrameProps) {
  return (
    <FlexWidget style={shellStyle}>
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
        }}
      >
        {children}
      </FlexWidget>
      {refreshedAt ? (
        <FlexWidget
          style={{
            width: "match_parent",
            marginTop: 4,
          }}
        >
          <TextWidget
            text={formatRefreshedAt(refreshedAt)}
            style={{ fontSize: 10, color: "#737373" }}
          />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
