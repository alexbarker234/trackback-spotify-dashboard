"use client";

import ChartTooltip from "@/components/charts/shared/ChartTooltip";
import ExpandableChartContainer from "@/components/charts/shared/ExpandableChartContainer";
import { topItemsChartColors } from "@/lib/utils/colors";
import { formatDuration } from "@/lib/utils/timeUtils";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type YearShareData = {
  year: string;
  sharePct: number;
  streamCount: number;
  totalDuration: number;
};

type TopTrackByYear = {
  year: string;
  trackName: string;
  totalDuration: number;
};

type YearSharePieChartProps = {
  data: YearShareData[];
  topTracksByYear: TopTrackByYear[];
};

export default function YearSharePieChart({ data, topTracksByYear }: YearSharePieChartProps) {
  const chartData = data.map((item) => ({
    name: item.year,
    value: item.sharePct,
    year: item.year,
    sharePct: item.sharePct,
    streamCount: item.streamCount,
    totalDuration: item.totalDuration
  }));

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{ payload: (typeof chartData)[number] }>;
  }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0]?.payload;
    if (!item) return null;

    return (
      <ChartTooltip>
        <p className="text-sm font-medium text-white">{item.year}</p>
        <p className="text-white">
          <span className="text-gray-400">Share: </span>
          {item.sharePct.toFixed(1)}%
        </p>
        <p className="text-white">
          <span className="text-gray-400">Streams: </span>
          {item.streamCount.toLocaleString()}
        </p>
        <p className="text-white">
          <span className="text-gray-400">Duration: </span>
          {formatDuration(item.totalDuration)}
        </p>
      </ChartTooltip>
    );
  };

  return (
    <ExpandableChartContainer title="Top years by share" chartHeight="h-auto">
      <div className="relative flex flex-col">
        <div className="h-[360px] w-full shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="35%"
                outerRadius="85%"
                dataKey="value"
                paddingAngle={2}
                cornerRadius={4}
                strokeWidth={0}
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ""} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`year-share-${index}`}
                    fill={topItemsChartColors[index % topItemsChartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-3">
          {data.map((item) => {
            const topTrack = topTracksByYear.find((t) => t.year === item.year);
            return (
              <Link
                key={item.year}
                href={`/dashboard/years/${item.year}`}
                className="flex flex-col gap-1 rounded-xl bg-black/20 p-4 transition-colors hover:bg-black/30"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-white">{item.year}</div>
                  <div className="text-gray-300">
                    {item.sharePct.toFixed(1)}% • {item.streamCount.toLocaleString()} streams
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {topTrack
                    ? `Top track: ${topTrack.trackName} (${formatDuration(topTrack.totalDuration)})`
                    : "Top track unavailable"}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ExpandableChartContainer>
  );
}

