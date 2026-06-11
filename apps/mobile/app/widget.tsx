import { Redirect, useLocalSearchParams } from "expo-router";

import { setPendingWidgetPath } from "@/lib/pending-widget-navigation";

export default function WidgetDeepLinkScreen() {
  const { path } = useLocalSearchParams<{ path?: string }>();

  if (typeof path === "string" && path.length > 0) {
    setPendingWidgetPath(path);
  }

  return <Redirect href="/" />;
}
