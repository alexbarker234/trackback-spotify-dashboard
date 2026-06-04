import { FlexWidget, TextWidget } from "react-native-android-widget";

import type { WidgetFourWeekStats } from "@/lib/types";

import { StatBox } from "./StatBox";
import { GridSpacer, StatCell, StatRow } from "./grid";
import type { LayoutMode, WidgetSizing } from "./types";

function formatStreams(count: number): string {
  return count.toLocaleString();
}

function formatMinutes(minutes: number): string {
  return minutes.toLocaleString();
}

type StatsContentProps = {
  stats: WidgetFourWeekStats;
  layout: LayoutMode;
  sizing: WidgetSizing;
};

export function StatsContent({ stats, layout, sizing }: StatsContentProps) {
  const topArtistName = stats.topArtist?.artistName ?? "—";
  const topTrackName = stats.topTrack?.trackName ?? "—";

  const cards = [
    <StatBox
      key="artist"
      label="Top artist"
      value={topArtistName}
      sizing={sizing}
      imageUrl={stats.topArtist?.artistImageUrl}
    />,
    <StatBox
      key="track"
      label="Top track"
      value={topTrackName}
      sizing={sizing}
      imageUrl={stats.topTrack?.imageUrl}
    />,
    <StatBox
      key="streams"
      label="Streams"
      value={formatStreams(stats.totalStreams)}
      sizing={sizing}
    />,
    <StatBox
      key="minutes"
      label="Minutes listened"
      value={formatMinutes(stats.minutesListened)}
      sizing={sizing}
    />,
  ];

  const gap = sizing.gridGap;
  const spacer = sizing.showSpacer ? <GridSpacer /> : null;
  const grow = sizing.showSpacer ? 1 : undefined;

  const gridBody =
    layout === "column" ? (
      <FlexWidget
        style={{
          flex: grow,
          width: "match_parent",
          flexDirection: "column",
          flexGap: gap,
        }}
      >
        <StatCell>{cards[0]}</StatCell>
        <StatCell>{cards[1]}</StatCell>
        {spacer}
        <StatCell>{cards[2]}</StatCell>
        <StatCell>{cards[3]}</StatCell>
      </FlexWidget>
    ) : (
      <FlexWidget
        style={{
          flex: grow,
          width: "match_parent",
          flexDirection: "column",
          flexGap: gap,
        }}
      >
        <StatRow gap={gap}>
          <StatCell>{cards[0]}</StatCell>
          <StatCell>{cards[1]}</StatCell>
        </StatRow>
        {spacer}
        <StatRow gap={gap}>
          <StatCell>{cards[2]}</StatCell>
          <StatCell>{cards[3]}</StatCell>
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
      <TextWidget
        text="Last 4 weeks"
        style={{ fontSize: sizing.titleFontSize, fontWeight: "bold", color: "#fafafa" }}
      />
      <FlexWidget
        style={{
          flex: grow,
          width: "match_parent",
          flexDirection: "column",
          flexGap: gap,
        }}
      >
        {gridBody}
      </FlexWidget>
    </FlexWidget>
  );
}
