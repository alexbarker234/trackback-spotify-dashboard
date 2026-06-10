import { FlexWidget, FlexWidgetStyle, TextWidget, TextWidgetStyle } from "react-native-android-widget";

import { LABEL_FONT_SIZE } from "./constants";
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
};

export function StatBox({ label, value, sizing, imageUrl }: StatBoxProps) {
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

  if (hasImage && sizing.stackedImage) {
    return (
      <FlexWidget style={boxStyle}>
        <TextWidget text={label} style={labelStyle} />
        <FlexWidget
          style={{
            width: "match_parent",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <StatImage
            imageUrl={imageUrl}
            width={sizing.imageBannerWidth}
            height={sizing.imageBannerHeight}
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
