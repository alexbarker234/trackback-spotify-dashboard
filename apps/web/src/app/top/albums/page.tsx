"use client";

import TopItemsPage, { DateRange, TopItem } from "@/components/top/TopItemsPage";
import { useTopAlbums } from "@/hooks/useTopAlbums";
import { useMemo, useState } from "react";

export default function TopAlbumsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("4weeks");
  const [currentPeriod, setCurrentPeriod] = useState(0);

  // Calculate start and end dates based on dateRange and currentPeriod
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined = now;

    if (dateRange === "4weeks") {
      start = new Date();
      start.setDate(start.getDate() - (28 + currentPeriod * 28));
    } else if (dateRange === "6months") {
      start = new Date();
      start.setMonth(start.getMonth() - (6 + currentPeriod * 6));
    } else if (dateRange === "lifetime") {
      start = undefined;
      end = undefined;
    }

    return { startDate: start, endDate: end };
  }, [dateRange, currentPeriod]);

  const { data, isLoading, error } = useTopAlbums({
    startDate,
    endDate
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
    minutes: Math.round(album.totalDuration / 60000),
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
