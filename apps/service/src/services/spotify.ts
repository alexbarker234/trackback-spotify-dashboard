import { SPOTIFY_CONFIG } from "@/config";
import {
  SpotifyArtistResponse,
  SpotifyRecentlyPlayedResponse,
  SpotifyTokenResponse,
  SpotifyTrack
} from "@/types/spotify";

/**
 * Refreshes an access token using a refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
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
      expiresIn: data.expires_in
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
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Spotify API request failed:", error);
    throw error;
  }
}

/**
 * Fetches recently played tracks for a user
 */
export async function fetchRecentlyPlayedTracks(
  accessToken: string,
  afterTimestamp: number,
  limit: number = 50
): Promise<SpotifyRecentlyPlayedResponse> {
  return spotifyApiRequest<SpotifyRecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}&after=${afterTimestamp}`,
    accessToken
  );
}

/**
 * Fetches artist data including images
 */
export async function fetchArtistData(artistId: string, accessToken: string): Promise<SpotifyArtistResponse> {
  return spotifyApiRequest<SpotifyArtistResponse>(`/artists/${artistId}`, accessToken);
}

/**
 * Fetches track data including artists and album information
 */
export async function fetchTrackData(trackId: string, accessToken: string): Promise<SpotifyTrack> {
  return spotifyApiRequest<SpotifyTrack>(`/tracks/${trackId}`, accessToken);
}

/**
 * Fetches multiple tracks in a single request (up to 50 tracks)
 */
export async function fetchMultipleTracks(
  trackIds: string[],
  accessToken: string
): Promise<{ tracks: SpotifyTrack[] }> {
  const ids = trackIds.join(",");
  return spotifyApiRequest<{ tracks: SpotifyTrack[] }>(`/tracks?ids=${ids}`, accessToken);
}
