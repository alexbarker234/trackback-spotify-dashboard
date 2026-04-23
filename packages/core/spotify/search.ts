import { SpotifySearchResponse } from "../types/spotifyTypes";
import { spotifyApiRequest } from "./index";

/**
 * Search for albums, artists, and tracks on Spotify
 */
export async function searchSpotify(
  query: string,
  accessToken: string,
  types: Array<"album" | "track" | "artist"> = ["album", "track", "artist"],
  limit = 10
): Promise<SpotifySearchResponse | null> {
  if (!query || query.trim() === "") {
    return { albums: { items: [] }, tracks: { items: [] }, artists: { items: [] } };
  }

  const typeString = types.join(",");
  const encodedQuery = encodeURIComponent(query);
  const safeLimit = Math.min(Math.max(limit, 1), 10);
  const endpoint = `/search?q=${encodedQuery}&type=${typeString}&limit=${safeLimit}`;

  return spotifyApiRequest<SpotifySearchResponse>(endpoint, accessToken);
}
