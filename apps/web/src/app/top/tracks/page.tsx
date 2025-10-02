"use client";

import TopItemsPage, { DateRange, TopItem } from "@/components/top/TopItemsPage";
import { useTopTracks } from "@/hooks/useTopTracks";
import { useMemo, useState } from "react";

export default function TopTracksPage() {
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

  const { data, isLoading, error } = useTopTracks({
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
