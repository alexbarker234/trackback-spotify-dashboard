import LocalDate from "@/components/LocalDate";
import LocalTime from "@/components/LocalTime";
import { auth } from "@/lib/auth";
import { formatDuration, formatTime } from "@/lib/utils/timeUtils";
import { album, albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface AlbumStats {
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
  uniqueTracks: number;
  uniqueArtists: number;
}

interface TopTrack {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
}

interface TopArtist {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
  totalDuration: number;
}

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
      uniqueTracks: 0,
      uniqueArtists: 0
    };
  }
}

async function getTopTracks(albumId: string, limit: number = 10): Promise<TopTrack[]> {
  try {
    const topTracks = await db
      .select({
        trackName: track.name,
        trackIsrc: track.isrc,
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration"),
        imageUrl: album.imageUrl
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(and(eq(albumTrack.albumId, albumId), gte(listen.durationMS, 30000)))
      .groupBy(track.isrc, track.name, album.imageUrl)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return topTracks;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return [];
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
        imageUrl: album.imageUrl
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
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

  const [albumData, stats, topTracks, topArtists, recentListens] = await Promise.all([
    getAlbumData(albumId),
    getAlbumStats(albumId),
    getTopTracks(albumId),
    getTopArtists(albumId),
    getRecentListens(albumId)
  ]);

  if (!albumData) {
    notFound();
  }

  const { album, artists } = albumData;

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Album Header */}
        <div className="mb-8 flex gap-4">
          <div>{album.imageUrl && <img src={album.imageUrl} className="h-32 w-32 rounded-lg object-cover" />}</div>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-zinc-100">{album.name}</h1>
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
              {stats.uniqueTracks} tracks • {stats.uniqueArtists} artists
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
                <span className="text-right text-zinc-100">
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
                <span className="text-right text-zinc-100">
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
                <span className="text-zinc-400">Unique Tracks:</span>
                <span className="text-zinc-100">{stats.uniqueTracks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tracks */}
        {topTracks.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Tracks</h3>
            <div className="space-y-2">
              {topTracks.map((track, index) => (
                <div key={track.trackIsrc} className="rounded-lg bg-zinc-800 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-16 text-2xl font-bold text-zinc-400">#{index + 1}</span>
                      <div className="flex items-center gap-4">
                        {track.imageUrl && (
                          <img
                            src={track.imageUrl}
                            alt={`${track.trackName} album cover`}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <Link
                            href={`/track/${track.trackIsrc}`}
                            className="text-zinc-100 transition-colors hover:text-zinc-300"
                          >
                            {track.trackName}
                          </Link>
                          <p className="text-sm text-zinc-400">
                            {track.listenCount} listens • {formatDuration(track.totalDuration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Artists</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topArtists.map((artist, index) => (
                <div key={artist.artistId} className="rounded-lg bg-zinc-800 p-4">
                  <div className="flex gap-4">
                    <div className="text-lg font-bold text-zinc-400">#{index + 1}</div>
                    {artist.artistImageUrl && (
                      <img
                        src={artist.artistImageUrl}
                        alt={`${artist.artistName} artist image`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/artist/${artist.artistId}`}
                          className="font-medium text-zinc-100 transition-colors hover:text-zinc-300"
                        >
                          {artist.artistName}
                        </Link>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {artist.listenCount} listens • {formatDuration(artist.totalDuration)}
                      </p>
                    </div>
                  </div>
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
                    <div className="flex items-center gap-4">
                      {listen.imageUrl && (
                        <img
                          src={listen.imageUrl}
                          alt={`${listen.trackName} album cover`}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <Link
                          href={`/track/${listen.trackIsrc}`}
                          className="text-zinc-100 transition-colors hover:text-zinc-300"
                        >
                          {listen.trackName}
                        </Link>
                        <p className="text-sm text-zinc-400">
                          <LocalDate date={listen.playedAt} /> • <LocalTime date={listen.playedAt} />
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-100">{formatTime(listen.durationMS)}</p>
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
