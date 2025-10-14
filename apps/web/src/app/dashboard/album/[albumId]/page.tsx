import ArtistCard from "@/components/cards/ArtistCard";
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
  getAlbumListenStats,
  getCumulativeStreamData,
  getDailyStreamData,
  getHourlyListenData,
  getRecentListens,
  getTopTracksForAlbum,
  getYearlyPercentageData
} from "@workspace/core";
import { getAlbumData } from "@workspace/core/queries/albums";
import { getTopArtists } from "@workspace/core/queries/artists";

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;

  const [
    albumData,
    stats,
    topTracks,
    topArtists,
    recentListens,
    dailyStreamData,
    cumulativeStreamData,
    yearlyPercentageData,
    hourlyListenData
  ] = await Promise.all([
    getAlbumData(albumId),
    getAlbumListenStats(albumId),
    getTopTracksForAlbum(albumId),
    getTopArtists({ albumId }),
    getRecentListens({ albumId }),
    getDailyStreamData({ albumId }),
    getCumulativeStreamData({ albumId }),
    getYearlyPercentageData({ albumId }),
    getHourlyListenData({ albumId })
  ]);

  if (!albumData) {
    return <NoData />;
  }

  const { album, artists } = albumData;

  return (
    <ItemPageSkeleton>
      {/* Album Header */}
      <ItemHeader
        imageUrl={album.imageUrl}
        name={album.name}
        artists={artists}
        subtitle={`${stats.uniqueTracks} tracks • ${stats.uniqueArtists} artists`}
      />

      {/* Statistics Grid */}
      <StatGrid stats={stats} />

      {/* Daily Stream Chart */}
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {/* Cumulative Stream Chart */}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {/* Yearly Percentage Chart */}
      {yearlyPercentageData.length > 0 && <YearlyPercentageChart data={yearlyPercentageData} itemName={album.name} />}
      {/* Hourly Listens Chart */}
      {hourlyListenData.length > 0 && <HourlyListensRadialChart data={hourlyListenData} />}

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Tracks on this album</h3>
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <TrackCard key={track.trackIsrc} track={track} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Top Artists */}
      {topArtists.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Artists on this album</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {topArtists.map((artist, index) => (
              <ArtistCard key={artist.artistId} artist={artist} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Listens */}
      {recentListens.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Recent Album Listens</h3>
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
