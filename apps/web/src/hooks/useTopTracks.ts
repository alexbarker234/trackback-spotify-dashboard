"use client";

import { useEffect, useState } from "react";

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
  startDate?: Date;
  endDate?: Date;
};

export function useTopTracks(options: UseTopTracksOptions = {}) {
  const { startDate, endDate } = options;
  const [data, setData] = useState<TopTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (startDate) {
          params.set("startDate", startDate.toISOString());
        }
        if (endDate) {
          params.set("endDate", endDate.toISOString());
        }

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
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
