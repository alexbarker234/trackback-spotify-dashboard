import { SpotifySearchResponse } from "../types/spotifyTypes";
import { spotifyApiRequest } from "./index";

/**
 * Search for albums, artists, and tracks on Spotify
 */
export async function searchSpotify(
  query: string,
  accessToken: string,
  types: Array<"album" | "track" | "artist"> = ["album", "track", "artist"],
  limit = 20
): Promise<SpotifySearchResponse | null> {
  if (!query || query.trim() === "") {
    return { albums: { items: [] }, tracks: { items: [] }, artists: { items: [] } };
  }

  const typeString = types.join(",");
  const encodedQuery = encodeURIComponent(query);
  const endpoint = `/search?q=${encodedQuery}&type=${typeString}&limit=${limit}`;

  return spotifyApiRequest<SpotifySearchResponse>(endpoint, accessToken);
}
