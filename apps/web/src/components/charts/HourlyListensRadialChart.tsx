"use client";

import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/timeUtils";
import { useEffect, useRef, useState } from "react";
import ChartTooltip from "./ChartTooltip";

interface HourlyListenData {
  hour: number;
  listenCount: number;
  totalDuration: number;
}

interface HourlyListensRadialChartProps {
  data: HourlyListenData[];
}

export default function HourlyListensRadialChart({ data }: HourlyListensRadialChartProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [chartSize, setChartSize] = useState(320);
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert UTC hourly data to local timezone
  const convertToLocalTimezone = (inputData: HourlyListenData[]): HourlyListenData[] => {
    // Get timezone offset in hours (negative for UTC+, positive for UTC-)
    const timezoneOffsetHours = -new Date().getTimezoneOffset() / 60;

    // Create array to accumulate shifted data
    const shiftedData = new Array(24).fill(null).map(() => ({
      hour: 0,
      listenCount: 0,
      totalDuration: 0
    }));

    // Shift each hour's data to local timezone
    inputData.forEach((item) => {
      const localHour = (item.hour + timezoneOffsetHours + 24) % 24;
      shiftedData[localHour]!.hour = localHour;
      shiftedData[localHour]!.listenCount += item.listenCount;
      shiftedData[localHour]!.totalDuration += item.totalDuration;
    });

    return shiftedData;
  };

  // Fill in missing hours with 0 values
  const createCompleteHourlyData = (inputData: HourlyListenData[]): HourlyListenData[] => {
    const hourlyData = new Array(24).fill(null).map((_, index) => {
      const existingData = inputData.find((item) => item.hour === index);
      return {
        hour: index,
        listenCount: existingData?.listenCount || 0,
        totalDuration: existingData?.totalDuration || 0
      };
    });
    return hourlyData;
  };

  const completeData = convertToLocalTimezone(createCompleteHourlyData(data));

  const maxListenCount = Math.max(...completeData.map((d) => d.listenCount));

  // Handle responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        console.log(containerWidth, containerHeight);
        const size = Math.min(containerWidth, containerHeight, 600);
        setChartSize(size);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [containerRef]);

  // Chart dimensions - responsive
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const innerRadius = chartSize * 0.125;
  const maxRadius = chartSize * 0.5;
  const barWidth = chartSize * 0.025;

  // Generate radial bar data
  const radialBars = completeData.map((item, index) => {
    const angle = (index * 360) / 24 - 90; // Start from top (12 o'clock)
    const radians = (angle * Math.PI) / 180;
    const barLength = (item.listenCount / Math.max(maxListenCount, 1)) * (maxRadius - innerRadius);
    const isHovered = hoveredHour === index;
    return {
      ...item,
      angle,
      radians,
      barLength,
      isHovered,
      startX: centerX + Math.cos(radians) * innerRadius,
      startY: centerY + Math.sin(radians) * innerRadius,
      endX: centerX + Math.cos(radians) * (innerRadius + barLength),
      endY: centerY + Math.sin(radians) * (innerRadius + barLength)
    };
  });

  const handleBarHover = (hour: number | null) => {
    if (hour !== null) setHoveredHour(hour);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      setMousePosition({
        x: mouseX,
        y: mouseY
      });

      // Calculate distance from the center of the chart
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      if (distanceFromCenter > maxRadius + chartSize * 0.03) {
        setIsHovering(false);
        setHoveredHour(null);
      } else {
        setIsHovering(true);
      }
    }
  };

  const handleChartMouseEnter = () => {
    setIsHovering(true);
  };

  const handleChartMouseLeave = () => {
    setIsHovering(false);
    setHoveredHour(null);
  };

  const hoveredData = hoveredHour !== null ? completeData[hoveredHour] : null;

  return (
    <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-lg font-semibold text-white">Hourly Listening Pattern</h3>
      <div className="flex h-96 w-full items-center justify-center" ref={containerRef}>
        <div className="relative" ref={chartRef}>
          <svg
            width={chartSize}
            height={chartSize}
            className="overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleChartMouseEnter}
            onMouseLeave={handleChartMouseLeave}
          >
            {/* Hour markers */}
            {[0, 6, 12, 18].map((hour) => {
              const angle = (hour * 360) / 24 - 90;
              const radians = (angle * Math.PI) / 180;
              const labelRadius = innerRadius - chartSize * 0.0625; // 6.25% of chart size
              const labelX = centerX + Math.cos(radians) * labelRadius;
              const labelY = centerY + Math.sin(radians) * labelRadius;

              return (
                <text
                  key={hour}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={chartSize * 0.0375} // 3.75% of chart size
                  fontWeight="500"
                >
                  {hour}
                </text>
              );
            })}

            {/* Maximum radius circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={maxRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />

            {/* Hour tick marks */}
            {completeData.map((_, index) => {
              const angle = (index * 360) / 24 - 90;
              const radians = (angle * Math.PI) / 180;
              const tickLength = chartSize * 0.015625; // 1.5625% of chart size
              const tickInnerX = centerX + Math.cos(radians) * (innerRadius - tickLength);
              const tickInnerY = centerY + Math.sin(radians) * (innerRadius - tickLength);
              const tickOuterX = centerX + Math.cos(radians) * (innerRadius - tickLength * 2);
              const tickOuterY = centerY + Math.sin(radians) * (innerRadius - tickLength * 2);

              return (
                <line
                  key={index}
                  x1={tickInnerX}
                  y1={tickInnerY}
                  x2={tickOuterX}
                  y2={tickOuterY}
                  stroke="white"
                  strokeWidth={chartSize * 0.003125} // Scale stroke width too
                  opacity="0.3"
                />
              );
            })}

            {/* Background bars */}
            {radialBars.map((bar) => (
              <rect
                key={`bg-${bar.hour}`}
                x={bar.startX - barWidth / 2}
                y={bar.startY - barWidth / 2}
                width={maxRadius - innerRadius}
                height={barWidth}
                rx={barWidth / 2}
                ry={barWidth / 2}
                fill="rgba(0, 0, 0, 0.2)"
                transform={`rotate(${bar.angle}, ${bar.startX}, ${bar.startY})`}
              />
            ))}

            {/* Radial bars */}
            {radialBars.map((bar) => (
              <g key={bar.hour}>
                {/* Hover area - larger invisible area for easier hovering */}
                <rect
                  x={bar.startX - barWidth / 2 - chartSize * 0.00625}
                  y={bar.startY - barWidth / 2 - chartSize * 0.00625}
                  width={maxRadius - innerRadius}
                  height={barWidth + chartSize * 0.0125}
                  fill="transparent"
                  transform={`rotate(${bar.angle}, ${bar.startX}, ${bar.startY})`}
                  onMouseEnter={() => handleBarHover(bar.hour)}
                  onMouseLeave={() => handleBarHover(null)}
                />
                {/* Actual bar */}
                <rect
                  x={bar.startX - barWidth / 2}
                  y={bar.startY - barWidth / 2}
                  width={bar.barLength}
                  height={barWidth}
                  rx={barWidth / 2}
                  ry={barWidth / 2}
                  transform={`rotate(${bar.angle}, ${bar.startX}, ${bar.startY})`}
                  className={cn("fill-purple-500 transition-all duration-500 ease-out", {
                    "fill-pink-500": bar.isHovered
                  })}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {isHovering && hoveredData && (
            <div
              className="animate-in fade-in-0 pointer-events-none absolute z-50 text-nowrap transition-all duration-200 ease-out"
              style={{
                left: mousePosition.x + 10,
                top: mousePosition.y + 10
              }}
            >
              <ChartTooltip>
                <p className="text-sm font-medium text-gray-300">
                  {hoveredData.hour}:00 (
                  {hoveredData.hour === 0 ? 12 : hoveredData.hour > 12 ? hoveredData.hour - 12 : hoveredData.hour}:00{" "}
                  {hoveredData.hour < 12 ? "AM" : "PM"})
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Listens: </span>
                  {hoveredData.listenCount}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Duration: </span>
                  {formatDuration(hoveredData.totalDuration)}
                </p>
              </ChartTooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
