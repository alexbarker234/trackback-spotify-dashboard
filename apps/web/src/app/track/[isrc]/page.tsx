import BackNav from "@/components/BackNav";
import AlbumGrid from "@/components/cards/AlbumGrid";
import ListenCard from "@/components/cards/ListenCard";
import LocalDate from "@/components/LocalDate";
import LocalTime from "@/components/LocalTime";
import { auth } from "@/lib/auth";
import { formatDuration, formatTime } from "@/lib/utils/timeUtils";
import { Listen, TopAlbum } from "@/types";
import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface TrackStats {
  totalListens: number;
  totalDuration: number;
  yearListens: number;
  yearDuration: number;
  monthListens: number;
  monthDuration: number;
  weekListens: number;
  weekDuration: number;
  firstListen: Date | null;
  lastListen: Date | null;
  avgDuration: number;
  completionRate: number;
}

async function getTrackData(isrc: string) {
  try {
    const trackRows = await db
      .select({
        name: track.name,
        isrc: track.isrc,
        durationMS: track.durationMS,
        imageUrl: album.imageUrl
      })
      .from(track)
      .leftJoin(albumTrack, eq(track.isrc, albumTrack.trackIsrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(eq(track.isrc, isrc))
      .limit(1);
    const trackData = trackRows[0];

    if (!trackData) return null;

    // Get artists for this track
    const trackArtists = await db.query.trackArtist.findMany({
      where: (trackArtist, { eq }) => eq(trackArtist.trackIsrc, isrc)
    });

    const artists = await db.query.artist.findMany({
      where: (artist, { inArray }) =>
        inArray(
          artist.id,
          trackArtists.map((ta) => ta.artistId)
        )
    });

    return {
      track: trackData,
      artists
    };
  } catch (error) {
    console.error("Error fetching track data:", error);
    return null;
  }
}

async function getTrackStats(isrc: string): Promise<TrackStats> {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all listens for this track
    const allListens = await db
      .select({
        durationMS: listen.durationMS,
        playedAt: listen.playedAt
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .where(and(eq(track.isrc, isrc), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt));

    // Get track duration for completion rate calculation
    const trackData = await db.query.track.findFirst({
      where: (track, { eq }) => eq(track.isrc, isrc)
    });

    const trackDuration = trackData?.durationMS || 0;

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
    const completionRate = trackDuration > 0 ? (avgDuration / trackDuration) * 100 : 0;

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
      completionRate
    };
  } catch (error) {
    console.error("Error fetching track stats:", error);
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
      completionRate: 0
    };
  }
}

async function getTopAlbums(isrc: string, limit: number = 10): Promise<TopAlbum[]> {
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
      .where(and(eq(albumTrack.trackIsrc, isrc), gte(listen.durationMS, 30000)))
      .groupBy(album.id, album.name, album.imageUrl)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return topAlbums;
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return [];
  }
}

async function getRecentListens(isrc: string, limit: number = 10): Promise<Listen[]> {
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
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(and(eq(track.isrc, isrc), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt))
      .limit(limit);

    return recentListens;
  } catch (error) {
    console.error("Error fetching recent listens:", error);
    return [];
  }
}

export default async function TrackPage({ params }: { params: Promise<{ isrc: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { isrc } = await params;

  const [trackData, stats, recentListens, topAlbums] = await Promise.all([
    getTrackData(isrc),
    getTrackStats(isrc),
    getRecentListens(isrc),
    getTopAlbums(isrc)
  ]);

  if (!trackData) {
    notFound();
  }

  const { track, artists } = trackData;

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        <BackNav />
        {/* Track Header */}
        <div className="mb-8 flex gap-4">
          <div>
            <img src={track.imageUrl} className="h-32 w-32 rounded-lg object-cover" />
          </div>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-zinc-100">{track.name}</h1>
            <div className="mb-4 flex flex-wrap gap-2">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="text-lg text-zinc-300 transition-colors hover:text-zinc-400"
                >
                  {artist.name}
                </Link>
              ))}
            </div>
            <div className="text-sm text-zinc-400">
              Duration: {formatTime(track.durationMS)} • ISRC: {track.isrc}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Listens */}
          <div className="rounded-lg bg-zinc-800 p-6">
            <h3 className="mb-2 text-sm font-medium text-zinc-400">Total Listens</h3>
            <p className="text-3xl font-bold text-zinc-100">{stats.totalListens.toLocaleString()}</p>
            <p className="text-sm text-zinc-500">{formatDuration(stats.totalDuration)} total time</p>
          </div>

          {/* This Year */}
          <div className="rounded-lg bg-zinc-800 p-6">
            <h3 className="mb-2 text-sm font-medium text-zinc-400">This Year</h3>
            <p className="text-3xl font-bold text-zinc-100">{stats.yearListens.toLocaleString()}</p>
            <p className="text-sm text-zinc-500">{formatDuration(stats.yearDuration)} total time</p>
          </div>

          {/* This Month */}
          <div className="rounded-lg bg-zinc-800 p-6">
            <h3 className="mb-2 text-sm font-medium text-zinc-400">This Month</h3>
            <p className="text-3xl font-bold text-zinc-100">{stats.monthListens.toLocaleString()}</p>
            <p className="text-sm text-zinc-500">{formatDuration(stats.monthDuration)} total time</p>
          </div>

          {/* This Week */}
          <div className="rounded-lg bg-zinc-800 p-6">
            <h3 className="mb-2 text-sm font-medium text-zinc-400">This Week</h3>
            <p className="text-3xl font-bold text-zinc-100">{stats.weekListens.toLocaleString()}</p>
            <p className="text-sm text-zinc-500">{formatDuration(stats.weekDuration)} total time</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Listen History */}
          <div className="rounded-lg bg-zinc-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Listen History</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">First Listen:</span>
                <span className="text-zinc-100">
                  {stats.firstListen ? (
                    <>
                      <LocalDate date={stats.firstListen} />
                      <br />
                      <LocalTime date={stats.firstListen} />
                    </>
                  ) : (
                    "Never"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Last Listen:</span>
                <span className="text-zinc-100">
                  {stats.lastListen ? (
                    <>
                      <LocalDate date={stats.lastListen} />
                      <br />
                      <LocalTime date={stats.lastListen} />
                    </>
                  ) : (
                    "Never"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Listen Quality */}
          <div className="rounded-lg bg-zinc-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Listen Quality</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Average Duration:</span>
                <span className="text-zinc-100">{formatTime(stats.avgDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Completion Rate:</span>
                <span className="text-zinc-100">{stats.completionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
