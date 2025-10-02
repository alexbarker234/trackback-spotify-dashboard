import { SpotifyCurrentlyPlayingResponse } from "../types/spotifyTypes";
import { spotifyApiRequest } from "./index";

/**
 * Fetches the currently playing track for a user
 */
export async function fetchCurrentlyPlayingTrack(accessToken: string): Promise<SpotifyCurrentlyPlayingResponse | null> {
  return spotifyApiRequest<SpotifyCurrentlyPlayingResponse>("/me/player/currently-playing", accessToken);
}
