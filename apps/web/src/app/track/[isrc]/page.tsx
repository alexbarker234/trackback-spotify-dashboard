import LocalDate from "@/components/LocalDate";
import LocalTime from "@/components/LocalTime";
import { albumTrack, and, db, desc, eq, gte, listen, track } from "@workspace/database";
import Link from "next/link";
import { notFound } from "next/navigation";

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

interface TrackPageProps {
  params: {
    isrc: string;
  };
}

async function getTrackData(isrc: string) {
  try {
    // Get track with artists and albums
    const trackData = await db.query.track.findFirst({
      where: (track, { eq }) => eq(track.isrc, isrc)
    });

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

    // Get albums for this track
    const albumTracks = await db.query.albumTrack.findMany({
      where: (albumTrack, { eq }) => eq(albumTrack.trackIsrc, isrc)
    });

    const albums = await db.query.album.findMany({
      where: (album, { inArray }) =>
        inArray(
          album.id,
          albumTracks.map((at) => at.albumId)
        )
    });

    return {
      track: trackData,
      artists,
      albums
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

async function getRecentListens(isrc: string, limit: number = 10) {
  try {
    const recentListens = await db
      .select({
        id: listen.id,
        durationMS: listen.durationMS,
        playedAt: listen.playedAt
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .where(and(eq(track.isrc, isrc), gte(listen.durationMS, 30000)))
      .orderBy(desc(listen.playedAt))
      .limit(limit);

    return recentListens;
  } catch (error) {
    console.error("Error fetching recent listens:", error);
    return [];
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
  }
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { isrc } = params;

  const [trackData, stats, recentListens] = await Promise.all([
    getTrackData(isrc),
    getTrackStats(isrc),
    getRecentListens(isrc)
  ]);

  if (!trackData) {
    notFound();
  }

  const { track, artists, albums } = trackData;

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Track Header */}
        <div className="mb-8 flex gap-4">
          <div>
            <img src={albums[0].imageUrl} className="h-32 w-32 rounded-lg object-cover" />
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
        {albums.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Albums</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <div key={album.id} className="rounded-lg bg-zinc-800 p-4">
                  {album.imageUrl && (
                    <img
                      src={album.imageUrl}
                      alt={`${album.name} album cover`}
                      className="mb-3 h-32 w-32 rounded-lg object-cover"
                    />
                  )}
                  <h4 className="font-medium text-zinc-100">{album.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Listens */}
        {recentListens.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Recent Listens</h3>
            <div className="space-y-2">
              {recentListens.map((listen) => (
                <div key={listen.id} className="rounded-lg bg-zinc-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-100">
                        <LocalDate date={listen.playedAt} />
                      </p>
                      <p className="text-sm text-zinc-400">
                        <LocalTime date={listen.playedAt} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-100">{formatTime(listen.durationMS)}</p>
                      <p className="text-sm text-zinc-400">
                        {((listen.durationMS / track.durationMS) * 100).toFixed(1)}% complete
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
