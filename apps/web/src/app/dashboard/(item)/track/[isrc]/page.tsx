import AlbumGrid from "@/components/cards/AlbumGrid";
import ListenCard from "@/components/cards/ListenCard";
import CumulativeStreamChart from "@/components/charts/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/DailyStreamChart";
import HourlyListensRadialChart from "@/components/charts/HourlyListensRadialChart";
import ListeningHeatmap from "@/components/charts/ListeningHeatmap";
import YearlyPercentageChart from "@/components/charts/YearlyPercentageChart";
import ItemHeader from "@/components/itemPage/ItemHeader";
import ItemPageSkeleton from "@/components/itemPage/ItemPageSkeleton";
import Loading from "@/components/Loading";
import NoData from "@/components/NoData";
import StatGrid from "@/components/statsGrid/StatGrid";
import { formatTime } from "@/lib/utils/timeUtils";
import {
  getCumulativeStreamData,
  getDailyStreamData,
  getHourlyListenData,
  getRecentListens,
  getTrackListenStats,
  getYearlyPercentageData
} from "@workspace/core";
import { getTopAlbums } from "@workspace/core/queries/albums";
import { getTrackData } from "@workspace/core/queries/tracks";
import { Suspense } from "react";
import Link from "next/link";

async function TrackHeader({ trackData }: { trackData: Awaited<ReturnType<typeof getTrackData>> }) {
  const { track, artists } = trackData;
  return (
    <ItemHeader
      imageUrl={track.imageUrl}
      name={track.name}
      artists={artists}
      subtitle={`Duration: ${formatTime(track.durationMS)}`}
    />
  );
}

async function StatsSection({ isrc }: { isrc: string }) {
  const stats = await getTrackListenStats(isrc);
  return <StatGrid stats={stats} />;
}

async function ChartsSection({ isrc, trackName }: { isrc: string; trackName: string }) {
  const [dailyStreamData, cumulativeStreamData, yearlyPercentageData, hourlyListenData] =
    await Promise.all([
      getDailyStreamData({ trackIsrc: isrc }),
      getCumulativeStreamData({ trackIsrc: isrc }),
      getYearlyPercentageData({ trackIsrc: isrc }),
      getHourlyListenData({ trackIsrc: isrc })
    ]);

  return (
    <>
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {yearlyPercentageData.length > 0 && (
        <YearlyPercentageChart data={yearlyPercentageData} itemName={trackName} />
      )}
      {hourlyListenData.length > 0 && <HourlyListensRadialChart data={hourlyListenData} />}
      <ListeningHeatmap trackIsrc={isrc} />
    </>
  );
}

async function AlbumsSection({ isrc }: { isrc: string }) {
  const topAlbums = await getTopAlbums({ trackIsrc: isrc });
  return <AlbumGrid albums={topAlbums} />;
}

async function RecentListensSection({ isrc, trackName }: { isrc: string; trackName: string }) {
  const recentListens = await getRecentListens({ trackIsrc: isrc });
  if (recentListens.length === 0) return null;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">Recent Listens</h3>
        <Link
          href={{ pathname: "/dashboard/history", query: { type: "track", id: isrc, name: trackName } }}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-300"
        >
          View more
        </Link>
      </div>
      <div className="space-y-2">
        {recentListens.map((listen) => (
          <ListenCard key={listen.id} listen={listen} />
        ))}
      </div>
    </div>
  );
}

export default async function TrackPage({ params }: { params: Promise<{ isrc: string }> }) {
  const { isrc } = await params;
  const trackData = await getTrackData(isrc);
  if (!trackData) return <NoData />;

  return (
    <ItemPageSkeleton>
      {/* Track Header */}
      <Suspense fallback={<Loading />}>
        <TrackHeader trackData={trackData} />
      </Suspense>

      {/* Statistics Grid */}
      <Suspense fallback={<Loading />}>
        <StatsSection isrc={isrc} />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={<Loading />}>
        <ChartsSection isrc={isrc} trackName={trackData?.track.name || ""} />
      </Suspense>

      {/* Albums */}
      <Suspense fallback={<Loading />}>
        <AlbumsSection isrc={isrc} />
      </Suspense>

      {/* Recent Listens */}
      <Suspense fallback={<Loading />}>
        <RecentListensSection isrc={isrc} trackName={trackData?.track.name || ""} />
      </Suspense>
    </ItemPageSkeleton>
  );
}
