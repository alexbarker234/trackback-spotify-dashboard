"use client";

import { DateRange } from "@/hooks/useDateRange";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ItemCard from "../ItemCard";

export type TopItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  subtitle?: string;
  streams: number;
  minutes: number;
  href: string;
};

export type TopItemsPageProps = {
  title: string;
  items: TopItem[];
  isLoading: boolean;
  error: string | null;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  currentPeriod: number;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
};

export default function TopItemsPage({
  title,
  items,
  isLoading,
  error,
  dateRange,
  onDateRangeChange,
  currentPeriod,
  onPreviousPeriod,
  onNextPeriod
}: TopItemsPageProps) {
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

    if (dateRange === "year") {
      const currentYear = new Date().getFullYear();
      const targetYear = currentYear - currentPeriod;
      if (isCurrentPeriod) return `${currentYear}`;
      return `${targetYear}`;
    }

    return "";
  };

  const canNavigateBack = dateRange !== "lifetime";
  const canNavigateForward = currentPeriod > 0;

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-zinc-100">{title}</h1>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Date Range Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => onDateRangeChange("4weeks")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "4weeks" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              4 Weeks
            </button>
            <button
              onClick={() => onDateRangeChange("6months")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "6months" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => onDateRangeChange("year")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "year" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Year
            </button>
            <button
              onClick={() => onDateRangeChange("lifetime")}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === "lifetime" ? "bg-blue-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Lifetime
            </button>
          </div>

          {/* Navigation Controls */}
          {canNavigateBack && (
            <div className="mx-auto flex items-center gap-2 lg:mx-0">
              <button
                onClick={onPreviousPeriod}
                className="flex w-28 cursor-pointer items-center justify-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                <span>Previous</span>
              </button>
              <span className="mx-2 text-sm text-zinc-400">{getPeriodLabel()}</span>
              <button
                onClick={onNextPeriod}
                disabled={!canNavigateForward}
                className="flex w-28 cursor-pointer items-center justify-center rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next</span>
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
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
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => (
              <ItemCard
                key={item.id}
                href={item.href}
                imageUrl={item.imageUrl}
                number={index + 1}
                title={item.name}
                subtitle={item.subtitle}
                streams={item.streams}
                minutes={item.minutes}
                className="w-auto"
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
