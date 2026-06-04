import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, TextWidget } from "react-native-android-widget";

import { REFRESH_ACTION, STAT_BOX_BG } from "./constants";

const shellStyle: FlexWidgetStyle = {
  height: "match_parent",
  width: "match_parent",
  backgroundColor: "#0a0a0a",
  paddingHorizontal: 12,
  paddingTop: 12,
  paddingBottom: 6,
  flexDirection: "column",
};

export function WidgetFrame({ children }: { children: ReactNode }) {
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
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 4,
        }}
      >
        <FlexWidget
          clickAction={REFRESH_ACTION}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: STAT_BOX_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="↻" style={{ fontSize: 18, color: "#a3a3a3" }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
