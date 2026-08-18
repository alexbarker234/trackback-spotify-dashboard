import { album, db, inArray, sql } from "@workspace/database";
import { fetchMultipleAlbums, getServerAccessToken } from "./spotify";

function releaseYearFromSpotifyDate(releaseDate?: string): number | null {
  if (!releaseDate) return null;
  const match = releaseDate.match(/^\d{4}/);
  if (!match) return null;
  const year = Number(match[0]);
  if (!Number.isFinite(year) || year < 1000 || year > 9999) return null;
  return year;
}

/**
 * Backfills `album.release_year` from Spotify `release_date` for rows where it's still null.
 * Runs in small batches to stay within Spotify rate limits.
 */
export async function backfillAlbumReleaseYearsService(options?: {
  // How many albums to attempt per run
  limit?: number;
  // Update chunk size when generating CASE SQL
  updateChunkSize?: number;
}): Promise<void> {
  const limit = options?.limit ?? 50;
  const updateChunkSize = options?.updateChunkSize ?? 50;

  try {
    const accessToken = await getServerAccessToken();
    if (!accessToken) return;

    const nullReleaseAlbums = await db.query.album.findMany({
      where: (a, { isNull: drizzleIsNull }) => drizzleIsNull(a.releaseYear),
      limit
    });

    if (nullReleaseAlbums.length === 0) {
      console.log("No album release years to backfill");
      return;
    }

    const albumIds = nullReleaseAlbums.map((a) => a.id);
    const spotifyAlbumsResponse = await fetchMultipleAlbums(albumIds, accessToken);
    const spotifyAlbums = spotifyAlbumsResponse.albums.filter(
      (a): a is NonNullable<typeof a> => a !== null
    );

    const updates = spotifyAlbums
      .map((a) => {
        const releaseYear = releaseYearFromSpotifyDate(a.release_date);
        return releaseYear ? { id: a.id, releaseYear } : null;
      })
      .filter((v): v is { id: string; releaseYear: number } => v !== null);

    if (updates.length === 0) {
      console.log("No usable release years returned from Spotify");
      return;
    }

    // Bulk update using CASE expression (faster than one UPDATE per album).
    // Chunking keeps SQL size reasonable.
    for (let i = 0; i < updates.length; i += updateChunkSize) {
      const chunk = updates.slice(i, i + updateChunkSize);

      const sqlChunks: any[] = [];
      sqlChunks.push(sql`(case`);
      for (const u of chunk) {
        // Explicit cast to integer to satisfy Postgres typing.
        sqlChunks.push(sql`when ${album.id} = ${u.id} then ${u.releaseYear}::integer`);
      }
      sqlChunks.push(sql`end)`);
      const finalSql = sql.join(sqlChunks, sql.raw(" "));

      await db
        .update(album)
        .set({ releaseYear: sql<number>`${finalSql}` })
        .where(inArray(album.id, chunk.map((u) => u.id)));
    }

    console.log(`Backfilled ${updates.length} album release years`);
  } catch (error) {
    console.error("Error backfilling album release years:", error);
  }
}

