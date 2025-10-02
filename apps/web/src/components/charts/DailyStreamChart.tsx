"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DailyStreamData {
  date: string;
  streamCount: number;
  totalDuration: number;
  movingAverage?: number;
}

interface DailyStreamChartProps {
  data: DailyStreamData[];
}

export default function DailyStreamChart({ data }: DailyStreamChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDurationFromMS = (ms: number) => {
    return formatDuration(ms);
  };

  // Calculate 4-week (28-day) moving average
  const calculateMovingAverage = (data: DailyStreamData[]) => {
    const windowSize = 28;
    return data.map((item, index) => {
      if (index < windowSize - 1) {
        return { ...item, movingAverage: undefined };
      }

      const windowData = data.slice(index - windowSize + 1, index + 1);
      const average = windowData.reduce((sum, d) => sum + d.streamCount, 0) / windowSize;
      return { ...item, movingAverage: Math.round(average * 100) / 100 };
    });
  };

  const dataWithMovingAverage = calculateMovingAverage(data);

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: DailyStreamData; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const streamData = payload.find((p) => p.dataKey === "streamCount");
      const movingAvgData = payload.find((p) => p.dataKey === "movingAverage");

      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-300">{formatDate(label)}</p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Streams: </span>
            {streamData?.value}
          </p>
          {movingAvgData?.value && (
            <p className="text-zinc-100">
              <span className="text-zinc-400">4-Week Avg: </span>
              {movingAvgData.value}
            </p>
          )}
          <p className="text-zinc-100">
            <span className="text-zinc-400">Duration: </span>
            {formatDurationFromMS(streamData?.payload.totalDuration || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg bg-zinc-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Daily Streams</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dataWithMovingAverage}
            margin={{
              top: 10,
              right: 10,
              left: -30,
              bottom: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="streamCount"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke="#F59E0B"
              dot={false}
              connectNulls={false}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
