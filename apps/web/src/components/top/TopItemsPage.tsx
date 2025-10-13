"use client";

import { DateRange } from "@/hooks/useDateRange";
import DateNavigationControls from "../DateNavigationControls";
import DateRangeSelector from "../DateRangeSelector";
import StreamItemCard from "../itemCards/StreamItemCard";

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
  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-white">{title}</h1>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Date Range Selector */}
          <DateRangeSelector dateRange={dateRange} onDateRangeChange={onDateRangeChange} />

          {/* Navigation Controls */}
          <DateNavigationControls
            dateRange={dateRange}
            currentPeriod={currentPeriod}
            onPreviousPeriod={onPreviousPeriod}
            onNextPeriod={onNextPeriod}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-red-400">Error loading data. Please try again.</div>
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {items.map((item, index) => (
              <StreamItemCard
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
            <div className="text-gray-400">No data available for this period</div>
          </div>
        )}
      </div>
    </div>
  );
}
