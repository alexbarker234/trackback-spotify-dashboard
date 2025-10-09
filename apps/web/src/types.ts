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

// Search
export interface SearchAlbum {
  id: string;
  name: string;
  imageUrl: string | null;
  artists: string[];
}

export interface SearchTrack {
  id: string;
  isrc?: string;
  name: string;
  imageUrl: string | null;
  artists: string[];
}

export interface SearchArtist {
  id: string;
  name: string;
  imageUrl: string | null;
  followers: number;
}

export interface SearchResults {
  albums: SearchAlbum[];
  tracks: SearchTrack[];
  artists: SearchArtist[];
}
