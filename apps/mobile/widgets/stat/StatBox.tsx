import { FlexWidget, FlexWidgetStyle, TextWidget, TextWidgetStyle } from "react-native-android-widget";

import { LABEL_FONT_SIZE, STAT_BOX_BG } from "./constants";
import { StatImage } from "./StatImage";
import type { WidgetSizing } from "./types";

const labelStyle: TextWidgetStyle = {
  fontSize: LABEL_FONT_SIZE,
  fontWeight: "600" as const,
  color: "#a3a3a3",
  width: "match_parent" as const,
};

const valueStyle = (sizing: WidgetSizing): TextWidgetStyle => ({
  fontSize: sizing.valueFontSize,
  fontWeight: "600" as const,
  color: "#fafafa",
  width: "match_parent" as const,
});

type StatBoxProps = {
  label: string;
  value: string;
  sizing: WidgetSizing;
  imageUrl?: string | null;
  fillCell?: boolean;
};

export function StatBox({ label, value, sizing, imageUrl, fillCell = false }: StatBoxProps) {
  const hasImage = imageUrl !== undefined;
  const radius = sizing.imageCornerRadius;

  const boxStyle: FlexWidgetStyle = {
    width: "match_parent",
    height: fillCell ? "match_parent" : undefined,
    backgroundColor: STAT_BOX_BG,
    borderRadius: 10,
    padding: sizing.cardPadding,
    flexDirection: "column",
    flexGap: sizing.cardInnerGap,
    ...(fillCell ? { flex: 1 } : {}),
  };

  if (hasImage && fillCell) {
    return (
      <FlexWidget style={boxStyle}>
        <TextWidget text={label} style={labelStyle} />
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <StatImage
            imageUrl={imageUrl}
            width={sizing.imageSize}
            height={sizing.imageSize}
            radius={radius}
          />
        </FlexWidget>
        <TextWidget text={value} maxLines={sizing.valueMaxLines} style={valueStyle(sizing)} />
      </FlexWidget>
    );
  }

  if (hasImage) {
    return (
      <FlexWidget style={boxStyle}>
        <TextWidget text={label} style={labelStyle} />
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
            <TextWidget text={value} maxLines={sizing.valueMaxLines} style={valueStyle(sizing)} />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget style={boxStyle}>
      <TextWidget text={label} style={labelStyle} />
      <TextWidget text={value} maxLines={sizing.valueMaxLines} style={valueStyle(sizing)} />
    </FlexWidget>
  );
}
