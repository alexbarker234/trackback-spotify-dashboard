import {
  getArtistsNeedingImages,
  getSpotifyUser,
  getUserAccessToken,
  saveListens,
  updateArtistImage
} from "./database";
import { fetchArtistData, fetchRecentlyPlayedTracks } from "./spotify";

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
      const afterTimestamp = Math.floor((Date.now() - 2 * 60 * 1000) / 1000);
      const recentlyPlayed = await fetchRecentlyPlayedTracks(accessToken, afterTimestamp);

      console.log(`Found ${recentlyPlayed.items.length} recent tracks for user ${spotifyUser.userId}`);

      // Prepare all tracks for bulk save
      const tracksData = recentlyPlayed.items.map((item) => ({
        trackData: item.track,
        playedAt: new Date(item.played_at)
      }));

      // Save all tracks in bulk
      await saveListens(tracksData);

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
