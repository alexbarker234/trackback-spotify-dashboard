import { getListensWithoutAlbumTrack, saveBatchTrackDataToDatabase } from "@/database";
import { Listen } from "@workspace/database";
import { fetchMultipleTracks, getServerAccessToken } from "./spotify";

export async function populateAlbumTrackService(): Promise<void> {
  try {
    console.log(
      `[${new Date().toISOString()}] 🔍 Finding listens that don't have albumTrack entries...`
    );

    // Get all listens that don't have corresponding albumTrack entries
    const listensWithoutAlbumTrack = await getListensWithoutAlbumTrack();

    if (listensWithoutAlbumTrack.length === 0) {
      console.log("No listens need albumTrack entries");
      return;
    }

    console.log(`Found ${listensWithoutAlbumTrack.length} listens without albumTrack entries`);

    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log("No server access token available");
      return;
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

        // Add a small delay to respect rate limits
        if (i + batchSize < trackIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        // Continue with next batch
      }
    }

    console.log(
      `[${new Date().toISOString()}] ✅ Successfully processed ${trackIds.length} tracks, saved track/artist/album data`
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error populating imported listens:`, error);
  }
}
