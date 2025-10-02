"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { DateRange, useTopArtists } from "@/hooks/useTopArtists";
import { useState } from "react";

export default function TopArtistsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("4weeks");
  const [currentPeriod, setCurrentPeriod] = useState(0);

  const { data, isLoading, error } = useTopArtists({
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

  // Transform artists data to TopItem format
  const items: TopItem[] = data.map((artist) => ({
    id: artist.artistId,
    name: artist.artistName,
    imageUrl: artist.artistImageUrl,
    subtitle: `${artist.listenCount} streams`,
    streams: artist.listenCount,
    minutes: artist.listenCount,
    href: `/artist/${artist.artistId}`
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
    />
  );
}
