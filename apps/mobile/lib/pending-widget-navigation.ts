import { API_URL } from "./config";

let pendingPath: string | null = null;

export function setPendingWidgetPath(path: string) {
  pendingPath = path.startsWith("/") ? path : `/${path}`;
}

export function consumePendingWidgetPath(): string | null {
  const path = pendingPath;
  pendingPath = null;
  return path;
}

export function webUrlFromWidgetPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}
