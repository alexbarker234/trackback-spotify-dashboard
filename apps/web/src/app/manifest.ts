import { colors } from "@/lib/utils/colors";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trackback",
    short_name: "Trackback",
    description: "A personal spotify listening dashboard",
    start_url: "/",
    display: "standalone",
    background_color: colors.theme,
    theme_color: colors.theme,
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
