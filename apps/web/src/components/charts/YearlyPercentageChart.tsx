"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface YearlyPercentageData {
  year: string;
  itemPercentage: number;
  otherPercentage: number;
  itemListens: number;
  otherListens: number;
  totalListens: number;
}

interface YearlyPercentageChartProps {
  data: YearlyPercentageData[];
  itemName: string;
}

export default function YearlyPercentageChart({ data, itemName }: YearlyPercentageChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: YearlyPercentageData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-white">
            <span className="text-gray-400">{itemName}: </span>
            {data.itemPercentage.toFixed(1)}% ({data.itemListens.toLocaleString()} listens)
          </p>
          <p className="text-white">
            <span className="text-gray-400">Other: </span>
            {data.otherPercentage.toFixed(1)}% ({data.otherListens.toLocaleString()} listens)
          </p>
          <p className="text-white">
            <span className="text-gray-400">Total Listens: </span>
            {data.totalListens.toLocaleString()}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title="Yearly Listen Distribution">
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
          <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${Math.round(value)}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="otherPercentage"
            stackId="1"
            stroke="#9ca3af"
            fill="#9ca3af"
            fillOpacity={0.6}
            strokeWidth={2}
            name="Other"
          />
          <Area
            type="monotone"
            dataKey="itemPercentage"
            stackId="1"
            stroke="#ec4899"
            fill="#ec4899"
            fillOpacity={0.8}
            strokeWidth={2}
            name={itemName}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}
