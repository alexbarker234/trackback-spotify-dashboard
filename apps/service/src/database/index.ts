import {
  album,
  albumArtist,
  AlbumArtistInsert,
  AlbumInsert,
  albumTrack,
  AlbumTrackInsert,
  artist,
  ArtistInsert,
  db,
  eq,
  inArray,
  Listen,
  listen,
  ListenInsert,
  SQL,
  sql,
  track,
  trackArtist,
  TrackArtistInsert,
  TrackInsert
} from "@workspace/database";
import { SpotifyTrack } from "../types/spotify";

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
    const albumArtistsToInsert: Array<AlbumArtistInsert> = [];
    const listensToInsert: Array<ListenInsert> = [];

    // Collect all unique tracks, artists, albums, and listens
    const uniqueTracks = new Map<string, TrackInsert>();
    const uniqueArtists = new Map<string, ArtistInsert>();
    const uniqueAlbums = new Map<string, AlbumInsert>();
    const uniqueTrackArtists = new Set<string>();
    const uniqueAlbumTracks = new Set<string>();
    const uniqueAlbumArtists = new Set<string>();
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
        for (const artistData of trackData.artists) {
          if (!uniqueArtists.has(artistData.id)) {
            uniqueArtists.set(artistData.id, {
              id: artistData.id,
              name: artistData.name
            });
          }
          uniqueAlbumArtists.add(`${trackData.album.id}-${artistData.id}`);
        }
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
        const trackIsrc =
          trackData.trackData.external_ids?.isrc || `spotify_${trackData.trackData.id}`;
        albumTracksToInsert.push({ albumId, trackId, trackIsrc });
      }
    }

    // Prepare album-artist relationships
    for (const key of uniqueAlbumArtists) {
      const [albumId, artistId] = key.split("-");
      albumArtistsToInsert.push({ albumId, artistId });
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

    if (albumArtistsToInsert.length > 0) {
      await db.insert(albumArtist).values(albumArtistsToInsert).onConflictDoNothing();
    }

    if (listensToInsert.length > 0) {
      await db.insert(listen).values(listensToInsert);
    }

    // Calculate duration statistics
    const totalOriginalDuration = tracksData.reduce(
      (sum, track) => sum + track.trackData.duration_ms,
      0
    );
    const totalActualDuration = tracksData.reduce(
      (sum, track) => sum + track.trackData.duration_ms,
      0
    );
    const skippedDuration = totalOriginalDuration - totalActualDuration;
    const skippedPercentage =
      totalOriginalDuration > 0 ? ((skippedDuration / totalOriginalDuration) * 100).toFixed(1) : 0;

    console.log(
      `Bulk saved: ${tracksToInsert.length} tracks, ${artistsToInsert.length} artists, ${albumsToInsert.length} albums, ${albumArtistsToInsert.length} album artists, ${listensToInsert.length} listens`
    );
    console.log(
      `Duration: ${(totalActualDuration / 1000 / 60).toFixed(1)}min actual vs ${(totalOriginalDuration / 1000 / 60).toFixed(1)}min original (${skippedPercentage}% skipped)`
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
 * Updates multiple artist images in bulk
 */
export async function updateArtistImagesBulk(
  updates: Array<{ artistId: string; imageUrl: string | null }>
): Promise<void> {
  if (updates.length === 0) return;

  const artistIds: string[] = [];
  const sqlChunks: SQL[] = [];

  sqlChunks.push(sql`(case`);
  for (const update of updates) {
    sqlChunks.push(sql`when ${artist.id} = ${update.artistId} then ${update.imageUrl}`);
    artistIds.push(update.artistId);
  }
  sqlChunks.push(sql`end)`);

  const finalSql = sql.join(sqlChunks, sql.raw(" "));

  await db.update(artist).set({ imageUrl: finalSql }).where(inArray(artist.id, artistIds));
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
 * Checks for existing listens by playedAt timestamps
 */
export async function getExistingListensByPlayedAt(playedAtDates: Date[]): Promise<Set<string>> {
  if (playedAtDates.length === 0) return new Set();

  const existingListens = await db.query.listen.findMany({
    where: (listen, { inArray }) => inArray(listen.playedAt, playedAtDates)
  });

  return new Set(existingListens.map((l) => l.playedAt.toISOString()));
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
    const albumArtistsToInsert: Array<AlbumArtistInsert> = [];

    // Use Sets to track unique entries
    const uniqueArtists = new Set<string>();
    const uniqueAlbums = new Set<string>();
    const uniqueTrackArtists = new Set<string>();
    const uniqueAlbumTracks = new Set<string>();
    const uniqueAlbumArtists = new Set<string>();

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

        for (const artistData of spotifyTrack.artists) {
          const albumArtistKey = `${spotifyTrack.album.id}-${artistData.id}`;
          if (!uniqueAlbumArtists.has(albumArtistKey)) {
            if (!uniqueArtists.has(artistData.id)) {
              artistsToInsert.push({
                id: artistData.id,
                name: artistData.name,
                imageUrl: null
              });
              uniqueArtists.add(artistData.id);
            }
            albumArtistsToInsert.push({
              albumId: spotifyTrack.album.id,
              artistId: artistData.id
            });
            uniqueAlbumArtists.add(albumArtistKey);
          }
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

    if (albumArtistsToInsert.length > 0) {
      await db.insert(albumArtist).values(albumArtistsToInsert).onConflictDoNothing();
    }

    console.log(
      `Bulk saved: ${tracksToInsert.length} tracks, ${artistsToInsert.length} artists, ${albumsToInsert.length} albums, ${trackArtistsToInsert.length} track-artist relationships, ${albumTracksToInsert.length} album-track relationships, ${albumArtistsToInsert.length} album-artist relationships`
    );
  } catch (error) {
    console.error(`Error saving batch track data:`, error);
  }
}
