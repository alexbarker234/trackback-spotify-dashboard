import { albumTrack, and, artist, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { TopArtist } from "../types";

export type TopArtistsOptions = {
  albumId?: string;
  trackIsrc?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

export async function getTopArtists(options: TopArtistsOptions = {}): Promise<TopArtist[]> {
  const { albumId, trackIsrc, startDate, endDate, limit = 250 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Add entity filters
    if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Add date filters
    if (startDate) whereConditions.push(gte(listen.playedAt, startDate));
    if (endDate) whereConditions.push(sql`${listen.playedAt} <= ${endDate}`);

    const topArtists = await db
      .select({
        artistName: artist.name,
        artistId: artist.id,
        artistImageUrl: artist.imageUrl,
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
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

    // Filter out null values and convert to TopArtist format
    const validArtists = topArtists
      .filter((artist) => artist.artistName && artist.artistId)
      .map((artist) => ({
        artistName: artist.artistName!,
        artistId: artist.artistId!,
        artistImageUrl: artist.artistImageUrl,
        listenCount: artist.listenCount,
        totalDuration: artist.totalDuration
      }));

    return validArtists;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    return [];
  }
}
