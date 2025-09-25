import {
  account,
  album,
  AlbumInsert,
  albumTrack,
  AlbumTrackInsert,
  artist,
  ArtistInsert,
  db,
  eq,
  Listen,
  listen,
  ListenInsert,
  track,
  trackArtist,
  TrackArtistInsert,
  TrackInsert
} from "@workspace/database";
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
    const tracksToInsert: Array<TrackInsert> = [];
    const artistsToInsert: Array<ArtistInsert> = [];
    const trackArtistsToInsert: Array<TrackArtistInsert> = [];
    const albumsToInsert: Array<AlbumInsert> = [];
    const albumTracksToInsert: Array<AlbumTrackInsert> = [];
    const listensToInsert: Array<ListenInsert> = [];

    // Collect all unique tracks, artists, albums, and listens
    const uniqueTracks = new Map<string, TrackInsert>();
    const uniqueArtists = new Map<string, ArtistInsert>();
    const uniqueAlbums = new Map<string, AlbumInsert>();
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
          durationMS: trackData.duration_ms,
          playedAt: playedAt,
          trackId: trackData.id,
          imported: false
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

/**
 * Gets track data with artist and album relationships for a specific track ID
 */
export async function getTrackWithRelations(trackId: string) {
  // Get track data
  const trackData = await db.query.track.findFirst({
    where: (track, { eq }) => eq(track.isrc, trackId)
  });

  if (!trackData) return null;

  // Get artist relationships
  const trackArtists = await db.query.trackArtist.findMany({
    where: (trackArtist, { eq }) => eq(trackArtist.trackIsrc, trackId)
  });

  // Get album relationships
  const albumTracks = await db.query.albumTrack.findMany({
    where: (albumTrack, { eq }) => eq(albumTrack.trackIsrc, trackId)
  });

  return {
    track: trackData,
    artists: trackArtists,
    albums: albumTracks
  };
}

/**
 * Gets listens that don't have corresponding albumTrack entries
 */
export async function getListensWithoutAlbumTrack(): Promise<Listen[]> {
  return db.query.listen.findMany({
    where: (listen, { notExists }) =>
      notExists(db.select().from(albumTrack).where(eq(albumTrack.trackId, listen.trackId)))
  });
}

/**
 * Saves track, artist, and album data to the database in bulk
 */
export async function saveBatchTrackDataToDatabase(spotifyTracks: SpotifyTrack[]): Promise<void> {
  try {
    // Collect all data for bulk inserts
    const tracksToInsert: Array<TrackInsert> = [];
    const artistsToInsert: Array<ArtistInsert> = [];
    const trackArtistsToInsert: Array<TrackArtistInsert> = [];
    const albumsToInsert: Array<AlbumInsert> = [];
    const albumTracksToInsert: Array<AlbumTrackInsert> = [];

    // Use Sets to track unique entries
    const uniqueArtists = new Set<string>();
    const uniqueAlbums = new Set<string>();
    const uniqueTrackArtists = new Set<string>();
    const uniqueAlbumTracks = new Set<string>();

    // Process each track in the batch
    for (const spotifyTrack of spotifyTracks) {
      const trackIsrc = spotifyTrack.external_ids?.isrc || `spotify_${spotifyTrack.id}`;

      // Collect track data
      tracksToInsert.push({
        isrc: trackIsrc,
        name: spotifyTrack.name,
        durationMS: spotifyTrack.duration_ms
      });

      // Collect artist data and relationships
      for (const artistData of spotifyTrack.artists) {
        if (!uniqueArtists.has(artistData.id)) {
          artistsToInsert.push({
            id: artistData.id,
            name: artistData.name,
            imageUrl: null
          });
          uniqueArtists.add(artistData.id);
        }

        const trackArtistKey = `${trackIsrc}-${artistData.id}`;
        if (!uniqueTrackArtists.has(trackArtistKey)) {
          trackArtistsToInsert.push({
            trackIsrc: trackIsrc,
            artistId: artistData.id
          });
          uniqueTrackArtists.add(trackArtistKey);
        }
      }

      // Collect album data and relationships
      if (spotifyTrack.album) {
        if (!uniqueAlbums.has(spotifyTrack.album.id)) {
          albumsToInsert.push({
            id: spotifyTrack.album.id,
            name: spotifyTrack.album.name,
            imageUrl: spotifyTrack.album.images[0]?.url || null
          });
          uniqueAlbums.add(spotifyTrack.album.id);
        }

        const albumTrackKey = `${spotifyTrack.album.id}-${spotifyTrack.id}`;
        if (!uniqueAlbumTracks.has(albumTrackKey)) {
          albumTracksToInsert.push({
            albumId: spotifyTrack.album.id,
            trackId: spotifyTrack.id,
            trackIsrc: trackIsrc
          });
          uniqueAlbumTracks.add(albumTrackKey);
        }
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

    console.log(
      `Bulk saved: ${tracksToInsert.length} tracks, ${artistsToInsert.length} artists, ${albumsToInsert.length} albums, ${trackArtistsToInsert.length} track-artist relationships, ${albumTracksToInsert.length} album-track relationships`
    );
  } catch (error) {
    console.error(`Error saving batch track data:`, error);
  }
}
