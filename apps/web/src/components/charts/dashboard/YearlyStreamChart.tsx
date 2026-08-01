"use client";

import ChartTooltip from "@/components/charts/shared/ChartTooltip";
import ExpandableChartContainer from "@/components/charts/shared/ExpandableChartContainer";
import { chartAxis, chartGrid, colors } from "@/lib/utils/colors";
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
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-white">
            <span className="text-gray-400">Streams: </span>
            {payload[0].value.toLocaleString()}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Duration: </span>
            {formatDurationFromMS(payload[0].payload.totalDuration)}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title="Streams by year">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
          <XAxis dataKey="year" tickFormatter={formatYear} stroke={chartAxis} fontSize={12} />
          <YAxis stroke={chartAxis} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="streamCount"
            stroke={colors.amber}
            fill={colors.amber}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}
