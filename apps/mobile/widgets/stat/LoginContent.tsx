import { FlexWidget, TextWidget } from "react-native-android-widget";

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
        style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa" }}
      />
      <TextWidget
        text="Sign in to see your listening stats"
        style={{ fontSize: 13, color: "#a3a3a3", textAlign: "center" }}
      />
      <TextWidget
        text="Tap to open Trackback"
        style={{ fontSize: 11, color: "#525252", textAlign: "center" }}
      />
    </FlexWidget>
  );
}
