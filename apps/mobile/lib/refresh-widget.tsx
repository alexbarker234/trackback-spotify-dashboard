import { requestWidgetUpdate } from "react-native-android-widget";

import { renderTopArtistsWidget } from "./render-top-artists-widget";

export async function refreshTopArtistsWidget() {
  await requestWidgetUpdate({
    widgetName: "TopArtists",
    renderWidget: renderTopArtistsWidget,
  });
}
