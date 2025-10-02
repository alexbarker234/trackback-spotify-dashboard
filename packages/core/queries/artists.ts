import { albumTrack, and, artist, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";

export type DateRange = "4weeks" | "6months" | "lifetime";

export type TopArtistsOptions = {
  dateRange?: DateRange;
  offset?: number;
  limit?: number;
};

export type TopArtist = {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
};

export async function getTopArtistsByDateRange(options: TopArtistsOptions = {}): Promise<TopArtist[]> {
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

    const topArtists = await db
      .select({
        artistName: artist.name,
        artistId: artist.id,
        artistImageUrl: artist.imageUrl,
        listenCount: sql<number>`count(*)`.as("listenCount")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(artist, eq(trackArtist.artistId, artist.id))
      .where(and(...whereConditions))
      .groupBy(artist.name, artist.id, artist.imageUrl)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return topArtists;
  } catch (error) {
    console.error("Error fetching top artists by date range:", error);
    return [];
  }
}
