"use no memo";

import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, ImageWidget, TextWidget } from "react-native-android-widget";

import type { WidgetFourWeekStats } from "@/lib/types";

const REFRESH_ACTION = "REFRESH";

const STAT_BOX_BG = "#262626";
const GRID_GAP = 8;
const LABEL_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 16;

type StatWidgetProps = {
  stats?: WidgetFourWeekStats;
  error?: string;
  loading?: boolean;
  needsLogin?: boolean;
  width?: number;
  height?: number;
};

type LayoutMode = "grid" | "column";

const shellStyle: FlexWidgetStyle = {
  height: "match_parent" as const,
  width: "match_parent" as const,
  backgroundColor: "#0a0a0a" as const,
  padding: 12,
  flexDirection: "column" as const,
};

function getLayoutMode(width?: number, height?: number): LayoutMode {
  if (!width) {
    return "grid";
  }

  if (width < 300) {
    return "column";
  }

  if (height && height > width && width < 360) {
    return "column";
  }

  return "grid";
}

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
            backgroundColor: STAT_BOX_BG,
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

/** Equal-width / equal-height slot for each stat card */
function StatCell({ children }: { children: ReactNode }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        width: "match_parent",
        height: "match_parent",
      }}
    >
      {children}
    </FlexWidget>
  );
}

function StatRow({ children }: { children: ReactNode }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        width: "match_parent",
        flexDirection: "row",
        flexGap: GRID_GAP,
      }}
    >
      {children}
    </FlexWidget>
  );
}

function StatImage({
  imageUrl,
  radius,
  compact,
}: {
  imageUrl: string | null | undefined;
  radius: number;
  compact: boolean;
}) {
  const size = compact ? 28 : 32;

  if (imageUrl?.startsWith("https:")) {
    return (
      <ImageWidget
        image={imageUrl as `https:${string}`}
        imageWidth={size}
        imageHeight={size}
        radius={radius}
      />
    );
  }

  return (
    <FlexWidget
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: "#404040",
      }}
    />
  );
}

function StatBox({
  label,
  value,
  imageUrl,
  imageRadius = 6,
  compact = false,
}: {
  label: string;
  value: string;
  imageUrl?: string | null;
  imageRadius?: number;
  compact?: boolean;
}) {
  const hasImage = imageUrl !== undefined;

  if (hasImage) {
    return (
      <FlexWidget
        style={{
          width: "match_parent",
          height: "match_parent",
          backgroundColor: STAT_BOX_BG,
          borderRadius: 10,
          padding: 10,
          flexDirection: "column",
          flexGap: 6,
        }}
      >
        <TextWidget
          text={label}
          style={{
            fontSize: LABEL_FONT_SIZE,
            fontWeight: "600",
            color: "#a3a3a3",
            width: "match_parent",
          }}
        />
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            flexDirection: "row",
            alignItems: "center",
            flexGap: 8,
          }}
        >
          <StatImage imageUrl={imageUrl} radius={imageRadius} compact={compact} />
          <FlexWidget style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
            <TextWidget
              text={value}
              maxLines={2}
              style={{
                fontSize: VALUE_FONT_SIZE,
                fontWeight: "600",
                color: "#fafafa",
                width: "match_parent",
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: STAT_BOX_BG,
        borderRadius: 10,
        padding: 10,
        flexDirection: "column",
        justifyContent: "center",
        flexGap: 6,
      }}
    >
      <TextWidget
        text={label}
        style={{
          fontSize: LABEL_FONT_SIZE,
          fontWeight: "600",
          color: "#a3a3a3",
          width: "match_parent",
        }}
      />
      <TextWidget
        text={value}
        maxLines={2}
        style={{
          fontSize: VALUE_FONT_SIZE,
          fontWeight: "600",
          color: "#fafafa",
          width: "match_parent",
        }}
      />
    </FlexWidget>
  );
}

function formatStreams(count: number): string {
  return count.toLocaleString();
}

function formatMinutes(minutes: number): string {
  return minutes.toLocaleString();
}

function LoginContent() {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        width: "match_parent",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        flexGap: 8,
      }}
    >
      <TextWidget
        text="Last 4 weeks"
        style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa" }}
      />
      <TextWidget
        text="Sign in to see your listening stats"
        style={{ fontSize: 13, color: "#a3a3a3", textAlign: "center" }}
      />
      <TextWidget
        text="Tap to open Trackback"
        style={{ fontSize: 11, color: "#525252", textAlign: "center" }}
      />
    </FlexWidget>
  );
}

function StatsContent({
  stats,
  layout,
  compact,
}: {
  stats: WidgetFourWeekStats;
  layout: LayoutMode;
  compact: boolean;
}) {
  const topArtistName = stats.topArtist?.artistName ?? "—";
  const topTrackName = stats.topTrack?.trackName ?? "—";

  const cards = [
    <StatBox
      key="artist"
      label="Top artist"
      value={topArtistName}
      imageUrl={stats.topArtist?.artistImageUrl}
      imageRadius={16}
      compact={compact}
    />,
    <StatBox
      key="track"
      label="Top track"
      value={topTrackName}
      imageUrl={stats.topTrack?.imageUrl}
      imageRadius={6}
      compact={compact}
    />,
    <StatBox key="streams" label="Streams" value={formatStreams(stats.totalStreams)} />,
    <StatBox
      key="minutes"
      label="Minutes listened"
      value={formatMinutes(stats.minutesListened)}
    />,
  ];

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        width: "match_parent",
        flexDirection: "column",
        flexGap: GRID_GAP,
      }}
    >
      <TextWidget
        text="Last 4 weeks"
        style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa" }}
      />
      {layout === "column" ? (
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            flexDirection: "column",
            flexGap: GRID_GAP,
          }}
        >
          {cards.map((card) => (
            <StatCell key={card.key}>{card}</StatCell>
          ))}
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            flexDirection: "column",
            flexGap: GRID_GAP,
          }}
        >
          <StatRow>
            <StatCell>{cards[0]}</StatCell>
            <StatCell>{cards[1]}</StatCell>
          </StatRow>
          <StatRow>
            <StatCell>{cards[2]}</StatCell>
            <StatCell>{cards[3]}</StatCell>
          </StatRow>
        </FlexWidget>
      )}
    </FlexWidget>
  );
}

export function StatWidget({
  stats,
  error,
  loading,
  needsLogin,
  width,
  height,
}: StatWidgetProps) {
  const layout = getLayoutMode(width, height);
  const compact = layout === "column" || (width !== undefined && width < 340);

  if (loading) {
    return (
      <WidgetFrame>
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="Loading stats..." style={{ fontSize: 14, color: "#a3a3a3" }} />
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
            width: "match_parent",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text="Last 4 weeks"
            style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa", marginBottom: 8 }}
          />
          <TextWidget text={error} style={{ fontSize: 12, color: "#f87171" }} maxLines={3} />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  if (!stats) {
    return (
      <WidgetFrame>
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="No stats available" style={{ fontSize: 14, color: "#a3a3a3" }} />
        </FlexWidget>
      </WidgetFrame>
    );
  }

  return (
    <WidgetFrame>
      <StatsContent stats={stats} layout={layout} compact={compact} />
    </WidgetFrame>
  );
}

export { REFRESH_ACTION };
