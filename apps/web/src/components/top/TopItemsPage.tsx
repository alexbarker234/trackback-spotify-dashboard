"use client";

import { DateRange, useDateRange } from "@/hooks/useDateRange";
import { useTopItems } from "@/hooks/useTopItems";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatDateShort, formatDuration } from "@/lib/utils/timeUtils";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import BackNav from "../BackNav";
import CompactRankListCard from "../cards/CompactRankListCard";
import ExpandableChartContainer from "../charts/ExpandableChartContainer";
import TopItemsBubbleChart from "../charts/TopItemsBubbleChart";
import TopItemsPieChart from "../charts/TopItemsPieChart";
import DateNavigationControls from "../DateNavigationControls";
import DateRangeSelector from "../DateRangeSelector";
import { ExportLoadingOverlay, useOffscreenExport } from "../export";
import StreamItemCard from "../itemCards/StreamItemCard";
import ItemTypeSelector, { ItemType, itemTypeOptions } from "../ItemTypeSelector";
import Loading from "../Loading";
import CustomDateRangeModal from "../modals/CustomDateRangeModal";
import ViewSelector, { ViewType, viewTypeOptions } from "../ViewSelector";

const EXPORT_GRID_LIST_MAX = 10;

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

  const { setTitle, setSubheader } = usePageTitle();

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

  const updatePeriod = useCallback(() => {
    const isLifetime = dateRange === "lifetime";
    const hasDates = startDate && endDate;
    const period =
      !isLifetime && hasDates
        ? `from ${formatDate(startDate.getTime())} to ${formatDate(endDate.getTime())}`
        : "";
    const shortPeriod =
      !isLifetime && hasDates
        ? `${formatDateShort(startDate.getTime())} - ${formatDateShort(endDate.getTime())}`
        : "";

    setTitle(title);
    setSubheader(shortPeriod);
    return period;
  }, [dateRange, startDate, endDate, title, setSubheader, setTitle]);

  useEffect(() => {
    updatePeriod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodDisplay = useMemo(() => updatePeriod(), [updatePeriod]);

  const onItemTypeChange = (newItemType: ItemType) => {
    setItemType(newItemType);
  };

  const handleDateRangeOptionClick = (dateRange: DateRange) => {
    if (dateRange === "custom") {
      setIsCustomModalOpen(true);
    }
  };

  const canExport = Boolean(data && data.length > 0 && !isLoading && !error);
  const exportFilename = `${title.toLowerCase().replace(/\s+/g, "-")}-${viewType}.png`;

  const { isExporting, showExportSurface, exportRef, startExport, exportWidth, exportHeight } =
    useOffscreenExport({
      filename: exportFilename,
      shareTitle: title,
      enabled: canExport
    });

  const exportProps = {
    onExport: startExport,
    isExporting,
    exportDisabled: !canExport
  };

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Title & Controls */}
        {!isStandalone && (
          <>
            <BackNav />
            <div className="mb-2">
              <h1 className="text-4xl font-bold text-white">
                {title} <span className="text-2xl text-gray-400">{periodDisplay}</span>
              </h1>
              <div className="mt-2 max-w-md">
                <ItemTypeSelector itemType={itemType} onItemTypeChange={onItemTypeChange} />
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
            <ExpandableChartContainer title={title} chartHeight="h-auto" {...exportProps}>
              <TopItemsGrid items={data} maxItems={maxItems} />
            </ExpandableChartContainer>
          ) : viewType === "list" ? (
            <ExpandableChartContainer title={title} chartHeight="h-auto" {...exportProps}>
              <TopItemsList items={data} maxItems={maxItems} />
            </ExpandableChartContainer>
          ) : viewType === "pie" ? (
            <TopItemsPieChart
              chartTitle={`${title} Distribution`}
              items={data}
              maxItems={12}
              {...exportProps}
            />
          ) : (
            <TopItemsBubbleChart
              chartTitle={`${title} Bubble`}
              items={data}
              maxItems={20}
              {...exportProps}
            />
          )
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No data available for this period</div>
          </div>
        )}

        {/* Custom Date Range Modal */}
        <CustomDateRangeModal isOpen={isCustomModalOpen} onClose={handleCloseModal} />
      </div>

      {isExporting && <ExportLoadingOverlay />}

      {showExportSurface && data && (
        <div
          ref={exportRef}
          aria-hidden
          className="bg-gradient-primary pointer-events-none fixed top-0 flex flex-col p-12 text-white"
          style={{ width: exportWidth, height: exportHeight, left: -10000 }}
        >
          <div className="mb-8 shrink-0">
            <h1 className="text-4xl font-bold">{title}</h1>
            {periodDisplay ? <p className="mt-2 text-xl text-gray-400">{periodDisplay}</p> : null}
          </div>
          <div className="min-h-0 flex-1">
            {viewType === "grid" ? (
              <TopItemsGrid items={data} maxItems={EXPORT_GRID_LIST_MAX} className="grid-cols-2 gap-5" />
            ) : viewType === "list" ? (
              <TopItemsList items={data} maxItems={EXPORT_GRID_LIST_MAX} className="gap-4" />
            ) : viewType === "pie" ? (
              <TopItemsPieChart
                chartTitle={`${title} Distribution`}
                items={data}
                maxItems={12}
                hideExpandButton
                chartHeight="h-[1550px]"
              />
            ) : (
              <TopItemsBubbleChart
                chartTitle={`${title} Bubble`}
                items={data}
                maxItems={20}
                hideExpandButton
                chartHeight="h-[1550px]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TopItemsList = ({
  items,
  maxItems,
  className
}: {
  items: TopItem[];
  maxItems: number;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
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

const TopItemsGrid = ({
  items,
  maxItems,
  className
}: {
  items: TopItem[];
  maxItems: number;
  className?: string;
}) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5", className)}>
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
