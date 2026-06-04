import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { renderStatWidget } from "@/lib/render-stat-widget";
import { REFRESH_ACTION, StatWidget } from "@/widgets/StatWidget";

async function renderStat(props: WidgetTaskHandlerProps) {
  props.renderWidget(<StatWidget loading />);
  props.renderWidget(await renderStatWidget());
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== "Stat") {
    return;
  }

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      await renderStat(props);
      break;
    case "WIDGET_CLICK":
      if (props.clickAction === REFRESH_ACTION) {
        await renderStat(props);
      }
      break;
    default:
      break;
  }
}
