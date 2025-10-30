import LinkCard from "@/components/cards/LinkCard";
import ListenCard from "@/components/cards/ListenCard";
import MonthlyStreamChart from "@/components/charts/MonthlyStreamChart";
import YearlyStreamChart from "@/components/charts/YearlyStreamChart";
import StreamItemCard from "@/components/itemCards/StreamItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import Loading from "@/components/Loading";
import NowPlaying from "@/components/NowPlaying";
import ListeningAnalytics from "@/components/statsGrid/ListeningAnalytics";
import ListeningMetricsGrid from "@/components/statsGrid/ListeningMetricsGrid";
import { auth } from "@/lib/auth";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { getTopAlbums } from "@workspace/core/queries/albums";
import {
  getLongestListeningSession,
  getLongestListeningStreak
} from "@workspace/core/queries/analytics";
import { getTopArtists } from "@workspace/core/queries/artists";
import {
  getBasicListenStats,
  getMonthlyStreamData,
  getRecentListens,
  getYearlyStreamData
} from "@workspace/core/queries/listens";
import { getTopTracks } from "@workspace/core/queries/tracks";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

async function MetricsSection() {
  const [listenStats, longestStreak, longestSession] = await Promise.all([
    getBasicListenStats(),
    getLongestListeningStreak(),
    getLongestListeningSession()
  ]);
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <ListeningMetricsGrid stats={listenStats} />
      <ListeningAnalytics stats={{ longestStreak, longestSession }} />
    </div>
  );
}

async function TopTracksSection() {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const topTracks = await getTopTracks({ startDate: fourWeeksAgo, limit: 250 });

  if (topTracks.length === 0) return null;

  return (
    <ItemCarousel
      title="Top Tracks"
      subtitle="Your top tracks from the past 4 weeks"
      viewMoreUrl="dashboard/top?type=tracks"
    >
      {topTracks.map((track, index) => (
        <StreamItemCard
          key={track.trackIsrc}
          href={`/dashboard/track/${track.trackIsrc}`}
          imageUrl={track.imageUrl}
          number={index + 1}
          title={track.trackName}
          subtitle={track.artists.map((a) => a.artistName).join(", ")}
          streams={track.listenCount}
          durationMs={track.totalDuration}
        />
      ))}
    </ItemCarousel>
  );
}

async function TopArtistsSection() {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const topArtists = await getTopArtists({ startDate: fourWeeksAgo, limit: 250 });

  if (topArtists.length === 0) return null;

  return (
    <ItemCarousel
      title="Top Artists"
      subtitle="Your top artists from the past 4 weeks"
      viewMoreUrl="dashboard/top?type=artists"
    >
      {topArtists.map((artist, index) => (
        <StreamItemCard
          key={artist.artistId}
          href={`/dashboard/artist/${artist.artistId}`}
          imageUrl={artist.artistImageUrl}
          number={index + 1}
          title={artist.artistName}
          subtitle={`${artist.listenCount} streams`}
          streams={artist.listenCount}
          durationMs={artist.totalDuration}
        />
      ))}
    </ItemCarousel>
  );
}

async function TopAlbumsSection() {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const topAlbums = await getTopAlbums({ startDate: fourWeeksAgo, limit: 250 });

  if (topAlbums.length === 0) return null;

  return (
    <ItemCarousel
      title="Top Albums"
      subtitle="Your top albums from the past 4 weeks"
      viewMoreUrl="dashboard/top?type=albums"
    >
      {topAlbums.map((album, index) => (
        <StreamItemCard
          key={album.albumId}
          href={`/dashboard/album/${album.albumId}`}
          imageUrl={album.albumImageUrl}
          number={index + 1}
          title={album.albumName}
          subtitle={album.artistNames?.join(", ")}
          streams={album.listenCount}
          durationMs={album.totalDuration}
        />
      ))}
    </ItemCarousel>
  );
}

async function StreamChartsSection() {
  const [monthlyStreamData, yearlyStreamData] = await Promise.all([
    getMonthlyStreamData(),
    getYearlyStreamData()
  ]);

  if (monthlyStreamData.length === 0 && yearlyStreamData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {monthlyStreamData.length > 0 && <MonthlyStreamChart data={monthlyStreamData} />}
      {yearlyStreamData.length > 0 && <YearlyStreamChart data={yearlyStreamData} />}
    </div>
  );
}

async function RecentListensSection() {
  const listens = await getRecentListens({ limit: 50 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-zinc-100">Recent Listens</h2>
        <Link
          href="dashboard/history"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-300"
        >
          View more
        </Link>
      </div>
      {listens.length === 0 ? (
        <div className="py-8 text-center text-zinc-400">
          No listens found. Start listening to music to see your history here!
        </div>
      ) : (
        <div className="space-y-4">
          {listens.map((listen) => (
            <ListenCard key={listen.id} listen={listen} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <>
      {/* User Profile Section */}
      {session?.user && (
        <div className="bg-black/10 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center space-x-4 px-4 py-4 sm:py-16">
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={200}
              height={200}
              className="max-h-48 max-w-48 min-w-0 shrink grow rounded-full"
            />
            <div className="shrink-0">
              <h2 className="xs:text-2xl text-xl font-bold text-zinc-100 sm:text-3xl">
                {session.user.name}
              </h2>
              <p className="xs:text-lg text-base text-zinc-400 sm:text-xl">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto my-4 flex w-full max-w-7xl flex-1 flex-col gap-5 p-4">
        {/* Now Playing Section */}
        <NowPlaying />

        {/* Metrics Section */}
        <Suspense fallback={<Loading />}>
          <MetricsSection />
        </Suspense>

        {/* On This Day Section */}
        <LinkCard
          href="dashboard/throwback"
          title="On This Day"
          description="Discover what you were listening to on this date in previous years"
          icon={faCalendar}
        />

        {/* Top Tracks Section */}
        <Suspense fallback={<Loading />}>
          <TopTracksSection />
        </Suspense>

        {/* Top Artists Section */}
        <Suspense fallback={<Loading />}>
          <TopArtistsSection />
        </Suspense>

        {/* Top Albums Section */}
        <Suspense fallback={<Loading />}>
          <TopAlbumsSection />
        </Suspense>

        {/* Stream Charts Section */}
        <Suspense fallback={<Loading />}>
          <StreamChartsSection />
        </Suspense>

        {/* Recent Listens Section */}
        <Suspense fallback={<Loading />}>
          <RecentListensSection />
        </Suspense>
      </div>
    </>
  );
}
