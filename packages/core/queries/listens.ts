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

    // Only add date filter if days is not -1 (get all data)
    if (days !== -1) {
      const startDate = new Date();
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
    return dailyStreams.map((day) => ({
      ...day,
      streamCount: Number(day.streamCount),
      totalDuration: Number(day.totalDuration)
    }));
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
