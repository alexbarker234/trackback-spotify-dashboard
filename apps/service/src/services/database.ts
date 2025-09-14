import { account, album, albumTrack, and, artist, db, eq, listen, track, trackArtist } from "@workspace/database";
import { SpotifyTrack } from "../types/spotify";
import { refreshAccessToken } from "./spotify";

/**
 * Gets access token for a user, refreshing if necessary
 */
export async function getUserAccessToken(userId: string): Promise<string | null> {
  try {
    const userAccount = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
      .limit(1);

    if (userAccount.length === 0) {
      console.log(`No Spotify account found for user ${userId}`);
      return null;
    }

    const accountData = userAccount[0];

    // Check if token is expired
    if (accountData.accessTokenExpiresAt && accountData.accessTokenExpiresAt < new Date()) {
      console.log(`Access token expired for user ${userId}, refreshing...`);

      if (!accountData.refreshToken) {
        console.log(`No refresh token available for user ${userId}`);
        return null;
      }

      const refreshResult = await refreshAccessToken(accountData.refreshToken);

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
        .where(eq(account.id, accountData.id));

      return refreshResult.accessToken;
    }

    return accountData.accessToken || null;
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

export async function saveTrackData(trackData: SpotifyTrack, playedAt: Date): Promise<void> {
  try {
    const trackIsrc = trackData.external_ids?.isrc || `spotify_${trackData.id}`;

    // Save track if not exists
    await db
      .insert(track)
      .values({
        isrc: trackIsrc,
        name: trackData.name,
        durationMS: trackData.duration_ms
      })
      .onConflictDoNothing();

    // Save artists
    for (const artistData of trackData.artists) {
      await db
        .insert(artist)
        .values({
          id: artistData.id,
          name: artistData.name
        })
        .onConflictDoNothing();

      // Link track to artist
      await db
        .insert(trackArtist)
        .values({
          trackIsrc: trackIsrc,
          artistId: artistData.id
        })
        .onConflictDoNothing();
    }

    // Save album
    if (trackData.album) {
      await db
        .insert(album)
        .values({
          id: trackData.album.id,
          name: trackData.album.name,
          imageUrl: trackData.album.images[0]?.url
        })
        .onConflictDoNothing();

      // Link album to track
      await db
        .insert(albumTrack)
        .values({
          albumId: trackData.album.id,
          trackId: trackData.id,
          trackIsrc: trackIsrc
        })
        .onConflictDoNothing();
    }

    // Save listen record
    await db
      .insert(listen)
      .values({
        id: crypto.randomUUID(),
        durationMS: trackData.duration_ms,
        playedAt: playedAt,
        trackId: trackData.id,
        artistId: trackData.artists[0]?.id || "",
        albumId: trackData.album?.id || ""
      })
      .onConflictDoNothing();
  } catch (error) {
    console.error("Error saving track data:", error);
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
