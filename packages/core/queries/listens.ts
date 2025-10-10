import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";

export async function getRecentListensForArtist(artistId: string, limit: number = 10) {
  try {
    const recentListens = await db
      .select({
        id: listen.id,
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackName: track.name,
        trackIsrc: track.isrc,
        imageUrl: album.imageUrl,
        trackDurationMS: track.durationMS
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(and(eq(trackArtist.artistId, artistId), gte(listen.durationMS, 30000)))
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
};

export async function getDailyUniqueStreamData(options: GetDailyUniqueStreamDataOptions = {}) {
  const { days = -1 } = options;

  try {
    const whereConditions = [gte(listen.durationMS, 30000)];

    // Only add date filter if days is not -1 (get all data)
    if (days !== -1) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      whereConditions.push(gte(listen.playedAt, startDate));
    }

    const dailyUniqueStreams = await db
      .select({
        date: sql<string>`date(${listen.playedAt})`.as("date"),
        uniqueTracks: sql<number>`count(distinct ${track.isrc})`.as("uniqueTracks"),
        uniqueArtists: sql<number>`count(distinct ${trackArtist.artistId})`.as("uniqueArtists")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(...whereConditions))
      .groupBy(sql`date(${listen.playedAt})`)
      .orderBy(sql`date(${listen.playedAt})`);

    // Convert string values to numbers
    const streamData = dailyUniqueStreams.map((day) => ({
      ...day,
      uniqueTracks: Number(day.uniqueTracks),
      uniqueArtists: Number(day.uniqueArtists)
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
      uniqueTracks: number;
      uniqueArtists: number;
    }> = [];

    const currentDate = new Date(firstDate);
    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split("T")[0]!;
      const existingData = streamDataMap.get(dateString);

      completeData.push({
        date: dateString,
        uniqueTracks: existingData ? existingData.uniqueTracks : 0,
        uniqueArtists: existingData ? existingData.uniqueArtists : 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return completeData;
  } catch (error) {
    console.error("Error fetching daily unique stream data:", error);
    return [];
  }
}
