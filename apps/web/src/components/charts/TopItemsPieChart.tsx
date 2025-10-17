"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import Link from "next/link";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { TopItem } from "../top/TopItemsPage";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface TopItemsPieChartProps {
  items: TopItem[];
  chartTitle: string;
  maxItems?: number;
}

interface PieData {
  href: string;
  name: string;
  value: number;
  streams: number;
  durationMs: number;
  imageUrl: string | null;
  subtitle?: string;
  id: string;
  [key: string]: string | number | null | undefined;
}
const colors = ["#a855f7", "#8b5cf6", "#ec4899", "#f472b6", "#ef4444", "#dc2626", "#f97316", "#eab308"];

export default function TopItemsPieChart({ items, chartTitle, maxItems = 20 }: TopItemsPieChartProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const topItems = items.slice(0, maxItems);

  const data: PieData[] = topItems.map((item) => ({
    href: item.href,
    name: item.name,
    value: Number(item.streams),
    streams: Number(item.streams),
    durationMs: Number(item.durationMs),
    imageUrl: item.imageUrl,
    subtitle: item.subtitle,
    id: item.id
  }));

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{ payload: PieData; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const totalStreams = data.reduce((sum, item) => sum + item.streams, 0);
      const percentage = ((item.streams / totalStreams) * 100).toFixed(1);

      return (
        <ChartTooltip>
          <div className="flex items-center gap-3">
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />}
            <div>
              <p className="text-sm font-medium text-white">{item.name}</p>
              {item.subtitle && <p className="text-xs text-gray-300">{item.subtitle}</p>}
              <p className="text-white">
                <span className="text-gray-400">Streams: </span>
                {item.streams.toLocaleString()}
              </p>
              <p className="text-white">
                <span className="text-gray-400">Duration: </span>
                {formatDuration(item.durationMs)}
              </p>
              <p className="text-sm font-medium text-pink-400">{percentage}% of total</p>
            </div>
          </div>
        </ChartTooltip>
      );
    }
    return null;
  };

  let enterTimeout: ReturnType<typeof setTimeout> | null = null;
  let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleMouseEnter = () => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }

    enterTimeout = setTimeout(() => {
      setIsTooltipVisible(true);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (enterTimeout) {
      clearTimeout(enterTimeout);
      enterTimeout = null;
    }

    leaveTimeout = setTimeout(() => {
      setIsTooltipVisible(false);
    }, 100);
  };

  return (
    <ExpandableChartContainer title={chartTitle} chartHeight="h-[700px] sm:h-[500px]">
      <div className="relative flex h-full flex-col">
        <ResponsiveContainer width="100%" height="100%" className="flex-1">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              innerRadius="20%"
              outerRadius="100%"
              fill="#8884d8"
              dataKey="value"
              strokeWidth={0}
              paddingAngle={2}
              cornerRadius={4}
              className="cursor-pointer"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} active={isTooltipVisible} />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {data.slice(0, 12).map((item, index) => {
            const totalStreams = data.reduce((sum, item) => sum + item.streams, 0);
            const percentage = ((item.streams / totalStreams) * 100).toFixed(1);

            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-1 transition-all hover:bg-white/10"
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="aspect-square h-8 flex-shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">{percentage}%</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </ExpandableChartContainer>
  );
}
