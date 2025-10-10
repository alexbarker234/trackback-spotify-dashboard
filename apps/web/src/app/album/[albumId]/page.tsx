import ArtistCard from "@/components/cards/ArtistCard";
import ListenCard from "@/components/cards/ListenCard";
import TrackCard from "@/components/cards/TrackCard";
import CumulativeStreamChart from "@/components/charts/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/DailyStreamChart";
import YearlyPercentageChart from "@/components/charts/YearlyPercentageChart";
import ItemHeader from "@/components/itemPage/ItemHeader";
import ItemPageSkeleton from "@/components/itemPage/ItemPageSkeleton";
import NoData from "@/components/NoData";
import StatGrid, { Stats } from "@/components/statsGrid/StatGrid";
import { auth } from "@/lib/auth";
import { TopArtist } from "@/types";
import {
  getCumulativeStreamData,
  getDailyStreamData,
  getTopTracksForAlbum,
  getYearlyPercentageData
} from "@workspace/core";
import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getAlbumData(albumId: string) {
  try {
    // Get album data
    const albumData = await db.query.album.findFirst({
      where: (album, { eq }) => eq(album.id, albumId)
    });

    if (!albumData) return null;

    // Get artists for this album
    const albumArtists = await db.query.albumArtist.findMany({
      where: (albumArtist, { eq }) => eq(albumArtist.albumId, albumId)
    });

    const artists = await db.query.artist.findMany({
      where: (artist, { inArray }) =>
        inArray(
          artist.id,
          albumArtists.map((aa) => aa.artistId)
        )
    });

    // Get tracks for this album
    const albumTracks = await db.query.albumTrack.findMany({
      where: (albumTrack, { eq }) => eq(albumTrack.albumId, albumId)
    });

    const tracks = await db.query.track.findMany({
      where: (track, { inArray }) =>
        inArray(
          track.isrc,
          albumTracks.map((at) => at.trackIsrc)
        )
    });

    return {
      album: albumData,
      artists,
      tracks
    };
  } catch (error) {
    console.error("Error fetching album data:", error);
    return null;
  }
}

type AlbumStats = Stats & {
  uniqueTracks: number;
  uniqueArtists: number;
};

async function getAlbumStats(albumId: string): Promise<AlbumStats> {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all listens for this album
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackIsrc: track.isrc
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .where(and(eq(albumTrack.albumId, albumId), gte(listen.durationMS, 30000)))
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

    // Get unique tracks and artists
    const uniqueTracks = new Set(allListens.map((l) => l.trackIsrc)).size;

    // Get unique artists for this album
    const artistTracks = await db
      .select({ artistId: trackArtist.artistId })
      .from(albumTrack)
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(eq(albumTrack.albumId, albumId));

    const uniqueArtists = new Set(artistTracks.map((at) => at.artistId)).size;

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
      completionRate,
      uniqueTracks,
      uniqueArtists
    };
  } catch (error) {
    console.error("Error fetching album stats:", error);
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
      completionRate: 0,
      uniqueTracks: 0,
      uniqueArtists: 0
    };
  }
}

async function getTopArtists(albumId: string, limit: number = 10): Promise<TopArtist[]> {
  try {
    const topArtists = await db
      .select({
        artistName: trackArtist.artistId,
        artistId: trackArtist.artistId,
        artistImageUrl: sql<string | null>`null`.as("artistImageUrl"),
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .where(and(eq(albumTrack.albumId, albumId), gte(listen.durationMS, 30000)))
      .groupBy(trackArtist.artistId)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    // Get artist names and images
    const artistIds = topArtists.map((ta) => ta.artistId);
    const artists = await db.query.artist.findMany({
      where: (artist, { inArray }) => inArray(artist.id, artistIds)
    });

    return topArtists.map((ta) => {
      const artist = artists.find((a) => a.id === ta.artistId);
      return {
        ...ta,
        artistName: artist?.name || ta.artistName,
        artistImageUrl: artist?.imageUrl || null
      };
    });
  } catch (error) {
    console.error("Error fetching top artists:", error);
    return [];
  }
}

async function getRecentListens(albumId: string, limit: number = 10) {
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
      .innerJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .innerJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(and(eq(albumTrack.albumId, albumId), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt))
      .limit(limit);

    return recentListens;
  } catch (error) {
    console.error("Error fetching recent listens:", error);
    return [];
  }
}

export default async function AlbumPage({ params }: { params: Promise<{ albumId: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { albumId } = await params;

  const [
    albumData,
    stats,
    topTracks,
    topArtists,
    recentListens,
    dailyStreamData,
    cumulativeStreamData,
    yearlyPercentageData
  ] = await Promise.all([
    getAlbumData(albumId),
    getAlbumStats(albumId),
    getTopTracksForAlbum(albumId),
    getTopArtists(albumId),
    getRecentListens(albumId),
    getDailyStreamData({ albumId }),
    getCumulativeStreamData({ albumId }),
    getYearlyPercentageData({ albumId })
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
