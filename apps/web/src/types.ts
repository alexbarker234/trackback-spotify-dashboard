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
