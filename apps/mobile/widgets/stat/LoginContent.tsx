import { FlexWidget, TextWidget } from "react-native-android-widget";

import { widgetTextFont } from "./typography";

export function LoginContent() {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flexGap: 8,
      }}
    >
      <TextWidget
        text="Last 4 weeks"
        style={{ ...widgetTextFont("bold"), fontSize: 16, color: "#fafafa" }}
      />
      <TextWidget
        text="Sign in to see your listening stats"
        style={{ ...widgetTextFont("regular"), fontSize: 13, color: "#a3a3a3", textAlign: "center" }}
      />
      <TextWidget
        text="Tap to open Trackback"
        style={{ ...widgetTextFont("regular"), fontSize: 11, color: "#525252", textAlign: "center" }}
      />
    </FlexWidget>
  );
}
