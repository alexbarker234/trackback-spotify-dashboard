import {
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

export type WeeklyTopArtist = {
  week: string;
  artistId: string;
  artistName: string;
  artistImageUrl: string | null;
  listenCount: number;
  rank: number;
};

export async function getWeeklyTopArtists(
  options: { limit?: number; movingAverageWeeks?: number } = {}
): Promise<WeeklyTopArtist[]> {
  const { limit = 10, movingAverageWeeks = 4 } = options;

  try {
    // First, get all weekly data
    const weeklyData = await db
      .select({
        week: sql<string>`DATE_TRUNC('week', ${listen.playedAt})`.as("week"),
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
      .where(and(gte(listen.durationMS, 30000), sql`${artist.name} IS NOT NULL`))
      .groupBy(sql`DATE_TRUNC('week', ${listen.playedAt})`, artist.name, artist.id, artist.imageUrl)
      .orderBy(sql`DATE_TRUNC('week', ${listen.playedAt})`, desc(sql<number>`count(*)`));

    // Group by week and artist
    const weekGroups = new Map<string, Map<string, (typeof weeklyData)[0]>>();
    const allWeeks = new Set<string>();
    const allArtists = new Set<string>();

    weeklyData.forEach((row) => {
      if (!weekGroups.has(row.week)) {
        weekGroups.set(row.week, new Map());
      }
      weekGroups.get(row.week)!.set(row.artistId!, row);
      allWeeks.add(row.week);
      allArtists.add(row.artistId!);
    });

    // Calculate moving averages
    const sortedWeeks = Array.from(allWeeks).sort();
    const movingAverageData: WeeklyTopArtist[] = [];

    sortedWeeks.forEach((currentWeek, weekIndex) => {
      const artistAverages = new Map<string, { total: number; count: number }>();

      // Look back the specified number of weeks (including current week)
      const startWeekIndex = Math.max(0, weekIndex - (movingAverageWeeks - 1));
      const relevantWeeks = sortedWeeks.slice(startWeekIndex, weekIndex + 1);

      // Calculate moving average for each artist
      allArtists.forEach((artistId) => {
        let totalListens = 0;
        let weekCount = 0;

        relevantWeeks.forEach((week) => {
          const weekData = weekGroups.get(week);
          if (weekData && weekData.has(artistId)) {
            const artistData = weekData.get(artistId)!;
            totalListens += Number(artistData.listenCount);
            weekCount++;
          }
        });

        if (weekCount > 0) {
          const averageListens = Math.round(totalListens / weekCount);
          artistAverages.set(artistId, { total: averageListens, count: weekCount });
        }
      });

      // Convert to array and sort by moving average
      const sortedArtists = Array.from(artistAverages.entries())
        .map(([artistId, data]) => {
          const artistData = weeklyData.find((row) => row.artistId === artistId);
          return {
            artistId,
            artistName: artistData?.artistName || "Unknown",
            artistImageUrl: artistData?.artistImageUrl || null,
            listenCount: data.total,
            weekCount: data.count
          };
        })
        .sort((a, b) => b.listenCount - a.listenCount)
        .slice(0, limit);

      // Add rankings
      sortedArtists.forEach((artist, index) => {
        movingAverageData.push({
          week: currentWeek,
          artistId: artist.artistId,
          artistName: artist.artistName,
          artistImageUrl: artist.artistImageUrl,
          listenCount: artist.listenCount,
          rank: index + 1
        });
      });
    });

    return movingAverageData.sort((a, b) => a.week.localeCompare(b.week));
  } catch (error) {
    console.error("Error fetching weekly top artists:", error);
    return [];
  }
}

export async function getArtistData(artistId: string) {
  try {
    // Get artist data
    const artistData = await db.query.artist.findFirst({
      where: (artist, { eq }) => eq(artist.id, artistId)
    });

    if (!artistData) return null;

    // Get tracks for this artist
    const trackArtists = await db.query.trackArtist.findMany({
      where: (trackArtist, { eq }) => eq(trackArtist.artistId, artistId)
    });

    const tracks = await db.query.track.findMany({
      where: (track, { inArray }) =>
        inArray(
          track.isrc,
          trackArtists.map((ta) => ta.trackIsrc)
        )
    });

    // Get albums for this artist
    const albumArtists = await db.query.albumArtist.findMany({
      where: (albumArtist, { eq }) => eq(albumArtist.artistId, artistId)
    });

    const albums = await db.query.album.findMany({
      where: (album, { inArray }) =>
        inArray(
          album.id,
          albumArtists.map((aa) => aa.albumId)
        )
    });

    return {
      artist: artistData,
      tracks,
      albums
    };
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return null;
  }
}
