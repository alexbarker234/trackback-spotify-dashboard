import { formatDuration } from "@/lib/utils/timeUtils";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TopItem } from "../types";

const EXPORT_MAX = 12;

export default function TopItemsExportGrid({ items }: { items: TopItem[] }) {
  return (
    <div
      className="grid h-full grid-cols-3 gap-x-8 gap-y-6"
      style={{ gridTemplateRows: "repeat(4, minmax(0, 1fr))" }}
    >
      {items.slice(0, EXPORT_MAX).map((item, index) => (
        <div key={item.id} className="flex min-h-0 flex-col rounded-2xl bg-white/5 p-4">
          {/* Image */}
          <div className="relative min-h-0 w-full flex-1">
            <div className="absolute inset-0 m-auto aspect-square max-h-full max-w-full">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/5">
                  <FontAwesomeIcon icon={faMusic} className="text-5xl text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 shrink-0">
            <p className="line-clamp-2 text-2xl font-medium text-white">
              <span className="font-bold text-gray-400">#{index + 1}</span> {item.name}
            </p>
            {item.subtitle ? (
              <p className="mt-1 line-clamp-1 text-3xl text-gray-400">{item.subtitle}</p>
            ) : null}
            <p className="mt-1 text-2xl text-gray-500">
              {item.streams.toLocaleString()} streams • {formatDuration(item.durationMs)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
