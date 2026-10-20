import { getAlbumsWithoutAlbumArtist, saveAlbumsWithArtistsToDatabase } from "@/database";
import { fetchMultipleAlbums, getServerAccessToken } from "./spotify";

const ALBUM_LIMIT = 20;

/**
 * Populates missing album-artist relationships using Spotify album data
 */
export async function populateAlbumArtistData(): Promise<{ more: boolean }> {
  try {
    const albums = await getAlbumsWithoutAlbumArtist(ALBUM_LIMIT);
    const more = albums.length === ALBUM_LIMIT;

    if (albums.length === 0) {
      console.log("No albums need album-artist relationships");
      return { more: false };
    }

    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      throw new Error("No server access token available");
    }

    console.log(`Found ${albums.length} albums missing album-artist entries`);

    const batchSize = 20; // Spotify API limit for albums endpoint
    const albumIds = albums.map((album) => album.id);
    let batchFailed = false;

    for (let i = 0; i < albumIds.length; i += batchSize) {
      const batch = albumIds.slice(i, i + batchSize);

      try {
        console.log(
          `Processing album batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(albumIds.length / batchSize)} (${batch.length} albums)`
        );

        const spotifyAlbumsResponse = await fetchMultipleAlbums(batch, accessToken);
        const spotifyAlbums = spotifyAlbumsResponse.albums.filter(
          (album): album is NonNullable<typeof album> => album !== null
        );

        if (spotifyAlbums.length > 0) {
          await saveAlbumsWithArtistsToDatabase(spotifyAlbums);
          console.log(`Saved album-artist relationships for ${spotifyAlbums.length} albums`);
        }

        if (i + batchSize < albumIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        batchFailed = true;
        console.error(`Error processing album batch starting at index ${i}:`, error);
      }
    }

    console.log("Successfully populated album-artist relationships");
    return { more: more && !batchFailed };
  } catch (error) {
    console.error("Error populating album-artist data:", error);
    throw error;
  }
}
