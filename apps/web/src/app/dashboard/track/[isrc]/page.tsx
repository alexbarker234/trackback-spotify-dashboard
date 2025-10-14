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

export default async function TrackPage({ params }: { params: Promise<{ isrc: string }> }) {
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
    getRecentListens({ trackIsrc: isrc }),
    getTopAlbums({ trackIsrc: isrc }),
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
