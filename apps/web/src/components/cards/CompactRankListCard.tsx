import { formatDuration } from "@/lib/utils/timeUtils";
import Link from "next/link";

export default function CompactRankListCard({
  item,
  index
}: {
  item: {
    id: string;
    href: string;
    imageUrl: string | null;
    name: string;
    subtitle?: string;
    streams: number;
    durationMs: number;
  };
  index: number;
}) {
  return (
    <Link
      key={item.id}
      href={item.href}
      className="flex cursor-pointer items-center gap-4 rounded-xl bg-white/5 px-4 py-2 backdrop-blur-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed"
    >
      {/* Rank */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-gray-400">
        {index + 1}
      </div>

      {/* Image */}
      <div className="h-12 w-12 shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-lg object-cover shadow-lg" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/5">
            <span className="text-lg text-gray-400">🎵</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-white">{item.name}</h3>
        {item.subtitle && <p className="truncate text-sm text-gray-400">{item.subtitle}</p>}
      </div>

      {/* Stats */}
      <div className="shrink-0 text-right">
        <div className="text-sm font-medium text-white">{item.streams.toLocaleString()} streams</div>
        <div className="text-xs text-gray-400">{formatDuration(item.durationMs)}</div>
      </div>
    </Link>
  );
}
