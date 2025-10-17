"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { useDateRange } from "@/hooks/useDateRange";
import { useTopArtists } from "@/hooks/useTopArtists";

export default function TopArtistsPage({ isStandalone }: { isStandalone: boolean }) {
  const {
    dateRange,
    currentPeriod,
    startDate,
    endDate,
    handleDateRangeChange,
    handlePreviousPeriod,
    handleNextPeriod
  } = useDateRange();

  const { data, isLoading, error } = useTopArtists({
    startDate,
    endDate
  });

  // Transform artists data to TopItem format
  const items: TopItem[] = data.map((artist) => ({
    id: artist.artistId,
    name: artist.artistName,
    imageUrl: artist.artistImageUrl,
    streams: artist.listenCount,
    durationMs: artist.totalDuration,
    href: `/dashboard/artist/${artist.artistId}`
  }));

  return (
    <TopItemsPage
      title="Top Artists"
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
