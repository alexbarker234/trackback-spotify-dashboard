"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { useDateRange } from "@/hooks/useDateRange";
import { useTopAlbums } from "@/hooks/useTopAlbums";

export default function TopAlbumsPage({ isStandalone }: { isStandalone: boolean }) {
  const {
    dateRange,
    currentPeriod,
    startDate,
    endDate,
    handleDateRangeChange,
    handlePreviousPeriod,
    handleNextPeriod
  } = useDateRange();

  const { data, isLoading, error } = useTopAlbums({
    startDate,
    endDate
  });

  // Transform albums data to TopItem format
  const items: TopItem[] = data.map((album) => ({
    id: album.albumId,
    name: album.albumName,
    imageUrl: album.albumImageUrl,
    subtitle: album.artistNames?.join(", "),
    streams: album.listenCount,
    durationMs: album.totalDuration,
    href: `/dashboard/album/${album.albumId}`
  }));

  return (
    <TopItemsPage
      title="Top Albums"
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
