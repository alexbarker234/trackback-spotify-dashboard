import { FlexWidget, TextWidget } from "react-native-android-widget";

import { formatRefreshedAt } from "@/lib/format-refreshed-at";
import type { WidgetFourWeekStats } from "@/lib/types";

import { GRID_MIN_HEIGHT, REFRESHED_AT_FONT_SIZE } from "./constants";
import { StatCell, StatRow } from "./grid";
import { StatBox } from "./StatBox";
import type { LayoutMode, WidgetSizing } from "./types";

function formatStreams(count: number): string {
  return count.toLocaleString();
}

function formatMinutes(minutes: number): string {
  return minutes.toLocaleString();
}

function formatStreamCount(listenCount: number | undefined): string | undefined {
  if (listenCount === undefined) {
    return undefined;
  }

  return `${formatStreams(listenCount)} streams`;
}

type StatsContentProps = {
  stats: WidgetFourWeekStats;
  layout: LayoutMode;
  sizing: WidgetSizing;
  refreshedAt?: string;
  height?: number;
};

export function StatsContent({ stats, layout, sizing, refreshedAt, height }: StatsContentProps) {
  const topArtistName = stats.topArtist?.artistName ?? "—";
  const topTrackName = stats.topTrack?.trackName ?? "—";
  const gap = sizing.gridGap;

  const imageFillCell =
    layout === "grid" && (height === undefined || height >= GRID_MIN_HEIGHT);

  const cards = [
    <StatBox
      key="artist"
      label="Top artist"
      value={topArtistName}
      secondaryValue={formatStreamCount(stats.topArtist?.listenCount)}
      sizing={sizing}
      imageUrl={stats.topArtist?.artistImageUrl}
      fillCell={imageFillCell}
    />,
    <StatBox
      key="track"
      label="Top track"
      value={topTrackName}
      secondaryValue={formatStreamCount(stats.topTrack?.listenCount)}
      sizing={sizing}
      imageUrl={stats.topTrack?.imageUrl}
      fillCell={imageFillCell}
    />,
    <StatBox
      key="streams"
      label="Total streams"
      value={formatStreams(stats.totalStreams)}
      sizing={sizing}
    />,
    <StatBox
      key="minutes"
      label="Total minutes"
      value={formatMinutes(stats.minutesListened)}
      sizing={sizing}
    />,
  ];

  const gridBody =
    layout === "column" ? (
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
          flexGap: gap,
        }}
      >
        <StatCell>{cards[0]}</StatCell>
        <StatCell>{cards[1]}</StatCell>
        <StatCell>{cards[2]}</StatCell>
        <StatCell>{cards[3]}</StatCell>
      </FlexWidget>
    ) : (
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
          flexGap: gap,
        }}
      >
        <StatRow gap={gap} flex={imageFillCell ? 1 : undefined} fillHeight={imageFillCell}>
          {cards[0]}
          {cards[1]}
        </StatRow>
        <StatRow gap={gap}>
          {cards[2]}
          {cards[3]}
        </StatRow>
      </FlexWidget>
    );

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        flex: 1,
        width: "match_parent",
        flexDirection: "column",
        flexGap: gap,
      }}
    >
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: sizing.stackedHeader ? "column" : "row",
          justifyContent: sizing.stackedHeader ? "flex-start" : "space-between",
          alignItems: sizing.stackedHeader ? "flex-start" : "center",
          flexGap: sizing.stackedHeader ? 4 : undefined,
        }}
      >
        <TextWidget
          text="Last 4 weeks"
          style={{ fontSize: sizing.titleFontSize, fontWeight: "bold", color: "#fafafa" }}
        />
        {refreshedAt ? (
          <TextWidget
            text={formatRefreshedAt(refreshedAt)}
            style={{ fontSize: REFRESHED_AT_FONT_SIZE, color: "#737373" }}
          />
        ) : null}
      </FlexWidget>
      {gridBody}
    </FlexWidget>
  );
}
