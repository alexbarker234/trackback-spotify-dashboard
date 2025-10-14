import {
  album,
  albumArtist,
  albumTrack,
  and,
  artist,
  db,
  desc,
  eq,
  gte,
  listen,
  sql,
  track,
  trackArtist
} from "@workspace/database";
import { TopAlbum } from "../types";

export type TopAlbumsOptions = {
  artistId?: string;
  trackIsrc?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

export async function getTopAlbums(options: TopAlbumsOptions = {}): Promise<TopAlbum[]> {
  const { artistId, trackIsrc, startDate, endDate, limit = 250 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Add entity filters
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Add date filters
    if (startDate) whereConditions.push(gte(listen.playedAt, startDate));
    if (endDate) whereConditions.push(sql`${listen.playedAt} <= ${endDate}`);

    const topAlbums = await db
      .select({
        albumName: album.name,
        albumId: album.id,
        albumImageUrl: album.imageUrl,
        artistNames: sql<string[]>`array_agg(distinct ${artist.name}) filter (where ${artist.name} is not null)`,
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .leftJoin(albumArtist, eq(albumArtist.albumId, album.id))
      .leftJoin(artist, eq(albumArtist.artistId, artist.id))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(album.name, album.id, album.imageUrl)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    // Filter out null values and convert to TopAlbum format
    const validAlbums = topAlbums
      .filter((album) => album.albumName && album.albumId)
      .map((album) => ({
        albumName: album.albumName!,
        albumId: album.albumId!,
        albumImageUrl: album.albumImageUrl,
        artistNames: album.artistNames,
        listenCount: album.listenCount,
        totalDuration: album.totalDuration
      }));

    return validAlbums;
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return [];
  }
}

export async function getAlbumData(albumId: string) {
  try {
    // Get album data
    const albumData = await db.query.album.findFirst({
      where: (album, { eq }) => eq(album.id, albumId)
    });

    if (!albumData) return null;

    // Get artists for this album
    const albumArtists = await db.query.albumArtist.findMany({
      where: (albumArtist, { eq }) => eq(albumArtist.albumId, albumId)
    });

    const artists = await db.query.artist.findMany({
      where: (artist, { inArray }) =>
        inArray(
          artist.id,
          albumArtists.map((aa) => aa.artistId)
        )
    });

    // Get tracks for this album
    const albumTracks = await db.query.albumTrack.findMany({
      where: (albumTrack, { eq }) => eq(albumTrack.albumId, albumId)
    });

    const tracks = await db.query.track.findMany({
      where: (track, { inArray }) =>
        inArray(
          track.isrc,
          albumTracks.map((at) => at.trackIsrc)
        )
    });

    return {
      album: albumData,
      artists,
      tracks
    };
  } catch (error) {
    console.error("Error fetching album data:", error);
    return null;
  }
}
