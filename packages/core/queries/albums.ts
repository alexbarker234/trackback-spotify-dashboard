import { album, albumArtist, albumTrack, and, artist, db, desc, eq, gte, listen, sql } from "@workspace/database";
import { TopAlbum } from "../types";

export type TopAlbumsOptions = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

export async function getTopAlbumsByDateRange(options: TopAlbumsOptions = {}): Promise<TopAlbum[]> {
  const { startDate, endDate, limit = 250 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

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
    console.error("Error fetching top albums by date range:", error);
    return [];
  }
}
