"use client";

import BackNav from "@/components/BackNav";
import CumulativeStreamChart from "@/components/charts/dashboard/CumulativeStreamChart";
import DailyStreamChart from "@/components/charts/dashboard/DailyStreamChart";
import DayOfWeekStreamChart from "@/components/charts/dashboard/DayOfWeekStreamChart";
import HourlyListensRadialChart from "@/components/charts/dashboard/HourlyListensRadialChart";
import MonthlyStreamChart from "@/components/charts/dashboard/MonthlyStreamChart";
import DateNavigationControls from "@/components/DateNavigationControls";
import DateRangeSelector from "@/components/DateRangeSelector";
import Loading from "@/components/Loading";
import CustomDateRangeModal from "@/components/modals/CustomDateRangeModal";
import MetricCard from "@/components/statsGrid/MetricCard";
import { DateRange, useDateRange } from "@/hooks/useDateRange";
import { useStatsData } from "@/hooks/useStatsData";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { formatDate, formatDateShort, formatDuration } from "@/lib/utils/timeUtils";
import { useCallback, useEffect, useMemo, useState } from "react";

export type StatsPageProps = {
  isStandalone?: boolean;
};

export default function StatsPage({ isStandalone = false }: StatsPageProps) {
  const {
    dateRange,
    currentPeriod,
    startDate,
    endDate,
    handleDateRangeChange,
    handlePreviousPeriod,
    handleNextPeriod
  } = useDateRange({ initialDateRange: "lifetime" });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const { setTitle, setSubheader } = usePageTitle();

  const { data, isLoading, error } = useStatsData({ startDate, endDate });

  const isLifetime = dateRange === "lifetime";

  const periodDisplay = useMemo(() => {
    if (isLifetime || !startDate || !endDate) return "";
    return `from ${formatDate(startDate.getTime())} to ${formatDate(endDate.getTime())}`;
  }, [isLifetime, startDate, endDate]);

  const shortPeriod = useMemo(() => {
    if (isLifetime || !startDate || !endDate) return "";
    return `${formatDateShort(startDate.getTime())} - ${formatDateShort(endDate.getTime())}`;
  }, [isLifetime, startDate, endDate]);

  useEffect(() => {
    setTitle("Stats");
    setSubheader(shortPeriod);
  }, [shortPeriod, setTitle, setSubheader]);

  const handleCloseModal = useCallback(() => {
    setIsCustomModalOpen(false);
    if (dateRange === "custom" && !startDate && !endDate) {
      handleDateRangeChange("lifetime");
    }
  }, [dateRange, startDate, endDate, handleDateRangeChange]);

  const handleDateRangeOptionClick = (range: DateRange) => {
    if (range === "custom") {
      setIsCustomModalOpen(true);
    }
  };

  const hasCharts =
    data &&
    (data.daily.length > 0 ||
      data.cumulative.length > 0 ||
      data.monthly.length > 0 ||
      data.dayOfWeek.some((d) => d.streamCount > 0) ||
      data.hourly.some((d) => d.listenCount > 0));

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Title & Controls */}
        {!isStandalone && (
          <>
            <BackNav />
            <div className="mb-2">
              <h1 className="text-4xl font-bold text-white">
                Stats <span className="text-2xl text-gray-400">{periodDisplay}</span>
              </h1>
            </div>
          </>
        )}

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onOptionClick={handleDateRangeOptionClick}
          />

          {dateRange !== "custom" && (
            <DateNavigationControls
              dateRange={dateRange}
              currentPeriod={currentPeriod}
              onPreviousPeriod={handlePreviousPeriod}
              onNextPeriod={handleNextPeriod}
            />
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-red-400">Error loading stats. Please try again.</div>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-6">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              <MetricCard
                title="Streams"
                mainText={data.summary.totalListens}
                secondaryText={`${formatDuration(data.summary.totalDuration)} total time`}
                gradientFrom="from-pink-500/10"
                gradientTo="to-rose-500/10"
                blurColor="bg-pink-500/20"
                textColor="text-pink-400"
              />
              <MetricCard
                title="Tracks"
                mainText={data.summary.uniqueTracks}
                secondaryText="different tracks"
                gradientFrom="from-purple-500/10"
                gradientTo="to-pink-500/10"
                blurColor="bg-purple-500/20"
                textColor="text-purple-400"
              />
              <MetricCard
                title="Artists"
                mainText={data.summary.uniqueArtists}
                secondaryText="different artists"
                gradientFrom="from-yellow-500/10"
                gradientTo="to-orange-500/10"
                blurColor="bg-yellow-500/20"
                textColor="text-yellow-400"
              />
              <MetricCard
                title="Albums"
                mainText={data.summary.uniqueAlbums}
                secondaryText="different albums"
                gradientFrom="from-red-500/10"
                gradientTo="to-pink-500/10"
                blurColor="bg-red-500/20"
                textColor="text-red-400"
              />
            </div>

            {/* Charts */}
            {hasCharts ? (
              <div className="flex flex-col gap-6">
                {data.daily.length > 0 && <DailyStreamChart data={data.daily} />}
                {data.cumulative.length > 0 && <CumulativeStreamChart data={data.cumulative} />}
                {data.monthly.length > 0 && <MonthlyStreamChart data={data.monthly} />}
                {data.dayOfWeek.some((d) => d.streamCount > 0) && (
                  <DayOfWeekStreamChart data={data.dayOfWeek} />
                )}
                {data.hourly.some((d) => d.listenCount > 0) && (
                  <HourlyListensRadialChart data={data.hourly} />
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <div className="text-gray-400">No data available for this period</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No data available for this period</div>
          </div>
        )}

        <CustomDateRangeModal isOpen={isCustomModalOpen} onClose={handleCloseModal} />
      </div>
    </div>
  );
}
