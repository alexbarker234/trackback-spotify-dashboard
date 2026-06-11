import { albumTrack, and, db, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";

import { getTopArtists } from "./artists";
import { getTopTracks } from "./tracks";

export type WidgetLifetimeStats = {
  period: "lifetime";
  totalStreams: number;
  minutesListened: number;
  hoursListened: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  uniqueArtists: number;
};

export type WidgetFourWeekStats = {
  period: "4weeks";
  topArtist: {
    artistName: string;
    artistId: string;
    artistImageUrl: string | null;
    listenCount: number;
  } | null;
  topTrack: {
    trackName: string;
    trackIsrc: string;
    imageUrl: string | null;
    artistName: string | null;
    listenCount: number;
  } | null;
  totalStreams: number;
  minutesListened: number;
};

export function getFourWeekDateRange(): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 28);
  return { startDate, endDate };
}

async function getListenTotalsForRange(startDate: Date, endDate: Date) {
  const [row] = await db
    .select({
      streamCount: sql<number>`count(*)`.as("streamCount"),
      totalDurationMs: sql<number>`coalesce(sum(${listen.durationMS}), 0)`.as("totalDurationMs")
    })
    .from(listen)
    .where(
      and(
        gte(listen.durationMS, 30000),
        gte(listen.playedAt, startDate),
        sql`${listen.playedAt} <= ${endDate}`
      )
    );

  return {
    streamCount: Number(row?.streamCount ?? 0),
    totalDurationMs: Number(row?.totalDurationMs ?? 0)
  };
}

export async function getWidgetLifetimeStats(): Promise<WidgetLifetimeStats> {
  const [row] = await db
    .select({
      streamCount: sql<number>`count(*)`.as("streamCount"),
      totalDurationMs: sql<number>`coalesce(sum(${listen.durationMS}), 0)`.as("totalDurationMs"),
      uniqueTracks: sql<number>`count(distinct ${track.isrc})`.as("uniqueTracks"),
      uniqueAlbums: sql<number>`count(distinct ${albumTrack.albumId})`.as("uniqueAlbums"),
      uniqueArtists: sql<number>`count(distinct ${trackArtist.artistId})`.as("uniqueArtists")
    })
    .from(listen)
    .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
    .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
    .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
    .where(gte(listen.durationMS, 30000));

  const totalDurationMs = Number(row?.totalDurationMs ?? 0);

  return {
    period: "lifetime",
    totalStreams: Number(row?.streamCount ?? 0),
    minutesListened: Math.round(totalDurationMs / 60000),
    hoursListened: Math.round(totalDurationMs / 3600000),
    uniqueTracks: Number(row?.uniqueTracks ?? 0),
    uniqueAlbums: Number(row?.uniqueAlbums ?? 0),
    uniqueArtists: Number(row?.uniqueArtists ?? 0)
  };
}

export async function getWidgetFourWeekStats(): Promise<WidgetFourWeekStats> {
  const { startDate, endDate } = getFourWeekDateRange();

  const [artists, tracks, totals] = await Promise.all([
    getTopArtists({ startDate, endDate, limit: 1 }),
    getTopTracks({ startDate, endDate, limit: 1 }),
    getListenTotalsForRange(startDate, endDate)
  ]);

  const topArtist = artists[0]
    ? {
        artistName: artists[0].artistName,
        artistId: artists[0].artistId,
        artistImageUrl: artists[0].artistImageUrl,
        listenCount: artists[0].listenCount
      }
    : null;

  const topTrackRow = tracks[0];
  const topTrack = topTrackRow
    ? {
        trackName: topTrackRow.trackName,
        trackIsrc: topTrackRow.trackIsrc,
        imageUrl: topTrackRow.imageUrl,
        artistName: topTrackRow.artists[0]?.artistName ?? null,
        listenCount: topTrackRow.listenCount
      }
    : null;

  return {
    period: "4weeks",
    topArtist,
    topTrack,
    totalStreams: totals.streamCount,
    minutesListened: Math.round(totals.totalDurationMs / 60000)
  };
}
