export interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    external_ids?: {
      isrc?: string;
    };
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
      }>;
    };
  } | null;
  currently_playing_type: string;
  timestamp: number;
}

export interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}
