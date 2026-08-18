"use client";

import ChartTooltip from "@/components/charts/shared/ChartTooltip";
import ExpandableChartContainer from "@/components/charts/shared/ExpandableChartContainer";
import { chartAxis, chartGrid, colors } from "@/lib/utils/colors";
import { formatDuration } from "@/lib/utils/timeUtils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface YearlyDurationData {
  year: string;
  totalDuration: number;
  streamCount: number;
}

interface YearlyDurationChartProps {
  data: YearlyDurationData[];
}

export default function YearlyDurationChart({ data }: YearlyDurationChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: YearlyDurationData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const yearData = payload[0]?.payload;
      if (!yearData) return null;

      return (
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-white">
            <span className="text-gray-400">Duration: </span>
            {formatDuration(yearData.totalDuration)}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Streams: </span>
            {yearData.streamCount.toLocaleString()}
          </p>
        </ChartTooltip>
      );
    }

    return null;
  };

  return (
    <ExpandableChartContainer title="Duration by year">
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
          <XAxis dataKey="year" stroke={chartAxis} fontSize={12} />
          <YAxis stroke={chartAxis} fontSize={12} tickFormatter={(v) => formatDuration(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalDuration"
            stroke={colors.purple}
            fill={colors.purple}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}

