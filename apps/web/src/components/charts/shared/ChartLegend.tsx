import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { TopItem } from "@/components/top/types";

type ChartLegendProps = {
  data: TopItem[];
  colors: string[];
  size?: "default" | "export";
};

export default function ChartLegend({ data, colors, size = "default" }: ChartLegendProps) {
  const isExport = size === "export";

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
        isExport ? "mt-8 grid-cols-2 gap-4 md:grid-cols-2" : "mt-6"
      )}
    >
      {data.slice(0, 12).map((item, index) => {
        const totalStreams = data.reduce((sum, item) => sum + Number(item.streams), 0);
        const percentage = ((item.streams / totalStreams) * 100).toFixed(1);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg bg-white/5 transition-all hover:bg-white/10",
              isExport ? "gap-3 px-4 py-3" : "gap-2 px-2 py-1"
            )}
          >
            <div
              className={cn("shrink-0 rounded-full", isExport ? "h-4 w-4" : "h-3 w-3")}
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className={cn(
                  "aspect-square flex-shrink-0 rounded object-cover",
                  isExport ? "h-14 w-14 rounded-lg" : "h-8"
                )}
              />
            )}
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "truncate font-medium text-white",
                  isExport ? "text-xl" : "text-sm"
                )}
              >
                {item.name}
              </div>
              <div className={cn("text-gray-400", isExport ? "text-base" : "text-xs")}>
                {percentage}%
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
