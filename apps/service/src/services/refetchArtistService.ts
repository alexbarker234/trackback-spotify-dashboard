import { getArtistsNeedingRefetch, updateArtistImagesBulk } from "@/database";
import { fetchMultipleArtists, getServerAccessToken } from "./spotify";

const MAX_ARTISTS_PER_CYCLE = 30;

/**
 * Refetches artist image URLs from Spotify for artists whose data is older than 2 weeks
 */
export async function refetchArtistData(): Promise<void> {
  try {
    const accessToken = await getServerAccessToken();
    if (!accessToken) {
      console.log("No server access token available for artist refetch");
      return;
    }

    const artists = await getArtistsNeedingRefetch(MAX_ARTISTS_PER_CYCLE);

    if (artists.length === 0) {
      console.log("No artists need Spotify data refetch");
      return;
    }

    console.log(`Refetching Spotify data for ${artists.length} artists`);

    const artistIds = artists.map((a) => a.id);
    const spotifyArtistsResponse = await fetchMultipleArtists(artistIds, accessToken);
    const spotifyArtists = spotifyArtistsResponse.artists.filter((a) => a !== null);

    const updates = spotifyArtists.map((spotifyArtist) => ({
      artistId: spotifyArtist.id,
      imageUrl: spotifyArtist.images[0]?.url ?? ""
    }));

    if (updates.length > 0) {
      await updateArtistImagesBulk(updates);
      console.log(`Refetched Spotify images for ${updates.length} artists`);
    }
  } catch (error) {
    console.error("Error refetching artist data:", error);
  }
}
