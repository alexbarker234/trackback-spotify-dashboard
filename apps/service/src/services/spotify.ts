import { SPOTIFY_CONFIG } from "@/config";
import {
  SpotifyAlbumsResponse,
  SpotifyArtistResponse,
  SpotifyRecentlyPlayedResponse,
  SpotifyTokenResponse,
  SpotifyTrack
} from "@/types/spotify";

export async function getServerAccessToken(): Promise<string | null> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${SPOTIFY_CONFIG.BASIC}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials"
    })
  });

  const data = await response.json();

  return data.access_token;
}

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
        Authorization: `Basic ${SPOTIFY_CONFIG.BASIC}`
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

/**
 * Fetches recently played tracks for a user
 */
export async function fetchRecentlyPlayedTracks(
  accessToken: string,
  limit: number = 50
): Promise<SpotifyRecentlyPlayedResponse> {
  return spotifyApiRequest<SpotifyRecentlyPlayedResponse>(
    `/me/player/recently-played?limit=${limit}`,
    accessToken
  );
}

/**
 * Fetches artist data including images
 */
export async function fetchArtistData(
  artistId: string,
  accessToken: string
): Promise<SpotifyArtistResponse> {
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

/**
 * Fetches multiple artists in a single request (up to 50 artists)
 */
export async function fetchMultipleArtists(
  artistIds: string[],
  accessToken: string
): Promise<{ artists: SpotifyArtistResponse[] }> {
  const ids = artistIds.join(",");
  return spotifyApiRequest<{ artists: SpotifyArtistResponse[] }>(
    `/artists?ids=${ids}`,
    accessToken
  );
}

/**
 * Fetches multiple albums in a single request (up to 20 albums)
 */
export async function fetchMultipleAlbums(
  albumIds: string[],
  accessToken: string
): Promise<SpotifyAlbumsResponse> {
  const ids = albumIds.join(",");
  return spotifyApiRequest<SpotifyAlbumsResponse>(`/albums?ids=${ids}`, accessToken);
}
