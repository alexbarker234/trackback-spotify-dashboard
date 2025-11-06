"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
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
  // Fill missing days with zero values
  const filledData = (() => {
    if (!data.length) return [];
    const dataMap = new Map(data.map((d) => [d.date, d]));
    const [first, last] = [new Date(data[0]!.date), new Date(data[data.length - 1]!.date)];
    const result: CumulativeStreamData[] = [];
    let lastCumulative = { streams: 0, duration: 0 };
    const d = new Date(first);

    while (d <= last) {
      const dateStr = d.toISOString().split("T")[0]!;
      const existing = dataMap.get(dateStr);
      if (existing) {
        lastCumulative = {
          streams: existing.cumulativeStreams,
          duration: existing.cumulativeDuration
        };
        result.push(existing);
      } else {
        result.push({
          date: dateStr,
          streamCount: 0,
          totalDuration: 0,
          cumulativeStreams: lastCumulative.streams,
          cumulativeDuration: lastCumulative.duration
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return result;
  })();

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
          data={filledData}
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
