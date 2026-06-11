import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { renderLifetimeStatWidget } from "@/lib/render-lifetime-stat-widget";
import { renderStatWidget } from "@/lib/render-stat-widget";
import { LifetimeStatWidget } from "@/widgets/LifetimeStatWidget";
import { StatWidget } from "@/widgets/StatWidget";

function widgetSize(props: WidgetTaskHandlerProps) {
  return { width: props.widgetInfo.width, height: props.widgetInfo.height };
}

async function renderStat(props: WidgetTaskHandlerProps) {
  const size = widgetSize(props);
  props.renderWidget(<StatWidget loading {...size} />);
  props.renderWidget(await renderStatWidget(size));
}

async function renderLifetimeStat(props: WidgetTaskHandlerProps) {
  const size = widgetSize(props);
  props.renderWidget(<LifetimeStatWidget loading {...size} />);
  props.renderWidget(await renderLifetimeStatWidget(size));
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      break;
    default:
      return;
  }

  switch (props.widgetInfo.widgetName) {
    case "Stat":
      await renderStat(props);
      break;
    case "LifetimeStat":
      await renderLifetimeStat(props);
      break;
    default:
      break;
  }
}
