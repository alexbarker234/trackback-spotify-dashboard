import { getListensWithoutAlbumTrack, saveBatchTrackDataToDatabase } from "@/database";
import { Listen } from "@workspace/database";
import { fetchMultipleTracks, getServerAccessToken } from "./spotify";

const LISTEN_LIMIT = 50;

export async function populateAlbumTrackService(): Promise<{ more: boolean }> {
  try {
    console.log(
      `[${new Date().toISOString()}] 🔍 Finding listens that don't have albumTrack entries...`
    );

    const listensWithoutAlbumTrack = await getListensWithoutAlbumTrack(LISTEN_LIMIT);
    const more = listensWithoutAlbumTrack.length === LISTEN_LIMIT;

    if (listensWithoutAlbumTrack.length === 0) {
      console.log("No listens need albumTrack entries");
      return { more: false };
    }

    console.log(`Found ${listensWithoutAlbumTrack.length} listens without albumTrack entries`);

    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      throw new Error("No server access token available");
    }

    // Group listens by track ID to minimize API calls
    const listensByTrackId = new Map<string, Listen[]>();
    for (const listen of listensWithoutAlbumTrack) {
      if (!listensByTrackId.has(listen.trackId)) {
        listensByTrackId.set(listen.trackId, []);
      }
      listensByTrackId.get(listen.trackId)!.push(listen);
    }

    console.log(`Processing ${listensByTrackId.size} unique tracks`);

    // Process tracks in batches of 50 (Spotify API limit)
    const trackIds = Array.from(listensByTrackId.keys());
    const batchSize = 50;
    let batchFailed = false;

    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);

      try {
        console.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(trackIds.length / batchSize)} (${batch.length} tracks)`
        );

        // Fetch track data from Spotify
        const spotifyTracksResponse = await fetchMultipleTracks(batch, accessToken);
        const spotifyTracks = spotifyTracksResponse.tracks.filter((track) => track !== null);

        // Save all track, artist, and album data to database in bulk
        await saveBatchTrackDataToDatabase(spotifyTracks);
      } catch (error) {
        batchFailed = true;
        console.error(`Error processing batch starting at index ${i}:`, error);
      }
    }

    console.log(
      `[${new Date().toISOString()}] ✅ Successfully processed ${trackIds.length} tracks, saved track/artist/album data`
    );

    return { more: more && !batchFailed };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error populating imported listens:`, error);
    throw error;
  }
}
