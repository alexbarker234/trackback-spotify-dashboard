import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { fetchTopArtists } from "@/lib/fetch-top-artists";
import { TopArtistsWidget } from "@/widgets/TopArtistsWidget";

async function renderTopArtists(props: WidgetTaskHandlerProps) {
  props.renderWidget(<TopArtistsWidget artists={[]} loading />);

  try {
    const artists = await fetchTopArtists(5);
    props.renderWidget(<TopArtistsWidget artists={artists} />);
  } catch (err) {
    props.renderWidget(
      <TopArtistsWidget
        artists={[]}
        error={err instanceof Error ? err.message : "Could not load artists"}
      />,
    );
  }
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
    default:
      break;
  }
}
