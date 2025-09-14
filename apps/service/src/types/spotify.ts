export interface SpotifyTrack {
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
  album?: {
    id: string;
    name: string;
    images: Array<{
      url: string;
    }>;
  };
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[];
}

export interface SpotifyArtistResponse {
  id: string;
  name: string;
  images: Array<{
    url: string;
  }>;
}

export interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}
