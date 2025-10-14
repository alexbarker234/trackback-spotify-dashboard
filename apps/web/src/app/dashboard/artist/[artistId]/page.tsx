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
import { TopAlbum } from "@/types";
import {
  getArtistListenStats,
  getCumulativeStreamData,
  getDailyStreamData,
  getHourlyListenData,
  getRecentListensForArtist,
  getTopTracksForArtist,
  getYearlyPercentageData
} from "@workspace/core";
import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";

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
    getTopAlbums(artistId),
    getRecentListensForArtist(artistId),
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
