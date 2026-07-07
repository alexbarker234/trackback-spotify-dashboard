import { FlexWidget, TextWidget } from "react-native-android-widget";

import { formatRefreshedAt } from "@/lib/format-refreshed-at";
import type { WidgetFourWeekStats } from "@/lib/types";
import { artistWidgetLink, homeWidgetLink, trackWidgetLink } from "@/lib/widget-links";

import { GRID_MIN_HEIGHT, REFRESHED_AT_FONT_SIZE } from "./constants";
import { StatCell, StatRow } from "./grid";
import { StatBox } from "./StatBox";
import type { LayoutMode, WidgetSizing } from "./types";
import { widgetTextFont } from "./typography";

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

  const columnMode = layout === "column";
  const imageFillCell =
    layout === "grid" && (height === undefined || height >= GRID_MIN_HEIGHT);

  const homeLink = { clickAction: "OPEN_URI" as const, clickActionData: { uri: homeWidgetLink() } };

  const cards = [
    <StatBox
      key="artist"
      label="Top artist"
      value={topArtistName}
      secondaryValue={formatStreamCount(stats.topArtist?.listenCount)}
      sizing={sizing}
      imageUrl={stats.topArtist?.artistImageUrl}
      fillCell={imageFillCell}
      flexCell={columnMode}
      {...(stats.topArtist?.artistId
        ? {
            clickAction: "OPEN_URI" as const,
            clickActionData: { uri: artistWidgetLink(stats.topArtist.artistId) },
          }
        : {})}
    />,
    <StatBox
      key="track"
      label="Top track"
      value={topTrackName}
      secondaryValue={formatStreamCount(stats.topTrack?.listenCount)}
      sizing={sizing}
      imageUrl={stats.topTrack?.imageUrl}
      fillCell={imageFillCell}
      flexCell={columnMode}
      {...(stats.topTrack?.trackIsrc
        ? {
            clickAction: "OPEN_URI" as const,
            clickActionData: { uri: trackWidgetLink(stats.topTrack.trackIsrc) },
          }
        : {})}
    />,
    <StatBox
      key="streams"
      label="Total streams"
      value={formatStreams(stats.totalStreams)}
      sizing={sizing}
      flexCell={columnMode}
      {...homeLink}
    />,
    <StatBox
      key="minutes"
      label="Total minutes"
      value={formatMinutes(stats.minutesListened)}
      sizing={sizing}
      flexCell={columnMode}
      {...homeLink}
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
        <StatCell fillHeight>{cards[0]}</StatCell>
        <StatCell fillHeight>{cards[1]}</StatCell>
        <StatCell fillHeight>{cards[2]}</StatCell>
        <StatCell fillHeight>{cards[3]}</StatCell>
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
          style={{ ...widgetTextFont("bold"), fontSize: sizing.titleFontSize, color: "#fafafa" }}
        />
        {refreshedAt ? (
          <TextWidget
            text={formatRefreshedAt(refreshedAt)}
            style={{ ...widgetTextFont("regular"), fontSize: REFRESHED_AT_FONT_SIZE, color: "#737373" }}
          />
        ) : null}
      </FlexWidget>
      {gridBody}
    </FlexWidget>
  );
}
