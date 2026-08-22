import {
  album,
  albumTrack,
  and,
  artist,
  db,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  listen,
  sql,
  track,
  trackArtist
} from "@workspace/database";
import { TopTrack } from "../types";

type BaseTopTrack = {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
};

export type TopTracksOptions = {
  artistId?: string;
  albumId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
};

export async function getTopTracks(options: TopTracksOptions = {}): Promise<TopTrack[]> {
  const { artistId, albumId, startDate, endDate, limit = 250 } = options;

  try {
    let query = db
      .select({
        trackName: track.name,
        trackIsrc: track.isrc,
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration"),
        imageUrl: sql<string>`min(${album.imageUrl})`.as("imageUrl")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id));

    // Add artist join and filter only when filtering by artist
    if (artistId) {
      query = query.leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc));
    }

    // Build where conditions
    const conditions = [gte(listen.durationMS, 30000), isNotNull(track.name), isNotNull(track.isrc)];

    // Add entity filters
    if (artistId) {
      conditions.push(eq(trackArtist.artistId, artistId));
    } else if (albumId) {
      conditions.push(eq(albumTrack.albumId, albumId));
    }

    // Add date filters
    if (startDate) conditions.push(gte(listen.playedAt, startDate));
    if (endDate) conditions.push(sql`${listen.playedAt} <= ${endDate}`);

    const topTracksResult = await query
      .where(and(...conditions))
      .groupBy(track.isrc, track.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    // Filter out null values and convert to BaseTopTrack format
    const topTracks: BaseTopTrack[] = topTracksResult
      .filter((track) => track.trackName && track.trackIsrc)
      .map((track) => ({
        trackName: track.trackName!,
        trackIsrc: track.trackIsrc!,
        listenCount: track.listenCount,
        totalDuration: track.totalDuration,
        imageUrl: track.imageUrl
      }));

    return populateArtists(topTracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return [];
  }
}

export async function getTopTracksForArtist(artistId: string, limit: number = 10): Promise<TopTrack[]> {
  return getTopTracks({ artistId, limit });
}

export async function getTopTracksForAlbum(albumId: string, limit: number = 10): Promise<TopTrack[]> {
  return getTopTracks({ albumId, limit });
}

export async function getTrackData(isrc: string) {
  try {
    const trackRows = await db
      .select({
        name: track.name,
        isrc: track.isrc,
        durationMS: track.durationMS,
        imageUrl: album.imageUrl,
        trackId: albumTrack.trackId
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

export type MostListenedTrackByReleaseYear = {
  year: string;
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
  artists: {
    artistName: string;
    artistId: string;
  }[];
};

/**
 * For each album release year, returns the most listened track.
 * "Most listened" uses listen count (distinct listen rows), then total duration as a tie breaker.
 */
export async function getMostListenedTracksByReleaseYear(): Promise<MostListenedTrackByReleaseYear[]> {
  try {
    // Note: we derive release year from album.release_year via album_track mapping.
    // If a track appears on multiple albums, this query uses the MIN() release_year per track.
    const query = `
      WITH track_release AS (
        SELECT
          at.track_isrc,
          MIN(a.release_year) as release_year,
          MIN(a.image_url) as image_url
        FROM album_track at
        JOIN album a ON at.album_id = a.id
        WHERE a.release_year IS NOT NULL
        GROUP BY at.track_isrc
      ),
      streams AS (
        SELECT
          tr.release_year::text as year,
          t.isrc as track_isrc,
          t.name as track_name,
          tr.image_url as image_url,
          COUNT(DISTINCT l.id) as listen_count,
          SUM(l.duration_ms) as total_duration
        FROM listen l
        JOIN album_track at ON l.track_id = at.track_id
        JOIN track t ON at.track_isrc = t.isrc
        JOIN track_release tr ON tr.track_isrc = t.isrc
        WHERE l.duration_ms >= 30000
        GROUP BY tr.release_year::text, t.isrc, t.name, tr.image_url
      ),
      ranked AS (
        SELECT
          s.*,
          ROW_NUMBER() OVER (
            PARTITION BY s.year
            ORDER BY s.listen_count DESC, s.total_duration DESC
          ) as rn
        FROM streams s
      )
      SELECT
        year,
        track_isrc,
        track_name,
        image_url,
        listen_count,
        total_duration
      FROM ranked
      WHERE rn = 1
      ORDER BY year;
    `;

    const result = await db.execute(sql.raw(query));

    const rows = result.rows as Array<Record<string, unknown>>;
    if (rows.length === 0) return [];

    const yearByIsrc = new Map<string, string>();
    const topTracksBase: BaseTopTrack[] = rows.map((r) => {
      const year = String(r.year);
      const trackIsrc = String(r.track_isrc);
      yearByIsrc.set(trackIsrc, year);

      return {
        trackName: String(r.track_name),
        trackIsrc,
        listenCount: Number(r.listen_count),
        totalDuration: Number(r.total_duration),
        imageUrl: (r.image_url as string | null) ?? null
      };
    });

    const populated = await populateArtists(topTracksBase);

    return populated.map((t) => ({
      year: yearByIsrc.get(t.trackIsrc) || "",
      trackName: t.trackName,
      trackIsrc: t.trackIsrc,
      listenCount: t.listenCount,
      totalDuration: t.totalDuration,
      imageUrl: t.imageUrl,
      artists: t.artists
    }));
  } catch (error) {
    console.error("Error fetching most listened tracks by release year:", error);
    return [];
  }
}

/**
 * Top tracks whose associated album release year matches `year`.
 * If a track appears on multiple albums, MIN(release_year) is used.
 */
export async function getTopTracksByReleaseYear(
  year: number,
  limit: number = 100
): Promise<TopTrack[]> {
  try {
    const result = await db.execute(sql`
      WITH track_release AS (
        SELECT
          at.track_isrc,
          MIN(a.release_year) as release_year,
          MIN(a.image_url) as image_url
        FROM album_track at
        JOIN album a ON at.album_id = a.id
        WHERE a.release_year IS NOT NULL
        GROUP BY at.track_isrc
      )
      SELECT
        t.isrc as track_isrc,
        t.name as track_name,
        tr.image_url as image_url,
        COUNT(DISTINCT l.id) as listen_count,
        SUM(l.duration_ms) as total_duration
      FROM listen l
      JOIN album_track at ON l.track_id = at.track_id
      JOIN track t ON at.track_isrc = t.isrc
      JOIN track_release tr ON tr.track_isrc = t.isrc
      WHERE l.duration_ms >= 30000
        AND tr.release_year = ${year}
      GROUP BY t.isrc, t.name, tr.image_url
      ORDER BY listen_count DESC, total_duration DESC
      LIMIT ${limit}
    `);
    const rows = result.rows as Array<Record<string, unknown>>;
    if (rows.length === 0) return [];

    const topTracksBase: BaseTopTrack[] = rows.map((r) => ({
      trackName: String(r.track_name),
      trackIsrc: String(r.track_isrc),
      listenCount: Number(r.listen_count),
      totalDuration: Number(r.total_duration),
      imageUrl: (r.image_url as string | null) ?? null
    }));

    return populateArtists(topTracksBase);
  } catch (error) {
    console.error("Error fetching top tracks by release year:", error);
    return [];
  }
}

export type PeakDayTrack = {
  trackName: string;
  trackIsrc: string;
  peakListenCount: number;
  peakDate: string;
  imageUrl: string | null;
  artists: {
    artistName: string;
    artistId: string;
  }[];
};

type GetTopTracksByPeakDayListensOptions = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  tzOffsetMinutes?: number;
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
};

function toDateString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

/**
 * Tracks ranked by their highest listen count on a single local calendar day.
 */
export async function getTopTracksByPeakDayListens(
  options: GetTopTracksByPeakDayListensOptions = {}
): Promise<PeakDayTrack[]> {
  const { startDate, endDate, limit = 20, tzOffsetMinutes = 0, artistId, albumId, trackIsrc } =
    options;

  try {
    const result = await db.execute(sql`
      WITH daily AS (
        SELECT
          t.isrc as track_isrc,
          t.name as track_name,
          MIN(a.image_url) as image_url,
          date(l.played_at + (${tzOffsetMinutes}::int * interval '1 minute')) as listen_date,
          COUNT(DISTINCT l.id) as listen_count
        FROM listen l
        JOIN album_track at ON l.track_id = at.track_id
        JOIN track t ON at.track_isrc = t.isrc
        LEFT JOIN album a ON at.album_id = a.id
        WHERE l.duration_ms >= 30000
          ${startDate ? sql`AND l.played_at >= ${startDate}` : sql``}
          ${endDate ? sql`AND l.played_at <= ${endDate}` : sql``}
          ${artistId ? sql`AND EXISTS (
            SELECT 1 FROM track_artist ta
            WHERE ta.track_isrc = t.isrc AND ta.artist_id = ${artistId}
          )` : sql``}
          ${albumId ? sql`AND at.album_id = ${albumId}` : sql``}
          ${trackIsrc ? sql`AND t.isrc = ${trackIsrc}` : sql``}
        GROUP BY 1, 2, 4
      ),
      best_day AS (
        SELECT
          daily.*,
          ROW_NUMBER() OVER (
            PARTITION BY track_isrc
            ORDER BY listen_count DESC, listen_date DESC
          ) as rn
        FROM daily
      )
      SELECT track_isrc, track_name, image_url, listen_date, listen_count
      FROM best_day
      WHERE rn = 1
      ORDER BY listen_count DESC, listen_date DESC
      LIMIT ${limit}
    `);

    const rows = result.rows as Array<Record<string, unknown>>;
    if (rows.length === 0) return [];

    const peakDateByIsrc = new Map<string, string>();
    const topTracksBase: BaseTopTrack[] = rows.map((r) => {
      const trackIsrc = String(r.track_isrc);
      peakDateByIsrc.set(trackIsrc, toDateString(r.listen_date));

      return {
        trackName: String(r.track_name),
        trackIsrc,
        listenCount: Number(r.listen_count),
        totalDuration: 0,
        imageUrl: (r.image_url as string | null) ?? null
      };
    });

    const populated = await populateArtists(topTracksBase);

    return populated.map((track) => ({
      trackName: track.trackName,
      trackIsrc: track.trackIsrc,
      peakListenCount: track.listenCount,
      peakDate: peakDateByIsrc.get(track.trackIsrc) || "",
      imageUrl: track.imageUrl,
      artists: track.artists
    }));
  } catch (error) {
    console.error("Error fetching top tracks by peak day listens:", error);
    return [];
  }
}

async function populateArtists(topTracks: BaseTopTrack[]): Promise<TopTrack[]> {
  // Get all artists for each track
  const trackIsrcs = topTracks.map((t) => t.trackIsrc);
  if (trackIsrcs.length === 0) return [];

  const trackArtists = await db
    .select({
      trackIsrc: trackArtist.trackIsrc,
      artistName: artist.name,
      artistId: artist.id
    })
    .from(trackArtist)
    .leftJoin(artist, eq(trackArtist.artistId, artist.id))
    .where(and(inArray(trackArtist.trackIsrc, trackIsrcs), isNotNull(artist.name)));

  // Group artists by track ISRC
  const artistsByTrack = trackArtists.reduce(
    (acc, ta) => {
      if (!acc[ta.trackIsrc]) {
        acc[ta.trackIsrc] = [];
      }
      acc[ta.trackIsrc]!.push({
        artistName: ta.artistName!,
        artistId: ta.artistId!
      });
      return acc;
    },
    {} as Record<string, { artistName: string; artistId: string }[]>
  );

  // Combine track stats with artists
  return topTracks.map((track) => ({
    trackName: track.trackName,
    trackIsrc: track.trackIsrc,
    listenCount: track.listenCount,
    totalDuration: track.totalDuration,
    imageUrl: track.imageUrl,
    artists: artistsByTrack[track.trackIsrc] || []
  }));
}
