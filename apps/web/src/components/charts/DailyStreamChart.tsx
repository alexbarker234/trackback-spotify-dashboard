"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

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
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{formatDate(label)}</p>
          <p className="text-white">
            <span className="text-gray-400">Streams: </span>
            {streamData?.value}
          </p>
          {movingAvgData?.value && (
            <p className="text-white">
              <span className="text-gray-400">4-Week Avg: </span>
              {movingAvgData.value}
            </p>
          )}
          <p className="text-white">
            <span className="text-gray-400">Duration: </span>
            {formatDurationFromMS(streamData?.payload.totalDuration || 0)}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title="Daily Streams">
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="streamCount"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="movingAverage"
            stroke="#eab308"
            dot={false}
            connectNulls={false}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}
