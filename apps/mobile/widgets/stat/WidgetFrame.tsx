import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, TextWidget } from "react-native-android-widget";

import { widgetTextFont } from "./typography";

const shellStyle: FlexWidgetStyle = {
  height: "match_parent",
  width: "match_parent",
  backgroundColor: "#0a0a0a",
  paddingHorizontal: 12,
  paddingTop: 12,
  paddingBottom: 12,
  flexDirection: "column",
};

type WidgetFrameProps = {
  children: ReactNode;
  width?: number;
  height?: number;
};

export function WidgetFrame({ children, width, height }: WidgetFrameProps) {
  const debugSize =
    width !== undefined || height !== undefined
      ? `${width ?? "?"}×${height ?? "?"} px`
      : undefined;

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
      {debugSize ? (
        <FlexWidget
          style={{
            width: "match_parent",
            marginTop: 4,
          }}
        >
          <TextWidget
            text={debugSize}
            style={{ ...widgetTextFont("regular"), fontSize: 10, color: "#737373" }}
          />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
