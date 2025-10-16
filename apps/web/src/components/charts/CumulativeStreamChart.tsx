"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

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
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{formatDate(label)}</p>
          <p className="text-white">
            <span className="text-gray-400">Daily Streams: </span>
            {data.streamCount}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Cumulative Streams: </span>
            {data.cumulativeStreams.toLocaleString()}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Daily Duration: </span>
            {formatDurationFromMS(data.totalDuration)}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Cumulative Duration: </span>
            {formatDurationFromMS(data.cumulativeDuration)}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title="Cumulative Streams">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeStreams"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}
