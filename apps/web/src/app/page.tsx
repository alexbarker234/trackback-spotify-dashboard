import MonthlyStreamChart from "@/components/charts/MonthlyStreamChart";
import YearlyStreamChart from "@/components/charts/YearlyStreamChart";
import ItemCard from "@/components/ItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import LocalDate from "@/components/LocalDate";
import LocalTime from "@/components/LocalTime";
import NowPlaying from "@/components/NowPlaying";
import { auth } from "@/lib/auth";
import { getTopAlbumsByDateRange } from "@workspace/core/queries/albums";
import { getTopArtistsByDateRange } from "@workspace/core/queries/artists";
import { getMonthlyStreamData, getYearlyStreamData } from "@workspace/core/queries/listens";
import { getTopTracksByDateRange } from "@workspace/core/queries/tracks";
import { album, albumTrack, artist, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getListens() {
  try {
    const listens = await db
      .select({
        id: listen.id,
        durationMS: listen.durationMS,
        playedAt: listen.playedAt,
        trackName: track.name,
        trackIsrc: track.isrc,
        trackId: albumTrack.trackId,
        artistNames: sql<string[]>`array_agg(distinct ${artist.name}) filter (where ${artist.name} is not null)`,
        albumName: album.name,
        albumImageUrl: album.imageUrl
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(artist, eq(trackArtist.artistId, artist.id))
      .leftJoin(album, eq(albumTrack.albumId, album.id))
      .groupBy(
        listen.id,
        listen.durationMS,
        listen.playedAt,
        track.name,
        track.isrc,
        albumTrack.trackId,
        album.name,
        album.imageUrl
      )
      .where(gte(listen.durationMS, 30000))
      .orderBy(desc(listen.playedAt))
      .limit(50);

    return listens;
  } catch (error) {
    console.error("Error fetching listens:", error);
    return [];
  }
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const [listens, topTracks, topArtists, topAlbums, monthlyStreamData, yearlyStreamData] = await Promise.all([
    getListens(),
    getTopTracksByDateRange({ startDate: fourWeeksAgo, limit: 250 }),
    getTopArtistsByDateRange({ startDate: fourWeeksAgo, limit: 250 }),
    getTopAlbumsByDateRange({ startDate: fourWeeksAgo, limit: 250 }),
    getMonthlyStreamData(),
    getYearlyStreamData()
  ]);

  return (
    <>
      {/* User Profile Section */}
      {session?.user && (
        <div className="bg-black/10 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center space-x-4 px-4 py-4 sm:py-16">
            <Image
              src={session.user.image || "/default-avatar.png"}
              alt={session.user.name || "User"}
              width={200}
              height={200}
              className="h-full max-h-48 w-full max-w-48 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">{session.user.name}</h2>
              <p className="text-lg text-zinc-400 sm:text-xl">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}
      {/* Now Playing Section */}
      <NowPlaying />

      <div className="mx-auto my-4 flex w-full max-w-7xl flex-1 flex-col p-4">
        {/* Top Tracks Section */}
        {topTracks.length > 0 && (
          <div className="mb-8">
            <ItemCarousel title="Top Tracks" subtitle="Your top tracks from the past 4 weeks" viewMoreUrl="/top/tracks">
              {topTracks.map((track, index) => (
                <ItemCard
                  key={track.trackIsrc}
                  href={`/track/${track.trackIsrc}`}
                  imageUrl={track.imageUrl}
                  number={index + 1}
                  title={track.trackName}
                  subtitle={track.artists.map((a) => a.artistName).join(", ")}
                  streams={track.listenCount}
                  minutes={Math.round(track.totalDuration / 60000)}
                />
              ))}
            </ItemCarousel>
          </div>
        )}

        {/* Top Artists Section */}
        {topArtists.length > 0 && (
          <div className="mb-8">
            <ItemCarousel
              title="Top Artists"
              subtitle="Your top artists from the past 4 weeks"
              viewMoreUrl="/top/artists"
            >
              {topArtists.map((artist, index) => (
                <ItemCard
                  key={artist.artistId}
                  href={`/artist/${artist.artistId}`}
                  imageUrl={artist.artistImageUrl}
                  number={index + 1}
                  title={artist.artistName}
                  subtitle={`${artist.listenCount} streams`}
                  streams={artist.listenCount}
                  minutes={artist.listenCount}
                />
              ))}
            </ItemCarousel>
          </div>
        )}

        {/* Top Albums Section */}
        {topAlbums.length > 0 && (
          <div className="mb-8">
            <ItemCarousel title="Top Albums" subtitle="Your top albums from the past 4 weeks" viewMoreUrl="/top/albums">
              {topAlbums.map((album, index) => (
                <ItemCard
                  key={album.albumId}
                  href={`/album/${album.albumId}`}
                  imageUrl={album.albumImageUrl}
                  number={index + 1}
                  title={album.albumName}
                  subtitle={album.artistNames?.join(", ")}
                  streams={album.listenCount}
                  minutes={album.listenCount}
                />
              ))}
            </ItemCarousel>
          </div>
        )}

        {/* Stream Charts Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {monthlyStreamData.length > 0 && <MonthlyStreamChart data={monthlyStreamData} />}
          {yearlyStreamData.length > 0 && <YearlyStreamChart data={yearlyStreamData} />}
        </div>

        {/* Recent Listens Section */}
        <div>
          <h2 className="mb-6 text-3xl font-bold text-zinc-100">Recent Listens</h2>

          {listens.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">
              No listens found. Start listening to music to see your history here!
            </div>
          ) : (
            <div className="space-y-4">
              {listens.map((listen) => (
                <Link
                  key={listen.id}
                  href={`/track/${listen.trackIsrc}`}
                  className="block rounded-lg bg-zinc-800 p-4 transition-colors hover:bg-zinc-700"
                >
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
                      <p className="text-zinc-400">
                        {listen.artistNames && listen.artistNames.length > 0
                          ? listen.artistNames.join(", ")
                          : "Unknown Artist"}
                      </p>
                      <p className="text-sm text-zinc-500">{listen.albumName || "Unknown Album"}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-400">
                      <p>
                        <LocalDate date={listen.playedAt} />
                      </p>
                      <p>
                        <LocalTime date={listen.playedAt} />
                      </p>
                      <p className="text-xs">{Math.round(listen.durationMS / 1000)}s</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
