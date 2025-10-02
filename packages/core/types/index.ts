export interface SpotifyStreamingHistoryItem {
  ts: string;
  platform: string;
  ms_played: number;
  conn_country: string;
  ip_addr: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  offline_timestamp: number;
  incognito_mode: boolean;
}
export interface ArtistStats {
  totalListens: number;
  totalDuration: number;
  yearListens: number;
  yearDuration: number;
  monthListens: number;
  monthDuration: number;
  weekListens: number;
  weekDuration: number;
  firstListen: Date | null;
  lastListen: Date | null;
  avgDuration: number;
  uniqueTracks: number;
  uniqueAlbums: number;
}

export interface TopTrack {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  artists: {
    artistName: string;
    artistId: string;
  }[];
  imageUrl: string | null;
}

export interface TopAlbum {
  albumName: string;
  albumId: string;
  albumImageUrl: string | null;
  artistNames: string[];
  listenCount: number;
  totalDuration: number;
}

export interface TopArtist {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
  totalDuration: number;
}

export interface Listen {
  id: string;
  durationMS: number;
  trackDurationMS: number;
  playedAt: Date;
  trackName: string;
  trackIsrc: string;
  imageUrl: string | null;
}
