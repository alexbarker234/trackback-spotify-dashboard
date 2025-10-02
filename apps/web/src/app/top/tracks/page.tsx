"use client";

import TopItemsPage, { TopItem } from "@/components/top/TopItemsPage";
import { DateRange, useTopTracks } from "@/hooks/useTopTracks";
import { useState } from "react";

export default function TopTracksPage() {
  const [dateRange, setDateRange] = useState<DateRange>("4weeks");
  const [currentPeriod, setCurrentPeriod] = useState(0);

  const { data, isLoading, error } = useTopTracks({
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
