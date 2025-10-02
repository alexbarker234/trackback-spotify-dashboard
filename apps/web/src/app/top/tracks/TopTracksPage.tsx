"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { useDateRange } from "@/hooks/useDateRange";
import { useTopTracks } from "@/hooks/useTopTracks";

export default function TopTracksPage() {
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
    minutes: Math.round(track.totalDuration / 60000),
    href: `/track/${track.trackIsrc}`
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
    />
  );
}
