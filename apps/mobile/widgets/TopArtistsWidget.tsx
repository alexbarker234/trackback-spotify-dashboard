"use no memo";

import React from "react";
import { FlexWidget, ImageWidget, ListWidget, TextWidget } from "react-native-android-widget";

import type { TopArtist } from "@/lib/types";

type TopArtistsWidgetProps = {
  artists: TopArtist[];
  error?: string;
  loading?: boolean;
};

export function TopArtistsWidget({ artists, error, loading }: TopArtistsWidgetProps) {
  if (loading) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#0a0a0a",
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextWidget text="Loading top artists..." style={{ fontSize: 14, color: "#a3a3a3" }} />
      </FlexWidget>
    );
  }

  if (error) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#0a0a0a",
          padding: 16,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextWidget
          text="Top Artists"
          style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa", marginBottom: 8 }}
        />
        <TextWidget text={error} style={{ fontSize: 12, color: "#f87171" }} maxLines={3} />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#0a0a0a",
        padding: 12,
        flexDirection: "column",
      }}
    >
      <TextWidget
        text="Top Artists"
        style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa", marginBottom: 8 }}
      />
      <ListWidget style={{ height: "match_parent", width: "match_parent" }}>
        {artists.map((artist, index) => (
          <FlexWidget
            key={artist.artistId}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              flexGap: 10,
            }}
          >
            <TextWidget
              text={`${index + 1}`}
              style={{ fontSize: 14, fontWeight: "600", color: "#737373", width: 20 }}
            />
            {artist.artistImageUrl?.startsWith("https:") ? (
              <ImageWidget
                image={artist.artistImageUrl as `https:${string}`}
                imageWidth={36}
                imageHeight={36}
                radius={18}
              />
            ) : (
              <FlexWidget
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#262626",
                }}
              />
            )}
            <FlexWidget style={{ flex: 1, flexDirection: "column" }}>
              <TextWidget
                text={artist.artistName}
                maxLines={1}
                style={{ fontSize: 14, fontWeight: "600", color: "#fafafa" }}
              />
              <TextWidget
                text={`${artist.listenCount} streams`}
                style={{ fontSize: 11, color: "#737373" }}
              />
            </FlexWidget>
          </FlexWidget>
        ))}
      </ListWidget>
    </FlexWidget>
  );
}
