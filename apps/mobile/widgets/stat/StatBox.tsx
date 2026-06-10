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

const secondaryValueStyle = (sizing: WidgetSizing): TextWidgetStyle => ({
  fontSize: sizing.valueFontSize - 2,
  fontWeight: "500" as const,
  color: "#a3a3a3",
  width: "match_parent" as const,
});

type ValueBlockProps = {
  value: string;
  secondaryValue?: string;
  sizing: WidgetSizing;
};

function ValueBlock({ value, secondaryValue, sizing }: ValueBlockProps) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "column",
        flexGap: secondaryValue ? 2 : undefined,
      }}
    >
      <TextWidget
        text={value}
        maxLines={secondaryValue ? 1 : sizing.valueMaxLines}
        style={valueStyle(sizing)}
      />
      {secondaryValue ? (
        <TextWidget text={secondaryValue} style={secondaryValueStyle(sizing)} />
      ) : null}
    </FlexWidget>
  );
}

type StatBoxProps = {
  label: string;
  value: string;
  secondaryValue?: string;
  sizing: WidgetSizing;
  imageUrl?: string | null;
  fillCell?: boolean;
};

export function StatBox({
  label,
  value,
  secondaryValue,
  sizing,
  imageUrl,
  fillCell = false,
}: StatBoxProps) {
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
    const imageSize = sizing.fillImageSize;

    return (
      <FlexWidget style={boxStyle}>
        <TextWidget text={label} style={labelStyle} />
        <ValueBlock value={value} secondaryValue={secondaryValue} sizing={sizing} />
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
            width={200}
            height={200}
            radius={radius}
          />
        </FlexWidget>
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
          <FlexWidget
            style={{
              flex: 0,
              width: "match_parent",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <StatImage
              imageUrl={imageUrl}
              width={200}
              height={200}
              radius={radius}
            /></FlexWidget>
          <FlexWidget style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
            <ValueBlock value={value} secondaryValue={secondaryValue} sizing={sizing} />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget style={boxStyle}>
      <TextWidget text={label} style={labelStyle} />
      <ValueBlock value={value} secondaryValue={secondaryValue} sizing={sizing} />
    </FlexWidget>
  );
}
