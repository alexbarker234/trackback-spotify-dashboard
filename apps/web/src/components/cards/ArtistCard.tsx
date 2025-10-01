import { formatDuration } from "@/lib/utils/timeUtils";
import { TopArtist } from "@/types";
import Link from "next/link";

export default function ArtistCard({ artist, rank }: { artist: TopArtist; rank: number }) {
  return (
    <Link href={`/album/${artist.artistId}`} className="rounded-lg bg-zinc-800 p-4 transition-colors hover:bg-zinc-700">
      <div className="flex gap-4">
        <div className="flex items-center text-lg font-bold text-zinc-400">#{rank}</div>
        {artist.artistImageUrl && (
          <img
            src={artist.artistImageUrl}
            alt={`${artist.artistName} artist cover`}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="line-clamp-2 font-medium text-zinc-100">{artist.artistName}</h4>
          </div>
          <p className="text-sm text-zinc-400">
            {artist.listenCount} listens • {formatDuration(artist.totalDuration)}
          </p>
        </div>
      </div>
    </Link>
  );
}
