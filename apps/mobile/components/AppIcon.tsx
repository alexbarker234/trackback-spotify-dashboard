import { Image, type ImageStyle, type StyleProp } from "react-native";

const appIcon = require("@/assets/images/icon.png");

type AppIconProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function AppIcon({ size = 88, style }: AppIconProps) {
  return (
    <Image
      source={appIcon}
      style={[{ width: size, height: size, borderRadius: size * 0.2 }, style]}
      accessibilityLabel="Trackback"
    />
  );
}
