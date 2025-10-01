import { Listen } from "@workspace/database";
import {
  getArtistsNeedingImages,
  getExistingListensByPlayedAt,
  getListensWithoutAlbumTrack,
  saveBatchTrackDataToDatabase,
  saveListens,
  updateArtistImage
} from "../database";

import { getSpotifyUser, getUserAccessToken } from "@/database/user";
import { fetchArtistData, fetchMultipleTracks, fetchRecentlyPlayedTracks } from "./spotify";

/**
 * Updates artist data with images from Spotify API
 */
async function updateArtistData(accessToken: string): Promise<void> {
  try {
    const artists = await getArtistsNeedingImages();

    for (const artistData of artists) {
      try {
        const artistResponse = await fetchArtistData(artistData.id, accessToken);
        await updateArtistImage(artistData.id, artistResponse.images[0]?.url || null);
      } catch (error) {
        console.error(`Error updating artist ${artistData.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error updating artist data:", error);
  }
}

/**
 * Fetches and saves recently played tracks for all users
 */
export async function fetchRecentlyPlayedTracksService(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] 🎵 Fetching recently played tracks...`);

    // Get all users with Spotify accounts
    const spotifyUser = await getSpotifyUser();

    if (!spotifyUser) {
      console.log("No Spotify user found in database");
      return;
    }

    const accessToken = await getUserAccessToken(spotifyUser.userId);

    if (!accessToken) {
      console.log(`No valid access token`);
      return;
    }

    try {
      // Fetch recently played tracks
      const recentlyPlayed = await fetchRecentlyPlayedTracks(accessToken);

      console.log(`Found ${recentlyPlayed.items.length} recent tracks for user ${spotifyUser.userId}`);

      // Prepare all tracks for bulk save
      const allTracksData = recentlyPlayed.items.map((item) => ({
        trackData: item.track,
        playedAt: new Date(item.played_at)
      }));

      // Check for existing listens to avoid duplicates
      const playedAtDates = allTracksData.map((track) => track.playedAt);
      const existingPlayedAtSet = await getExistingListensByPlayedAt(playedAtDates);

      // Filter out tracks that are already saved
      const newTracksData = allTracksData.filter((track) => true);

      console.log(
        `Filtered out ${allTracksData.length - newTracksData.length} duplicate tracks, ${newTracksData.length} new tracks to save`
      );

      // Save only new tracks in bulk
      if (newTracksData.length > 0) {
        await saveListens(newTracksData);
      } else {
        console.log("No new tracks to save");
      }

      // Update artist data
      await updateArtistData(accessToken);
    } catch (error) {
      console.error(`Error fetching tracks for user ${spotifyUser.userId}:`, error);
    }

    console.log(`[${new Date().toISOString()}] ✅ Successfully processed recently played tracks`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error fetching recently played tracks:`, error);
  }
}

export async function populateImportedListensService(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] 🔍 Finding listens that don't have albumTrack entries...`);

    // Get all listens that don't have corresponding albumTrack entries
    const listensWithoutAlbumTrack = await getListensWithoutAlbumTrack();

    if (listensWithoutAlbumTrack.length === 0) {
      console.log("No listens need albumTrack entries");
      return;
    }

    console.log(`Found ${listensWithoutAlbumTrack.length} listens without albumTrack entries`);

    // Get Spotify user and access token
    const spotifyUser = await getSpotifyUser();
    if (!spotifyUser) {
      console.log("No Spotify user found in database");
      return;
    }

    const accessToken = await getUserAccessToken(spotifyUser.userId);
    if (!accessToken) {
      console.log("No valid access token available");
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
