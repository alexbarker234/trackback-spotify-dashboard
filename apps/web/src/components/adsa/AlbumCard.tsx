import { formatDuration } from "@/lib/utils/timeUtils";
import { TopAlbum } from "@/types";
import Link from "next/link";

export default function AlbumCard({ album, rank }: { album: TopAlbum; rank: number }) {
  return (
    <Link href={`/album/${album.albumId}`} className="rounded-lg bg-zinc-800 p-4 transition-colors hover:bg-zinc-700">
      <div className="flex gap-4">
        <div className="flex items-center text-lg font-bold text-zinc-400">#{rank}</div>
        {album.albumImageUrl && (
          <img
            src={album.albumImageUrl}
            alt={`${album.albumName} album cover`}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="line-clamp-2 font-medium text-zinc-100">{album.albumName}</h4>
          </div>
          <p className="text-sm text-zinc-400">
            {album.listenCount} listens • {formatDuration(album.totalDuration)}
          </p>
        </div>
      </div>
    </Link>
  );
}
