import { authClient } from "./auth-client";
import { API_URL } from "./config";
import type { TopArtist } from "./types";

export async function fetchTopArtists(limit = 5): Promise<TopArtist[]> {
  const cookies = authClient.getCookie();
  const headers: Record<string, string> = {};

  if (cookies) {
    headers.Cookie = cookies;
  }

  const response = await fetch(`${API_URL}/api/top-artists?limit=${limit}`, { headers });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Sign in required");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch top artists (${response.status})`);
  }

  return response.json();
}
