"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { useDateRange } from "@/hooks/useDateRange";
import { useTopTracks } from "@/hooks/useTopTracks";

export default function TopTracksPage({ isStandalone }: { isStandalone: boolean }) {
  const {
    dateRange,
    currentPeriod,
    startDate,
    endDate,
    handleDateRangeChange,
    handlePreviousPeriod,
    handleNextPeriod
  } = useDateRange();

  const { data, isLoading, error } = useTopTracks({
    startDate,
    endDate
  });

  // Transform tracks data to TopItem format
  const items: TopItem[] = data.map((track) => ({
    id: track.trackIsrc,
    name: track.trackName,
    imageUrl: track.imageUrl,
    subtitle: track.artists.map((a) => a.artistName).join(", "),
    streams: track.listenCount,
    durationMs: track.totalDuration,
    href: `/dashboard/track/${track.trackIsrc}`
  }));

  return (
    <TopItemsPage
      title="Top Tracks"
      items={items}
      isLoading={isLoading}
      error={error}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      currentPeriod={currentPeriod}
      onPreviousPeriod={handlePreviousPeriod}
      onNextPeriod={handleNextPeriod}
      isStandalone={isStandalone}
    />
  );
}
