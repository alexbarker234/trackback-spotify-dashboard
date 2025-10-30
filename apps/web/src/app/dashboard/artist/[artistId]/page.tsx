import AlbumGrid from "@/components/cards/AlbumGrid";
import ListenCard from "@/components/cards/ListenCard";
import TrackCard from "@/components/cards/TrackCard";
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
import { Suspense } from "react";
import Link from "next/link";

async function ArtistHeader({
  artistData
}: {
  artistData: Awaited<ReturnType<typeof getArtistData>>;
}) {
  const { artist } = artistData;
  return (
    <ItemHeader
      imageUrl={artist.imageUrl}
      name={artist.name}
      subtitle={`${artistData.tracks.length} tracks • ${artistData.albums.length} albums`}
    />
  );
}

async function StatsSection({ artistId }: { artistId: string }) {
  const stats = await getArtistListenStats(artistId);
  return <StatGrid stats={stats} />;
}

async function ChartsSection({ artistId, artistName }: { artistId: string; artistName: string }) {
  const [dailyStreamData, cumulativeStreamData, yearlyPercentageData, hourlyListenData] =
    await Promise.all([
      getDailyStreamData({ artistId }),
      getCumulativeStreamData({ artistId }),
      getYearlyPercentageData({ artistId }),
      getHourlyListenData({ artistId })
    ]);

  return (
    <>
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {yearlyPercentageData.length > 0 && (
        <YearlyPercentageChart data={yearlyPercentageData} itemName={artistName} />
      )}
      {hourlyListenData.length > 0 && <HourlyListensRadialChart data={hourlyListenData} />}
      <ListeningHeatmap artistId={artistId} />
    </>
  );
}

async function TopTracksSection({ artistId }: { artistId: string }) {
  const topTracks = await getTopTracksForArtist(artistId);
  if (topTracks.length === 0) return null;
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Tracks</h3>
      <div className="space-y-2">
        {topTracks.map((track, index) => (
          <TrackCard key={track.trackIsrc} track={track} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

async function TopAlbumsSection({ artistId }: { artistId: string }) {
  const topAlbums = await getTopAlbums({ artistId });
  return <AlbumGrid albums={topAlbums} />;
}

async function RecentListensSection({ artistId, artistName }: { artistId: string; artistName: string }) {
  const recentListens = await getRecentListens({ artistId });
  if (recentListens.length === 0) return null;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">Recent Listens</h3>
        <Link
          href={{ pathname: "/dashboard/history", query: { type: "artist", id: artistId, name: artistName } }}
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

export default async function ArtistPage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;
  const artistData = await getArtistData(artistId);
  if (!artistData) return <NoData />;

  return (
    <ItemPageSkeleton>
      {/* Artist Header */}
      <Suspense fallback={<Loading />}>
        <ArtistHeader artistData={artistData} />
      </Suspense>

      {/* Statistics Grid */}
      <Suspense fallback={<Loading />}>
        <StatsSection artistId={artistId} />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={<Loading />}>
        <ChartsSection artistId={artistId} artistName={artistData.artist.name} />
      </Suspense>

      {/* Top Tracks */}
      <Suspense fallback={<Loading />}>
        <TopTracksSection artistId={artistId} />
      </Suspense>

      {/* Top Albums */}
      <Suspense fallback={<Loading />}>
        <TopAlbumsSection artistId={artistId} />
      </Suspense>

      {/* Recent Listens */}
      <Suspense fallback={<Loading />}>
        <RecentListensSection artistId={artistId} artistName={artistData.artist.name} />
      </Suspense>
    </ItemPageSkeleton>
  );
}
