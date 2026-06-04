import { requestWidgetUpdate } from "react-native-android-widget";

import { renderStatWidget } from "./render-stat-widget";

export async function refreshStatWidget() {
  await requestWidgetUpdate({
    widgetName: "Stat",
    renderWidget: () => renderStatWidget(),
  });
}
