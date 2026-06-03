export type TopArtist = {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
  totalDuration: number;
};

export type TopTrack = {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
  artists: {
    artistName: string;
    artistId: string;
  }[];
};
