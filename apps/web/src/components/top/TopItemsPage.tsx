"use client";

import { DateRange } from "@/hooks/useDateRange";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import BackNav from "../BackNav";
import CompactRankListCard from "../cards/CompactRankListCard";
import TopItemsPieChart from "../charts/TopItemsPieChart";
import DateNavigationControls from "../DateNavigationControls";
import DateRangeSelector from "../DateRangeSelector";
import StreamItemCard from "../itemCards/StreamItemCard";
import ViewSelector, { ViewType, viewTypeOptions } from "../ViewSelector";

export type TopItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  subtitle?: string;
  streams: number;
  durationMs: number;
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

const TopItemLink = ({ href, text }: { href: string; text: string }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hrefWithParams = href + (searchParams.toString() ? `?${searchParams.toString()}` : "");
  return (
    <Link
      href={hrefWithParams}
      className={cn(
        "text-sm text-gray-400 transition-colors hover:text-white",
        pathname === href ? "cursor-default text-white" : ""
      )}
    >
      {text}
    </Link>
  );
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
  maxItems = 250
}: TopItemsPageProps) {
  const [viewType, setViewType] = useQueryState<ViewType>(
    "viewType",
    parseAsStringLiteral(viewTypeOptions).withDefault("grid")
  );

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <BackNav />
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          <div className="mt-4 flex gap-4">
            <TopItemLink href="/dashboard/top/artists" text="Artists" />
            <TopItemLink href="/dashboard/top/tracks" text="Tracks" />
            <TopItemLink href="/dashboard/top/albums" text="Albums" />
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
            <TopItemsGrid items={items} maxItems={maxItems} />
          ) : viewType === "list" ? (
            <TopItemsList items={items} maxItems={maxItems} />
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

const TopItemsList = ({ items, maxItems }: { items: TopItem[]; maxItems: number }) => {
  return (
    <div className="flex flex-col gap-3">
      {items.slice(0, maxItems).map((item, index) => (
        <CompactRankListCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
};

const TopItemsGrid = ({ items, maxItems }: { items: TopItem[]; maxItems: number }) => {
  return (
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
          durationMs={item.durationMs}
          className="w-auto"
        />
      ))}
    </div>
  );
};
