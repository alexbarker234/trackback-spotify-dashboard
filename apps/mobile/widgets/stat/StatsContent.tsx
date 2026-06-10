import { FlexWidget, TextWidget } from "react-native-android-widget";

import { formatRefreshedAt } from "@/lib/format-refreshed-at";
import type { WidgetFourWeekStats } from "@/lib/types";

import { REFRESHED_AT_FONT_SIZE } from "./constants";
import { StatBox } from "./StatBox";
import { GridSpacer, StatCell, StatRow } from "./grid";
import type { LayoutMode, WidgetSizing } from "./types";

function formatStreams(count: number): string {
  return count.toLocaleString();
}

function formatMinutes(minutes: number): string {
  return minutes.toLocaleString();
}

function formatTopItemValue(name: string, listenCount: number | undefined): string {
  if (name === "—" || listenCount === undefined) {
    return name;
  }

  return `${name}\n${formatStreams(listenCount)} streams`;
}

type StatsContentProps = {
  stats: WidgetFourWeekStats;
  layout: LayoutMode;
  sizing: WidgetSizing;
  refreshedAt?: string;
};

export function StatsContent({ stats, layout, sizing, refreshedAt }: StatsContentProps) {
  const topArtistName = stats.topArtist?.artistName ?? "—";
  const topTrackName = stats.topTrack?.trackName ?? "—";

  const cards = [
    <StatBox
      key="artist"
      label="Top artist"
      value={formatTopItemValue(topArtistName, stats.topArtist?.listenCount)}
      sizing={sizing}
      imageUrl={stats.topArtist?.artistImageUrl}
    />,
    <StatBox
      key="track"
      label="Top track"
      value={formatTopItemValue(topTrackName, stats.topTrack?.listenCount)}
      sizing={sizing}
      imageUrl={stats.topTrack?.imageUrl}
    />,
    <StatBox
      key="streams"
      label="Total streams"
      value={formatStreams(stats.totalStreams)}
      sizing={sizing}
    />,
    <StatBox
      key="minutes"
      label="Total minutes listened"
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
