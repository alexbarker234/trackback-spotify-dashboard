import { Children, isValidElement, type ReactNode } from "react";
import { FlexWidget } from "react-native-android-widget";

export function StatCell({ children }: { children: ReactNode }) {
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

const equalWidthCellStyle = {
  flex: 1,
  width: 0,
} as const;

export function StatRow({
  children,
  gap,
  flex,
  fillHeight = false,
}: {
  children: ReactNode;
  gap: number;
  flex?: number;
  fillHeight?: boolean;
}) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        flexGap: gap,
        ...(flex !== undefined ? { flex } : {}),
        ...(fillHeight ? { height: "match_parent" } : {}),
      }}
    >
      {Children.toArray(children).map((child, index) => (
        <FlexWidget
          key={isValidElement(child) && child.key != null ? child.key : index}
          style={{
            ...equalWidthCellStyle,
            ...(fillHeight ? { height: "match_parent" } : {}),
          }}
        >
          {child}
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}
