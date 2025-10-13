export interface BaseListenStats {
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
}

export interface TrackListenStats extends BaseListenStats {
  completionRate: number;
  avgDuration: number;
}

export interface ArtistListenStats extends BaseListenStats {
  uniqueTracks: number;
  uniqueAlbums: number;
  completionRate: number;
  avgDuration: number;
}

export interface AlbumListenStats extends BaseListenStats {
  uniqueTracks: number;
  uniqueArtists: number;
  completionRate: number;
  avgDuration: number;
}
