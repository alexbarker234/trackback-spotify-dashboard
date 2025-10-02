"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <p className="text-sm font-medium text-zinc-300">{label}</p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">{itemName}: </span>
            {data.itemPercentage.toFixed(1)}% ({data.itemListens.toLocaleString()} listens)
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Other: </span>
            {data.otherPercentage.toFixed(1)}% ({data.otherListens.toLocaleString()} listens)
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Total Listens: </span>
            {data.totalListens.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg bg-zinc-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Yearly Listen Distribution</h3>
      <div className="h-64 w-full">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${Math.round(value)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="otherPercentage"
              stackId="1"
              stroke="#6B7280"
              fill="#6B7280"
              fillOpacity={0.6}
              strokeWidth={2}
              name="Other"
            />
            <Area
              type="monotone"
              dataKey="itemPercentage"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.8}
              strokeWidth={2}
              name={itemName}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
