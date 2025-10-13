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
import { auth } from "@/lib/auth";
import { TopArtist } from "@/types";
import {
  getAlbumListenStats,
  getCumulativeStreamData,
  getDailyStreamData,
  getHourlyListenData,
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
    yearlyPercentageData,
    hourlyListenData
  ] = await Promise.all([
    getAlbumData(albumId),
    getAlbumListenStats(albumId),
    getTopTracksForAlbum(albumId),
    getTopArtists(albumId),
    getRecentListens(albumId),
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
