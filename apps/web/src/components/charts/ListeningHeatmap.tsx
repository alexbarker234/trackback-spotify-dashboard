"use client";

import { DailyData, useHeatmapData } from "@/hooks/useHeatmapData";
import { MONTH_NAMES_SHORT } from "@/lib/constants";
import { chunkArray } from "@/lib/utils/arrayUtils";
import { clampInBounds } from "@/lib/utils/tooltipUtils";
import { useRef, useState } from "react";
import DateNavigationControls from "../DateNavigationControls";
import Loading from "../Loading";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

const LEGEND_COLORS = [
  "bg-white/10",
  "bg-purple-900",
  "bg-purple-700",
  "bg-purple-500",
  "bg-purple-400"
];

type DayData = {
  date: string;
  streamCount: number;
  totalDuration: number;
  dayOfWeek: number;
  weekOfYear: number;
};

type MonthData = {
  monthName: string;
  weeks: Array<Array<DayData | null>>;
};

interface ListeningHeatmapProps {
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
}

export default function ListeningHeatmap({ artistId, albumId, trackIsrc }: ListeningHeatmapProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const currentPeriod = new Date().getFullYear() - currentYear;
  const { data, isLoading, error } = useHeatmapData({
    year: currentYear,
    artistId,
    albumId,
    trackIsrc
  });

  const handlePreviousYear = () => setCurrentYear((prev) => prev - 1);
  const handleNextYear = () => {
    const currentYearNow = new Date().getFullYear();
    if (currentYear < currentYearNow) {
      setCurrentYear((prev) => prev + 1);
    }
  };

  return (
    <ExpandableChartContainer title="Listening Activity Heatmap" chartHeight="h-fit">
      <div className="mx-auto mb-4 w-fit">
        <DateNavigationControls
          dateRange="year"
          currentPeriod={currentPeriod}
          onPreviousPeriod={handlePreviousYear}
          onNextPeriod={handleNextYear}
        />
      </div>
      <ListeningHeatmapContent
        currentYear={currentYear}
        data={data}
        isLoading={isLoading}
        error={error}
      />
    </ExpandableChartContainer>
  );
}

function ListeningHeatmapContent({
  currentYear,
  data,
  isLoading,
  error
}: {
  currentYear: number;
  data: DailyData[];
  isLoading: boolean;
  error: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const generateYearData = (): DayData[] => {
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));
    const dataMap = new Map(data.map((item) => [item.date, item]));
    const yearData: DayData[] = [];

    const currentDate = new Date(startOfYear);
    while (currentDate <= endOfYear) {
      const dateString = currentDate.toISOString().split("T")[0]!;
      const existingData = dataMap.get(dateString);

      yearData.push({
        date: dateString,
        streamCount: existingData?.streamCount || 0,
        totalDuration: existingData?.totalDuration || 0,
        dayOfWeek: currentDate.getDay(),
        weekOfYear: Math.ceil(
          (currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) / 86400000 / 7
        )
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return yearData;
  };

  const groupDataByMonths = (yearData: DayData[]): MonthData[] => {
    const months: MonthData[] = [];
    let currentMonth = -1;
    let currentMonthData: DayData[] = [];

    yearData.forEach((day) => {
      const month = new Date(day.date).getMonth();

      if (month !== currentMonth) {
        // Save previous month
        if (currentMonth !== -1 && currentMonthData.length > 0) {
          months.push({
            monthName: MONTH_NAMES_SHORT[currentMonth],
            weeks: chunkArray(currentMonthData, 7)
          });
        }
        currentMonth = month;
        currentMonthData = [day];
      } else {
        currentMonthData.push(day);
      }
    });

    // Add the last month
    if (currentMonth !== -1 && currentMonthData.length > 0) {
      months.push({
        monthName: MONTH_NAMES_SHORT[currentMonth],
        weeks: chunkArray(currentMonthData, 7)
      });
    }

    return months;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (hoveredDay && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const clampedPosition = clampInBounds(mouseX + 10, mouseY + 10, tooltipRect, containerRect);
      setMousePosition(clampedPosition);
    } else {
      setMousePosition({ x: mouseX + 10, y: mouseY + 10 });
    }
  };

  const handleMouseEnter = (day: DayData) => {
    setHoveredDay(day);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = (day: DayData) => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredDay((currentDay) => (currentDay?.date === day.date ? null : currentDay));
    }, 100);
  };

  const yearData = generateYearData();
  const months = groupDataByMonths(yearData);
  const maxStreams = Math.max(...yearData.map((d) => d.streamCount));

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
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
          style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
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
      <HeatmapGrid
        months={months}
        maxStreams={maxStreams}
        isLoading={isLoading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <HeatmapLegend />
    </div>
  );
}

function HeatmapGrid({
  months,
  maxStreams,
  isLoading,
  onMouseEnter,
  onMouseLeave
}: {
  months: MonthData[];
  maxStreams: number;
  isLoading: boolean;
  onMouseEnter: (day: DayData) => void;
  onMouseLeave: (day: DayData) => void;
}) {
  const getColorIntensity = (streamCount: number, maxStreams: number): string => {
    if (streamCount === 0 || maxStreams === 0) return "bg-white/10";

    const intensity = streamCount / maxStreams;
    if (intensity <= 0.25) return "bg-purple-900";
    if (intensity <= 0.5) return "bg-purple-700";
    if (intensity <= 0.75) return "bg-purple-500";
    return "bg-purple-400";
  };

  return (
    <div className="mx-auto w-fit">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <Loading />
          </div>
        )}
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="flex flex-col">
            <div className="mb-2 text-center text-xs text-gray-400">{month.monthName}</div>
            <div className="flex justify-start gap-1">
              {month.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${monthIndex}-${weekIndex}-${dayIndex}`}
                      className={`h-3 w-3 cursor-pointer rounded-sm transition-all duration-200 hover:ring-2 hover:ring-white/20 ${
                        day ? getColorIntensity(day.streamCount, maxStreams) : "bg-white/10"
                      }`}
                      onMouseEnter={() => day && onMouseEnter(day)}
                      onMouseLeave={() => day && onMouseLeave(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapLegend() {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-400">
      <span>Less</span>
      <div className="flex gap-1">
        {LEGEND_COLORS.map((color, index) => (
          <div key={index} className={`h-3 w-3 rounded-sm ${color}`} />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}
