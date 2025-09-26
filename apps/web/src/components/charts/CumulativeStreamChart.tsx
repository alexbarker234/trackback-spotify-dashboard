"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CumulativeStreamData {
  date: string;
  streamCount: number;
  totalDuration: number;
  cumulativeStreams: number;
  cumulativeDuration: number;
}

interface CumulativeStreamChartProps {
  data: CumulativeStreamData[];
}

export default function CumulativeStreamChart({ data }: CumulativeStreamChartProps) {
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
    payload?: Array<{ value: number; payload: CumulativeStreamData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-300">{formatDate(label)}</p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Daily Streams: </span>
            {data.streamCount}
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Cumulative Streams: </span>
            {data.cumulativeStreams.toLocaleString()}
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Daily Duration: </span>
            {formatDurationFromMS(data.totalDuration)}
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Cumulative Duration: </span>
            {formatDurationFromMS(data.cumulativeDuration)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg bg-zinc-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Cumulative Streams</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulativeStreams"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
