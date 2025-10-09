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

export interface SpotifySearchAlbum {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  artists: Array<{ id: string; name: string }>;
  release_date: string;
  total_tracks: number;
}

export interface SpotifySearchTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  external_ids?: {
    isrc?: string;
  };
}

export interface SpotifySearchArtist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  genres: string[];
  followers: {
    total: number;
  };
}

export interface SpotifySearchResponse {
  albums?: {
    items: SpotifySearchAlbum[];
  };
  tracks?: {
    items: SpotifySearchTrack[];
  };
  artists?: {
    items: SpotifySearchArtist[];
  };
}
