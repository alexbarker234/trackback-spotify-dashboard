import AlbumGrid from "@/components/cards/AlbumGrid";
import ListenCard from "@/components/cards/ListenCard";
import CumulativeStreamChart from "@/components/charts/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/DailyStreamChart";
import HourlyListensRadialChart from "@/components/charts/HourlyListensRadialChart";
import YearlyPercentageChart from "@/components/charts/YearlyPercentageChart";
import ItemHeader from "@/components/itemPage/ItemHeader";
import ItemPageSkeleton from "@/components/itemPage/ItemPageSkeleton";
import NoData from "@/components/NoData";
import StatGrid from "@/components/statsGrid/StatGrid";
import { auth } from "@/lib/auth";
import { formatTime } from "@/lib/utils/timeUtils";
import { Listen, TopAlbum } from "@/types";
import {
  getCumulativeStreamData,
  getDailyStreamData,
  getHourlyListenData,
  getTrackListenStats,
  getYearlyPercentageData
} from "@workspace/core";
import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getTrackData(isrc: string) {
  try {
    const trackRows = await db
      .select({
        name: track.name,
        isrc: track.isrc,
        durationMS: track.durationMS,
        imageUrl: album.imageUrl
      })
      .from(track)
      .leftJoin(albumTrack, eq(track.isrc, albumTrack.trackIsrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(eq(track.isrc, isrc))
      .limit(1);
    const trackData = trackRows[0];

    if (!trackData) return null;

    // Get artists for this track
    const trackArtists = await db.query.trackArtist.findMany({
      where: (trackArtist, { eq }) => eq(trackArtist.trackIsrc, isrc)
    });

    const artists = await db.query.artist.findMany({
      where: (artist, { inArray }) =>
        inArray(
          artist.id,
          trackArtists.map((ta) => ta.artistId)
        )
    });

    return {
      track: trackData,
      artists
    };
  } catch (error) {
    console.error("Error fetching track data:", error);
    return null;
  }
}

async function getTopAlbums(isrc: string, limit: number = 10): Promise<TopAlbum[]> {
  try {
    const topAlbums = await db
      .select({
        albumName: album.name,
        albumId: album.id,
        albumImageUrl: album.imageUrl,
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(and(eq(albumTrack.trackIsrc, isrc), gte(listen.durationMS, 30000)))
      .groupBy(album.id, album.name, album.imageUrl)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return topAlbums;
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return [];
  }
}

async function getRecentListens(isrc: string, limit: number = 10): Promise<Listen[]> {
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
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(and(eq(track.isrc, isrc), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt))
      .limit(limit);

    return recentListens;
  } catch (error) {
    console.error("Error fetching recent listens:", error);
    return [];
  }
}

export default async function TrackPage({ params }: { params: Promise<{ isrc: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { isrc } = await params;

  const [
    trackData,
    stats,
    recentListens,
    topAlbums,
    dailyStreamData,
    cumulativeStreamData,
    yearlyPercentageData,
    hourlyListenData
  ] = await Promise.all([
    getTrackData(isrc),
    getTrackListenStats(isrc),
    getRecentListens(isrc),
    getTopAlbums(isrc),
    getDailyStreamData({ trackIsrc: isrc }),
    getCumulativeStreamData({ trackIsrc: isrc }),
    getYearlyPercentageData({ trackIsrc: isrc }),
    getHourlyListenData({ trackIsrc: isrc })
  ]);

  if (!trackData) {
    return <NoData />;
  }

  const { track, artists } = trackData;

  return (
    <ItemPageSkeleton>
      {/* Track Header */}
      <ItemHeader
        imageUrl={track.imageUrl}
        name={track.name}
        artists={artists}
        subtitle={`Duration: ${formatTime(track.durationMS)}`}
      />

      {/* Statistics Grid */}
      <StatGrid stats={stats} />

      {/* Daily Stream Chart */}
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {/* Cumulative Stream Chart */}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {/* Yearly Percentage Chart */}
      {yearlyPercentageData.length > 0 && <YearlyPercentageChart data={yearlyPercentageData} itemName={track.name} />}
      {/* Hourly Listens Chart */}
      {hourlyListenData.length > 0 && <HourlyListensRadialChart data={hourlyListenData} />}

      {/* Albums */}
      <AlbumGrid albums={topAlbums} />

      {/* Recent Listens */}
      {recentListens.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Recent Listens</h3>
          <div className="space-y-2">
            {recentListens.map((listen) => (
              <ListenCard key={listen.id} listen={listen} />
            ))}
          </div>
        </div>
      )}
    </ItemPageSkeleton>
  );
}
