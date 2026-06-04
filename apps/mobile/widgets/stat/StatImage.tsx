import { FlexWidget, ImageWidget } from "react-native-android-widget";

type StatImageProps = {
  imageUrl: string | null | undefined;
  width: number;
  height: number;
  radius: number;
};

export function StatImage({ imageUrl, width, height, radius }: StatImageProps) {
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
