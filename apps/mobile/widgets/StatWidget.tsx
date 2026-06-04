"use no memo";

import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, ImageWidget, TextWidget } from "react-native-android-widget";

import type { WidgetFourWeekStats } from "@/lib/types";

const REFRESH_ACTION = "REFRESH";

const STAT_BOX_BG = "#262626";

type StatWidgetProps = {
  stats?: WidgetFourWeekStats;
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

function StatImage({
  imageUrl,
  radius,
}: {
  imageUrl: string | null | undefined;
  radius: number;
}) {
  if (imageUrl?.startsWith("https:")) {
    return (
      <ImageWidget
        image={imageUrl as `https:${string}`}
        imageWidth={32}
        imageHeight={32}
        radius={radius}
      />
    );
  }

  return (
    <FlexWidget
      style={{
        width: 32,
        height: 32,
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
}: {
  label: string;
  value: string;
  imageUrl?: string | null;
  imageRadius?: number;
}) {
  const hasImage = imageUrl !== undefined;

  return (
    <FlexWidget
      style={{
        flex: 1,
        backgroundColor: STAT_BOX_BG,
        borderRadius: 10,
        padding: 10,
        flexDirection: hasImage ? "row" : "column",
        alignItems: hasImage ? "center" : "flex-start",
        flexGap: hasImage ? 8 : 4,
      }}
    >
      {hasImage ? <StatImage imageUrl={imageUrl} radius={imageRadius} /> : null}
      <FlexWidget style={{ flex: 1, flexDirection: "column", flexGap: 4 }}>
        <TextWidget text={label} style={{ fontSize: 10, color: "#737373" }} />
        <TextWidget
          text={value}
          maxLines={2}
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: "#fafafa",
            width: "match_parent",
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function StatRow({ children }: { children: ReactNode }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        flexGap: 8,
      }}
    >
      {children}
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

function StatsContent({ stats }: { stats: WidgetFourWeekStats }) {
  const topArtistName = stats.topArtist?.artistName ?? "—";
  const topTrackName = stats.topTrack?.trackName ?? "—";

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        width: "match_parent",
        flexDirection: "column",
        flexGap: 8,
      }}
    >
      <TextWidget
        text="Last 4 weeks"
        style={{ fontSize: 16, fontWeight: "bold", color: "#fafafa", marginBottom: 2 }}
      />
      <StatRow>
        <StatBox
          label="Top artist"
          value={topArtistName}
          imageUrl={stats.topArtist?.artistImageUrl}
          imageRadius={16}
        />
        <StatBox
          label="Top track"
          value={topTrackName}
          imageUrl={stats.topTrack?.imageUrl}
          imageRadius={6}
        />
      </StatRow>
      <StatRow>
        <StatBox label="Streams" value={formatStreams(stats.totalStreams)} />
        <StatBox label="Minutes listened" value={formatMinutes(stats.minutesListened)} />
      </StatRow>
    </FlexWidget>
  );
}

export function StatWidget({ stats, error, loading, needsLogin }: StatWidgetProps) {
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
      <StatsContent stats={stats} />
    </WidgetFrame>
  );
}

export { REFRESH_ACTION };
