import {
  album,
  albumArtist,
  albumTrack,
  and,
  artist,
  db,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  listen,
  sql,
  track,
  trackArtist
} from "@workspace/database";

type ThrowbackItem = {
  name: string;
  id: string;
  imageUrl: string | null;
  year: number;
  listenCount: number;
  totalDuration: number;
};

export type OnThisDayArtist = ThrowbackItem;

export type OnThisDayTrack = ThrowbackItem & {
  artists: Array<{ artistName: string; artistId: string }>;
};

export type OnThisDayAlbum = ThrowbackItem & {
  artistNames: string[];
};

export async function getOnThisDayArtists(): Promise<OnThisDayArtist[]> {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const onThisDayArtists = await db
      .select({
        artistName: artist.name,
        artistId: artist.id,
        artistImageUrl: artist.imageUrl,
        year: sql<string>`extract(year from ${listen.playedAt})`.as("year"),
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(artist, eq(trackArtist.artistId, artist.id))
      .where(
        and(
          gte(listen.durationMS, 30000),
          sql`extract(month from ${listen.playedAt}) = ${currentMonth}`,
          sql`extract(day from ${listen.playedAt}) = ${currentDay}`,
          sql`extract(year from ${listen.playedAt}) < ${currentDate.getFullYear()}`
        )
      )
      .groupBy(artist.name, artist.id, artist.imageUrl, sql`extract(year from ${listen.playedAt})`)
      .orderBy(desc(sql<number>`count(*)`));

    return onThisDayArtists.map((item) => ({
      name: item.artistName!,
      id: item.artistId!,
      imageUrl: item.artistImageUrl,
      year: Number(item.year),
      listenCount: Number(item.listenCount),
      totalDuration: Number(item.totalDuration)
    }));
  } catch (error) {
    console.error("Error fetching on this day artists:", error);
    return [];
  }
}

export async function getOnThisDayTracks(): Promise<OnThisDayTrack[]> {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const onThisDayTracks = await db
      .select({
        trackName: track.name,
        trackIsrc: track.isrc,
        imageUrl: album.imageUrl,
        year: sql<string>`extract(year from ${listen.playedAt})`.as("year"),
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(
        and(
          gte(listen.durationMS, 30000),
          sql`extract(month from ${listen.playedAt}) = ${currentMonth}`,
          sql`extract(day from ${listen.playedAt}) = ${currentDay}`,
          sql`extract(year from ${listen.playedAt}) < ${currentDate.getFullYear()}`
        )
      )
      .groupBy(track.name, track.isrc, album.imageUrl, sql`extract(year from ${listen.playedAt})`)
      .orderBy(desc(sql<number>`count(*)`));

    // Get artists for each track
    const trackIsrcs = onThisDayTracks
      .map((t) => t.trackIsrc)
      .filter((isrc): isrc is string => Boolean(isrc));
    const trackArtists = await db
      .select({
        trackIsrc: trackArtist.trackIsrc,
        artistName: artist.name,
        artistId: artist.id
      })
      .from(trackArtist)
      .leftJoin(artist, eq(trackArtist.artistId, artist.id))
      .where(and(inArray(trackArtist.trackIsrc, trackIsrcs), isNotNull(artist.name)));

    // Group artists by track ISRC
    const artistsByTrack = trackArtists.reduce(
      (acc, ta) => {
        if (!acc[ta.trackIsrc]) {
          acc[ta.trackIsrc] = [];
        }
        acc[ta.trackIsrc]!.push({
          artistName: ta.artistName!,
          artistId: ta.artistId!
        });
        return acc;
      },
      {} as Record<string, { artistName: string; artistId: string }[]>
    );

    return onThisDayTracks
      .filter((track) => track.trackName && track.trackIsrc)
      .map((track) => ({
        name: track.trackName!,
        id: track.trackIsrc!,
        imageUrl: track.imageUrl,
        year: Number(track.year),
        listenCount: Number(track.listenCount),
        totalDuration: Number(track.totalDuration),
        artists: artistsByTrack[track.trackIsrc!] || []
      }));
  } catch (error) {
    console.error("Error fetching on this day tracks:", error);
    return [];
  }
}

export async function getOnThisDayAlbums(): Promise<OnThisDayAlbum[]> {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const onThisDayAlbums = await db
      .select({
        albumName: album.name,
        albumId: album.id,
        albumImageUrl: album.imageUrl,
        year: sql<string>`extract(year from ${listen.playedAt})`.as("year"),
        listenCount: sql<number>`count(*)`.as("listenCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration")
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .where(
        and(
          gte(listen.durationMS, 30000),
          sql`extract(month from ${listen.playedAt}) = ${currentMonth}`,
          sql`extract(day from ${listen.playedAt}) = ${currentDay}`,
          sql`extract(year from ${listen.playedAt}) < ${currentDate.getFullYear()}`
        )
      )
      .groupBy(album.name, album.id, album.imageUrl, sql`extract(year from ${listen.playedAt})`)
      .orderBy(desc(sql<number>`count(*)`));

    // Get artists for each album
    const albumIds = onThisDayAlbums
      .map((a) => a.albumId)
      .filter((id): id is string => Boolean(id));
    const albumArtists = await db
      .select({
        albumId: albumArtist.albumId,
        artistName: artist.name,
        artistId: artist.id
      })
      .from(albumArtist)
      .leftJoin(artist, eq(albumArtist.artistId, artist.id))
      .where(and(inArray(albumArtist.albumId, albumIds), isNotNull(artist.name)));

    // Group artists by album ID
    const artistsByAlbum = albumArtists.reduce(
      (acc, aa) => {
        if (!acc[aa.albumId]) {
          acc[aa.albumId] = [];
        }
        acc[aa.albumId]!.push({
          artistName: aa.artistName!,
          artistId: aa.artistId!
        });
        return acc;
      },
      {} as Record<string, { artistName: string; artistId: string }[]>
    );

    return onThisDayAlbums
      .filter((album) => album.albumName && album.albumId)
      .map((album) => ({
        name: album.albumName!,
        id: album.albumId!,
        imageUrl: album.albumImageUrl,
        year: Number(album.year),
        listenCount: Number(album.listenCount),
        totalDuration: Number(album.totalDuration),
        artistNames: artistsByAlbum[album.albumId!]?.map((a) => a.artistName) || []
      }));
  } catch (error) {
    console.error("Error fetching on this day albums:", error);
    return [];
  }
}
