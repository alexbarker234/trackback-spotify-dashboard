"use client";

import ItemCard from "@/components/ItemCard";
import { DateRange, useTopArtists } from "@/hooks/useTopArtists";
import { useState } from "react";

export default function TopArtistsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("4weeks");
  const [currentPeriod, setCurrentPeriod] = useState(0);

  const { data, isLoading, error } = useTopArtists({
    dateRange,
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

  const getPeriodLabel = () => {
    if (dateRange === "lifetime") return "Lifetime";

    const isCurrentPeriod = currentPeriod === 0;

    if (dateRange === "4weeks") {
      if (isCurrentPeriod) return "Last 4 Weeks";
      return `${currentPeriod * 4} weeks ago`;
    }

    if (dateRange === "6months") {
      if (isCurrentPeriod) return "Last 6 Months";
      return `${currentPeriod * 6} months ago`;
    }

    return "";
  };

  const canNavigateBack = dateRange !== "lifetime";
  const canNavigateForward = currentPeriod > 0;

  return (
    <div className="flex-1 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-zinc-100">Top Artists</h1>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Date Range Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDateRangeChange("4weeks")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "4weeks" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              4 Weeks
            </button>
            <button
              onClick={() => handleDateRangeChange("6months")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "6months" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => handleDateRangeChange("lifetime")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "lifetime" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Lifetime
            </button>
          </div>

          {/* Navigation Controls */}
          {canNavigateBack && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPeriod}
                className="cursor-pointer rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-600"
              >
                ← Previous
              </button>
              <span className="text-sm text-zinc-400">{getPeriodLabel()}</span>
              <button
                onClick={handleNextPeriod}
                disabled={!canNavigateForward}
                className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-zinc-400">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-red-400">Error loading data. Please try again.</div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((artist, index) => (
              <ItemCard
                key={artist.artistId}
                href={`/artist/${artist.artistId}`}
                imageUrl={artist.artistImageUrl}
                number={index + 1}
                title={artist.artistName}
                subtitle={`${artist.listenCount} streams`}
                streams={artist.listenCount}
                minutes={artist.listenCount}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-zinc-400">No data available for this period</div>
          </div>
        )}
      </div>
    </div>
  );
}
