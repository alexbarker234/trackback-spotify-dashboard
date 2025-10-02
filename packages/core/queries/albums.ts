import { album, albumArtist, albumTrack, and, artist, db, desc, eq, gte, listen, sql } from "@workspace/database";

export type DateRange = "4weeks" | "6months" | "lifetime";

export type TopAlbumsOptions = {
  dateRange?: DateRange;
  offset?: number;
  limit?: number;
};

export type TopAlbum = {
  albumName: string;
  albumId: string;
  albumImageUrl: string | null;
  artistNames: string[];
  listenCount: number;
};

export async function getTopAlbumsByDateRange(options: TopAlbumsOptions = {}): Promise<TopAlbum[]> {
  const { dateRange = "4weeks", offset = 0, limit = 250 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Add date filter based on range
    if (dateRange !== "lifetime") {
      const startDate = new Date();
      if (dateRange === "4weeks") {
        startDate.setDate(startDate.getDate() - (28 + offset * 28));
      } else if (dateRange === "6months") {
        startDate.setMonth(startDate.getMonth() - (6 + offset * 6));
      }
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    const topAlbums = await db
      .select({
        albumName: album.name,
        albumId: album.id,
        albumImageUrl: album.imageUrl,
        artistNames: sql<string[]>`array_agg(distinct ${artist.name}) filter (where ${artist.name} is not null)`,
        listenCount: sql<number>`count(*)`.as("listenCount")
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

    return topAlbums;
  } catch (error) {
    console.error("Error fetching top albums by date range:", error);
    return [];
  }
}
