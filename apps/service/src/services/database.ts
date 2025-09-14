import { account, album, albumTrack, artist, db, eq, listen, track, trackArtist } from "@workspace/database";
import { SpotifyTrack } from "../types/spotify";
import { refreshAccessToken } from "./spotify";

/**
 * Gets access token for a user, refreshing if necessary
 */
export async function getUserAccessToken(userId: string): Promise<string | null> {
  try {
    const userAccount = await getSpotifyUser();

    if (!userAccount) {
      console.log(`No Spotify account found for user ${userId}`);
      return null;
    }

    // Check if token is expired
    if (userAccount.accessTokenExpiresAt && userAccount.accessTokenExpiresAt < new Date()) {
      console.log(`Access token expired for user ${userId}, refreshing...`);

      if (!userAccount.refreshToken) {
        console.log(`No refresh token available for user ${userId}`);
        return null;
      }

      const refreshResult = await refreshAccessToken(userAccount.refreshToken);

      if (!refreshResult) {
        console.log(`Failed to refresh token for user ${userId}`);
        return null;
      }

      // Update the database with new token
      const newExpiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000);
      await db
        .update(account)
        .set({
          accessToken: refreshResult.accessToken,
          accessTokenExpiresAt: newExpiresAt,
          updatedAt: new Date()
        })
        .where(eq(account.id, userAccount.id));

      return refreshResult.accessToken;
    }

    return userAccount.accessToken || null;
  } catch (error) {
    console.error(`Error getting access token for user ${userId}:`, error);
    return null;
  }
}

export async function getSpotifyUser() {
  return db.query.account.findFirst({
    where: (account, { eq }) => eq(account.providerId, "spotify")
  });
}

interface TrackListenData {
  trackData: SpotifyTrack;
  playedAt: Date;
}

export async function saveListens(tracksData: TrackListenData[]): Promise<void> {
  if (tracksData.length === 0) return;

  try {
    // Prepare all data for bulk operations
    const tracksToInsert: Array<{ isrc: string; name: string; durationMS: number }> = [];
    const artistsToInsert: Array<{ id: string; name: string }> = [];
    const trackArtistsToInsert: Array<{ trackIsrc: string; artistId: string }> = [];
    const albumsToInsert: Array<{ id: string; name: string; imageUrl: string | null }> = [];
    const albumTracksToInsert: Array<{ albumId: string; trackId: string; trackIsrc: string }> = [];
    const listensToInsert: Array<{
      id: string;
      durationMS: number;
      playedAt: Date;
      trackId: string;
      artistId: string;
      albumId: string;
    }> = [];

    // Collect all unique tracks, artists, albums, and listens
    const uniqueTracks = new Map<string, { isrc: string; name: string; durationMS: number }>();
    const uniqueArtists = new Map<string, { id: string; name: string }>();
    const uniqueAlbums = new Map<string, { id: string; name: string; imageUrl: string | null }>();
    const uniqueTrackArtists = new Set<string>();
    const uniqueAlbumTracks = new Set<string>();
    const playedAtTimestamps = new Set<string>();

    for (const { trackData, playedAt } of tracksData) {
      const trackIsrc = trackData.external_ids?.isrc || `spotify_${trackData.id}`;
      const playedAtKey = playedAt.toISOString();

      // Collect unique tracks
      uniqueTracks.set(trackIsrc, {
        isrc: trackIsrc,
        name: trackData.name,
        durationMS: trackData.duration_ms
      });

      // Collect unique artists and track-artist relationships
      for (const artistData of trackData.artists) {
        uniqueArtists.set(artistData.id, {
          id: artistData.id,
          name: artistData.name
        });
        uniqueTrackArtists.add(`${trackIsrc}-${artistData.id}`);
      }

      // Collect unique albums and album-track relationships
      if (trackData.album) {
        uniqueAlbums.set(trackData.album.id, {
          id: trackData.album.id,
          name: trackData.album.name,
          imageUrl: trackData.album.images[0]?.url || null
        });
        uniqueAlbumTracks.add(`${trackData.album.id}-${trackData.id}`);
      }

      // Collect unique playedAt timestamps for duplicate checking
      playedAtTimestamps.add(playedAtKey);
    }

    // Check for existing listens with the same playedAt timestamps
    const playedAtDates = Array.from(playedAtTimestamps).map((ts) => new Date(ts));
    const existingListens = await db.query.listen.findMany({
      where: (listen, { inArray }) => inArray(listen.playedAt, playedAtDates)
    });

    const existingPlayedAtSet = new Set(existingListens.map((l) => l.playedAt.toISOString()));

    // Prepare data for bulk inserts
    tracksToInsert.push(...Array.from(uniqueTracks.values()));
    artistsToInsert.push(...Array.from(uniqueArtists.values()));
    albumsToInsert.push(...Array.from(uniqueAlbums.values()));

    // Prepare track-artist relationships
    for (const key of uniqueTrackArtists) {
      const [trackIsrc, artistId] = key.split("-");
      trackArtistsToInsert.push({ trackIsrc, artistId });
    }

    // Prepare album-track relationships
    for (const key of uniqueAlbumTracks) {
      const [albumId, trackId] = key.split("-");
      const trackData = tracksData.find((t) => t.trackData.id === trackId);
      if (trackData) {
        const trackIsrc = trackData.trackData.external_ids?.isrc || `spotify_${trackData.trackData.id}`;
        albumTracksToInsert.push({ albumId, trackId, trackIsrc });
      }
    }

    // Prepare listen records (only for non-duplicate playedAt timestamps)
    for (const { trackData, playedAt } of tracksData) {
      const playedAtKey = playedAt.toISOString();
      if (!existingPlayedAtSet.has(playedAtKey)) {
        listensToInsert.push({
          id: crypto.randomUUID(),
          durationMS: trackData.duration_ms,
          playedAt: playedAt,
          trackId: trackData.id,
          artistId: trackData.artists[0]?.id || "",
          albumId: trackData.album?.id || ""
        });
      }
    }

    // Perform bulk inserts
    if (tracksToInsert.length > 0) {
      await db.insert(track).values(tracksToInsert).onConflictDoNothing();
    }

    if (artistsToInsert.length > 0) {
      await db.insert(artist).values(artistsToInsert).onConflictDoNothing();
    }

    if (albumsToInsert.length > 0) {
      await db.insert(album).values(albumsToInsert).onConflictDoNothing();
    }

    if (trackArtistsToInsert.length > 0) {
      await db.insert(trackArtist).values(trackArtistsToInsert).onConflictDoNothing();
    }

    if (albumTracksToInsert.length > 0) {
      await db.insert(albumTrack).values(albumTracksToInsert).onConflictDoNothing();
    }

    if (listensToInsert.length > 0) {
      await db.insert(listen).values(listensToInsert);
    }

    console.log(
      `Bulk saved: ${tracksToInsert.length} tracks, ${artistsToInsert.length} artists, ${albumsToInsert.length} albums, ${listensToInsert.length} listens`
    );
  } catch (error) {
    console.error("Error saving track data in bulk:", error);
  }
}

/**
 * Gets artists that need image updates
 */
export async function getArtistsNeedingImages() {
  return db.query.artist.findMany({
    where: (artist, { isNull }) => isNull(artist.imageUrl)
  });
}

/**
 * Updates artist image URL
 */
export async function updateArtistImage(artistId: string, imageUrl: string | null): Promise<void> {
  await db.update(artist).set({ imageUrl }).where(eq(artist.id, artistId));
}
