import { formatTime } from "@/lib/utils/timeUtils";
import { Listen } from "@/types";
import Link from "next/link";
import LocalDate from "../LocalDate";
import LocalTime from "../LocalTime";

export default function ListenCard({ listen }: { listen: Listen }) {
  return (
    <Link
      href={`/track/${listen.trackIsrc}`}
      className="block rounded-lg bg-zinc-800 p-4 transition-colors hover:bg-zinc-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {listen.imageUrl && (
            <img
              src={listen.imageUrl}
              alt={`${listen.trackName} album cover`}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="text-zinc-100">{listen.trackName}</p>
            <p className="text-sm text-zinc-400">
              <LocalDate date={listen.playedAt} /> • <LocalTime date={listen.playedAt} />
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-zinc-100">{formatTime(listen.durationMS)}</p>
          <p className="text-sm text-zinc-400">
            {((listen.durationMS / listen.trackDurationMS) * 100).toFixed(1)}% complete
          </p>
        </div>
      </div>
    </Link>
  );
}
