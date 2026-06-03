import React from "react";
import { requestWidgetUpdate } from "react-native-android-widget";

import { TopArtistsWidget } from "@/widgets/TopArtistsWidget";

import { fetchTopArtists } from "./fetch-top-artists";

export async function refreshTopArtistsWidget() {
  await requestWidgetUpdate({
    widgetName: "TopArtists",
    renderWidget: async () => {
      try {
        const artists = await fetchTopArtists(5);
        return <TopArtistsWidget artists={artists} />;
      } catch (err) {
        return (
          <TopArtistsWidget
            artists={[]}
            error={err instanceof Error ? err.message : "Could not load artists"}
          />
        );
      }
    },
  });
}
