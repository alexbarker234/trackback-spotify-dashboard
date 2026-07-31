"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import ChartLegend from "../charts/ChartLegend";
import { topItemsChartColors } from "../charts/topItemsChartColors";
import { TopItem } from "./TopItemsPage";

const EXPORT_MAX = 12;

export default function TopItemsExportPie({ items }: { items: TopItem[] }) {
  const topItems = items.slice(0, EXPORT_MAX);
  const data = topItems.map((item) => ({
    ...item,
    value: Number(item.streams),
    streams: Number(item.streams),
    durationMs: Number(item.durationMs)
  }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Chart */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              innerRadius="20%"
              outerRadius="90%"
              fill="#8884d8"
              dataKey="value"
              strokeWidth={0}
              paddingAngle={2}
              cornerRadius={4}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.id} fill={topItemsChartColors[index % topItemsChartColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <ChartLegend data={data} colors={topItemsChartColors} size="export" />
    </div>
  );
}
