import { SpotifyTokenResponse } from "../types/spotifyTypes";

export const SPOTIFY_CONFIG = {
  API_BASE: "https://api.spotify.com/v1",
  TOKEN_URL: "https://accounts.spotify.com/api/token",
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID as string,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET as string,
  get TOKEN() {
    return Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString("base64");
  }
} as const;

/**
 * Refreshes an access token using a refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number; refreshToken?: string } | null> {
  try {
    console.log("Refreshing access token...");
    const response = await fetch(SPOTIFY_CONFIG.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${SPOTIFY_CONFIG.TOKEN}`
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });

    const data: SpotifyTokenResponse = await response.json();

    if (!response.ok) {
      console.error("Failed to refresh token:", response.status, response.statusText);
      console.log(data);
      return null;
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

/**
 * Makes an authenticated request to the Spotify API
 */
export async function spotifyApiRequest<T>(endpoint: string, accessToken: string): Promise<T> {
  try {
    const response = await fetch(`${SPOTIFY_CONFIG.API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized - token may be expired");
      }
      if (response.status === 429) {
        console.log("Rate limited by Spotify API. Waiting 30 seconds before retry...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
        return spotifyApiRequest<T>(endpoint, accessToken);
      }
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Spotify API request failed for ${SPOTIFY_CONFIG.API_BASE}${endpoint}:`, error);
    throw error;
  }
}
