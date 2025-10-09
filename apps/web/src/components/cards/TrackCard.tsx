import { formatDuration } from "@/lib/utils/timeUtils";
import { TopTrack } from "@/types";
import Link from "next/link";

export default function TrackCard({ track, rank }: { track: TopTrack; rank: number }) {
  return (
    <Link
      href={`/track/${track.trackIsrc}`}
      className="block rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-16 text-2xl font-bold text-gray-400">#{rank}</span>
          <div className="flex items-center gap-4">
            {track.imageUrl && (
              <img
                src={track.imageUrl}
                alt={`${track.trackName} album cover`}
                className="h-16 w-16 rounded-lg object-cover shadow-lg"
              />
            )}
            <div>
              <p className="text-white">{track.trackName}</p>
              <p className="text-gray-300">{track.artists.map((artist) => artist.artistName).join(" • ")}</p>
              <p className="text-sm text-gray-400">
                {track.listenCount} listens • {formatDuration(track.totalDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
