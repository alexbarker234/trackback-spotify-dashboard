import { and, db, gte, ListenInsert, lte } from "@workspace/database";
import { listen } from "@workspace/database/schema/spotifySchema";
import { SpotifyStreamingHistoryItem } from "../types";

/**
 * Extracts Spotify track ID from a Spotify track URI
 * @param uri - Spotify track URI (e.g., "spotify:track:2U6mFmBDjaAu6oCCDRpRet")
 * @returns Track ID or null if invalid
 */
function extractSpotifyTrackId(uri: string | null): string | null {
  if (!uri) return null;
  const match = uri.match(/spotify:track:([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

/**
 * Processes a single streaming history item and returns the processed listen
 * @param item - Spotify streaming history item
 * @returns Processed listen or null if item is invalid
 */
function processStreamingHistoryItem(item: SpotifyStreamingHistoryItem): ListenInsert | null {
  if (
    !item.master_metadata_track_name ||
    !item.master_metadata_album_artist_name ||
    !item.master_metadata_album_album_name ||
    !item.spotify_track_uri
  ) {
    return null;
  }

  const trackId = extractSpotifyTrackId(item.spotify_track_uri);
  if (!trackId) return null;

  return {
    durationMS: item.ms_played,
    playedAt: new Date(item.ts),
    trackId: trackId,
    imported: true
  };
}

/**
 * Processes Spotify streaming history JSON data and inserts listens into the database
 * @param streamingHistory - Array of Spotify streaming history items
 * @returns Promise with processing results
 */
export async function processSpotifyStreamingHistory(
  streamingHistory: SpotifyStreamingHistoryItem[],
  progressCallback?: (message: string, percentage: number) => void
): Promise<{
  processed: number;
  skipped: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    const listens: ListenInsert[] = [];

    // Process each streaming history item
    for (const item of streamingHistory) {
      try {
        const processed = processStreamingHistoryItem(item);
        if (!processed) {
          results.skipped++;
          continue;
        }

        listens.push(processed);
        results.processed++;
      } catch (error) {
        results.errors.push(`Error processing item: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    let minTime = Infinity;
    let maxTime = -Infinity;

    for (const listen of listens) {
      const time = listen.playedAt.getTime();
      if (time < minTime) minTime = time;
      if (time > maxTime) maxTime = time;
    }

    const dateRange = {
      min: new Date(minTime),
      max: new Date(maxTime)
    };

    await db.transaction(async (tx) => {
      if (dateRange.min && dateRange.max) {
        console.log(
          `Deleting existing listens between ${dateRange.min.toISOString()} and ${dateRange.max.toISOString()}`
        );
        progressCallback?.("Deleting existing listens...", 10);
        await tx.delete(listen).where(and(gte(listen.playedAt, dateRange.min), lte(listen.playedAt, dateRange.max)));
      }

      console.log(`Inserting ${listens.length} listens`);
      const BATCH_SIZE = 10000;
      const totalBatches = Math.ceil(listens.length / BATCH_SIZE);

      for (let i = 0; i < listens.length; i += BATCH_SIZE) {
        const batch = listens.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

        progressCallback?.(
          `Inserting batch ${batchNumber}/${totalBatches} (${batch.length} listens)`,
          20 + (batchNumber / totalBatches) * 80
        );

        await tx.insert(listen).values(batch);
        console.log(`Inserted batch ${batchNumber}: ${batch.length} listens`);
      }
    });

    console.log(`Successfully processed ${results.processed} listens, skipped ${results.skipped} items`);
    if (results.errors.length > 0) {
      console.log(`Encountered ${results.errors.length} errors during processing`);
    }
  } catch (error) {
    results.errors.push(`Fatal error during processing: ${error instanceof Error ? error.message : "Unknown error"}`);
    console.error(error);
  }

  return results;
}
