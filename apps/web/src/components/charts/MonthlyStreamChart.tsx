"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

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

  return (
    <ExpandableChartContainer title="Streams by month">
      <MonthlyStreamChartContent data={sortedData} />
    </ExpandableChartContainer>
  );
}

function MonthlyStreamChartContent({ data }: MonthlyStreamChartProps) {
  const [isVertical, setIsVertical] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setIsVertical(height > width);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{formatMonth(label)}</p>
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
    <div ref={containerRef} className="h-full w-full">
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          {isVertical ? (
            <>
              <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                type="category"
                dataKey="month"
                tickFormatter={formatShortMonth}
                stroke="#9CA3AF"
                fontSize={12}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="month"
                tickFormatter={formatShortMonth}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="streamCount"
            fill="#a855f7"
            radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
