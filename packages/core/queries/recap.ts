import { and, db, gte, listen, sql } from "@workspace/database";
import type { TopAlbum, TopArtist, TopTrack } from "../types";
import { getTopAlbums } from "./albums";
import { getTopArtists } from "./artists";
import { getDayOfWeekStreamData, getHourlyListenData, getPeriodListenStats } from "./listens";
import { getTopTracks } from "./tracks";

export type RankComparison = {
  previousRank: number | null;
  previousListenCount: number;
};

export type Ranked<T> = T & RankComparison;

export type WeeklyRecap = {
  minutes: number;
  uniqueArtists: number;
  uniqueTracks: number;
  compareMinutes: number;
  compareUniqueArtists: number;
  compareUniqueTracks: number;
  topArtists: Ranked<TopArtist>[];
  topTracks: Ranked<TopTrack>[];
  topAlbums: Ranked<TopAlbum>[];
  dayOfWeek: Awaited<ReturnType<typeof getDayOfWeekStreamData>>;
  hourly: Awaited<ReturnType<typeof getHourlyListenData>>;
  earliestListen: string | null;
};

export type GetWeeklyRecapOptions = {
  startDate: Date;
  endDate: Date;
  compareStartDate: Date;
  compareEndDate: Date;
  tzOffsetMinutes?: number;
  limit?: number;
};

const PREVIOUS_RANK_LIMIT = 250;

function withPreviousRank<T>(
  current: T[],
  previous: T[],
  idOf: (item: T) => string,
  listensOf: (item: T) => number
): Ranked<T>[] {
  const previousById = new Map(
    previous.map((item, index) => [
      idOf(item),
      { rank: index + 1, listenCount: Number(listensOf(item)) }
    ])
  );

  return current.map((item) => {
    const prior = previousById.get(idOf(item));
    return {
      ...item,
      previousRank: prior?.rank ?? null,
      previousListenCount: prior?.listenCount ?? 0
    };
  });
}

async function getRangeMinutes(startDate: Date, endDate: Date) {
  try {
    const [row] = await db
      .select({
        totalDuration: sql<number>`coalesce(sum(${listen.durationMS}), 0)`.as("totalDuration")
      })
      .from(listen)
      .where(
        and(
          gte(listen.durationMS, 30000),
          gte(listen.playedAt, startDate),
          sql`${listen.playedAt} <= ${endDate}`
        )
      );

    return Math.round(Number(row?.totalDuration ?? 0) / 60000);
  } catch (error) {
    console.error("Error fetching range minutes:", error);
    return 0;
  }
}

export async function getEarliestListenAt(): Promise<string | null> {
  try {
    const [row] = await db
      .select({
        playedAt: sql<Date | string | null>`min(${listen.playedAt})`.as("playedAt")
      })
      .from(listen)
      .where(gte(listen.durationMS, 30000));

    if (!row?.playedAt) return null;
    const date = new Date(row.playedAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (error) {
    console.error("Error fetching earliest listen:", error);
    return null;
  }
}

export async function getWeeklyRecap(options: GetWeeklyRecapOptions): Promise<WeeklyRecap> {
  const {
    startDate,
    endDate,
    compareStartDate,
    compareEndDate,
    tzOffsetMinutes = 0,
    limit = 5
  } = options;

  const dateOptions = { startDate, endDate };
  const compareOptions = { startDate: compareStartDate, endDate: compareEndDate };

  const [
    minutes,
    compareMinutes,
    stats,
    compareStats,
    topArtists,
    previousArtists,
    topTracks,
    previousTracks,
    topAlbums,
    previousAlbums,
    dayOfWeek,
    hourly,
    earliestListen
  ] = await Promise.all([
    getRangeMinutes(startDate, endDate),
    getRangeMinutes(compareStartDate, compareEndDate),
    getPeriodListenStats(dateOptions),
    getPeriodListenStats(compareOptions),
    getTopArtists({ ...dateOptions, limit }),
    getTopArtists({ ...compareOptions, limit: PREVIOUS_RANK_LIMIT }),
    getTopTracks({ ...dateOptions, limit }),
    getTopTracks({ ...compareOptions, limit: PREVIOUS_RANK_LIMIT }),
    getTopAlbums({ ...dateOptions, limit }),
    getTopAlbums({ ...compareOptions, limit: PREVIOUS_RANK_LIMIT }),
    getDayOfWeekStreamData({ ...dateOptions, tzOffsetMinutes }),
    getHourlyListenData(dateOptions),
    getEarliestListenAt()
  ]);

  return {
    minutes,
    uniqueArtists: stats.uniqueArtists,
    uniqueTracks: stats.uniqueTracks,
    compareMinutes,
    compareUniqueArtists: compareStats.uniqueArtists,
    compareUniqueTracks: compareStats.uniqueTracks,
    topArtists: withPreviousRank(
      topArtists,
      previousArtists,
      (artist) => artist.artistId,
      (artist) => artist.listenCount
    ),
    topTracks: withPreviousRank(
      topTracks,
      previousTracks,
      (track) => track.trackIsrc,
      (track) => track.listenCount
    ),
    topAlbums: withPreviousRank(
      topAlbums,
      previousAlbums,
      (album) => album.albumId,
      (album) => album.listenCount
    ),
    dayOfWeek,
    hourly,
    earliestListen
  };
}
