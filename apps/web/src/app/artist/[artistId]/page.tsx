import AlbumGrid from "@/components/cards/AlbumGrid";
import ListenCard from "@/components/cards/ListenCard";
import TrackCard from "@/components/cards/TrackCard";
import CumulativeStreamChart from "@/components/charts/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/DailyStreamChart";
import YearlyPercentageChart from "@/components/charts/YearlyPercentageChart";
import ItemPageSkeleton from "@/components/itemPage/ItemPageSkeleton";
import StatGrid, { Stats } from "@/components/StatGrid";
import { auth } from "@/lib/auth";
import { TopAlbum } from "@/types";
import {
  getCumulativeStreamData,
  getDailyStreamData,
  getRecentListensForArtist,
  getTopTracksForArtist,
  getYearlyPercentageData
} from "@workspace/core";
import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

async function getArtistData(artistId: string) {
  try {
    // Get artist data
    const artistData = await db.query.artist.findFirst({
      where: (artist, { eq }) => eq(artist.id, artistId)
    });

    if (!artistData) return null;

    // Get tracks for this artist
    const trackArtists = await db.query.trackArtist.findMany({
      where: (trackArtist, { eq }) => eq(trackArtist.artistId, artistId)
    });

    const tracks = await db.query.track.findMany({
      where: (track, { inArray }) =>
        inArray(
          track.isrc,
          trackArtists.map((ta) => ta.trackIsrc)
        )
    });

    // Get albums for this artist
    const albumArtists = await db.query.albumArtist.findMany({
      where: (albumArtist, { eq }) => eq(albumArtist.artistId, artistId)
    });

    const albums = await db.query.album.findMany({
      where: (album, { inArray }) =>
        inArray(
          album.id,
          albumArtists.map((aa) => aa.albumId)
        )
    });

    return {
      artist: artistData,
      tracks,
      albums
    };
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return null;
  }
}

type ArtistStats = Stats & {
  uniqueTracks: number;
  uniqueAlbums: number;
};

async function getArtistStats(artistId: string): Promise<ArtistStats> {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all listens for this artist
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackIsrc: track.isrc
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(eq(trackArtist.artistId, artistId), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt));

    // Calculate statistics
    const totalListens = allListens.length;
    const totalDuration = allListens.reduce((sum, l) => sum + l.durationMS, 0);

    const yearListens = allListens.filter((l) => l.playedAt >= oneYearAgo).length;
    const yearDuration = allListens.filter((l) => l.playedAt >= oneYearAgo).reduce((sum, l) => sum + l.durationMS, 0);

    const monthListens = allListens.filter((l) => l.playedAt >= oneMonthAgo).length;
    const monthDuration = allListens.filter((l) => l.playedAt >= oneMonthAgo).reduce((sum, l) => sum + l.durationMS, 0);

    const weekListens = allListens.filter((l) => l.playedAt >= oneWeekAgo).length;
    const weekDuration = allListens.filter((l) => l.playedAt >= oneWeekAgo).reduce((sum, l) => sum + l.durationMS, 0);

    const firstListen = allListens.length > 0 ? allListens[allListens.length - 1].playedAt : null;
    const lastListen = allListens.length > 0 ? allListens[0].playedAt : null;

    const avgDuration = totalListens > 0 ? totalDuration / totalListens : 0;

    // Get unique tracks and albums
    const uniqueTracks = new Set(allListens.map((l) => l.trackIsrc)).size;

    // Get unique albums for this artist
    const albumTracks = await db
      .select({ albumId: albumTrack.albumId })
      .from(albumTrack)
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(eq(trackArtist.artistId, artistId));

    const uniqueAlbums = new Set(albumTracks.map((at) => at.albumId)).size;

    // TODO
    const completionRate = 0;

    return {
      totalListens,
      totalDuration,
      yearListens,
      yearDuration,
      monthListens,
      monthDuration,
      weekListens,
      weekDuration,
      firstListen,
      lastListen,
      avgDuration,
      uniqueTracks,
      uniqueAlbums,
      completionRate
    };
  } catch (error) {
    console.error("Error fetching artist stats:", error);
    return {
      totalListens: 0,
      totalDuration: 0,
      yearListens: 0,
      yearDuration: 0,
      monthListens: 0,
      monthDuration: 0,
      weekListens: 0,
      weekDuration: 0,
      firstListen: null,
      lastListen: null,
      avgDuration: 0,
      uniqueTracks: 0,
      uniqueAlbums: 0,
      completionRate: 0
    };
  }
}

async function getTopAlbums(artistId: string, limit: number = 10): Promise<TopAlbum[]> {
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
      .where(and(eq(trackArtist.artistId, artistId), gte(listen.durationMS, 30000)))
      .groupBy(album.id, album.name, album.imageUrl)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return topAlbums;
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return [];
  }
}

export default async function ArtistPage({ params }: { params: Promise<{ artistId: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { artistId } = await params;

  const [
    artistData,
    stats,
    topTracks,
    topAlbums,
    recentListens,
    dailyStreamData,
    cumulativeStreamData,
    yearlyPercentageData
  ] = await Promise.all([
    getArtistData(artistId),
    getArtistStats(artistId),
    getTopTracksForArtist(artistId),
    getTopAlbums(artistId),
    getRecentListensForArtist(artistId),
    getDailyStreamData({ artistId }),
    getCumulativeStreamData({ artistId }),
    getYearlyPercentageData({ artistId })
  ]);

  if (!artistData) {
    notFound();
  }

  const { artist } = artistData;
  return (
    <ItemPageSkeleton>
      {/* Artist Header */}
      <div className="flex gap-4">
        <div>{artist.imageUrl && <img src={artist.imageUrl} className="h-32 w-32 rounded-lg object-cover" />}</div>
        <div>
          <h1 className="mb-2 text-4xl font-bold text-zinc-100">{artist.name}</h1>
          <div className="text-sm text-zinc-400">
            {stats.uniqueTracks} tracks • {stats.uniqueAlbums} albums
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <StatGrid stats={stats} />

      {/* Daily Stream Chart */}
      {dailyStreamData.length > 0 && <DailyStreamChart data={dailyStreamData} />}
      {/* Cumulative Stream Chart */}
      {cumulativeStreamData.length > 0 && <CumulativeStreamChart data={cumulativeStreamData} />}
      {/* Yearly Percentage Chart */}
      {yearlyPercentageData.length > 0 && <YearlyPercentageChart data={yearlyPercentageData} itemName={artist.name} />}

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
