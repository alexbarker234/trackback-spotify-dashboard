import React from "react";

import { fetchTopArtists } from "./fetch-top-artists";
import { isWidgetAuthenticated } from "./widget-auth";
import { TopArtistsWidget } from "@/widgets/TopArtistsWidget";

export async function renderTopArtistsWidget() {
  if (!isWidgetAuthenticated()) {
    return <TopArtistsWidget needsLogin />;
  }

  try {
    const artists = await fetchTopArtists(5);
    return <TopArtistsWidget artists={artists} />;
  } catch (err) {
    if (err instanceof Error && err.message === "Sign in required") {
      return <TopArtistsWidget needsLogin />;
    }

    return (
      <TopArtistsWidget
        artists={[]}
        error={err instanceof Error ? err.message : "Could not load artists"}
      />
    );
  }
}
