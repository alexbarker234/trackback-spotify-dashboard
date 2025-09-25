import { Listen } from "@workspace/database";
import {
  getArtistsNeedingImages,
  getListensNeedingArtistAlbumData,
  getSpotifyUser,
  getTrackWithRelations,
  getUserAccessToken,
  saveBatchTrackDataToDatabase,
  saveListens,
  updateArtistImage,
  updateListenArtistAlbum
} from "./database";
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

export async function populateImportedListensService(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] 🔍 Finding listens that need artist/album data...`);

    // Get all listens that need artist or album IDs
    const listensNeedingData = await getListensNeedingArtistAlbumData();

    if (listensNeedingData.length === 0) {
      console.log("No listens need artist/album data population");
      return;
    }

    console.log(`Found ${listensNeedingData.length} listens needing artist/album data`);

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
    for (const listen of listensNeedingData) {
      if (!listensByTrackId.has(listen.trackId)) {
        listensByTrackId.set(listen.trackId, []);
      }
      listensByTrackId.get(listen.trackId)!.push(listen);
    }

    console.log(`Processing ${listensByTrackId.size} unique tracks`);

    // Process tracks in batches of 50 (Spotify API limit)
    const trackIds = Array.from(listensByTrackId.keys());
    const batchSize = 50;
    let processedCount = 0;
    let updatedCount = 0;

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

        // Process each track in the batch to update listens
        for (const spotifyTrack of spotifyTracks) {
          const trackListens = listensByTrackId.get(spotifyTrack.id) || [];

          // Get existing track relationships from database
          const trackIsrc = spotifyTrack.external_ids?.isrc || `spotify_${spotifyTrack.id}`;
          const existingRelations = await getTrackWithRelations(trackIsrc);

          // Determine artist and album IDs
          let artistId: string | null = null;
          let albumId: string | null = null;

          // Use existing database data if available
          if (existingRelations && existingRelations.artists.length > 0) {
            artistId = existingRelations.artists[0].artistId;
          } else if (spotifyTrack.artists.length > 0) {
            artistId = spotifyTrack.artists[0].id;
          }

          if (existingRelations && existingRelations.albums.length > 0) {
            albumId = existingRelations.albums[0].albumId;
          } else if (spotifyTrack.album) {
            albumId = spotifyTrack.album.id;
          }

          // Update all listens for this track
          for (const listen of trackListens) {
            const needsArtistUpdate = !listen.artistId && artistId;
            const needsAlbumUpdate = !listen.albumId && albumId;

            if (needsArtistUpdate || needsAlbumUpdate) {
              await updateListenArtistAlbum(
                listen.id,
                needsArtistUpdate ? artistId : listen.artistId,
                needsAlbumUpdate ? albumId : listen.albumId
              );
              updatedCount++;
            }
          }

          processedCount++;
        }

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
      `[${new Date().toISOString()}] ✅ Successfully processed ${processedCount} tracks, saved track/artist/album data, and updated ${updatedCount} listens`
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error populating imported listens:`, error);
  }
}
