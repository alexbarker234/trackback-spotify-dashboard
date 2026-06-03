"use no memo";

import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, ImageWidget, ListWidget, TextWidget } from "react-native-android-widget";

import type { TopArtist } from "@/lib/types";

const REFRESH_ACTION = "REFRESH";

type TopArtistsWidgetProps = {
  artists?: TopArtist[];
  error?: string;
  loading?: boolean;
  needsLogin?: boolean;
};

const shellStyle: FlexWidgetStyle = {
  height: "match_parent" as const,
  width: "match_parent" as const,
  backgroundColor: "#0a0a0a" as const,
  padding: 12,
  flexDirection: "column" as const,
};

function WidgetFrame({ children }: { children: ReactNode }) {
  return (
    <FlexWidget style={shellStyle}>
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
        }}
      >
        {children}
      </FlexWidget>
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 4,
        }}
      >
        <FlexWidget
          clickAction={REFRESH_ACTION}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#262626",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="↻" style={{ fontSize: 18, color: "#a3a3a3" }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}

function LoginContent() {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flexGap: 8,
      }}
    >
      <TextWidget
        text="Top Artists"
        style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa" }}
      />
      <TextWidget
        text="Sign in to see your top artists"
        style={{ fontSize: 13, color: "#a3a3a3", textAlign: "center" }}
      />
      <TextWidget
        text="Tap to open Trackback"
        style={{ fontSize: 11, color: "#525252", textAlign: "center" }}
      />
    </FlexWidget>
  );
}

export function TopArtistsWidget({
  artists = [],
  error,
  loading,
  needsLogin,
}: TopArtistsWidgetProps) {
  if (loading) {
    return (
      <WidgetFrame>
        <FlexWidget
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="Loading top artists..." style={{ fontSize: 14, color: "#a3a3a3" }} />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  if (needsLogin) {
    return (
      <WidgetFrame>
        <LoginContent />
      </WidgetFrame>
    );
  }

  if (error) {
    return (
      <WidgetFrame>
        <FlexWidget
          clickAction="OPEN_APP"
          style={{
            flex: 1,
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
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame>
      <FlexWidget
        clickAction="OPEN_APP"
        style={{ flex: 1, width: "match_parent", flexDirection: "column" }}
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
                width: "match_parent",
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
              <FlexWidget
                style={{
                  flex: 1,
                  width: "match_parent",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <TextWidget
                  text={artist.artistName}
                  maxLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#fafafa",
                    width: "match_parent",
                  }}
                />
                <TextWidget
                  text={`${artist.listenCount} streams`}
                  style={{ fontSize: 11, color: "#737373", width: "match_parent" }}
                />
              </FlexWidget>
            </FlexWidget>
          ))}
        </ListWidget>
      </FlexWidget>
    </WidgetFrame>
  );
}

export { REFRESH_ACTION };
