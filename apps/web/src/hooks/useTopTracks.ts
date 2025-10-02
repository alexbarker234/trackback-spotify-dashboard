"use client";

import { useEffect, useState } from "react";

export type DateRange = "4weeks" | "6months" | "lifetime";

export type TopTrack = {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
  artists: {
    artistName: string;
    artistId: string;
  }[];
};

export type UseTopTracksOptions = {
  dateRange?: DateRange;
  offset?: number;
};

export function useTopTracks(options: UseTopTracksOptions = {}) {
  const { dateRange = "4weeks", offset = 0 } = options;
  const [data, setData] = useState<TopTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          dateRange,
          offset: offset.toString()
        });

        const response = await fetch(`/api/top-tracks?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch top tracks");
        }

        const tracks = await response.json();
        setData(tracks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, offset]);

  return { data, isLoading, error };
}
