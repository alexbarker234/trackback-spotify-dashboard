"use client";

import ChartLegend from "@/components/charts/shared/ChartLegend";
import { BubbleChartContent } from "../views/TopItemsBubbleChart";
import { topItemsChartColors } from "../topItemsChartColors";
import { TopItem } from "../types";

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
