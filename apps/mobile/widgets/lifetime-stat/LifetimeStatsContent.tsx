import { FlexWidget, TextWidget } from "react-native-android-widget";

import { formatRefreshedAt } from "@/lib/format-refreshed-at";
import type { WidgetLifetimeStats } from "@/lib/types";

import { REFRESHED_AT_FONT_SIZE } from "../stat/constants";
import { StatCell, StatRow } from "../stat/grid";
import { StatBox } from "../stat/StatBox";
import type { WidgetSizing } from "../stat/types";
import { widgetTextFont } from "../stat/typography";
import { resolveLifetimeBreakpoint } from "./breakpoints";
import {
  getLifetimeStatLabel,
  getLifetimeStatValue,
  LIFETIME_STAT_KEYS,
} from "./labels";

function formatCount(count: number): string {
  return count.toLocaleString();
}

type LifetimeStatsContentProps = {
  stats: WidgetLifetimeStats;
  sizing: WidgetSizing;
  refreshedAt?: string;
  width?: number;
  height?: number;
};

export function LifetimeStatsContent({
  stats,
  sizing,
  refreshedAt,
  width,
  height,
}: LifetimeStatsContentProps) {
  const breakpoint = resolveLifetimeBreakpoint(width, height);
  const { layout, shortLabels } = breakpoint;
  const gap = sizing.gridGap;

  const cards = LIFETIME_STAT_KEYS.map((key) => (
    <StatBox
      key={key}
      label={getLifetimeStatLabel(key, shortLabels)}
      value={formatCount(getLifetimeStatValue(stats, key))}
      sizing={sizing}
      flexCell
    />
  ));

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
        {cards.map((card) => (
          <StatCell key={card.key} fillHeight>
            {card}
          </StatCell>
        ))}
      </FlexWidget>
    ) : layout === "grid-3x2" ? (
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          flexDirection: "column",
          flexGap: gap,
        }}
      >
        <StatRow gap={gap} flex={1} fillHeight>
          {cards[0]}
          {cards[1]}
          {cards[2]}
        </StatRow>
        <StatRow gap={gap} flex={1} fillHeight>
          {cards[3]}
          {cards[4]}
          {cards[5]}
        </StatRow>
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
        <StatRow gap={gap} flex={1} fillHeight>
          {cards[0]}
          {cards[1]}
        </StatRow>
        <StatRow gap={gap} flex={1} fillHeight>
          {cards[2]}
          {cards[3]}
        </StatRow>
        <StatRow gap={gap} flex={1} fillHeight>
          {cards[4]}
          {cards[5]}
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
          text="Lifetime"
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
