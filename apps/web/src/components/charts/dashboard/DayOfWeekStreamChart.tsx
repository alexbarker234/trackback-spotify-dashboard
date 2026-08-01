"use client";

import ChartTooltip from "@/components/charts/shared/ChartTooltip";
import ExpandableChartContainer from "@/components/charts/shared/ExpandableChartContainer";
import ResizableChartContent from "@/components/charts/shared/ResizableChartContent";
import { chartAxis, chartGrid, colors } from "@/lib/utils/colors";
import { formatDuration } from "@/lib/utils/timeUtils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DayOfWeekStreamData {
  dayOfWeek: number;
  day: string;
  streamCount: number;
  totalDuration: number;
}

interface DayOfWeekStreamChartProps {
  data: DayOfWeekStreamData[];
}

export default function DayOfWeekStreamChart({ data }: DayOfWeekStreamChartProps) {
  return (
    <ExpandableChartContainer title="Streams by day of week">
      <ResizableChartContent>
        {(isVertical) => <DayOfWeekStreamChartContent data={data} isVertical={isVertical} />}
      </ResizableChartContent>
    </ExpandableChartContainer>
  );
}

function DayOfWeekStreamChartContent({
  data,
  isVertical
}: {
  data: DayOfWeekStreamData[];
  isVertical: boolean;
}) {
  const formatShortDay = (day: string) => day.slice(0, 3);

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: DayOfWeekStreamData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-white">
            <span className="text-gray-400">Streams: </span>
            {payload[0]!.value.toLocaleString()}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Duration: </span>
            {formatDuration(payload[0]!.payload.totalDuration)}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{
          top: 10,
          right: 10,
          left: -10,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
        {isVertical ? (
          <>
            <XAxis type="number" stroke={chartAxis} fontSize={12} />
            <YAxis
              type="category"
              dataKey="day"
              tickFormatter={formatShortDay}
              stroke={chartAxis}
              fontSize={12}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="day" tickFormatter={formatShortDay} stroke={chartAxis} fontSize={12} />
            <YAxis stroke={chartAxis} fontSize={12} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="streamCount"
          fill={colors.sunset}
          radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
