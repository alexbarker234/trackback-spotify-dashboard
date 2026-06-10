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

export type WidgetFourWeekStats = {
  period: "4weeks";
  topArtist: {
    artistName: string;
    artistId: string;
    artistImageUrl: string | null;
    listenCount: number;
  } | null;
  topTrack: {
    trackName: string;
    trackIsrc: string;
    imageUrl: string | null;
    artistName: string | null;
    listenCount: number;
  } | null;
  totalStreams: number;
  minutesListened: number;
};
