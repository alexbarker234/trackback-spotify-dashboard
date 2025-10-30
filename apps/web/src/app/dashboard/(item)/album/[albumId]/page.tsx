import ArtistCard from "@/components/cards/ArtistCard";
import ListenCard from "@/components/cards/ListenCard";
import TrackCard from "@/components/cards/TrackCard";
import CumulativeStreamChart from "@/components/charts/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/DailyStreamChart";
import HourlyListensRadialChart from "@/components/charts/HourlyListensRadialChart";
import ListeningHeatmap from "@/components/charts/ListeningHeatmap";
import YearlyPercentageChart from "@/components/charts/YearlyPercentageChart";
import ExpandableList from "@/components/ExpandableList";
import ItemHeader from "@/components/itemPage/ItemHeader";
import ItemPageSkeleton from "@/components/itemPage/ItemPageSkeleton";
import Loading from "@/components/Loading";
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
import Link from "next/link";
import { Suspense } from "react";

async function AlbumHeader({ albumData }: { albumData: Awaited<ReturnType<typeof getAlbumData>> }) {
  const { album, artists } = albumData;
  return (
    <ItemHeader
      imageUrl={album.imageUrl}
      name={album.name}
      artists={artists}
      subtitle={`${albumData.tracks.length} tracks • ${albumData.artists.length} artists`}
    />
  );
}

async function StatsSection({ albumId }: { albumId: string }) {
  const stats = await getAlbumListenStats(albumId);
  return <StatGrid stats={stats} />;
}

async function ChartsSection({ albumId, albumName }: { albumId: string; albumName: string }) {
  const [dailyStreamData, cumulativeStreamData, yearlyPercentageData, hourlyListenData] =
    await Promise.all([
      getDailyStreamData({ albumId }),
      getCumulativeStreamData({ albumId }),
      getYearlyPercentageData({ albumId }),
      getHourlyListenData({ albumId })
    ]);

  return (
    <>
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {yearlyPercentageData.length > 0 && (
        <YearlyPercentageChart data={yearlyPercentageData} itemName={albumName} />
      )}
      {hourlyListenData.length > 0 && <HourlyListensRadialChart data={hourlyListenData} />}
      <ListeningHeatmap albumId={albumId} />
    </>
  );
}

async function TopTracksSection({ albumId }: { albumId: string }) {
  const topTracks = await getTopTracksForAlbum(albumId, 100);
  if (topTracks.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Tracks on this album</h3>
      <ExpandableList containerClassName="space-y-2">
        {topTracks.map((track, index) => (
          <TrackCard key={track.trackIsrc} track={track} rank={index + 1} />
        ))}
      </ExpandableList>
    </div>
  );
}

async function TopArtistsSection({ albumId }: { albumId: string }) {
  const topArtists = await getTopArtists({ albumId });
  if (topArtists.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Artists on this album</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topArtists.map((artist, index) => (
          <ArtistCard key={artist.artistId} artist={artist} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

async function RecentListensSection({
  albumId,
  albumName
}: {
  albumId: string;
  albumName: string;
}) {
  const recentListens = await getRecentListens({ albumId });
  if (recentListens.length === 0) return null;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">Recent Album Listens</h3>
        <Link
          href={{
            pathname: "/dashboard/history",
            query: { type: "album", id: albumId, name: albumName }
          }}
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

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const { albumId } = await params;
  const albumData = await getAlbumData(albumId);
  if (!albumData) return <NoData />;

  return (
    <ItemPageSkeleton>
      {/* Album Header */}
      <Suspense fallback={<Loading />}>
        <AlbumHeader albumData={albumData} />
      </Suspense>

      {/* Statistics Grid */}
      <Suspense fallback={<Loading />}>
        <StatsSection albumId={albumId} />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={<Loading />}>
        <ChartsSection albumId={albumId} albumName={albumData.album.name} />
      </Suspense>

      {/* Top Tracks */}
      <Suspense fallback={<Loading />}>
        <TopTracksSection albumId={albumId} />
      </Suspense>

      {/* Top Artists */}
      <Suspense fallback={<Loading />}>
        <TopArtistsSection albumId={albumId} />
      </Suspense>

      {/* Recent Listens */}
      <Suspense fallback={<Loading />}>
        <RecentListensSection albumId={albumId} albumName={albumData.album.name} />
      </Suspense>
    </ItemPageSkeleton>
  );
}
