import { formatDuration } from "@/lib/utils/timeUtils";
import { TopItem } from "./TopItemsPage";

const EXPORT_MAX = 15;

export default function TopItemsExportList({ items }: { items: TopItem[] }) {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      {items.slice(0, EXPORT_MAX).map((item, index) => (
        <div
          key={item.id}
          className="flex min-h-0 flex-1 items-center gap-6 rounded-2xl bg-white/5 px-6 py-4"
        >
          {/* Rank */}
          <div className="flex aspect-square h-full shrink-0 items-center justify-center rounded-full bg-white/10 text-3xl font-bold text-gray-400">
            {index + 1}
          </div>

          {/* Image */}
          <div className="aspect-square h-full shrink-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/5">
                <span className="text-4xl text-gray-400">🎵</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-4xl font-medium text-white">{item.name}</h3>
            {item.subtitle ? (
              <p className="mt-1 truncate text-3xl text-gray-400">{item.subtitle}</p>
            ) : null}
          </div>

          {/* Stats */}
          <div className="shrink-0 text-right">
            <div className="text-3xl font-medium text-white">
              {item.streams.toLocaleString()} streams
            </div>
            <div className="mt-1 text-2xl text-gray-400">{formatDuration(item.durationMs)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
