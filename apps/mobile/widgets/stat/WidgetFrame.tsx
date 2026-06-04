import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, IconWidget } from "react-native-android-widget";

import {
  FA_ICON_ARROWS_ROTATE,
  FA_SOLID_FONT,
  REFRESH_ACTION,
  STAT_BOX_BG,
} from "./constants";

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
          <IconWidget
            icon={FA_ICON_ARROWS_ROTATE}
            font={FA_SOLID_FONT}
            size={14}
            style={{ color: "#a3a3a3" }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
