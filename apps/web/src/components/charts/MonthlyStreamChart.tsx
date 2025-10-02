"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthlyStreamData {
  month: string;
  monthNumber: number;
  streamCount: number;
  totalDuration: number;
}

interface MonthlyStreamChartProps {
  data: MonthlyStreamData[];
}

export default function MonthlyStreamChart({ data }: MonthlyStreamChartProps) {
  // Sort data by month number to ensure proper chronological order
  const sortedData = [...data].sort((a, b) => a.monthNumber - b.monthNumber);

  const formatShortMonth = (monthStr: string) => {
    return monthStr.trim().slice(0, 3);
  };

  const formatMonth = (monthStr: string) => {
    return monthStr.trim().charAt(0).toUpperCase() + monthStr.trim().slice(1).toLowerCase();
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
    payload?: Array<{ value: number; payload: MonthlyStreamData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-300">{formatMonth(label)}</p>
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
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Streams by month</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tickFormatter={formatShortMonth} stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="streamCount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
