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

export type TopTracksOptions = {
  artistId?: string;
  albumId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

export async function getTopTracks(options: TopTracksOptions = {}): Promise<TopTrack[]> {
  const { artistId, albumId, startDate, endDate, limit = 250 } = options;

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
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id));

    // Add artist join and filter only when filtering by artist
    if (artistId) {
      query = query.leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc));
    }

    // Build where conditions
    const conditions = [gte(listen.durationMS, 30000), isNotNull(track.name), isNotNull(track.isrc)];

    // Add entity filters
    if (artistId) {
      conditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      conditions.push(eq(albumTrack.albumId, albumId));
    }

    // Add date filters
    if (startDate) conditions.push(gte(listen.playedAt, startDate));
    if (endDate) conditions.push(sql`${listen.playedAt} <= ${endDate}`);

    const topTracksResult = await query
      .where(and(...conditions))
      .groupBy(track.isrc, track.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    // Filter out null values and convert to BaseTopTrack format
    const topTracks: BaseTopTrack[] = topTracksResult
      .filter((track) => track.trackName && track.trackIsrc)
      .map((track) => ({
        trackName: track.trackName!,
        trackIsrc: track.trackIsrc!,
        listenCount: track.listenCount,
        totalDuration: track.totalDuration,
        imageUrl: track.imageUrl
      }));

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

export async function getTrackData(isrc: string) {
  try {
    const trackRows = await db
      .select({
        name: track.name,
        isrc: track.isrc,
        durationMS: track.durationMS,
        imageUrl: album.imageUrl
      })
      .from(track)
      .leftJoin(albumTrack, eq(track.isrc, albumTrack.trackIsrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(eq(track.isrc, isrc))
      .limit(1);
    const trackData = trackRows[0];

    if (!trackData) return null;

    // Get artists for this track
    const trackArtists = await db.query.trackArtist.findMany({
      where: (trackArtist, { eq }) => eq(trackArtist.trackIsrc, isrc)
    });

    const artists = await db.query.artist.findMany({
      where: (artist, { inArray }) =>
        inArray(
          artist.id,
          trackArtists.map((ta) => ta.artistId)
        )
    });

    return {
      track: trackData,
      artists
    };
  } catch (error) {
    console.error("Error fetching track data:", error);
    return null;
  }
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
