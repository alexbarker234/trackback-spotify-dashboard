"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { DateRange, useTopAlbums } from "@/hooks/useTopAlbums";
import { useState } from "react";

export default function TopAlbumsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("4weeks");
  const [currentPeriod, setCurrentPeriod] = useState(0);

  const { data, isLoading, error } = useTopAlbums({
    dateRange,
    offset: currentPeriod
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    setCurrentPeriod(0); // Reset to current period when changing range
  };

  const handlePreviousPeriod = () => {
    setCurrentPeriod((prev) => prev + 1);
  };

  const handleNextPeriod = () => {
    setCurrentPeriod((prev) => Math.max(0, prev - 1));
  };

  // Transform albums data to TopItem format
  const items: TopItem[] = data.map((album) => ({
    id: album.albumId,
    name: album.albumName,
    imageUrl: album.albumImageUrl,
    subtitle: album.artistNames.join(", "),
    streams: album.listenCount,
    minutes: album.listenCount,
    href: `/album/${album.albumId}`
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
