import Link from "next/link";
import { TopItem } from "../top/TopItemsPage";

export default function ChartLegend({ data, colors }: { data: TopItem[]; colors: string[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {data.slice(0, 12).map((item, index) => {
        const totalStreams = data.reduce((sum, item) => sum + Number(item.streams), 0);
        const percentage = ((item.streams / totalStreams) * 100).toFixed(1);
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 transition-all hover:bg-white/10"
          >
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="aspect-square h-8 flex-shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{item.name}</div>
              <div className="text-xs text-gray-400">{percentage}%</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
