import { getAlbumsWithoutAlbumArtist, saveAlbumsWithArtistsToDatabase } from "@/database";
import { fetchMultipleAlbums, getServerAccessToken } from "./spotify";

/**
 * Populates missing album-artist relationships using Spotify album data
 */
export async function populateAlbumArtistData(): Promise<void> {
  try {
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log("No server access token available");
      return;
    }
    console.log(accessToken);

    const albums = await getAlbumsWithoutAlbumArtist();

    if (albums.length === 0) {
      console.log("No albums need album-artist relationships");
      return;
    }

    console.log(`Found ${albums.length} albums missing album-artist entries`);

    const batchSize = 20; // Spotify API limit for albums endpoint
    const albumIds = albums.map((album) => album.id);

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
        console.error(`Error processing album batch starting at index ${i}:`, error);
      }
    }

    console.log("Successfully populated album-artist relationships");
  } catch (error) {
    console.error("Error populating album-artist data:", error);
  }
}
