import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { renderStatWidget } from "@/lib/render-stat-widget";
import { StatWidget } from "@/widgets/StatWidget";

function widgetSize(props: WidgetTaskHandlerProps) {
  return { width: props.widgetInfo.width, height: props.widgetInfo.height };
}

async function renderStat(props: WidgetTaskHandlerProps) {
  const size = widgetSize(props);
  props.renderWidget(<StatWidget loading {...size} />);
  props.renderWidget(await renderStatWidget(size));
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
    default:
      break;
  }
}
