"use no memo";

import { type ReactNode } from "react";
import { FlexWidget, FlexWidgetStyle, ImageWidget, TextWidget } from "react-native-android-widget";

import type { WidgetFourWeekStats } from "@/lib/types";

const REFRESH_ACTION = "REFRESH";

const STAT_BOX_BG = "#262626";
const GRID_GAP = 8;
const LABEL_FONT_SIZE = 13;
const IMAGE_CORNER_RADIUS = 8;
const STAT_BOX_PADDING = 20;

type WidgetSizing = {
  valueFontSize: number;
  valueMaxLines: number;
  imageSize: number;
  imageCornerRadius: number;
  imageBannerWidth: number;
  imageBannerHeight: number;
  stackedImage: boolean;
  gridGap: number;
  cardPadding: number;
  cardInnerGap: number;
  titleFontSize: number;
  showSpacer: boolean;
};

const SHELL_OVERHEAD = 50;
const TITLE_LINE_HEIGHT = 20;
const HEIGHT_BUFFER = 20;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function imageCardHeight(
  imageSize: number,
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueFontSize * (valueMaxLines > 1 ? 2.15 : 1.15);
  const bodyHeight = LABEL_FONT_SIZE + cardInnerGap + Math.max(imageSize, valueHeight);
  return cardPadding * 2 + bodyHeight;
}

function textCardHeight(
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueFontSize * (valueMaxLines > 1 ? 2.15 : 1.15);
  return cardPadding * 2 + LABEL_FONT_SIZE + cardInnerGap + valueHeight;
}

function stackedImageCardHeight(
  bannerHeight: number,
  valueFontSize: number,
  cardPadding: number,
  cardInnerGap: number,
  valueMaxLines: number,
): number {
  const valueHeight = valueFontSize * (valueMaxLines > 1 ? 2.15 : 1.15);
  return cardPadding * 2 + LABEL_FONT_SIZE + cardInnerGap + bannerHeight + cardInnerGap + valueHeight;
}

function measureLayoutHeight(
  layout: LayoutMode,
  sizing: Pick<
    WidgetSizing,
    | "stackedImage"
    | "imageSize"
    | "imageBannerHeight"
    | "valueFontSize"
    | "gridGap"
    | "cardPadding"
    | "cardInnerGap"
    | "valueMaxLines"
  >,
): number {
  const imageRow = sizing.stackedImage
    ? stackedImageCardHeight(
        sizing.imageBannerHeight,
        sizing.valueFontSize,
        sizing.cardPadding,
        sizing.cardInnerGap,
        sizing.valueMaxLines,
      )
    : imageCardHeight(
        sizing.imageSize,
        sizing.valueFontSize,
        sizing.cardPadding,
        sizing.cardInnerGap,
        sizing.valueMaxLines,
      );
  const textRow = textCardHeight(
    sizing.valueFontSize,
    sizing.cardPadding,
    sizing.cardInnerGap,
    sizing.valueMaxLines,
  );

  if (layout === "column") {
    return (
      TITLE_LINE_HEIGHT +
      sizing.gridGap +
      imageRow +
      sizing.gridGap +
      imageRow +
      sizing.gridGap +
      textRow +
      sizing.gridGap +
      textRow +
      HEIGHT_BUFFER
    );
  }

  return (
    TITLE_LINE_HEIGHT +
    sizing.gridGap +
    imageRow +
    sizing.gridGap +
    textRow +
    HEIGHT_BUFFER
  );
}

function getWidgetSizing(
  width: number | undefined,
  height: number | undefined,
  layout: LayoutMode,
): WidgetSizing {
  const widgetWidth = width ?? 320;
  const widgetHeight = height ?? 260;
  const statsHeight = widgetHeight - SHELL_OVERHEAD;
  const contentWidth = widgetWidth - 24;

  const imageCellWidth =
    layout === "column" ? contentWidth : (contentWidth - GRID_GAP) / 2;
  const scale = clamp(imageCellWidth / 140, 0.9, 1.85);

  let sizing: WidgetSizing = {
    valueFontSize: clamp(Math.round(15 * scale), 13, 26),
    valueMaxLines: 2,
    imageSize: clamp(Math.round(34 * scale), 30, 72),
    imageCornerRadius: clamp(Math.round(IMAGE_CORNER_RADIUS * scale), 6, 12),
    imageBannerWidth: Math.max(Math.round(imageCellWidth - STAT_BOX_PADDING), 48),
    imageBannerHeight: 0,
    stackedImage: false,
    gridGap: GRID_GAP,
    cardPadding: 10,
    cardInnerGap: 6,
    titleFontSize: 16,
    showSpacer: true,
  };

  sizing.imageBannerHeight = sizing.imageBannerWidth;

  const stackedFits =
    measureLayoutHeight(layout, { ...sizing, stackedImage: true }) <= statsHeight;
  sizing.stackedImage = stackedFits;

  while (measureLayoutHeight(layout, sizing) > statsHeight) {
    if (sizing.valueFontSize > 12) {
      sizing.valueFontSize -= 1;
      continue;
    }
    if (sizing.imageSize > 22) {
      sizing.imageSize -= 2;
      continue;
    }
    if (sizing.gridGap > 4) {
      sizing.gridGap -= 2;
      continue;
    }
    if (sizing.cardPadding > 6) {
      sizing.cardPadding -= 2;
      continue;
    }
    if (sizing.cardInnerGap > 4) {
      sizing.cardInnerGap -= 1;
      continue;
    }
    if (sizing.valueMaxLines > 1) {
      sizing.valueMaxLines = 1;
      continue;
    }
    if (sizing.titleFontSize > 14) {
      sizing.titleFontSize = 14;
      continue;
    }
    break;
  }

  if (sizing.stackedImage) {
    const textRow = textCardHeight(
      sizing.valueFontSize,
      sizing.cardPadding,
      sizing.cardInnerGap,
      sizing.valueMaxLines,
    );
    const overhead =
      layout === "column"
        ? TITLE_LINE_HEIGHT +
          sizing.gridGap * 4 +
          textRow * 2 +
          sizing.cardPadding * 4 +
          HEIGHT_BUFFER
        : TITLE_LINE_HEIGHT + sizing.gridGap + textRow + HEIGHT_BUFFER;
    const bannerBudget = statsHeight - overhead - LABEL_FONT_SIZE - sizing.valueFontSize - sizing.cardInnerGap * 2 - sizing.cardPadding * 2;
    sizing.imageBannerHeight = clamp(
      Math.min(sizing.imageBannerWidth, Math.round(bannerBudget)),
      32,
      sizing.imageBannerWidth,
    );
  }

  while (measureLayoutHeight(layout, sizing) > statsHeight) {
    if (sizing.stackedImage && sizing.imageBannerHeight > 28) {
      sizing.imageBannerHeight -= 4;
      continue;
    }
    if (!sizing.stackedImage && sizing.imageSize > 20) {
      sizing.imageSize -= 2;
      continue;
    }
    break;
  }

  sizing.showSpacer = statsHeight - measureLayoutHeight(layout, sizing) > 24;

  return sizing;
}

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
  paddingHorizontal: 12,
  paddingTop: 12,
  paddingBottom: 6,
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
            width: 20,
            height: 20,
            borderRadius: 10,
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

/** Equal width; height follows card content */
function StatCell({ children }: { children: ReactNode }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        width: "match_parent",
      }}
    >
      {children}
    </FlexWidget>
  );
}

function StatRow({ children, gap }: { children: ReactNode; gap: number }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        flexGap: gap,
      }}
    >
      {children}
    </FlexWidget>
  );
}

function GridSpacer() {
  return <FlexWidget style={{ flex: 1, width: "match_parent" }} />;
}

function StatImage({
  imageUrl,
  width,
  height,
  radius,
}: {
  imageUrl: string | null | undefined;
  width: number;
  height: number;
  radius: number;
}) {
  if (imageUrl?.startsWith("https:")) {
    return (
      <ImageWidget
        image={imageUrl as `https:${string}`}
        imageWidth={width}
        imageHeight={height}
        radius={radius}
      />
    );
  }

  return (
    <FlexWidget
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: "#404040",
      }}
    />
  );
}

function StatBox({
  label,
  value,
  sizing,
  imageUrl,
}: {
  label: string;
  value: string;
  sizing: WidgetSizing;
  imageUrl?: string | null;
}) {
  const hasImage = imageUrl !== undefined;
  const radius = sizing.imageCornerRadius;

  const boxStyle: FlexWidgetStyle = {
    width: "match_parent",
    backgroundColor: "#262626",
    borderRadius: 10,
    padding: sizing.cardPadding,
    flexDirection: "column",
    flexGap: sizing.cardInnerGap,
  };

  if (hasImage) {
    if (sizing.stackedImage) {
      return (
        <FlexWidget style={boxStyle}>
          <TextWidget
            text={label}
            style={{
              fontSize: LABEL_FONT_SIZE,
              fontWeight: "600",
              color: "#a3a3a3",
              width: "match_parent",
            }}
          />
          <FlexWidget style={{ width: "match_parent" }}>
            <StatImage
              imageUrl={imageUrl}
              width={sizing.imageBannerWidth}
              height={sizing.imageBannerHeight}
              radius={radius}
            />
          </FlexWidget>
          <TextWidget
            text={value}
            maxLines={sizing.valueMaxLines}
            style={{
              fontSize: sizing.valueFontSize,
              fontWeight: "600",
              color: "#fafafa",
              width: "match_parent",
            }}
          />
        </FlexWidget>
      );
    }

    return (
      <FlexWidget style={boxStyle}>
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
            width: "match_parent",
            flexDirection: "row",
            alignItems: "center",
            flexGap: sizing.cardInnerGap + 2,
          }}
        >
          <StatImage
            imageUrl={imageUrl}
            width={sizing.imageSize}
            height={sizing.imageSize}
            radius={radius}
          />
          <FlexWidget style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
            <TextWidget
              text={value}
              maxLines={sizing.valueMaxLines}
              style={{
                fontSize: sizing.valueFontSize,
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
    <FlexWidget style={boxStyle}>
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
        maxLines={sizing.valueMaxLines}
        style={{
          fontSize: sizing.valueFontSize,
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
  sizing,
}: {
  stats: WidgetFourWeekStats;
  layout: LayoutMode;
  sizing: WidgetSizing;
}) {
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
        {layout === "column" ? (
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
        )}
      </FlexWidget>
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
  const sizing = getWidgetSizing(width, height, layout);

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
      <StatsContent stats={stats} layout={layout} sizing={sizing} />
    </WidgetFrame>
  );
}

export { REFRESH_ACTION };
