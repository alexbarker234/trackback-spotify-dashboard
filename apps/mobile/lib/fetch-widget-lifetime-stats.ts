import { authClient } from "./auth-client";
import { API_URL } from "./config";
import type { WidgetLifetimeStats } from "./types";

export async function fetchWidgetLifetimeStats(): Promise<WidgetLifetimeStats> {
  const cookies = authClient.getCookie();
  const headers: Record<string, string> = {};

  if (cookies) {
    headers.Cookie = cookies;
  }

  const response = await fetch(`${API_URL}/api/widget/lifetime-stats`, { headers });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Sign in required");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch widget lifetime stats (${response.status})`);
  }

  return response.json();
}
