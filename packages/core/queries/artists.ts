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
  options: { limit?: number } = {}
): Promise<WeeklyTopArtist[]> {
  const { limit = 10 } = options;

  try {
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

    // Add ranking for each week
    const weeklyRankings: WeeklyTopArtist[] = [];
    const weekGroups = new Map<string, typeof weeklyData>();

    // Group by week
    weeklyData.forEach((row) => {
      if (!weekGroups.has(row.week)) {
        weekGroups.set(row.week, []);
      }
      weekGroups.get(row.week)!.push(row);
    });

    // Add rankings and limit to top N per week
    weekGroups.forEach((weekData, week) => {
      weekData.slice(0, limit).forEach((artist, index) => {
        weeklyRankings.push({
          week,
          artistId: artist.artistId!,
          artistName: artist.artistName!,
          artistImageUrl: artist.artistImageUrl,
          listenCount: Number(artist.listenCount),
          rank: index + 1
        });
      });
    });

    return weeklyRankings.sort((a, b) => a.week.localeCompare(b.week));
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
