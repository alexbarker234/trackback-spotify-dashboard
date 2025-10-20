"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { clampInBounds } from "@/lib/utils/tooltipUtils";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { TopItem } from "../top/TopItemsPage";
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";
import BubbleChart from "./d3/BubbleChart";
import { BubbleNodeData } from "./d3/BubbleNode";

interface TopItemsBubbleChartProps {
  items: TopItem[];
  chartTitle: string;
  maxItems?: number;
}

const colors = ["#a855f7", "#8b5cf6", "#ec4899", "#f472b6", "#ef4444", "#dc2626", "#f97316", "#eab308"];
function BubbleChartContent({ items, maxItems = 20 }: { items: TopItem[]; maxItems: number }) {
  const [hoveredItem, setHoveredItem] = useState<BubbleNodeData | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [chartSize, setChartSize] = useState({ width: 400, height: 400 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const topItems = items.slice(0, maxItems);
  const maxStreams = Math.max(...topItems.map((item) => Number(item.streams)));

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const size = Math.min(containerWidth, containerHeight);
        setChartSize({ width: size, height: size });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          updateSize();
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const generateBubbleData = (): BubbleNodeData[] => {
    const padding = 20;
    const availableWidth = chartSize.width - 2 * padding;
    const availableHeight = chartSize.height - 2 * padding;

    const data = topItems.map((item) => ({
      name: item.name,
      value: Number(item.streams),
      img: item.imageUrl
    }));

    const bubble = d3.pack().size([availableWidth, availableHeight]).padding(1.5);

    const nodes = d3
      .hierarchy({
        children: data
      })
      .sum((d) => d.value);

    const packed = bubble(nodes);
    const leaves = packed.leaves();

    const bubbles: BubbleNodeData[] = leaves.map((node) => {
      const originalItem = topItems.find((item) => item.name === node.data.name);
      return {
        ...originalItem!,
        x: node.x + padding,
        y: node.y + padding,
        radius: node.r
      };
    });

    return bubbles;
  };

  const bubbleData = generateBubbleData();

  const handleNodeHover = (node: BubbleNodeData | null) => {
    setHoveredItem(node);
    setIsHovering(!!node);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (isHovering && tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const x = mouseX + 10;
        const y = mouseY + 10;

        const clampedPosition = clampInBounds(x, y, tooltipRect, containerRect);
        setMousePosition(clampedPosition);
      } else {
        setMousePosition({ x: mouseX, y: mouseY });
      }
    }
  };

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      <div className="relative">
        <BubbleChart
          data={bubbleData}
          width={chartSize.width}
          height={chartSize.height}
          onNodeHover={handleNodeHover}
        />
      </div>
      {isHovering && hoveredItem && (
        <div
          ref={tooltipRef}
          className="animate-in fade-in-0 pointer-events-none absolute top-0 left-0 z-50 text-nowrap transition-all duration-200 ease-out"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
          <ChartTooltip>
            <div className="flex items-center gap-3">
              {hoveredItem.imageUrl && (
                <img src={hoveredItem.imageUrl} alt={hoveredItem.name} className="h-12 w-12 rounded-lg object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-white">{hoveredItem.name}</p>
                {hoveredItem.subtitle && <p className="text-xs text-gray-300">{hoveredItem.subtitle}</p>}
                <p className="text-white">
                  <span className="text-gray-400">Streams: </span>
                  {hoveredItem.streams?.toLocaleString()}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Duration: </span>
                  {hoveredItem.durationMs && formatDuration(hoveredItem.durationMs)}
                </p>
                <p className="text-sm font-medium text-pink-400">
                  {hoveredItem.streams && ((hoveredItem.streams / maxStreams) * 100).toFixed(1)}% of max
                </p>
              </div>
            </div>
          </ChartTooltip>
        </div>
      )}
    </div>
  );
}

export default function TopItemsBubbleChart({ items, chartTitle, maxItems = 20 }: TopItemsBubbleChartProps) {
  return (
    <ExpandableChartContainer title={chartTitle} chartHeight="h-[700px] sm:h-[500px]">
      <div className="relative flex h-full flex-col">
        <BubbleChartContent items={items} maxItems={maxItems} />
        <ChartLegend data={items} colors={colors} />
      </div>
    </ExpandableChartContainer>
  );
}
