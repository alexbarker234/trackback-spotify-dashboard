import { and, db, gte, listen, sql } from "@workspace/database";

import { getTopArtists } from "./artists";
import { getTopTracks } from "./tracks";

export type WidgetFourWeekStats = {
  period: "4weeks";
  topArtist: {
    artistName: string;
    artistId: string;
    artistImageUrl: string | null;
  } | null;
  topTrack: {
    trackName: string;
    trackIsrc: string;
    imageUrl: string | null;
    artistName: string | null;
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
        artistImageUrl: artists[0].artistImageUrl
      }
    : null;

  const topTrackRow = tracks[0];
  const topTrack = topTrackRow
    ? {
        trackName: topTrackRow.trackName,
        trackIsrc: topTrackRow.trackIsrc,
        imageUrl: topTrackRow.imageUrl,
        artistName: topTrackRow.artists[0]?.artistName ?? null
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
