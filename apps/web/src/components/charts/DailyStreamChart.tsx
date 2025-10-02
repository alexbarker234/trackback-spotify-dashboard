"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DailyStreamData {
  date: string;
  streamCount: number;
  totalDuration: number;
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

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: DailyStreamData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-300">{formatDate(label)}</p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Streams: </span>
            {payload[0].value}
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Duration: </span>
            {formatDurationFromMS(payload[0].payload.totalDuration)}
          </p>
        </div>
      );
    }
    return null;
  };

  // TODO add a moving average line for trends

  return (
    <div className="rounded-lg bg-zinc-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Daily Streams</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
