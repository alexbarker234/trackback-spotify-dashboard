"use client";

import { DateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import TopItemsPieChart from "../charts/TopItemsPieChart";
import DateNavigationControls from "../DateNavigationControls";
import DateRangeSelector from "../DateRangeSelector";
import StreamItemCard from "../itemCards/StreamItemCard";
import ViewSelector, { ViewType } from "../ViewSelector";

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
  maxItems?: number;
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
  onNextPeriod,
  maxItems = 20
}: TopItemsPageProps) {
  const [viewType, setViewType] = useState<ViewType>("grid");

  const pathname = usePathname();
  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          <div className="mt-4 flex gap-4">
            <Link
              href="/dashboard/top/artists"
              className={cn(
                "text-sm text-gray-400 transition-colors hover:text-white",
                pathname === "/dashboard/top/artists" ? "cursor-default text-white" : ""
              )}
            >
              Artists
            </Link>
            <Link
              href="/dashboard/top/tracks"
              className={cn(
                "text-sm text-gray-400 transition-colors hover:text-white",
                pathname === "/dashboard/top/tracks" ? "cursor-default text-white" : ""
              )}
            >
              Tracks
            </Link>
            <Link
              href="/dashboard/top/albums"
              className={cn(
                "text-sm text-gray-400 transition-colors hover:text-white",
                pathname === "/dashboard/top/albums" ? "cursor-default text-white" : ""
              )}
            >
              Albums
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Date Range Selector */}
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={onDateRangeChange} />

            {/* View Selector */}
            <ViewSelector viewType={viewType} onViewTypeChange={setViewType} />
          </div>

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
          viewType === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {items.slice(0, maxItems).map((item, index) => (
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
            <TopItemsPieChart chartTitle={`${title} Distribution`} items={items} maxItems={12} />
          )
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No data available for this period</div>
          </div>
        )}
      </div>
    </div>
  );
}
