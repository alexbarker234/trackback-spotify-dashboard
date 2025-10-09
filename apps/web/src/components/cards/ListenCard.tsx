import { formatTime } from "@/lib/utils/timeUtils";
import { Listen } from "@/types";
import Link from "next/link";
import LocalDate from "../LocalDate";
import LocalTime from "../LocalTime";

export default function ListenCard({ listen }: { listen: Listen }) {
  return (
    <Link
      href={`/track/${listen.trackIsrc}`}
      className="block rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {listen.imageUrl && (
            <img
              src={listen.imageUrl}
              alt={`${listen.trackName} album cover`}
              className="h-16 w-16 rounded-lg object-cover shadow-lg"
            />
          )}
          <div>
            <p className="text-white">{listen.trackName}</p>
            <p className="text-sm text-gray-400">
              <LocalDate date={listen.playedAt} /> • <LocalTime date={listen.playedAt} />
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white">{formatTime(listen.durationMS)}</p>
          <p className="text-sm text-gray-400">
            {((listen.durationMS / listen.trackDurationMS) * 100).toFixed(1)}% complete
          </p>
        </div>
      </div>
    </Link>
  );
}
