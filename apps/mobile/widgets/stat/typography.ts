import type { TextWidgetStyle } from "react-native-android-widget";

const WIDGET_FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

type WidgetFontWeight = keyof typeof WIDGET_FONTS;

export function widgetTextFont(weight: WidgetFontWeight): Pick<TextWidgetStyle, "fontFamily" | "fontWeight"> {
  switch (weight) {
    case "medium":
      return { fontFamily: WIDGET_FONTS.medium, fontWeight: "500" };
    case "semiBold":
      return { fontFamily: WIDGET_FONTS.semiBold, fontWeight: "600" };
    case "bold":
      return { fontFamily: WIDGET_FONTS.bold, fontWeight: "bold" };
    default:
      return { fontFamily: WIDGET_FONTS.regular, fontWeight: "normal" };
  }
}
