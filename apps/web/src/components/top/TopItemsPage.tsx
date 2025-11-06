"use client";

import { DateRange, useDateRange } from "@/hooks/useDateRange";
import { useTopItems } from "@/hooks/useTopItems";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/timeUtils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import BackNav from "../BackNav";
import CompactRankListCard from "../cards/CompactRankListCard";
import TopItemsBubbleChart from "../charts/TopItemsBubbleChart";
import TopItemsPieChart from "../charts/TopItemsPieChart";
import DateNavigationControls from "../DateNavigationControls";
import DateRangeSelector from "../DateRangeSelector";
import StreamItemCard from "../itemCards/StreamItemCard";
import ItemTypeSelector, { ItemType, itemTypeOptions } from "../ItemTypeSelector";
import Loading from "../Loading";
import CustomDateRangeModal from "../modals/CustomDateRangeModal";
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
  isStandalone?: boolean;
};

const TopItemLink = ({ itemType, text }: { itemType: ItemType; text: string }) => {
  const [currentItemType] = useQueryState<ItemType>(
    "type",
    parseAsStringLiteral(itemTypeOptions).withDefault("artists")
  );
  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.set("type", itemType);

  return (
    <Link
      href={`/dashboard/top?${newSearchParams.toString()}`}
      className={cn(
        "cursor-pointer text-sm text-gray-400 transition-colors hover:text-white",
        currentItemType === itemType ? "cursor-default text-white" : ""
      )}
    >
      {text}
    </Link>
  );
};

export default function TopItemsPage({ isStandalone = false }: TopItemsPageProps) {
  const {
    dateRange,
    currentPeriod,
    startDate,
    endDate,
    handleDateRangeChange,
    handlePreviousPeriod,
    handleNextPeriod
  } = useDateRange();

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handleCloseModal = useCallback(() => {
    setIsCustomModalOpen(false);
    // If no custom dates are set, switch back to a default range
    if (dateRange === "custom" && !startDate && !endDate) {
      handleDateRangeChange("4weeks");
    }
  }, [dateRange, startDate, endDate, handleDateRangeChange]);

  const [viewType, setViewType] = useQueryState<ViewType>(
    "viewType",
    parseAsStringLiteral(viewTypeOptions).withDefault("grid")
  );
  const [itemType, setItemType] = useQueryState<ItemType>(
    "type",
    parseAsStringLiteral(itemTypeOptions)
      .withDefault("artists")
      .withOptions({ clearOnDefault: false })
  );

  const maxItems = 250;

  // Fetch data based on item type
  const { data, isLoading, error } = useTopItems({
    itemType,
    startDate,
    endDate
  });

  const title = `Top ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;

  const onItemTypeChange = (newItemType: ItemType) => {
    setItemType(newItemType);
  };

  const handleDateRangeOptionClick = (dateRange: DateRange) => {
    if (dateRange === "custom") {
      setIsCustomModalOpen(true);
    }
  };

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Title & Controls */}
        {!isStandalone && (
          <>
            <BackNav />
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white">{title}</h1>
              <div className="mt-4 flex gap-4">
                <TopItemLink itemType="artists" text="Artists" />
                <TopItemLink itemType="tracks" text="Tracks" />
                <TopItemLink itemType="albums" text="Albums" />
              </div>
            </div>
          </>
        )}

        {/* Controls */}
        <div className="mb-2 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {/* Item Type Selector */}
            {isStandalone && (
              <ItemTypeSelector itemType={itemType} onItemTypeChange={onItemTypeChange} />
            )}
            {/* Date Range Selector */}
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              onOptionClick={handleDateRangeOptionClick}
            />

            {/* View Selector */}
            <ViewSelector viewType={viewType} onViewTypeChange={setViewType} />
          </div>

          {/* Navigation Controls */}
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
            <div className="text-red-400">Error loading data. Please try again.</div>
          </div>
        ) : data && data.length > 0 ? (
          viewType === "grid" ? (
            <TopItemsGrid items={data} maxItems={maxItems} />
          ) : viewType === "list" ? (
            <TopItemsList items={data} maxItems={maxItems} />
          ) : viewType === "pie" ? (
            <TopItemsPieChart chartTitle={`${title} Distribution`} items={data} maxItems={12} />
          ) : (
            <TopItemsBubbleChart chartTitle={`${title} Bubble`} items={data} maxItems={20} />
          )
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No data available for this period</div>
          </div>
        )}

        {/* Custom Date Range Modal */}
        <CustomDateRangeModal isOpen={isCustomModalOpen} onClose={handleCloseModal} />
      </div>
    </div>
  );
}

const TopItemsList = ({ items, maxItems }: { items: TopItem[]; maxItems: number }) => {
  return (
    <div className="flex flex-col gap-3">
      {items.slice(0, maxItems).map((item, index) => (
        <CompactRankListCard
          key={item.id}
          href={item.href}
          imageUrl={item.imageUrl}
          name={item.name}
          subtitle={item.subtitle}
          rank={index + 1}
          primaryText={`${item.streams.toLocaleString()} streams`}
          secondaryText={formatDuration(item.durationMs)}
        />
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
