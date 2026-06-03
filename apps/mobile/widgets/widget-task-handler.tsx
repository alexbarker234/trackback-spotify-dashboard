import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { renderTopArtistsWidget } from "@/lib/render-top-artists-widget";
import { REFRESH_ACTION, TopArtistsWidget } from "@/widgets/TopArtistsWidget";

async function renderTopArtists(props: WidgetTaskHandlerProps) {
  props.renderWidget(<TopArtistsWidget loading />);
  props.renderWidget(await renderTopArtistsWidget());
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== "TopArtists") {
    return;
  }

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      await renderTopArtists(props);
      break;
    case "WIDGET_CLICK":
      if (props.clickAction === REFRESH_ACTION) {
        await renderTopArtists(props);
      }
      break;
    default:
      break;
  }
}
