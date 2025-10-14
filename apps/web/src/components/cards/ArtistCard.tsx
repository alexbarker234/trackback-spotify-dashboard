import { formatDuration } from "@/lib/utils/timeUtils";
import { TopArtist } from "@/types";
import Link from "next/link";

export default function ArtistCard({ artist, rank }: { artist: TopArtist; rank: number }) {
  return (
    <Link
      href={`/dashboard/artist/${artist.artistId}`}
      className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      <div className="flex gap-4">
        <div className="flex items-center text-lg font-bold text-gray-400">#{rank}</div>
        {artist.artistImageUrl && (
          <img
            src={artist.artistImageUrl}
            alt={`${artist.artistName} artist cover`}
            className="h-16 w-16 rounded-lg object-cover shadow-lg"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="line-clamp-2 font-medium text-white">{artist.artistName}</h4>
          </div>
          <p className="text-sm text-gray-400">
            {artist.listenCount} listens • {formatDuration(artist.totalDuration)}
          </p>
        </div>
      </div>
    </Link>
  );
}
