"use client";

import { clampInBounds } from "@/lib/utils/tooltipUtils";
import { useRef, useState } from "react";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface DailyData {
  date: string;
  streamCount: number;
  totalDuration: number;
}

interface ListeningHeatmapProps {
  data: DailyData[];
}

export default function ListeningHeatmap({ data }: ListeningHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    streamCount: number;
    totalDuration: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Create a map for quick lookup of daily data
  const dataMap = new Map(data.map((item) => [item.date, item]));

  // Generate a full year of data for the current year
  const generateYearData = () => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1)); // January 1st UTC
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)); // December 31st UTC (end of day)

    const yearData: Array<{
      date: string;
      streamCount: number;
      totalDuration: number;
      dayOfWeek: number;
      weekOfYear: number;
    }> = [];

    const currentDate = new Date(startOfYear);
    while (currentDate <= endOfYear) {
      const dateString = currentDate.toISOString().split("T")[0]!;
      const existingData = dataMap.get(dateString);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Calculate week of year (ISO week)
      const startOfYearForWeek = new Date(currentDate.getFullYear(), 0, 1);
      const pastDaysOfYear = (currentDate.getTime() - startOfYearForWeek.getTime()) / 86400000;
      const weekOfYear = Math.ceil((pastDaysOfYear + startOfYearForWeek.getDay() + 1) / 7);

      yearData.push({
        date: dateString,
        streamCount: existingData?.streamCount || 0,
        totalDuration: existingData?.totalDuration || 0,
        dayOfWeek,
        weekOfYear
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return yearData;
  };

  const yearData = generateYearData();

  // Get the maximum stream count for color intensity calculation
  const maxStreams = Math.max(...yearData.map((d) => d.streamCount));

  // Get color intensity based on stream count
  const getColorIntensity = (streamCount: number) => {
    if (streamCount === 0) return "bg-white/10";
    if (maxStreams === 0) return "bg-white/10";

    const intensity = streamCount / maxStreams;
    if (intensity <= 0.25) return "bg-purple-900";
    if (intensity <= 0.5) return "bg-purple-700";
    if (intensity <= 0.75) return "bg-purple-500";
    return "bg-purple-400";
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Group data by months for rendering
  const months: Array<{
    monthName: string;
    weeks: Array<Array<(typeof yearData)[0] | null>>;
  }> = [];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Group data by months
  let currentMonth = -1;
  let currentMonthData: Array<(typeof yearData)[0]> = [];

  yearData.forEach((day) => {
    const date = new Date(day.date);
    const month = date.getMonth();

    if (month !== currentMonth) {
      // Save previous month if it exists
      if (currentMonth !== -1 && currentMonthData.length > 0) {
        const monthWeeks: Array<Array<(typeof yearData)[0] | null>> = [];
        for (let i = 0; i < currentMonthData.length; i += 7) {
          const week = currentMonthData.slice(i, i + 7);

          monthWeeks.push(week);
        }
        months.push({
          monthName: monthNames[currentMonth],
          weeks: monthWeeks
        });
      }

      // Start new month
      currentMonth = month;
      currentMonthData = [day];
    } else {
      currentMonthData.push(day);
    }
  });

  // Add the last month
  if (currentMonth !== -1 && currentMonthData.length > 0) {
    const monthWeeks: Array<Array<(typeof yearData)[0] | null>> = [];
    for (let i = 0; i < currentMonthData.length; i += 7) {
      const week = currentMonthData.slice(i, i + 7);
      monthWeeks.push(week);
    }
    months.push({
      monthName: monthNames[currentMonth],
      weeks: monthWeeks
    });
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (hoveredDay && tooltipRef.current) {
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

  let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleMouseEnter = (day: (typeof yearData)[0]) => {
    setHoveredDay(day);
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }
  };

  const handleMouseLeave = (day: (typeof yearData)[0]) => {
    leaveTimeout = setTimeout(() => {
      setHoveredDay((currentDay) => (currentDay?.date === day.date ? null : currentDay));
    }, 100);
  };

  return (
    <ExpandableChartContainer title="Listening Activity Heatmap" chartHeight="h-fit">
      <div
        className="relative flex h-full flex-col items-center justify-center"
        ref={containerRef}
        onMouseMove={handleMouseMove}
      >
        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="animate-in fade-in-0 pointer-events-none absolute top-0 left-0 z-50 text-nowrap transition-all duration-200 ease-out"
            ref={tooltipRef}
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          >
            <ChartTooltip>
              <div className="font-medium">{formatDate(hoveredDay.date)}</div>
              <div className="text-gray-300">
                <div>{hoveredDay.streamCount} streams</div>
                <div>{Math.round(hoveredDay.totalDuration / 60000)} minutes</div>
              </div>
            </ChartTooltip>
          </div>
        )}

        <div className="mx-auto w-fit">
          {/* Month sections - Responsive grid */}
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {months.map((month, monthIndex) => (
              <div key={monthIndex} className="flex flex-col">
                {/* Month label */}
                <div className="mb-2 text-center text-xs text-gray-400">{month.monthName}</div>

                {/* Month grid */}
                <div className="flex justify-center gap-1">
                  {month.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={`${monthIndex}-${weekIndex}-${dayIndex}`}
                          className={`h-3 w-3 cursor-pointer rounded-sm transition-all duration-200 hover:ring-2 hover:ring-white/20 ${
                            day ? getColorIntensity(day.streamCount) : "bg-white/10"
                          }`}
                          onMouseEnter={() => day && handleMouseEnter(day)}
                          onMouseLeave={() => day && handleMouseLeave(day)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-white/10"></div>
            <div className="h-3 w-3 rounded-sm bg-purple-900"></div>
            <div className="h-3 w-3 rounded-sm bg-purple-700"></div>
            <div className="h-3 w-3 rounded-sm bg-purple-500"></div>
            <div className="h-3 w-3 rounded-sm bg-purple-400"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </ExpandableChartContainer>
  );
}
