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

  const totalStart = Date.now();

  try {
    const dbStart = Date.now();

    // Bastard query of pain and suffering
    // Using window functions to calculate the moving average
    const result = await db.execute(sql`
      WITH weekly_counts AS (
        SELECT 
          DATE_TRUNC('week', l.played_at) as week,
          a.id as artist_id,
          a.name as artist_name,
          a.image_url as artist_image_url,
          COUNT(*) as listen_count
        FROM listen l
        LEFT JOIN album_track at ON l.track_id = at.track_id
        LEFT JOIN track t ON at.track_isrc = t.isrc
        LEFT JOIN track_artist ta ON ta.track_isrc = t.isrc
        LEFT JOIN artist a ON ta.artist_id = a.id
        WHERE l.duration_ms >= 30000 
          AND a.name IS NOT NULL
        GROUP BY DATE_TRUNC('week', l.played_at), a.id, a.name, a.image_url
      ),
      moving_averages AS (
        SELECT 
          week,
          artist_id,
          artist_name,
          artist_image_url,
          listen_count,
          ROUND(AVG(listen_count) OVER (
            PARTITION BY artist_id 
            ORDER BY week 
            ROWS BETWEEN ${movingAverageWeeks - 1} PRECEDING AND CURRENT ROW
          )) as moving_avg_count
        FROM weekly_counts
      ),
      ranked_artists AS (
        SELECT 
          week,
          artist_id,
          artist_name,
          artist_image_url,
          moving_avg_count as listen_count,
          ROW_NUMBER() OVER (
            PARTITION BY week 
            ORDER BY moving_avg_count DESC
          ) as rank
        FROM moving_averages
        WHERE moving_avg_count > 0
      )
      SELECT 
        week::text,
        artist_id,
        artist_name,
        artist_image_url,
        listen_count,
        rank
      FROM ranked_artists
      WHERE rank <= ${limit}
      ORDER BY week, rank
    `);

    const dbEnd = Date.now();
    console.log(`[getWeeklyTopArtists] DB query took ${(dbEnd - dbStart).toLocaleString()}ms`);

    const totalEnd = Date.now();
    console.log(`[getWeeklyTopArtists] TOTAL time: ${(totalEnd - totalStart).toLocaleString()}ms`);

    // Convert the result to the expected format
    return result.rows.map((row: Record<string, unknown>) => ({
      week: String(row.week),
      artistId: String(row.artist_id),
      artistName: String(row.artist_name),
      artistImageUrl: row.artist_image_url as string | null,
      listenCount: Number(row.listen_count),
      rank: Number(row.rank)
    }));
  } catch (error) {
    console.error("Error fetching weekly top artists:", error);
    return [];
  }
}

export type EvolutionStatsItem = {
  artistId: string;
  artistName: string;
  artistImageUrl: string | null;
  weeksAtNumberOne: number;
  firstWeekAtNumberOne: string;
  lastWeekAtNumberOne: string;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
};

export async function getTopArtistsByNumberOneWeeks(
  options: { limit?: number; movingAverageWeeks?: number } = {}
): Promise<EvolutionStatsItem[]> {
  const { limit = 25, movingAverageWeeks = 4 } = options;

  try {
    // Get all weekly data to calculate number 1 weeks
    const weeklyData = await getWeeklyTopArtists({ limit: 1000, movingAverageWeeks });

    // Group by artist and calculate weeks at number 1
    const artistStats = new Map<
      string,
      {
        artistId: string;
        artistName: string;
        artistImageUrl: string | null;
        weeksAtNumberOne: number;
        firstWeekAtNumberOne: string | null;
        lastWeekAtNumberOne: string | null;
        numberOneWeeks: string[];
      }
    >();

    weeklyData.forEach((week) => {
      if (week.rank === 1) {
        const existing = artistStats.get(week.artistId);
        if (existing) {
          existing.weeksAtNumberOne++;
          existing.lastWeekAtNumberOne = week.week;
          existing.numberOneWeeks.push(week.week);
        } else {
          artistStats.set(week.artistId, {
            artistId: week.artistId,
            artistName: week.artistName,
            artistImageUrl: week.artistImageUrl,
            weeksAtNumberOne: 1,
            firstWeekAtNumberOne: week.week,
            lastWeekAtNumberOne: week.week,
            numberOneWeeks: [week.week]
          });
        }
      }
    });

    // Calculate longest streak for each artist
    const calculateLongestStreak = (weeks: string[]) => {
      if (weeks.length === 0) return { streak: 0, start: "", end: "" };
      if (weeks.length === 1) return { streak: 1, start: weeks[0], end: weeks[0] };

      // Sort weeks chronologically
      const sortedWeeks = [...weeks].sort();

      let longestStreak = 1;
      let currentStreak = 1;
      let streakStart = sortedWeeks[0];
      let streakEnd = sortedWeeks[0];
      let currentStart = sortedWeeks[0];

      for (let i = 1; i < sortedWeeks.length; i++) {
        const currentWeek = new Date(sortedWeeks[i]!);
        const previousWeek = new Date(sortedWeeks[i - 1]!);

        // Check if weeks are consecutive (within 7 days)
        const daysDiff = (currentWeek.getTime() - previousWeek.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 7) {
          currentStreak++;
          streakEnd = sortedWeeks[i]!;
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            streakStart = currentStart;
            streakEnd = sortedWeeks[i - 1]!;
          }
          currentStreak = 1;
          currentStart = sortedWeeks[i]!;
          streakEnd = sortedWeeks[i]!;
        }
      }

      // Check if the last streak is the longest
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        streakStart = currentStart;
        streakEnd = sortedWeeks[sortedWeeks.length - 1];
      }

      return { streak: longestStreak, start: streakStart || "", end: streakEnd || "" };
    };

    // Convert to array and sort by weeks at number 1
    const result = Array.from(artistStats.values())
      .filter((artist) => artist.weeksAtNumberOne > 0)
      .sort((a, b) => b.weeksAtNumberOne - a.weeksAtNumberOne)
      .slice(0, limit)
      .map((artist) => {
        const streakInfo = calculateLongestStreak(artist.numberOneWeeks);
        return {
          artistId: artist.artistId,
          artistName: artist.artistName,
          artistImageUrl: artist.artistImageUrl,
          weeksAtNumberOne: artist.weeksAtNumberOne,
          firstWeekAtNumberOne: artist.firstWeekAtNumberOne!,
          lastWeekAtNumberOne: artist.lastWeekAtNumberOne!,
          longestStreak: streakInfo.streak,
          longestStreakStart: streakInfo.start || "",
          longestStreakEnd: streakInfo.end || ""
        };
      });

    return result;
  } catch (error) {
    console.error("Error fetching top artists by number one weeks:", error);
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
