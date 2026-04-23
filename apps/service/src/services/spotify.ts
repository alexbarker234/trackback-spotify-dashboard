import { SPOTIFY_CONFIG } from "@/config";
import {
  SpotifyAlbum,
  SpotifyAlbumsResponse,
  SpotifyArtistResponse,
  SpotifyRecentlyPlayedResponse,
  SpotifyTokenResponse,
  SpotifyTrack
} from "@/types/spotify";

const DEFAULT_SPOTIFY_RETRY_DELAY_MS = 30_000;
const SPOTIFY_MIN_REQUEST_GAP_MS = 250;
const SPOTIFY_MAX_RETRIES = 5;

let lastSpotifyRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(headerValue: string | null): number {
  if (!headerValue) {
    return DEFAULT_SPOTIFY_RETRY_DELAY_MS;
  }

  const seconds = Number(headerValue);
  if (!Number.isNaN(seconds) && seconds > 0) {
    return Math.ceil(seconds * 1000);
  }

  const dateMs = Date.parse(headerValue);
  if (!Number.isNaN(dateMs)) {
    return Math.max(dateMs - Date.now(), 0);
  }

  return DEFAULT_SPOTIFY_RETRY_DELAY_MS;
}

/**
 * Performs a Spotify API fetch while respecting minimum spacing
 * and backing off on 429 responses before retrying.
 */
async function rateLimitFetch(
  input: string,
  init?: Parameters<typeof fetch>[1]
): Promise<Response> {
  let attempts = 0;

  while (attempts <= SPOTIFY_MAX_RETRIES) {
    const now = Date.now();
    const waitMs = Math.max(lastSpotifyRequestAt + SPOTIFY_MIN_REQUEST_GAP_MS - now, 0);
    if (waitMs > 0) {
      await sleep(waitMs);
    }

    const response = await fetch(input, init);
    lastSpotifyRequestAt = Date.now();

    if (response.status !== 429) {
      return response;
    }

    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    attempts += 1;
    console.log(
      `Rate limited by Spotify API. Waiting ${retryAfterMs}ms before retry ${attempts}/${SPOTIFY_MAX_RETRIES}...`
    );
    await sleep(retryAfterMs);
  }

  throw new Error("Spotify API rate limit retries exceeded");
}

export async function getServerAccessToken(): Promise<string | null> {
  const response = await rateLimitFetch("https://accounts.spotify.com/api/token", {
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
    const response = await rateLimitFetch(SPOTIFY_CONFIG.TOKEN_URL, {
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
    const response = await rateLimitFetch(`${SPOTIFY_CONFIG.API_BASE}${endpoint}`, {
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

async function fetchInParallelBatches<T>(
  ids: string[],
  batchSize: number,
  fetcher: (id: string) => Promise<T>
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map((id) => fetcher(id)));

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }

  return results;
}

/**
 * Fetches multiple tracks using per-track requests in small batches
 */
export async function fetchMultipleTracks(
  trackIds: string[],
  accessToken: string
): Promise<{ tracks: SpotifyTrack[] }> {
  const tracks = await fetchInParallelBatches(trackIds, 5, (trackId) =>
    fetchTrackData(trackId, accessToken)
  );

  return { tracks };
}

/**
 * Fetches multiple artists using per-artist requests in small batches
 */
export async function fetchMultipleArtists(
  artistIds: string[],
  accessToken: string
): Promise<{ artists: SpotifyArtistResponse[] }> {
  const artists = await fetchInParallelBatches(artistIds, 5, (artistId) =>
    fetchArtistData(artistId, accessToken)
  );

  return { artists };
}

/**
 * Fetches multiple albums using per-album requests in small batches
 */
export async function fetchMultipleAlbums(
  albumIds: string[],
  accessToken: string
): Promise<SpotifyAlbumsResponse> {
  const albums = await fetchInParallelBatches(albumIds, 5, (albumId) =>
    spotifyApiRequest<SpotifyAlbum>(`/albums/${albumId}`, accessToken)
  );

  return { albums };
}
