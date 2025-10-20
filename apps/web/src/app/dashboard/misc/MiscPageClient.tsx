"use client";

import ArtistRankingChart from "@/components/charts/ArtistRankingChart";
import DateNavigationControls from "@/components/DateNavigationControls";
import DateRangeSelector from "@/components/DateRangeSelector";
import Loading from "@/components/Loading";
import { useArtistRanking } from "@/hooks/useArtistRanking";
import { useState } from "react";

type DateRange = "4weeks" | "6months" | "lifetime";

export default function MiscPageClient() {
  const [dateRange, setDateRange] = useState<DateRange>("4weeks");
  const [currentPeriod, setCurrentPeriod] = useState(0);

  const { data, isLoading, error } = useArtistRanking({
    period: dateRange,
    offset: currentPeriod
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    setCurrentPeriod(0); // Reset to current period when changing range
  };

  const handlePreviousPeriod = () => {
    setCurrentPeriod((prev) => prev + 1);
  };

  const handleNextPeriod = () => {
    setCurrentPeriod((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-white">Artist Rankings</h1>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Date Range Selector */}
          <DateRangeSelector dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />

          {/* Navigation Controls */}
          <DateNavigationControls
            dateRange={dateRange}
            currentPeriod={currentPeriod}
            onPreviousPeriod={handlePreviousPeriod}
            onNextPeriod={handleNextPeriod}
          />
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-red-400">Error loading data. Please try again.</div>
          </div>
        ) : data && data.length > 0 ? (
          <ArtistRankingChart data={data} />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No data available for this period</div>
          </div>
        )}
      </div>
    </div>
  );
}
