"use client";

import { useNowPlaying } from "@/hooks/useNowPlaying";
import Image from "next/image";
import Link from "next/link";
import Loading from "./Loading";

export default function NowPlaying() {
  const { data: nowPlaying, isLoading, error } = useNowPlaying();

  if (isLoading) {
    return (
      <NowPlayingSkeleton>
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 animate-pulse rounded-lg bg-zinc-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-700"></div>
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-700"></div>
          </div>
        </div>
      </NowPlayingSkeleton>
    );
  }

  if (error) {
    return (
      <NowPlayingSkeleton>
        <div className="text-lg font-semibold text-zinc-400">Unable to load currently playing track</div>
      </NowPlayingSkeleton>
    );
  }

  if (!nowPlaying?.is_playing || !nowPlaying?.item) {
    return (
      <NowPlayingSkeleton>
        <div className="text-lg font-semibold text-zinc-400">Nothing Playing</div>
      </NowPlayingSkeleton>
    );
  }

  const { item } = nowPlaying;
  const trackIsrc = item.external_ids?.isrc;

  return (
    <NowPlayingSkeleton>
      <Link
        href={`/track/${trackIsrc}`}
        className="flex items-center space-x-4 rounded-lg p-1 transition-colors hover:bg-zinc-700 sm:px-2"
      >
        {item.album.images[0] && (
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={item.album.images[0].url}
              alt={`${item.album.name} album cover`}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-zinc-100">{item.name}</h3>
          <p className="truncate text-zinc-400">{item.artists.map((artist) => artist.name).join(", ")}</p>
          <p className="truncate text-sm text-zinc-500">{item.album.name}</p>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <Loading className="h-6 w-6" />
        </div>
      </Link>
    </NowPlayingSkeleton>
  );
}

const NowPlayingSkeleton = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="m-4 rounded-lg bg-white/5 p-4 backdrop-blur-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-zinc-100">Now Playing</h2>
          <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
        </div>
        {children}
      </div>
    </div>
  );
};
