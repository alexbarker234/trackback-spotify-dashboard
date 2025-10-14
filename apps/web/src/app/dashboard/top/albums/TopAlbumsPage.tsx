"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { useDateRange } from "@/hooks/useDateRange";
import { useTopAlbums } from "@/hooks/useTopAlbums";

export default function TopAlbumsPage() {
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
    subtitle: album.artistNames.join(", "),
    streams: album.listenCount,
    minutes: Math.round(album.totalDuration / 60000),
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
    />
  );
}
