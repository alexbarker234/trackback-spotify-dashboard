import { type ReactNode } from "react";
import { FlexWidget } from "react-native-android-widget";

export function StatCell({ children }: { children: ReactNode }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        width: "match_parent",
      }}
    >
      {children}
    </FlexWidget>
  );
}

export function StatRow({ children, gap }: { children: ReactNode; gap: number }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        flexGap: gap,
      }}
    >
      {children}
    </FlexWidget>
  );
}

export function GridSpacer() {
  return <FlexWidget style={{ flex: 1, width: "match_parent" }} />;
}
