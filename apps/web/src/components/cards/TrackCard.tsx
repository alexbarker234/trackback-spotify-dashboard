import ItemCoverArt from "@/components/ItemCoverArt";
import { catalogName } from "@/lib/utils/catalogName";
import { formatDuration } from "@/lib/utils/timeUtils";
import { TopTrack } from "@/types";
import Link from "next/link";

export default function TrackCard({
  track,
  rank,
  rankLabel,
  href,
  statsText
}: {
  track: TopTrack;
  rank?: number;
  // Optional override for the big left label (e.g. show a year instead of "#rank").
  rankLabel?: string;
  href?: string;
  statsText?: string;
}) {
  return (
    <Link
      href={href ?? `/dashboard/track/${track.trackIsrc}`}
      className="block rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(rankLabel || rank != null) && (
            <span className="w-16 text-2xl font-bold text-gray-400">
              {rankLabel ? rankLabel : `#${rank}`}
            </span>
          )}
          <div className="flex items-center gap-4">
            {/* Image */}
            <ItemCoverArt
              imageUrl={track.imageUrl}
              name={track.trackName}
              className="h-16 w-16 rounded-lg shadow-lg"
            />
            {/* Content */}
            <div>
              <p className="text-white">{catalogName(track.trackName)}</p>
              <p className="text-gray-300">{track.artists.map((artist) => artist.artistName).join(" • ")}</p>
              <p className="text-sm text-gray-400">
                {statsText ?? `${track.listenCount} listens • ${formatDuration(track.totalDuration)}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
