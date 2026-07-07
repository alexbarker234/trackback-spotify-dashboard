import { API_URL } from "./config";
import { webUrlFromWidgetPath } from "./pending-widget-navigation";

function widgetDeepLink(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `trackback://widget?path=${encodeURIComponent(normalized)}`;
}

export function homeWidgetLink(): string {
  return widgetDeepLink("/dashboard");
}

export function artistWidgetLink(artistId: string): string {
  return widgetDeepLink(`/dashboard/artist/${artistId}`);
}

export function trackWidgetLink(trackIsrc: string): string {
  return widgetDeepLink(`/dashboard/track/${trackIsrc}`);
}

export function deepLinkToWebUrl(deepLink: string): string | null {
  try {
    const url = new URL(deepLink);
    if (url.hostname !== "widget") {
      return null;
    }

    const path = url.searchParams.get("path");
    if (!path) {
      return null;
    }

    return webUrlFromWidgetPath(path);
  } catch {
    return null;
  }
}
