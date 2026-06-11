import { FlexWidget, FlexWidgetStyle, TextWidget, TextWidgetStyle } from "react-native-android-widget";

import { IMAGE_CORNER_RADIUS, LABEL_FONT_SIZE, STAT_BOX_BG, STAT_IMAGE_SIZE } from "./constants";
import { StatImage } from "./StatImage";
import type { WidgetSizing } from "./types";
import { widgetTextFont } from "./typography";

const labelStyle: TextWidgetStyle = {
  ...widgetTextFont("semiBold"),
  fontSize: LABEL_FONT_SIZE,
  color: "#a3a3a3",
  width: "match_parent" as const,
};

const valueStyle = (sizing: WidgetSizing, useSingleValueFontSize: boolean): TextWidgetStyle => ({
  ...widgetTextFont("semiBold"),
  fontSize: useSingleValueFontSize ? sizing.singleValueFontSize : sizing.primaryValueFontSize,
  color: "#fafafa",
  width: "match_parent" as const,
  marginTop: -2,
});

const secondaryValueStyle = (sizing: WidgetSizing): TextWidgetStyle => ({
  ...widgetTextFont("medium"),
  fontSize: sizing.secondaryValueFontSize,
  color: "#a3a3a3",
  width: "match_parent" as const,
  marginTop: -2,
});

type ValueBlockProps = {
  value: string;
  secondaryValue?: string;
  sizing: WidgetSizing;
  compact?: boolean;
  useSingleValueFontSize?: boolean;
};

function ValueBlock({
  value,
  secondaryValue,
  sizing,
  compact = false,
  useSingleValueFontSize = false,
}: ValueBlockProps) {
  const valueMaxLines = compact ? 1 : secondaryValue ? 1 : sizing.valueMaxLines;

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "column"
      }}
    >
      <TextWidget
        text={value}
        maxLines={valueMaxLines}
        style={valueStyle(sizing, useSingleValueFontSize)}
      />
      {secondaryValue ? (
        <TextWidget
          text={secondaryValue}
          maxLines={compact ? 1 : undefined}
          style={secondaryValueStyle(sizing)}
        />
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
  flexCell?: boolean;
};

export function StatBox({
  label,
  value,
  secondaryValue,
  sizing,
  imageUrl,
  fillCell = false,
  flexCell = false,
}: StatBoxProps) {
  const hasImage = imageUrl !== undefined;
  const compact = flexCell && !fillCell;
  const useSingleValueFontSize = !hasImage && !secondaryValue;

  const boxStyle: FlexWidgetStyle = {
    width: "match_parent",
    backgroundColor: STAT_BOX_BG,
    borderRadius: 10,
    padding: sizing.cardPadding,
    flexDirection: "column",
    flexGap: sizing.cardInnerGap,
    ...((fillCell || flexCell) ? { flex: 1, height: "match_parent" } : {}),
    ...(flexCell ? { overflow: "hidden" } : {}),
  };

  if (hasImage && fillCell) {
    return (
      <FlexWidget style={boxStyle}>
        <TextWidget text={label} style={labelStyle} />
        <ValueBlock
          value={value}
          secondaryValue={secondaryValue}
          sizing={sizing}
          compact={compact}
          useSingleValueFontSize={useSingleValueFontSize}
        />
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <StatImage
            imageUrl={imageUrl}
            width={STAT_IMAGE_SIZE}
            height={STAT_IMAGE_SIZE}
            radius={IMAGE_CORNER_RADIUS}
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
            flex: flexCell ? 1 : undefined,
            width: "match_parent",
            flexDirection: "row",
            alignItems: "center",
            flexGap: sizing.cardInnerGap + 2,
            overflow: flexCell ? "hidden" : undefined,
          }}
        >
          {/* Why does the image scale to the height but make the width of the flexbox its original size*/}
          {/* What the hell is going on*/}
          <FlexWidget
            style={{ flex: 0, justifyContent: "flex-start", alignItems: "center" }}
          >
            <StatImage
              imageUrl={imageUrl}
              width={sizing.maxImageWidth}
              height={sizing.maxImageWidth}
              radius={IMAGE_CORNER_RADIUS}
            />
          </FlexWidget>
          <FlexWidget style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
            <ValueBlock
              value={value}
              secondaryValue={secondaryValue}
              sizing={sizing}
              compact={compact}
              useSingleValueFontSize={useSingleValueFontSize}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  return (
    <FlexWidget style={boxStyle}>
      <TextWidget text={label} style={labelStyle} />
      <FlexWidget
        style={{
          flex: flexCell ? 1 : undefined,
          width: "match_parent",
          justifyContent: flexCell ? "center" : undefined,
          overflow: flexCell ? "hidden" : undefined,
        }}
      >
        <ValueBlock
          value={value}
          secondaryValue={secondaryValue}
          sizing={sizing}
          compact={compact}
          useSingleValueFontSize={useSingleValueFontSize}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
