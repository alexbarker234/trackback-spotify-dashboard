import {
  getArtistsNeedingImages,
  getExistingListensByPlayedAt,
  saveListens,
  updateArtistImagesBulk
} from "../database";

import { getSpotifyUser, getUserAccessToken } from "@/database/user";
import { ENRICHMENT_JOB_ID } from "@/scheduler/ids";
import { requestJob } from "@/scheduler/jobState";
import { fetchMultipleArtists, fetchRecentlyPlayedTracks } from "./spotify";

/**
 * Updates artist data with images from Spotify API using bulk fetching
 */
async function updateArtistData(accessToken: string): Promise<void> {
  try {
    const artists = await getArtistsNeedingImages();

    if (artists.length === 0) {
      console.log("No artists need image updates");
      return;
    }

    console.log(`Found ${artists.length} artists needing image updates`);

    // Process artists in batches of 50 (Spotify API limit)
    const batchSize = 50;
    const artistIds = artists.map((artist) => artist.id);

    for (let i = 0; i < artistIds.length; i += batchSize) {
      const batch = artistIds.slice(i, i + batchSize);

      try {
        console.log(
          `Processing artist batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(artistIds.length / batchSize)} (${batch.length} artists)`
        );

        // Fetch artist data from Spotify in bulk
        const spotifyArtistsResponse = await fetchMultipleArtists(batch, accessToken);
        const spotifyArtists = spotifyArtistsResponse.artists.filter((artist) => artist !== null);

        // Prepare updates for database
        const updates = spotifyArtists.map((artist) => ({
          artistId: artist.id,
          imageUrl: artist.images[0]?.url || null
        }));

        // For all null images, set it to an empty string
        updates.forEach((update) => {
          if (update.imageUrl === null) {
            update.imageUrl = "";
          }
        });

        // Update artist images in bulk
        if (updates.length > 0) {
          await updateArtistImagesBulk(updates);
          console.log(`Updated ${updates.length} artist images`);
        }

        // Add a small delay to respect rate limits
        if (i + batchSize < artistIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing artist batch starting at index ${i}:`, error);
        // Continue with next batch
      }
    }

    console.log("Successfully updated artist data");
  } catch (error) {
    console.error("Error updating artist data:", error);
  }
}

/**
 * Fetches and saves recently played tracks for all users
 */
export async function fetchRecentlyPlayedTracksService(): Promise<void> {
  console.log(`[${new Date().toISOString()}] 🎵 Fetching recently played tracks...`);

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

  const recentlyPlayed = await fetchRecentlyPlayedTracks(accessToken);

  console.log(`Found ${recentlyPlayed.items.length} recent tracks for user ${spotifyUser.userId}`);

  const allTracksData = recentlyPlayed.items.map((item) => ({
    trackData: item.track,
    playedAt: new Date(item.played_at)
  }));

  const playedAtDates = allTracksData.map((track) => track.playedAt);
  const existingPlayedAtSet = await getExistingListensByPlayedAt(playedAtDates);

  const newTracksData = allTracksData.filter(
    (track) => !existingPlayedAtSet.has(track.playedAt.toISOString())
  );

  console.log(
    `Filtered out ${allTracksData.length - newTracksData.length} duplicate tracks, ${newTracksData.length} new tracks to save`
  );

  if (newTracksData.length > 0) {
    await saveListens(newTracksData);
    await requestJob(ENRICHMENT_JOB_ID);
  } else {
    console.log("No new tracks to save");
  }

  await updateArtistData(accessToken);

  console.log(`[${new Date().toISOString()}] ✅ Successfully processed recently played tracks`);
}
