import AlbumGrid from "@/components/cards/AlbumGrid";
import ListenCard from "@/components/cards/ListenCard";
import TrackCard from "@/components/cards/TrackCard";
import CumulativeStreamChart from "@/components/charts/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/DailyStreamChart";
import HourlyListensRadialChart from "@/components/charts/HourlyListensRadialChart";
import YearlyPercentageChart from "@/components/charts/YearlyPercentageChart";
import ItemHeader from "@/components/itemPage/ItemHeader";
import ItemPageSkeleton from "@/components/itemPage/ItemPageSkeleton";
import NoData from "@/components/NoData";
import StatGrid from "@/components/statsGrid/StatGrid";
import {
  getArtistListenStats,
  getCumulativeStreamData,
  getDailyStreamData,
  getHourlyListenData,
  getRecentListens,
  getTopTracksForArtist,
  getYearlyPercentageData
} from "@workspace/core";
import { getTopAlbums } from "@workspace/core/queries/albums";
import { getArtistData } from "@workspace/core/queries/artists";

export default async function ArtistPage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;

  const [
    artistData,
    stats,
    topTracks,
    topAlbums,
    recentListens,
    dailyStreamData,
    cumulativeStreamData,
    yearlyPercentageData,
    hourlyListenData
  ] = await Promise.all([
    getArtistData(artistId),
    getArtistListenStats(artistId),
    getTopTracksForArtist(artistId),
    getTopAlbums({ artistId }),
    getRecentListens({ artistId }),
    getDailyStreamData({ artistId }),
    getCumulativeStreamData({ artistId }),
    getYearlyPercentageData({ artistId }),
    getHourlyListenData({ artistId })
  ]);

  if (!artistData) {
    return <NoData />;
  }

  const { artist } = artistData;
  return (
    <ItemPageSkeleton>
      {/* Artist Header */}
      <ItemHeader
        imageUrl={artist.imageUrl}
        name={artist.name}
        subtitle={`${stats.uniqueTracks} tracks • ${stats.uniqueAlbums} albums`}
      />

      {/* Statistics Grid */}
      <StatGrid stats={stats} />

      {/* Daily Stream Chart */}
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {/* Cumulative Stream Chart */}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {/* Yearly Percentage Chart */}
      {yearlyPercentageData.length > 0 && <YearlyPercentageChart data={yearlyPercentageData} itemName={artist.name} />}
      {/* Hourly Listens Chart */}
      {hourlyListenData.length > 0 && <HourlyListensRadialChart data={hourlyListenData} />}

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Tracks</h3>
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <TrackCard key={track.trackIsrc} track={track} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {topAlbums.length > 0 && <AlbumGrid albums={topAlbums} />}

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
