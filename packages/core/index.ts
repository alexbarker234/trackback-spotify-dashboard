import { db, InferInsertModel } from "@workspace/database";
import { listen } from "@workspace/database/schema/spotifySchema";
import { SpotifyStreamingHistoryItem } from "./types";

type ProcessedListen = InferInsertModel<typeof listen>;

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
function processStreamingHistoryItem(item: SpotifyStreamingHistoryItem): ProcessedListen | null {
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
export async function processSpotifyStreamingHistory(streamingHistory: SpotifyStreamingHistoryItem[]): Promise<{
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
    const listens: ProcessedListen[] = [];

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

    // Insert listens into database
    console.log(`Inserting ${listens.length} listens`);
    await db.insert(listen).values(listens);

    // Finish
    console.log(`Successfully processed ${results.processed} listens, skipped ${results.skipped} items`);
    if (results.errors.length > 0) {
      console.log(`Encountered ${results.errors.length} errors during processing`);
    }
  } catch (error) {
    results.errors.push(`Fatal error during processing: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return results;
}
