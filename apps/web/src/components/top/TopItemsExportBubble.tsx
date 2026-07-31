"use client";

import ChartLegend from "../charts/ChartLegend";
import { BubbleChartContent } from "../charts/TopItemsBubbleChart";
import { topItemsChartColors } from "../charts/topItemsChartColors";
import { TopItem } from "./TopItemsPage";

const EXPORT_MAX = 20;

export default function TopItemsExportBubble({ items }: { items: TopItem[] }) {
  const topItems = items.slice(0, EXPORT_MAX);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Chart */}
      <div className="min-h-0 flex-1">
        <BubbleChartContent items={topItems} maxItems={EXPORT_MAX} disableAnimation />
      </div>

      {/* Legend */}
      <ChartLegend data={topItems} colors={topItemsChartColors} size="export" />
    </div>
  );
}
