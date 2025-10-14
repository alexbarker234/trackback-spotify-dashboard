import {
  album,
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
import { AlbumListenStats, ArtistListenStats, BaseListenStats, TrackListenStats } from "../types/listenStatTypes";

type GetRecentListensOptions = {
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
  limit?: number;
};

export async function getRecentListens(options: GetRecentListensOptions = {}) {
  const { artistId, albumId, trackIsrc, limit = 10 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Add entity filters
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    const recentListens = await db
      .select({
        id: listen.id,
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackName: track.name,
        trackIsrc: track.isrc,
        imageUrl: album.imageUrl,
        trackDurationMS: track.durationMS,
        artistNames: sql<string[]>`array_agg(distinct ${artist.name}) filter (where ${artist.name} is not null)`,
        albumName: album.name
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .leftJoin(artist, eq(trackArtist.artistId, artist.id))
      .where(and(...whereConditions))
      .groupBy(
        listen.id,
        listen.durationMS,
        listen.playedAt,
        track.name,
        track.isrc,
        albumTrack.trackId,
        album.name,
        album.imageUrl
      )
      .orderBy(desc(listen.playedAt))
      .limit(limit);

    return recentListens;
  } catch (error) {
    console.error("Error fetching recent listens:", error);
    return [];
  }
}

type GetDailyStreamDataOptions = {
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
  days?: number;
};

export async function getDailyStreamData(options: GetDailyStreamDataOptions = {}) {
  const { artistId, albumId, trackIsrc, days = -1 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    let startDate: Date | null = null;

    // Only add date filter if days is not -1 (get all data)
    if (days !== -1) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    const dailyStreams = await db
      .select({
        date: sql<string>`date(${listen.playedAt})`.as("date"),
        streamCount: sql<number>`count(*)`.as("streamCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`date(${listen.playedAt})`)
      .orderBy(sql`date(${listen.playedAt})`);

    // Convert string values to numbers
    const streamData = dailyStreams.map((day) => ({
      ...day,
      streamCount: Number(day.streamCount),
      totalDuration: Number(day.totalDuration)
    }));

    // If no data returned, return empty array
    if (streamData.length === 0) {
      return streamData;
    }

    // Get the first and last dates from the actual data
    const firstDate = new Date(streamData[0]!.date);
    const lastDate = new Date(streamData[streamData.length - 1]!.date);

    // Generate complete date range and fill missing days with 0
    const streamDataMap = new Map(streamData.map((item) => [item.date, item]));
    const completeData: Array<{
      date: string;
      streamCount: number;
      totalDuration: number;
    }> = [];

    const currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split("T")[0]!;
      const existingData = streamDataMap.get(dateString);

      completeData.push({
        date: dateString,
        streamCount: existingData ? existingData.streamCount : 0,
        totalDuration: existingData ? existingData.totalDuration : 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return completeData;
  } catch (error) {
    console.error("Error fetching daily stream data:", error);
    return [];
  }
}

export async function getCumulativeStreamData(options: GetDailyStreamDataOptions = {}) {
  const { artistId, albumId, trackIsrc, days = -1 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Only add date filter if days is not -1 (get all data)
    if (days !== -1) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    // WARNING streamCount and totalDuration are returned as strings!
    const dailyStreams = await db
      .select({
        date: sql<string>`date(${listen.playedAt})`.as("date"),
        streamCount: sql<number>`count(*)`.as("streamCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`date(${listen.playedAt})`)
      .orderBy(sql`date(${listen.playedAt})`);

    // Calculate cumulative values
    let cumulativeStreams = 0;
    let cumulativeDuration = 0;

    const cumulativeData = dailyStreams.map((day) => {
      const streamCount = Number(day.streamCount);
      const totalDuration = Number(day.totalDuration);

      cumulativeStreams += streamCount;
      cumulativeDuration += totalDuration;

      return {
        date: day.date,
        streamCount,
        totalDuration,
        cumulativeStreams,
        cumulativeDuration
      };
    });

    return cumulativeData;
  } catch (error) {
    console.error("Error fetching cumulative stream data:", error);
    return [];
  }
}

export async function getMonthlyStreamData(options: GetDailyStreamDataOptions = {}) {
  const { artistId, albumId, trackIsrc, days = -1 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Only add date filter if days is not -1 (get all data)
    if (days !== -1) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    const monthlyStreams = await db
      .select({
        month: sql<string>`to_char(${listen.playedAt}, 'Month')`.as("month"),
        monthNumber: sql<number>`extract(month from ${listen.playedAt})`.as("monthNumber"),
        streamCount: sql<number>`count(*)`.as("streamCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`to_char(${listen.playedAt}, 'Month')`, sql`extract(month from ${listen.playedAt})`)
      .orderBy(sql`extract(month from ${listen.playedAt})`);

    // Convert string values to numbers
    return monthlyStreams.map((month) => ({
      ...month,
      monthNumber: Number(month.monthNumber),
      streamCount: Number(month.streamCount),
      totalDuration: Number(month.totalDuration)
    }));
  } catch (error) {
    console.error("Error fetching monthly stream data:", error);
    return [];
  }
}

export async function getYearlyStreamData(options: GetDailyStreamDataOptions = {}) {
  const { artistId, albumId, trackIsrc, days = -1 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Only add date filter if days is not -1 (get all data)
    if (days !== -1) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    const yearlyStreams = await db
      .select({
        year: sql<string>`to_char(${listen.playedAt}, 'YYYY')`.as("year"),
        streamCount: sql<number>`count(*)`.as("streamCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`to_char(${listen.playedAt}, 'YYYY')`)
      .orderBy(sql`to_char(${listen.playedAt}, 'YYYY')`);

    // Convert string values to numbers
    return yearlyStreams.map((year) => ({
      ...year,
      streamCount: Number(year.streamCount),
      totalDuration: Number(year.totalDuration)
    }));
  } catch (error) {
    console.error("Error fetching yearly stream data:", error);
    return [];
  }
}

type GetYearlyPercentageDataOptions = {
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
};

export async function getYearlyPercentageData(options: GetYearlyPercentageDataOptions) {
  const { artistId, albumId, trackIsrc } = options;

  try {
    // Get total listens per year
    const totalListensPerYear = await db
      .select({
        year: sql<string>`to_char(${listen.playedAt}, 'YYYY')`.as("year"),
        totalListens: sql<number>`count(*)`.as("totalListens")
      })
      .from(listen)
      .where(gte(listen.durationMS, 30000))
      .groupBy(sql`to_char(${listen.playedAt}, 'YYYY')`)
      .orderBy(sql`to_char(${listen.playedAt}, 'YYYY')`);

    const whereConditions = [gte(listen.durationMS, 30000)];

    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Get listens for the specific item per year
    const itemListensPerYear = await db
      .select({
        year: sql<string>`to_char(${listen.playedAt}, 'YYYY')`.as("year"),
        itemListens: sql<number>`count(*)`.as("itemListens")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`to_char(${listen.playedAt}, 'YYYY')`)
      .orderBy(sql`to_char(${listen.playedAt}, 'YYYY')`);

    // Create a map for quick lookup
    const totalMap = new Map(totalListensPerYear.map((item) => [item.year, Number(item.totalListens)]));
    const itemMap = new Map(itemListensPerYear.map((item) => [item.year, Number(item.itemListens)]));

    // Combine data and calculate percentages
    const allYears = new Set([...totalMap.keys(), ...itemMap.keys()]);
    const result = Array.from(allYears)
      .map((year) => {
        const total = totalMap.get(year) || 0;
        const item = itemMap.get(year) || 0;
        const other = total - item;

        return {
          year,
          itemPercentage: total > 0 ? (item / total) * 100 : 0,
          otherPercentage: total > 0 ? (other / total) * 100 : 0,
          itemListens: item,
          otherListens: other,
          totalListens: total
        };
      })
      .sort((a, b) => a.year.localeCompare(b.year));

    // Remove years with no listens from both ends
    const trimmedResult = [...result];

    // Remove trailing years with no listens to the item
    while (trimmedResult.length > 0) {
      const lastYear = trimmedResult[trimmedResult.length - 1];
      if (lastYear && lastYear.itemListens === 0) {
        trimmedResult.pop();
      } else {
        break;
      }
    }

    // Remove leading years with no listens to the item
    while (trimmedResult.length > 0) {
      const firstYear = trimmedResult[0];
      if (firstYear && firstYear.itemListens === 0) {
        trimmedResult.shift();
      } else {
        break;
      }
    }

    return trimmedResult;
  } catch (error) {
    console.error("Error fetching yearly percentage data:", error);
    return [];
  }
}

type GetDailyUniqueStreamDataOptions = {
  days?: number;
  startDate?: Date;
  endDate?: Date;
  groupBy?: "day" | "week" | "month" | "year";
};

export async function getDailyUniqueStreamData(options: GetDailyUniqueStreamDataOptions = {}) {
  const { days = -1, startDate, endDate, groupBy = "day" } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Handle date filtering - priority: startDate/endDate > days > all data
    if (startDate) {
      whereConditions.push(gte(listen.playedAt, startDate));
    } else if (days !== -1) {
      const calculatedStartDate = new Date();
      calculatedStartDate.setDate(calculatedStartDate.getDate() - days);
      whereConditions.push(gte(listen.playedAt, calculatedStartDate));
    }

    if (endDate) {
      whereConditions.push(sql`${listen.playedAt} <= ${endDate}`);
    }

    // Determine the SQL grouping expression based on groupBy parameter
    let dateGroupBy: ReturnType<typeof sql>;
    let orderByClause: ReturnType<typeof sql>;

    switch (groupBy) {
      case "week":
        // Group by ISO week (year + week number)
        dateGroupBy = sql`to_char(${listen.playedAt}, 'IYYY-IW')`;
        orderByClause = sql`to_char(${listen.playedAt}, 'IYYY-IW')`;
        break;
      case "month":
        // Group by year-month
        dateGroupBy = sql`to_char(${listen.playedAt}, 'YYYY-MM')`;
        orderByClause = sql`to_char(${listen.playedAt}, 'YYYY-MM')`;
        break;
      case "year":
        // Group by year
        dateGroupBy = sql`to_char(${listen.playedAt}, 'YYYY')`;
        orderByClause = sql`to_char(${listen.playedAt}, 'YYYY')`;
        break;
      case "day":
      default:
        // Group by day (default)
        dateGroupBy = sql`date(${listen.playedAt})`;
        orderByClause = sql`date(${listen.playedAt})`;
        break;
    }

    const uniqueStreams = await db
      .select({
        date: sql<string>`${dateGroupBy}`.as("date"),
        streamCount: sql<number>`count(*)`.as("streamCount"),
        uniqueTracks: sql<number>`count(distinct ${track.isrc})`.as("uniqueTracks"),
        uniqueArtists: sql<number>`count(distinct ${trackArtist.artistId})`.as("uniqueArtists")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(dateGroupBy)
      .orderBy(orderByClause);

    // Convert string values to numbers
    const streamData = uniqueStreams.map((item) => ({
      date: item.date,
      streamCount: Number(item.streamCount),
      uniqueTracks: Number(item.uniqueTracks),
      uniqueArtists: Number(item.uniqueArtists)
    }));

    // For daily grouping, fill in missing days
    if (groupBy === "day" && streamData.length > 0) {
      const firstDate = new Date(streamData[0]!.date);
      const lastDate = new Date(streamData[streamData.length - 1]!.date);

      const streamDataMap = new Map(streamData.map((item) => [item.date, item]));
      const completeData: Array<{
        date: string;
        streamCount: number;
        uniqueTracks: number;
        uniqueArtists: number;
      }> = [];

      const currentDate = new Date(firstDate);
      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split("T")[0]!;
        const existingData = streamDataMap.get(dateString);

        completeData.push({
          date: dateString,
          streamCount: existingData ? existingData.streamCount : 0,
          uniqueTracks: existingData ? existingData.uniqueTracks : 0,
          uniqueArtists: existingData ? existingData.uniqueArtists : 0
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return completeData;
    }

    return streamData;
  } catch (error) {
    console.error("Error fetching daily unique stream data:", error);
    return [];
  }
}

async function calculateBaseStats(
  listens: Array<{ durationMS: number; playedAt: Date }>
): Promise<{ stats: Omit<BaseListenStats, "avgDuration">; avgDuration: number }> {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalListens = listens.length;
  const totalDuration = listens.reduce((sum, l) => sum + l.durationMS, 0);

  const yearListens = listens.filter((l) => l.playedAt >= oneYearAgo).length;
  const yearDuration = listens.filter((l) => l.playedAt >= oneYearAgo).reduce((sum, l) => sum + l.durationMS, 0);

  const monthListens = listens.filter((l) => l.playedAt >= oneMonthAgo).length;
  const monthDuration = listens.filter((l) => l.playedAt >= oneMonthAgo).reduce((sum, l) => sum + l.durationMS, 0);

  const weekListens = listens.filter((l) => l.playedAt >= oneWeekAgo).length;
  const weekDuration = listens.filter((l) => l.playedAt >= oneWeekAgo).reduce((sum, l) => sum + l.durationMS, 0);

  const firstListen = listens.length > 0 ? listens[listens.length - 1]!.playedAt : null;
  const lastListen = listens.length > 0 ? listens[0]!.playedAt : null;

  const avgDuration = totalListens > 0 ? totalDuration / totalListens : 0;

  return {
    stats: {
      totalListens,
      totalDuration,
      yearListens,
      yearDuration,
      monthListens,
      monthDuration,
      weekListens,
      weekDuration,
      firstListen,
      lastListen
    },
    avgDuration
  };
}

export async function getBasicListenStats(): Promise<BaseListenStats> {
  try {
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt
      })
      .from(listen)
      .where(gte(listen.durationMS, 30000))
      .orderBy(desc(listen.playedAt));

    const { stats } = await calculateBaseStats(allListens);

    return stats;
  } catch (error) {
    console.error("Error fetching basic listen stats:", error);
    return {
      totalListens: 0,
      totalDuration: 0,
      yearListens: 0,
      yearDuration: 0,
      monthListens: 0,
      monthDuration: 0,
      weekListens: 0,
      weekDuration: 0,
      firstListen: null,
      lastListen: null
    };
  }
}

export async function getTrackListenStats(trackIsrc: string): Promise<TrackListenStats> {
  try {
    // Get all listens for this track
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .where(and(eq(track.isrc, trackIsrc), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt));

    const { stats, avgDuration } = await calculateBaseStats(allListens);

    // Get track duration for completion rate calculation
    const trackData = await db.query.track.findFirst({
      where: (track, { eq }) => eq(track.isrc, trackIsrc)
    });

    const trackDuration = trackData?.durationMS || 0;
    const completionRate = trackDuration > 0 ? (avgDuration / trackDuration) * 100 : 0;

    return {
      ...stats,
      avgDuration,
      completionRate
    };
  } catch (error) {
    console.error("Error fetching track listen stats:", error);
    return {
      totalListens: 0,
      totalDuration: 0,
      yearListens: 0,
      yearDuration: 0,
      monthListens: 0,
      monthDuration: 0,
      weekListens: 0,
      weekDuration: 0,
      firstListen: null,
      lastListen: null,
      avgDuration: 0,
      completionRate: 0
    };
  }
}

export async function getArtistListenStats(artistId: string): Promise<ArtistListenStats> {
  try {
    // Get all listens for this artist
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackIsrc: track.isrc
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(eq(trackArtist.artistId, artistId), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt));

    const { stats, avgDuration } = await calculateBaseStats(allListens);

    // Get unique tracks
    const uniqueTracks = new Set(allListens.map((l) => l.trackIsrc)).size;

    // Get unique albums for this artist
    const albumTracks = await db
      .select({ albumId: albumTrack.albumId })
      .from(albumTrack)
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(eq(trackArtist.artistId, artistId));

    const uniqueAlbums = new Set(albumTracks.map((at) => at.albumId)).size;

    // TODO: Implement artist-level completion rate
    const completionRate = 0;

    return {
      ...stats,
      avgDuration,
      uniqueTracks,
      uniqueAlbums,
      completionRate
    };
  } catch (error) {
    console.error("Error fetching artist listen stats:", error);
    return {
      totalListens: 0,
      totalDuration: 0,
      yearListens: 0,
      yearDuration: 0,
      monthListens: 0,
      monthDuration: 0,
      weekListens: 0,
      weekDuration: 0,
      firstListen: null,
      lastListen: null,
      avgDuration: 0,
      uniqueTracks: 0,
      uniqueAlbums: 0,
      completionRate: 0
    };
  }
}

export async function getAlbumListenStats(albumId: string): Promise<AlbumListenStats> {
  try {
    // Get all listens for this album
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackIsrc: track.isrc
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .where(and(eq(albumTrack.albumId, albumId), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt));

    const { stats, avgDuration } = await calculateBaseStats(allListens);

    // Get unique tracks
    const uniqueTracks = new Set(allListens.map((l) => l.trackIsrc)).size;

    // Get unique artists for this album
    const artistTracks = await db
      .select({ artistId: trackArtist.artistId })
      .from(albumTrack)
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(eq(albumTrack.albumId, albumId));

    const uniqueArtists = new Set(artistTracks.map((at) => at.artistId)).size;

    // TODO: Implement album-level completion rate
    const completionRate = 0;

    return {
      ...stats,
      avgDuration,
      uniqueTracks,
      uniqueArtists,
      completionRate
    };
  } catch (error) {
    console.error("Error fetching album listen stats:", error);
    return {
      totalListens: 0,
      totalDuration: 0,
      yearListens: 0,
      yearDuration: 0,
      monthListens: 0,
      monthDuration: 0,
      weekListens: 0,
      weekDuration: 0,
      firstListen: null,
      lastListen: null,
      avgDuration: 0,
      completionRate: 0,
      uniqueTracks: 0,
      uniqueArtists: 0
    };
  }
}

type GetHourlyListenDataOptions = {
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
  startDate?: Date;
  endDate?: Date;
};

export async function getHourlyListenData(options: GetHourlyListenDataOptions = {}) {
  const { artistId, albumId, trackIsrc, startDate, endDate } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Add entity filters
    if (artistId) {
      whereConditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      whereConditions.push(eq(albumTrack.albumId, albumId));
    } else if (trackIsrc) {
      whereConditions.push(eq(albumTrack.trackIsrc, trackIsrc));
    }

    // Handle date filtering
    if (startDate) {
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    if (endDate) {
      whereConditions.push(sql`${listen.playedAt} <= ${endDate}`);
    }

    const hourlyListens = await db
      .select({
        hour: sql<number>`extract(hour from ${listen.playedAt})`.as("hour"),
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`extract(hour from ${listen.playedAt})`)
      .orderBy(sql`extract(hour from ${listen.playedAt})`);

    const hourlyData = hourlyListens.map((item) => ({
      hour: Number(item.hour),
      listenCount: Number(item.listenCount),
      totalDuration: Number(item.totalDuration)
    }));

    // Fill in missing hours with 0 values
    const completeHourlyData = new Array(24).fill(null).map((_, index) => {
      const existingData = hourlyData.find((item) => item.hour === index);
      return {
        hour: index,
        listenCount: existingData?.listenCount || 0,
        totalDuration: existingData?.totalDuration || 0
      };
    });

    return completeHourlyData;
  } catch (error) {
    console.error("Error fetching hourly listen data:", error);
    return [];
  }
}
