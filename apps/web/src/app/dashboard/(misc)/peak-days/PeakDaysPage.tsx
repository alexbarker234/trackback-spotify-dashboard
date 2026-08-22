"use client";

import BackNav from "@/components/BackNav";
import TrackCard from "@/components/cards/TrackCard";
import DateNavigationControls from "@/components/DateNavigationControls";
import DateRangeSelector from "@/components/DateRangeSelector";
import Loading from "@/components/Loading";
import CustomDateRangeModal from "@/components/modals/CustomDateRangeModal";
import { DateRange, useDateRange } from "@/hooks/useDateRange";
import { usePeakDayTracks } from "@/hooks/usePeakDayTracks";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { formatDate, formatDateShort } from "@/lib/utils/timeUtils";
import { useCallback, useEffect, useMemo, useState } from "react";

export type PeakDaysPageProps = {
  isStandalone?: boolean;
};

function formatPeakDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return formatDate(new Date(year, month - 1, day).getTime());
}

export default function PeakDaysPage({ isStandalone = false }: PeakDaysPageProps) {
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
  const { data, isLoading, error } = usePeakDayTracks({ startDate, endDate });

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
    setTitle("Most listens in one day");
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

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {!isStandalone && (
          <>
            <BackNav />
            <div className="mb-2">
              <h1 className="text-4xl font-bold text-white">
                Most listens in one day{" "}
                <span className="text-2xl text-gray-400">{periodDisplay}</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Songs ranked by their highest listen count on a single day.
              </p>
            </div>
          </>
        )}

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

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-red-400">Error loading data. Please try again.</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No data available for this period</div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((track, index) => (
              <TrackCard
                key={track.trackIsrc}
                track={{
                  trackName: track.trackName,
                  trackIsrc: track.trackIsrc,
                  listenCount: track.peakListenCount,
                  totalDuration: 0,
                  imageUrl: track.imageUrl,
                  artists: track.artists
                }}
                rank={index + 1}
                statsText={`${track.peakListenCount} listen${track.peakListenCount === 1 ? "" : "s"} on ${formatPeakDate(track.peakDate)}`}
              />
            ))}
          </div>
        )}

        <CustomDateRangeModal isOpen={isCustomModalOpen} onClose={handleCloseModal} />
      </div>
    </div>
  );
}
