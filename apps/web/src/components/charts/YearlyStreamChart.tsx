"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface YearlyStreamData {
  year: string;
  streamCount: number;
  totalDuration: number;
}

interface YearlyStreamChartProps {
  data: YearlyStreamData[];
}

export default function YearlyStreamChart({ data }: YearlyStreamChartProps) {
  const formatYear = (yearStr: string) => {
    return yearStr;
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
    payload?: Array<{ value: number; payload: YearlyStreamData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-300">{label}</p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Streams: </span>
            {payload[0].value.toLocaleString()}
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

  return (
    <div className="rounded-lg bg-zinc-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Streams by year</h3>
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
            <XAxis dataKey="year" tickFormatter={formatYear} stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="streamCount"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
