import {
  album,
  albumTrack,
  and,
  artist,
  db,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  listen,
  sql,
  track,
  trackArtist
} from "@workspace/database";
import { TopTrack } from "../types";

type BaseTopTrack = {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
};

type GetTopTracksOptions = {
  artistId?: string;
  albumId?: string;
  limit?: number;
};

export async function getTopTracks(options: GetTopTracksOptions = {}): Promise<TopTrack[]> {
  const { artistId, albumId, limit = 10 } = options;

  // Validate that exactly one filter is provided
  if ((artistId && albumId) || (!artistId && !albumId)) {
    throw new Error("Exactly one of artistId or albumId must be provided");
  }

  try {
    let query = db
      .select({
        trackName: track.name,
        trackIsrc: track.isrc,
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration"),
        imageUrl: sql<string>`min(${album.imageUrl})`.as("imageUrl")
      })
      .from(listen)
      .innerJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .innerJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id));

    // Add artist join and filter only when filtering by artist
    if (artistId) {
      query = query.innerJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc));
    }

    // Build where conditions
    const conditions = [gte(listen.durationMS, 30000), isNotNull(track.name), isNotNull(track.isrc)];
    if (artistId) {
      conditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      conditions.push(eq(albumTrack.albumId, albumId));
    }

    const topTracks: BaseTopTrack[] = await query
      .where(and(...conditions))
      .groupBy(track.isrc, track.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return populateArtists(topTracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return [];
  }
}

export async function getTopTracksForArtist(artistId: string, limit: number = 10): Promise<TopTrack[]> {
  return getTopTracks({ artistId, limit });
}

export async function getTopTracksForAlbum(albumId: string, limit: number = 10): Promise<TopTrack[]> {
  return getTopTracks({ albumId, limit });
}

async function populateArtists(topTracks: BaseTopTrack[]): Promise<TopTrack[]> {
  // Get all artists for each track
  const trackIsrcs = topTracks.map((t) => t.trackIsrc);
  if (trackIsrcs.length === 0) return [];

  const trackArtists = await db
    .select({
      trackIsrc: trackArtist.trackIsrc,
      artistName: artist.name,
      artistId: artist.id
    })
    .from(trackArtist)
    .leftJoin(artist, eq(trackArtist.artistId, artist.id))
    .where(and(inArray(trackArtist.trackIsrc, trackIsrcs), isNotNull(artist.name)));

  // Group artists by track ISRC
  const artistsByTrack = trackArtists.reduce(
    (acc, ta) => {
      if (!acc[ta.trackIsrc]) {
        acc[ta.trackIsrc] = [];
      }
      acc[ta.trackIsrc]!.push({
        artistName: ta.artistName!,
        artistId: ta.artistId!
      });
      return acc;
    },
    {} as Record<string, { artistName: string; artistId: string }[]>
  );

  // Combine track stats with artists
  return topTracks.map((track) => ({
    trackName: track.trackName,
    trackIsrc: track.trackIsrc,
    listenCount: track.listenCount,
    totalDuration: track.totalDuration,
    imageUrl: track.imageUrl,
    artists: artistsByTrack[track.trackIsrc] || []
  }));
}
