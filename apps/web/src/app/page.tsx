import { album, albumTrack, artist, db, desc, eq, listen, track } from "@workspace/database";

async function getListens() {
  try {
    const listens = await db
      .select({
        id: listen.id,
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackName: track.name,
        trackIsrc: track.isrc,
        artistName: artist.name,
        albumName: album.name,
        albumImageUrl: album.imageUrl
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(artist, eq(listen.artistId, artist.id))
      .leftJoin(album, eq(listen.albumId, album.id))
      .orderBy(desc(listen.playedAt))
      .limit(50);
    console.log(listens);
    return listens;
  } catch (error) {
    console.error("Error fetching listens:", error);
    return [];
  }
}

export default async function Home() {
  const listens = await getListens();

  return (
    <div className="flex-1 p-8">
      <h1 className="mb-6 text-3xl font-bold text-zinc-100">Recent Listens</h1>

      {listens.length === 0 ? (
        <div className="py-8 text-center text-zinc-400">
          No listens found. Start listening to music to see your history here!
        </div>
      ) : (
        <div className="space-y-4">
          {listens.map((listen) => (
            <div key={listen.id} className="rounded-lg bg-zinc-800 p-4 transition-colors hover:bg-zinc-700">
              <div className="flex items-center space-x-4">
                {listen.albumImageUrl && (
                  <img
                    src={listen.albumImageUrl}
                    alt={`${listen.albumName} album cover`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100">{listen.trackName || "Unknown Track"}</h3>
                  <p className="text-zinc-400">{listen.artistName || "Unknown Artist"}</p>
                  <p className="text-sm text-zinc-500">{listen.albumName || "Unknown Album"}</p>
                </div>
                <div className="text-right text-sm text-zinc-400">
                  <p>{new Date(listen.playedAt).toLocaleDateString()}</p>
                  <p>{new Date(listen.playedAt).toLocaleTimeString()}</p>
                  <p className="text-xs">{Math.round(listen.durationMS / 1000)}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
